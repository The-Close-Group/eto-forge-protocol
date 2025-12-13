# =============================================================================
# ETO Faucet Lambda - Terraform Configuration
# Chain ID: 69670 | RPC: https://eto.ash.center/rpc
# =============================================================================

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "aws_region" {
  default = "us-east-1"
}

variable "faucet_private_key" {
  description = "Private key for the faucet wallet"
  type        = string
  sensitive   = true
}

provider "aws" {
  region = var.aws_region
}

# DynamoDB table for rate limiting
resource "aws_dynamodb_table" "faucet_claims" {
  name           = "eto-faucet-claims"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "address"

  attribute {
    name = "address"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Name = "eto-faucet-claims"
  }
}

# IAM role for Lambda
resource "aws_iam_role" "faucet_lambda" {
  name = "eto-faucet-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.faucet_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "dynamodb_access" {
  name = "eto-faucet-dynamodb-policy"
  role = aws_iam_role.faucet_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem"
      ]
      Resource = aws_dynamodb_table.faucet_claims.arn
    }]
  })
}

# Lambda function
resource "aws_lambda_function" "faucet" {
  filename         = "faucet-lambda.zip"
  function_name    = "eto-faucet"
  role            = aws_iam_role.faucet_lambda.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      FAUCET_PRIVATE_KEY = var.faucet_private_key
      GAS_AMOUNT         = "0.01"
      USDC_AMOUNT        = "1000"
      COOLDOWN_HOURS     = "24"
      DYNAMODB_TABLE     = aws_dynamodb_table.faucet_claims.name
    }
  }

  tags = {
    Name = "eto-faucet"
  }
}

# API Gateway
resource "aws_apigatewayv2_api" "faucet" {
  name          = "eto-faucet-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_stage" "faucet" {
  api_id      = aws_apigatewayv2_api.faucet.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "faucet" {
  api_id           = aws_apigatewayv2_api.faucet.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.faucet.invoke_arn
}

resource "aws_apigatewayv2_route" "faucet" {
  api_id    = aws_apigatewayv2_api.faucet.id
  route_key = "POST /claim"
  target    = "integrations/${aws_apigatewayv2_integration.faucet.id}"
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.faucet.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.faucet.execution_arn}/*/*"
}

# Outputs
output "faucet_api_url" {
  description = "Faucet API endpoint"
  value       = "${aws_apigatewayv2_stage.faucet.invoke_url}/claim"
}

output "dynamodb_table" {
  description = "DynamoDB table for rate limiting"
  value       = aws_dynamodb_table.faucet_claims.name
}
