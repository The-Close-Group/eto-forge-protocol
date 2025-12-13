#!/bin/bash
# AWS Deployment Script for ETO Subgraph
# This script automates the deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 ETO Subgraph AWS Deployment${NC}"
echo ""

# Check required tools
command -v aws >/dev/null 2>&1 || { echo -e "${RED}❌ AWS CLI not installed${NC}"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker not installed${NC}"; exit 1; }

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO_NAME="eto-subgraph"
ECS_CLUSTER_NAME="eto-subgraph-cluster"
ECS_SERVICE_NAME="eto-subgraph-service"
TASK_DEFINITION_FAMILY="eto-subgraph"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Region: $AWS_REGION"
echo "  Account ID: $AWS_ACCOUNT_ID"
echo "  ECR Repo: $ECR_REPO_NAME"
echo "  ECS Cluster: $ECS_CLUSTER_NAME"
echo ""

# Step 1: Create ECR repository if it doesn't exist
echo -e "${GREEN}Step 1: Setting up ECR repository...${NC}"
aws ecr describe-repositories --repository-names $ECR_REPO_NAME --region $AWS_REGION 2>/dev/null || \
  aws ecr create-repository --repository-name $ECR_REPO_NAME --region $AWS_REGION
ECR_REPO_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME"
echo "  ✓ ECR Repository: $ECR_REPO_URI"

# Step 2: Login to ECR
echo -e "${GREEN}Step 2: Logging into ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO_URI
echo "  ✓ Logged in"

# Step 3: Build and push Docker image
echo -e "${GREEN}Step 3: Building and pushing Docker image...${NC}"
cd "$(dirname "$0")/.."
docker build -t $ECR_REPO_NAME:latest -f Dockerfile .
docker tag $ECR_REPO_NAME:latest $ECR_REPO_URI:latest
docker push $ECR_REPO_URI:latest
echo "  ✓ Image pushed"

# Step 4: Update task definition
echo -e "${GREEN}Step 4: Updating ECS task definition...${NC}"
TASK_DEF_FILE="aws/ecs-task-definition.json"
sed -i.bak "s/YOUR_ACCOUNT_ID/$AWS_ACCOUNT_ID/g" $TASK_DEF_FILE
sed -i.bak "s/YOUR_ECR_REPO/$ECR_REPO_URI/g" $TASK_DEF_FILE
sed -i.bak "s/REGION/$AWS_REGION/g" $TASK_DEF_FILE

# Register new task definition
TASK_DEF_ARN=$(aws ecs register-task-definition \
  --cli-input-json file://$TASK_DEF_FILE \
  --region $AWS_REGION \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)
echo "  ✓ Task definition registered: $TASK_DEF_ARN"

# Step 5: Update ECS service (if it exists)
echo -e "${GREEN}Step 5: Updating ECS service...${NC}"
if aws ecs describe-services --cluster $ECS_CLUSTER_NAME --services $ECS_SERVICE_NAME --region $AWS_REGION --query 'services[0].status' --output text 2>/dev/null | grep -q "ACTIVE"; then
  aws ecs update-service \
    --cluster $ECS_CLUSTER_NAME \
    --service $ECS_SERVICE_NAME \
    --task-definition $TASK_DEF_ARN \
    --region $AWS_REGION \
    --force-new-deployment > /dev/null
  echo "  ✓ Service updated, new deployment started"
else
  echo -e "${YELLOW}  ⚠ Service doesn't exist yet. Create it manually or use Terraform/CloudFormation.${NC}"
fi

# Restore backup
mv $TASK_DEF_FILE.bak $TASK_DEF_FILE 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Verify service is running: aws ecs describe-services --cluster $ECS_CLUSTER_NAME --services $ECS_SERVICE_NAME"
echo "  2. Check logs: aws logs tail /ecs/eto-subgraph --follow"
echo "  3. Update frontend VITE_SUBGRAPH_URL to point to your ALB/CloudFront URL"

