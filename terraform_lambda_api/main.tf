terraform {
  cloud {
    organization = "Florent"

    workspaces {
      name = "Mark_CMS"
    }
  }
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}

provider "aws" {
  region = "eu-central-1"
}

# ---- SES ----
resource "aws_ses_domain_identity" "domain_identity" {
  domain = "adfreesites.com"
}

resource "aws_ses_domain_dkim" "domain_identity_dkim" {
  domain = aws_ses_domain_identity.domain_identity.domain
}

# ---- Lambda ----
variable "src_lambda" {
  default = "src"
  type    = string
}

variable "stage_lamda" {
  default = "defaultStage"
  type    = string
}

data "aws_iam_policy_document" "assume" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = [
      "sts:AssumeRole"
    ]
  }
}

resource "aws_iam_role" "lambda" {
  name               = "lambda_iam_role"
  assume_role_policy = data.aws_iam_policy_document.assume.json
}

data "aws_iam_policy_document" "lambda" {
  statement {
    effect = "Allow"

    actions = [
      "ses:SendEmail",
      "ses:SendRawEmail"
    ]

    resources = ["*"]
  }
}

resource "aws_iam_policy" "lambda" {
  name        = "policy_send_emails_ses"
  description = "Sent emails with SES"
  policy      = data.aws_iam_policy_document.lambda.json
}

resource "aws_iam_role_policy_attachment" "lambda" {
  role       = aws_iam_role.lambda.name
  policy_arn = aws_iam_policy.lambda.arn
}

data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = "${path.module}/${var.src_lambda}/"
  output_path = "lambda_function_payload.zip"
}

resource "aws_lambda_function" "lambda_function" {

  filename         = "lambda_function_payload.zip"
  function_name    = "lambda_function_name"
  role             = aws_iam_role.lambda.arn
  handler          = "lambda.handler"
  source_code_hash = base64sha256(file("./${var.src_lambda}/lambda.js"))
  runtime          = "nodejs20.x"
}

resource "aws_cloudwatch_log_group" "api_gw" {
  name = "/aws/api_gw/${aws_api_gateway_rest_api.api.name}"

  retention_in_days = 30
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_function.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

# ---- API_GATEWAY ---- 
resource "aws_api_gateway_rest_api" "api" {
  name = "api"
  api_key_source = "HEADER"
}

resource "aws_api_gateway_resource" "resource" {
  path_part   = "adfreesites"
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.api.id
}

resource "aws_api_gateway_method" "method" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.resource.id
  http_method   = "POST"
  authorization = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "integration" {
  rest_api_id             = aws_api_gateway_rest_api.api.id
  resource_id             = aws_api_gateway_resource.resource.id
  http_method             = aws_api_gateway_method.method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.lambda_function.invoke_arn
}

resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = aws_api_gateway_rest_api.api.id
}

resource "aws_api_gateway_stage" "stage" {
  stage_name = "send"
  rest_api_id = aws_api_gateway_rest_api.api.id
  deployment_id = aws_api_gateway_deployment.deployment.id
}

resource "aws_api_gateway_usage_plan" "usageplan" {
  name = "usageplan"

  api_stages {
    api_id = aws_api_gateway_rest_api.api.id
    stage  = aws_api_gateway_stage.stage.stage_name
  }

  throttle_settings {
    burst_limit = 2
    rate_limit  = 10
  }
}

resource "aws_api_gateway_api_key" "key" {
  name = "api-key"
}

resource "aws_api_gateway_usage_plan_key" "main" {
  key_id        = aws_api_gateway_api_key.key.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.usageplan.id
}

output "invoke_url" {
  value = aws_api_gateway_stage.stage.invoke_url
}

output "ses_dkim_tokens" {
  value = toset(aws_ses_domain_dkim.domain_identity_dkim.dkim_tokens[*])
}

output "api_key" {
  value = aws_api_gateway_api_key.key.value
  sensitive = true
}
