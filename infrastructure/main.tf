terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "PLACEHOLDER_S3_BUCKET"
    key            = "preview/react-app/terraform.tfstate"
    region         = "eu-north-1"
    dynamodb_table = "PLACEHOLDER_DYNAMODB_TABLE"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

# Provider for WAF v2 (must be in us-east-1 for CloudFront)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# S3 Bucket for React App
resource "aws_s3_bucket" "react_app_bucket" {
  bucket = var.react_app_bucket_name
}

# S3 Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "react_app_bucket" {
  bucket = aws_s3_bucket.react_app_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
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
  acl    = "private"
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

# Origin Request Policy for React App API
resource "aws_cloudfront_origin_request_policy" "react_app_api" {
  name    = "preview-react-app-api-policy"
  comment = "Policy for React App API requests to ALB"

  headers_config {
    header_behavior = "whitelist"
    headers {
      items = ["Host", "X-Source"]
    }
  }

  query_strings_config {
    query_string_behavior = "all"
  }

  cookies_config {
    cookie_behavior = "all"
  }
}

# CloudFront Function to add custom header
resource "aws_cloudfront_function" "add_source_header" {
  name    = "add-source-header"
  runtime = "cloudfront-js-1.0"
  comment = "Add X-Source header for React App API requests"
  publish = true
  code    = <<-EOF
    function handler(event) {
        var request = event.request;
        request.headers['x-source'] = {value: 'react-app'};
        return request;
    }
  EOF
}

# Data source for existing ALB
data "aws_lb" "existing" {
  arn = "arn:aws:elasticloadbalancing:${var.aws_region}:${var.aws_account_id}:loadbalancer/app/${var.alb_name}/${var.alb_id}"
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
    origin_id                = "S3-${var.react_app_bucket_name}"
  }

  # Add ALB origin for API routes
  origin {
    domain_name = data.aws_lb.existing.dns_name
    origin_id   = "ALB-preview-server"
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${var.react_app_bucket_name}"

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

  # API cache behavior for preview-server
  ordered_cache_behavior {
    path_pattern     = "/api/*"
    target_origin_id = "ALB-preview-server"
    
    origin_request_policy_id = aws_cloudfront_origin_request_policy.react_app_api.id
    cache_policy_id         = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # CachingDisabled
    
    viewer_protocol_policy = "allow-all"
    allowed_methods       = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods        = ["GET", "HEAD"]
    
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.add_source_header.arn
    }
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
    Owner       = var.resource_owner_tag
  }

  # web_acl_id = aws_wafv2_web_acl.react_app.arn
}

# WAF Web ACL - DISABLED
# resource "aws_wafv2_web_acl" "react_app" {
#   provider = aws.us_east_1
#   name        = "preview-react-app-waf"
#   description = "WAF for Preview React App"
#   scope       = "CLOUDFRONT"

#   default_action {
#     allow {}
#   }

#   # AWS Managed Rules
#   rule {
#     name     = "AWSManagedRulesCommonRuleSet"
#     priority = 1

#     override_action {
#       none {}
#     }

#     statement {
#       managed_rule_group_statement {
#         name        = "AWSManagedRulesCommonRuleSet"
#         vendor_name = "AWS"
#       }
#     }

#     visibility_config {
#       cloudwatch_metrics_enabled = true
#       metric_name                = "AWSManagedRulesCommonRuleSetMetric"
#       sampled_requests_enabled   = true
#     }
#   }

#   rule {
#     name     = "AWSManagedRulesKnownBadInputsRuleSet"
#     priority = 2

#     override_action {
#       none {}
#     }

#     statement {
#       managed_rule_group_statement {
#         name        = "AWSManagedRulesKnownBadInputsRuleSet"
#         vendor_name = "AWS"
#       }
#     }

#     visibility_config {
#       cloudwatch_metrics_enabled = true
#       metric_name                = "AWSManagedRulesKnownBadInputsRuleSetMetric"
#       sampled_requests_enabled   = true
#     }
#   }

#   rule {
#     name     = "AWSManagedRulesAnonymousIpList"
#     priority = 3

#     override_action {
#       none {}
#     }

#     statement {
#       managed_rule_group_statement {
#         name        = "AWSManagedRulesAnonymousIpList"
#         vendor_name = "AWS"
#       }
#     }

#     visibility_config {
#       cloudwatch_metrics_enabled = true
#       metric_name                = "AWSManagedRulesAnonymousIpListMetric"
#       sampled_requests_enabled   = true
#     }
#   }

#   visibility_config {
#     cloudwatch_metrics_enabled = true
#     metric_name                = "PreviewReactAppWAFMetric"
#     sampled_requests_enabled   = true
#   }
# }
