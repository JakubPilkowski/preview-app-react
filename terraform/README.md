# React App Terraform Infrastructure

This directory contains the Terraform configuration for deploying the React app to AWS using S3 and CloudFront.

## Infrastructure Components

- **S3 Bucket**: `preview-react-app-bucket` - Stores the static assets
- **CloudFront Distribution**: Serves the React app with caching and CDN capabilities
- **WAF Web ACL**: Provides security with AWS managed rules

## Prerequisites

1. AWS CLI configured with appropriate permissions
2. Terraform installed (version >= 1.0)
3. S3 backend bucket `kalabanga-iac` exists
4. DynamoDB table `infrastructure-locks` exists

## Usage

### Initialize Terraform

```bash
cd terraform
terraform init
```

### Plan the deployment

```bash
terraform plan
```

### Apply the configuration

```bash
terraform apply
```

### Destroy the infrastructure

```bash
terraform destroy
```

## Outputs

After successful deployment, Terraform will output:

- `cloudfront_distribution_id`: The CloudFront distribution ID
- `cloudfront_domain_name`: The CloudFront domain name
- `s3_bucket_name`: The S3 bucket name
- `s3_bucket_arn`: The S3 bucket ARN

## Configuration

The infrastructure is configured for the `eu-north-1` region. You can modify the region in `variables.tf` if needed.

## Security

- WAF is enabled with AWS managed rules for common threats
- S3 bucket has public read access for CloudFront
- CloudFront uses HTTPS by default

## Deployment

After applying the Terraform configuration, you can deploy the React app using the GitHub Actions workflow in `.github/workflows/deploy.yml`.
