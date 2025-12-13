#!/bin/bash
# =============================================================================
# AWS Deployment Script for ETO Subgraph
# Chain ID: 69670 | RPC: https://eto.ash.center/rpc
# =============================================================================
#
# Usage:
#   ./deploy.sh                    # Full deployment
#   ./deploy.sh --build-only       # Only build and push Docker image
#   ./deploy.sh --deploy-subgraph  # Only deploy subgraph to running graph-node
#
# Prerequisites:
#   - AWS CLI configured (aws configure)
#   - Docker installed and running
#   - graph-cli installed (npm install -g @graphprotocol/graph-cli)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🚀 ETO Subgraph AWS Deployment${NC}"
echo -e "${BLUE}   Chain ID: 69670 | RPC: https://eto.ash.center/rpc${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Check required tools
check_tool() {
  command -v $1 >/dev/null 2>&1 || { echo -e "${RED}❌ $1 not installed${NC}"; exit 1; }
}
check_tool aws
check_tool docker

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo "UNKNOWN")
ECR_REPO_NAME="eto-subgraph"
ECS_CLUSTER_NAME="eto-subgraph-cluster"
ECS_SERVICE_NAME="eto-subgraph-service"
TASK_DEFINITION_FAMILY="eto-subgraph"
SUBGRAPH_NAME="eto-protocol/eto-mainnet"

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SUBGRAPH_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Region:       $AWS_REGION"
echo "  Account ID:   $AWS_ACCOUNT_ID"
echo "  ECR Repo:     $ECR_REPO_NAME"
echo "  ECS Cluster:  $ECS_CLUSTER_NAME"
echo "  Subgraph:     $SUBGRAPH_NAME"
echo ""

# Parse arguments
BUILD_ONLY=false
DEPLOY_SUBGRAPH_ONLY=false

for arg in "$@"; do
  case $arg in
    --build-only)
      BUILD_ONLY=true
      shift
      ;;
    --deploy-subgraph)
      DEPLOY_SUBGRAPH_ONLY=true
      shift
      ;;
  esac
done

# Function: Deploy subgraph to graph-node
deploy_subgraph() {
  local GRAPH_NODE_HOST=${GRAPH_NODE_HOST:-localhost}
  local IPFS_HOST=${IPFS_HOST:-localhost}
  
  echo -e "${GREEN}Deploying subgraph to graph-node...${NC}"
  echo "  Graph Node: http://$GRAPH_NODE_HOST:8020"
  echo "  IPFS: http://$IPFS_HOST:5001"
  
  cd "$SUBGRAPH_DIR"
  
  # Build subgraph
  echo -e "${YELLOW}Building subgraph...${NC}"
  npm run codegen
  npm run build
  
  # Create subgraph (ignore error if already exists)
  echo -e "${YELLOW}Creating subgraph...${NC}"
  npx graph create --node http://$GRAPH_NODE_HOST:8020/ $SUBGRAPH_NAME 2>/dev/null || true
  
  # Deploy subgraph
  echo -e "${YELLOW}Deploying subgraph...${NC}"
  npx graph deploy \
    --node http://$GRAPH_NODE_HOST:8020/ \
    --ipfs http://$IPFS_HOST:5001 \
    $SUBGRAPH_NAME \
    --version-label v2.0.0
  
  echo -e "${GREEN}✓ Subgraph deployed${NC}"
}

# If only deploying subgraph, do that and exit
if [ "$DEPLOY_SUBGRAPH_ONLY" = true ]; then
  deploy_subgraph
  exit 0
fi

# Step 1: Create ECR repository if it doesn't exist
echo -e "${GREEN}Step 1: Setting up ECR repository...${NC}"
if aws ecr describe-repositories --repository-names $ECR_REPO_NAME --region $AWS_REGION 2>/dev/null; then
  echo "  ✓ ECR repository exists"
else
  aws ecr create-repository --repository-name $ECR_REPO_NAME --region $AWS_REGION
  echo "  ✓ ECR repository created"
fi
ECR_REPO_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME"

# Step 2: Login to ECR
echo -e "${GREEN}Step 2: Logging into ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO_URI
echo "  ✓ Logged in"

# Step 3: Build and push Docker image
echo -e "${GREEN}Step 3: Building and pushing Docker image...${NC}"
cd "$SUBGRAPH_DIR"
docker build --platform linux/amd64 -t $ECR_REPO_NAME:latest -f Dockerfile .
docker tag $ECR_REPO_NAME:latest $ECR_REPO_URI:latest
docker tag $ECR_REPO_NAME:latest $ECR_REPO_URI:v2.0.0
docker push $ECR_REPO_URI:latest
docker push $ECR_REPO_URI:v2.0.0
echo "  ✓ Image pushed: $ECR_REPO_URI:v2.0.0"

if [ "$BUILD_ONLY" = true ]; then
  echo ""
  echo -e "${GREEN}✅ Build complete!${NC}"
  exit 0
fi

# Step 4: Register task definition
echo -e "${GREEN}Step 4: Registering ECS task definition...${NC}"
TASK_DEF_ARN=$(aws ecs register-task-definition \
  --cli-input-json file://$SCRIPT_DIR/ecs-task-definition.json \
  --region $AWS_REGION \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)
echo "  ✓ Task definition: $TASK_DEF_ARN"

# Step 5: Update ECS service (if it exists)
echo -e "${GREEN}Step 5: Updating ECS service...${NC}"
SERVICE_STATUS=$(aws ecs describe-services \
  --cluster $ECS_CLUSTER_NAME \
  --services $ECS_SERVICE_NAME \
  --region $AWS_REGION \
  --query 'services[0].status' \
  --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$SERVICE_STATUS" = "ACTIVE" ]; then
  aws ecs update-service \
    --cluster $ECS_CLUSTER_NAME \
    --service $ECS_SERVICE_NAME \
    --task-definition $TASK_DEF_ARN \
    --region $AWS_REGION \
    --force-new-deployment > /dev/null
  echo "  ✓ Service updated, new deployment started"
else
  echo -e "${YELLOW}  ⚠ Service '$ECS_SERVICE_NAME' not found or not active.${NC}"
  echo "  Create it with: aws ecs create-service ..."
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Wait for ECS task to start (~2 min)"
echo "  2. Check logs:  aws logs tail /ecs/eto-subgraph --follow"
echo "  3. Get ALB URL: aws elbv2 describe-load-balancers --names eto-subgraph-alb --query 'LoadBalancers[0].DNSName'"
echo "  4. Deploy subgraph: GRAPH_NODE_HOST=<alb-url> ./deploy.sh --deploy-subgraph"
echo "  5. Update frontend: VITE_SUBGRAPH_URL=http://<alb-url>/subgraphs/name/$SUBGRAPH_NAME"
echo ""
echo -e "${BLUE}Contract Addresses (Chain ID: 69670):${NC}"
echo "  DMMv2 CLMM:        0xd14Ea79ab8B06BD5D2F4c805b3D9F6D134002648"
echo "  SMAANG Vault:      0xed2EEd3257Ce0A9ECeeE1055b5e54E724E63c09a"
echo "  Oracle Aggregator: 0x432edDe96fca51943b2a65b889ED50De7E51BdF7"
echo ""
