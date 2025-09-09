variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-north-1"
}

variable "aws_account_id" {
  description = "AWS Account ID"
  type        = string
}

variable "react_app_bucket_name" {
  description = "Name of the S3 bucket for React App"
  type        = string
}

variable "alb_name" {
  description = "Name of the Application Load Balancer"
  type        = string
  default     = "preview-next-app"
}

variable "alb_id" {
  description = "ID of the Application Load Balancer"
  type        = string
}

variable "resource_owner_tag" {
  description = "Resource owner tag"
  type        = string
}

