terraform {
  cloud {
    organization = "Florent"
  }
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

variable "top_level_domain" {
  type = string
}

variable "sub_domain" {
  type    = string
}

resource "aws_s3_bucket" "bucket" {
}

resource "aws_s3_bucket_ownership_controls" "bucket" {
  bucket = aws_s3_bucket.bucket.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_policy" "allow_access_from_cloudfront" {
  bucket = aws_s3_bucket.bucket.id
  policy = data.aws_iam_policy_document.allow_access_from_cloudfront.json
}

data "aws_iam_policy_document" "allow_access_from_cloudfront" {
    statement {
      sid = "AllowCloudFrontServicePrincipalReadOnly"
      effect= "Allow"

      principals {
        type        = "Service"
        identifiers = ["cloudfront.amazonaws.com"]
      }

      actions = ["s3:GetObject"]
      resources = ["${aws_s3_bucket.bucket.arn}/*"]

      condition {
        test = "StringEquals"
        variable = "AWS:SourceArn"
        values = [aws_cloudfront_distribution.s3_distribution.arn]
      }
    }
}

resource "aws_cloudfront_origin_access_control" "m93_nl" {
  name                              = "${var.sub_domain}_${var.top_level_domain}_aws_cloudfront_origin_access_control"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name              = aws_s3_bucket.bucket.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.m93_nl.id
    origin_id                = "${var.sub_domain}.${var.top_level_domain}"
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = ["${var.sub_domain}.${var.top_level_domain}"]

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "${var.sub_domain}.${var.top_level_domain}"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_All"

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.cert.arn
    ssl_support_method = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  custom_error_response {
    error_caching_min_ttl = 86400
    error_code = 404
    response_code = 200
    response_page_path = "/index.html"
  }
}

resource "aws_acm_certificate" "cert" {
  domain_name       = "${var.sub_domain}.${var.top_level_domain}"
  validation_method = "DNS"
  lifecycle {
    create_before_destroy = true
  }
}

data "aws_route53_zone" "public" {
  name         = "${var.top_level_domain}."
  private_zone = false
}

resource "aws_route53_record" "cert_validation" {
  allow_overwrite = true
  name            = tolist(aws_acm_certificate.cert.domain_validation_options)[0].resource_record_name
  records         = [ tolist(aws_acm_certificate.cert.domain_validation_options)[0].resource_record_value ]
  type            = tolist(aws_acm_certificate.cert.domain_validation_options)[0].resource_record_type
  zone_id  = data.aws_route53_zone.public.id
  ttl      = 60
}

resource "aws_acm_certificate_validation" "example" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [aws_route53_record.cert_validation.fqdn]
}

resource "aws_route53_record" "record_a" {
  zone_id  = data.aws_route53_zone.public.id
  name    = "${var.sub_domain}.${var.top_level_domain}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.s3_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

output "url_distribution" {
  value = aws_cloudfront_distribution.s3_distribution.domain_name
}

output "id_cloudfront" {
  value = aws_cloudfront_distribution.s3_distribution.id
}

output "id_bucket" {
  value = aws_s3_bucket.bucket.id
}