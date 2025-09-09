output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID"
  value       = aws_cloudfront_distribution.react_app.id
}

output "cloudfront_domain_name" {
  description = "CloudFront Domain Name"
  value       = aws_cloudfront_distribution.react_app.domain_name
}

output "s3_bucket_name" {
  description = "S3 Bucket Name"
  value       = aws_s3_bucket.react_app_bucket.bucket
}

output "s3_bucket_arn" {
  description = "S3 Bucket ARN"
  value       = aws_s3_bucket.react_app_bucket.arn
}

output "cloudfront_url" {
  description = "CloudFront URL for React App"
  value       = "https://${aws_cloudfront_distribution.react_app.domain_name}"
}
