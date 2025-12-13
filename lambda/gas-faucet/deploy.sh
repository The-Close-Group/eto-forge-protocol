#!/bin/bash
# =============================================================================
# ETO Gas Faucet - AWS Deployment Script
# Chain ID: 69670 | RPC: https://eto.ash.center/rpc
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
REGION="${AWS_REGION:-us-east-1}"
FUNCTION_NAME="eto-gas-faucet"
TABLE_NAME="gas-faucet-requests"
API_NAME="eto-gas-faucet-api"
# Use existing Lambda role (already trusts Lambda service)
ROLE_ARN="arn:aws:iam::905418078110:role/lambda-aurora-rotation-role"

# Check for required environment variable
if [ -z "$FAUCET_PRIVATE_KEY" ]; then
  echo -e "${RED}Error: FAUCET_PRIVATE_KEY environment variable is required${NC}"
  echo ""
  echo "Usage:"
  echo "  export FAUCET_PRIVATE_KEY='your-private-key-here'"
  echo "  ./deploy.sh"
  echo ""
  echo "The faucet wallet needs ETH on ETO L1 (chain 69670)"
  exit 1
fi

echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🚰 ETO Gas Faucet Deployment${NC}"
echo -e "${GREEN}   Chain ID: 69670 | Drip: 0.1 ETH | Cooldown: 24h${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# -----------------------------------------------------------------------------
# Step 1: Create DynamoDB Table
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Step 1: Creating DynamoDB table...${NC}"

TABLE_EXISTS=$(aws dynamodb describe-table --table-name $TABLE_NAME --region $REGION 2>/dev/null || echo "NOT_FOUND")

if [[ "$TABLE_EXISTS" == "NOT_FOUND" ]]; then
  aws dynamodb create-table \
    --table-name $TABLE_NAME \
    --attribute-definitions AttributeName=walletAddress,AttributeType=S \
    --key-schema AttributeName=walletAddress,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION \
    --tags Key=Project,Value=ETO-Faucet

  echo "  Waiting for table to be active..."
  aws dynamodb wait table-exists --table-name $TABLE_NAME --region $REGION
  
  # Enable TTL
  aws dynamodb update-time-to-live \
    --table-name $TABLE_NAME \
    --time-to-live-specification Enabled=true,AttributeName=ttl \
    --region $REGION
  
  echo -e "  ${GREEN}✓ Table created with TTL enabled${NC}"
else
  echo -e "  ${GREEN}✓ Table already exists${NC}"
fi

# -----------------------------------------------------------------------------
# Step 2: Using existing IAM Role
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Step 2: Using existing IAM role...${NC}"
echo -e "  ${GREEN}✓ Using role: $ROLE_ARN${NC}"

# -----------------------------------------------------------------------------
# Step 3: Install dependencies and create deployment package
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Step 3: Building deployment package...${NC}"

npm install --production --silent
zip -rq function.zip index.js node_modules package.json

echo -e "  ${GREEN}✓ Package created ($(du -h function.zip | cut -f1))${NC}"

# -----------------------------------------------------------------------------
# Step 4: Deploy Lambda Function
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Step 4: Deploying Lambda function...${NC}"

FUNCTION_EXISTS=$(aws lambda get-function --function-name $FUNCTION_NAME --region $REGION 2>/dev/null || echo "NOT_FOUND")

if [[ "$FUNCTION_EXISTS" == "NOT_FOUND" ]]; then
  aws lambda create-function \
    --function-name $FUNCTION_NAME \
    --runtime nodejs20.x \
    --role $ROLE_ARN \
    --handler index.handler \
    --zip-file fileb://function.zip \
    --timeout 30 \
    --memory-size 256 \
    --environment "Variables={FAUCET_PRIVATE_KEY=$FAUCET_PRIVATE_KEY,RPC_URL=https://eto.ash.center/rpc,CHAIN_ID=69670,DRIP_AMOUNT=0.1,COOLDOWN_HOURS=24,DYNAMODB_TABLE=$TABLE_NAME}" \
    --region $REGION \
    --tags Project=ETO-Faucet

  echo -e "  ${GREEN}✓ Function created${NC}"
else
  aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --zip-file fileb://function.zip \
    --region $REGION > /dev/null

  aws lambda update-function-configuration \
    --function-name $FUNCTION_NAME \
    --environment "Variables={FAUCET_PRIVATE_KEY=$FAUCET_PRIVATE_KEY,RPC_URL=https://eto.ash.center/rpc,CHAIN_ID=69670,DRIP_AMOUNT=0.1,COOLDOWN_HOURS=24,DYNAMODB_TABLE=$TABLE_NAME}" \
    --region $REGION > /dev/null

  echo -e "  ${GREEN}✓ Function updated${NC}"
fi

LAMBDA_ARN=$(aws lambda get-function --function-name $FUNCTION_NAME --query 'Configuration.FunctionArn' --output text --region $REGION)

# -----------------------------------------------------------------------------
# Step 5: Create API Gateway
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Step 5: Setting up API Gateway...${NC}"

# Check if API already exists
API_ID=$(aws apigatewayv2 get-apis --region $REGION --query "Items[?Name=='$API_NAME'].ApiId" --output text)

if [ -z "$API_ID" ] || [ "$API_ID" == "None" ]; then
  # Create HTTP API
  API_ID=$(aws apigatewayv2 create-api \
    --name $API_NAME \
    --protocol-type HTTP \
    --cors-configuration AllowOrigins='*',AllowMethods=POST,OPTIONS,AllowHeaders=Content-Type \
    --region $REGION \
    --query 'ApiId' --output text)

  # Create Lambda integration
  INTEGRATION_ID=$(aws apigatewayv2 create-integration \
    --api-id $API_ID \
    --integration-type AWS_PROXY \
    --integration-uri $LAMBDA_ARN \
    --payload-format-version 2.0 \
    --region $REGION \
    --query 'IntegrationId' --output text)

  # Create route
  aws apigatewayv2 create-route \
    --api-id $API_ID \
    --route-key "POST /request-gas" \
    --target "integrations/$INTEGRATION_ID" \
    --region $REGION > /dev/null

  # Create default stage with auto-deploy
  aws apigatewayv2 create-stage \
    --api-id $API_ID \
    --stage-name '$default' \
    --auto-deploy \
    --region $REGION > /dev/null

  # Add Lambda permission for API Gateway
  ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
  aws lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id apigateway-invoke \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*" \
    --region $REGION 2>/dev/null || true

  echo -e "  ${GREEN}✓ API Gateway created${NC}"
else
  echo -e "  ${GREEN}✓ API Gateway exists${NC}"
fi

# Get the API endpoint
API_ENDPOINT=$(aws apigatewayv2 get-api --api-id $API_ID --region $REGION --query 'ApiEndpoint' --output text)

# -----------------------------------------------------------------------------
# Done!
# -----------------------------------------------------------------------------
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "API Endpoint: ${YELLOW}${API_ENDPOINT}/request-gas${NC}"
echo ""
echo "Test with:"
echo -e "  ${YELLOW}curl -X POST ${API_ENDPOINT}/request-gas \\${NC}"
echo -e "  ${YELLOW}  -H 'Content-Type: application/json' \\${NC}"
echo -e "  ${YELLOW}  -d '{\"address\": \"0xYourWalletAddress\"}'${NC}"
echo ""
echo "Frontend environment variable:"
echo -e "  ${YELLOW}VITE_FAUCET_API_URL=${API_ENDPOINT}/request-gas${NC}"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"

# Cleanup
rm -f function.zip /tmp/trust-policy.json /tmp/dynamodb-policy.json
