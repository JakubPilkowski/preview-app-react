terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "kalabanga-iac-bucket"
    key            = "preview/react-app/terraform.tfstate"
    region         = "eu-north-1"
    dynamodb_table = "infrastructure-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = "eu-north-1"
}

# S3 Bucket for React App
resource "aws_s3_bucket" "react_app_bucket" {
  bucket = "preview-react-app-bucket"
}

# S3 Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "react_app_bucket" {
  bucket = aws_s3_bucket.react_app_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 Bucket Ownership Controls
resource "aws_s3_bucket_ownership_controls" "react_app_bucket" {
  bucket = aws_s3_bucket.react_app_bucket.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# S3 Bucket ACL
resource "aws_s3_bucket_acl" "react_app_bucket" {
  depends_on = [
    aws_s3_bucket_public_access_block.react_app_bucket,
    aws_s3_bucket_ownership_controls.react_app_bucket,
  ]

  bucket = aws_s3_bucket.react_app_bucket.id
  acl    = "public-read"
}

# S3 Bucket Policy for CloudFront access
resource "aws_s3_bucket_policy" "react_app_bucket" {
  bucket = aws_s3_bucket.react_app_bucket.id

  policy = jsonencode({
    Version = "2008-10-17"
    Id      = "PolicyForCloudFrontPrivateContent"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.react_app_bucket.arn}/*"
        Condition = {
          ArnLike = {
            "AWS:SourceArn" = aws_cloudfront_distribution.react_app.arn
          }
        }
      }
    ]
  })
}

# CloudFront Origin Access Control
resource "aws_cloudfront_origin_access_control" "react_app" {
  name                              = "preview-react-app-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "react_app" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "kalabanga-preview-react-app"

  origin {
    domain_name              = aws_s3_bucket.react_app_bucket.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.react_app.id
    origin_id                = "S3-preview-react-app-bucket"
  }

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-preview-react-app-bucket"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "allow-all"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  # Handle SPA routing - redirect all requests to index.html
  custom_error_response {
    error_code         = 404
    response_code      = "200"
    response_page_path = "/index.html"
  }

  # Handle 403 errors as well
  custom_error_response {
    error_code         = 403
    response_code      = "200"
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name        = "kalabanga-preview-react-app"
    Environment = "preview"
    Project     = "preview-react-app"
    Owner       = "kalabanga"
  }

  # WAF Web ACL association - commented out as requested
  # web_acl_id = aws_wafv2_web_acl.react_app.arn
}

# WAF Web ACL - commented out as requested
# resource "aws_wafv2_web_acl" "react_app" {
#   name        = "preview-react-app-waf"
#   description = "WAF for Preview React App"
#   scope       = "CLOUDFRONT"
#
#   default_action {
#     allow {}
#   }
#
#   # AWS Managed Rules
#   rule {
#     name     = "AWSManagedRulesCommonRuleSet"
#     priority = 1
#
#     override_action {
#       none {}
#     }
#
#     statement {
#       managed_rule_group_statement {
#         name        = "AWSManagedRulesCommonRuleSet"
#         vendor_name = "AWS"
#       }
#     }
#
#     visibility_config {
#       cloudwatch_metrics_enabled = true
#       metric_name                = "AWSManagedRulesCommonRuleSetMetric"
#       sampled_requests_enabled   = true
#     }
#   }
#
#   rule {
#     name     = "AWSManagedRulesKnownBadInputsRuleSet"
#     priority = 2
#
#     override_action {
#       none {}
#     }
#
#     statement {
#       managed_rule_group_statement {
#         name        = "AWSManagedRulesKnownBadInputsRuleSet"
#         vendor_name = "AWS"
#       }
#     }
#
#     visibility_config {
#       cloudwatch_metrics_enabled = true
#       metric_name                = "AWSManagedRulesKnownBadInputsRuleSetMetric"
#       sampled_requests_enabled   = true
#     }
#   }
#
#   rule {
#     name     = "AWSManagedRulesAnonymousIpList"
#     priority = 3
#
#     override_action {
#       none {}
#     }
#
#     statement {
#       managed_rule_group_statement {
#         name        = "AWSManagedRulesAnonymousIpList"
#         vendor_name = "AWS"
#       }
#     }
#
#     visibility_config {
#       cloudwatch_metrics_enabled = true
#       metric_name                = "AWSManagedRulesAnonymousIpListMetric"
#       sampled_requests_enabled   = true
#     }
#   }
#
#   visibility_config {
#     cloudwatch_metrics_enabled = true
#     metric_name                = "PreviewReactAppWAFMetric"
#     sampled_requests_enabled   = true
#   }
# }
