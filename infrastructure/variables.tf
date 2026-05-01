variable "aws_region" {
  default = "us-west-1"
}

variable "key_name" {
  description = "The name of the key pair you created in AWS Console"
  type        = string
}