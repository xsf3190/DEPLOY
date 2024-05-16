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

resource "aws_lambda_function" "test_lambda" {

  filename         = "lambda_function_payload.zip"
  function_name    = "lambda_function_name"
  role             = aws_iam_role.lambda.arn
  handler          = "lambda.handler"
  source_code_hash = base64sha256(file("./${var.src_lambda}/lambda.js"))
  runtime          = "nodejs18.x"
}

# ---- API_GATEWAY ---- 
resource "aws_apigatewayv2_api" "lambda" {
  name          = "serverless_lambda_gw"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["POST"]
    allow_headers = ["*"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_stage" "lambda" {
  api_id = aws_apigatewayv2_api.lambda.id
  

  name        = "serverless_lambda_stage"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 1
    throttling_rate_limit = 1
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      }
    )
  }
}

resource "aws_apigatewayv2_integration" "test_lambda" {
  api_id = aws_apigatewayv2_api.lambda.id

  integration_uri    = aws_lambda_function.test_lambda.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "test_lambda" {
  api_id = aws_apigatewayv2_api.lambda.id

  route_key = "POST /"
  target    = "integrations/${aws_apigatewayv2_integration.test_lambda.id}"
}

resource "aws_cloudwatch_log_group" "api_gw" {
  name = "/aws/api_gw/${aws_apigatewayv2_api.lambda.name}"

  retention_in_days = 30
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.test_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.lambda.execution_arn}/*/*"
}

resource "aws_api_gateway_api_key" "gateway_key" {
  name = "gateway_key"
}

resource "aws_api_gateway_usage_plan" "usage_plan" {
  name = "usage_plan_lambda"

  api_stages {
    api_id = aws_apigatewayv2_api.lambda.id
    stage  = "serverless_lambda_stage"
  }
}

resource "aws_api_gateway_usage_plan_key" "deploy-apigw-usage-plan-key" {
  key_id        = aws_api_gateway_api_key.gateway_key.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.usage_plan.id
}

output "invoke_url" {
  value = aws_apigatewayv2_stage.lambda.invoke_url
}

output "ses_dkim_tokens" {
  value = toset(aws_ses_domain_dkim.domain_identity_dkim.dkim_tokens[*])
}

output "api-key" {
  value = aws_api_gateway_api_key.gateway_key.value
}
