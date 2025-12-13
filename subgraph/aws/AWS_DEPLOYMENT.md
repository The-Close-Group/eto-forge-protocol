# AWS Deployment Guide for ETO Subgraph

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured (`aws configure`)
3. **Terraform** (optional, for infrastructure) or **AWS Console** access
4. **Docker** installed locally
5. **Domain name** (optional, for SSL)

## Important: IPFS Consideration

**Note**: The current setup includes IPFS in docker-compose. For AWS ECS, you have two options:

1. **Option A (Recommended)**: Deploy IPFS as separate ECS service
2. **Option B**: Use managed IPFS service (Pinata, Infura, etc.)
3. **Option C**: Use local IPFS node in same task (not recommended for production)

For simplicity, we'll use **Option A** - deploy IPFS as a separate ECS service.

## Quick Start (Using Terraform - Recommended)

### Step 1: Setup Terraform

```bash
cd subgraph/aws/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

### Step 2: Initialize and Plan

```bash
terraform init
terraform plan
```

### Step 3: Deploy Infrastructure

```bash
terraform apply
# Enter 'yes' when prompted
```

This creates:
- ✅ VPC with public/private subnets
- ✅ RDS PostgreSQL (db.t3.micro)
- ✅ ECS Cluster
- ✅ Application Load Balancer
- ✅ Security Groups
- ✅ CloudWatch Logs
- ✅ Secrets Manager
- ✅ ECR Repository

### Step 4: Build and Push Docker Image

```bash
cd ../..
chmod +x aws/deploy.sh
./aws/deploy.sh
```

### Step 5: Create ECS Service

After infrastructure is created, you need to create the ECS service:

```bash
# Get outputs from Terraform
ALB_DNS=$(terraform output -raw alb_dns_name)
CLUSTER_NAME=$(terraform output -raw ecs_cluster_name)
TASK_DEF_ARN=$(aws ecs list-task-definitions --family-prefix eto-subgraph --query 'taskDefinitionArns[-1]' --output text)

# Create ECS service
aws ecs create-service \
  --cluster $CLUSTER_NAME \
  --service-name eto-subgraph-service \
  --task-definition $TASK_DEF_ARN \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:REGION:ACCOUNT:targetgroup/eto-subgraph-tg/xxx,containerName=graph-node-nginx,containerPort=80"
```

## Manual Deployment (Without Terraform)

### Step 1: Create RDS PostgreSQL

1. Go to AWS Console → RDS → Create Database
2. Choose **PostgreSQL 14**
3. Template: **Free tier** (db.t3.micro)
4. Settings:
   - DB instance identifier: `eto-subgraph-postgres`
   - Master username: `graph-node`
   - Master password: `[generate secure password]`
   - Database name: `graph-node`
5. VPC: Create new or use existing
6. Public access: **No** (private subnet only)
7. Security group: Allow port 5432 from ECS security group
8. Create database

### Step 2: Create ECR Repository

```bash
aws ecr create-repository --repository-name eto-subgraph --region us-east-1
```

### Step 3: Build and Push Image

```bash
cd subgraph
./aws/deploy.sh
```

### Step 4: Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name eto-subgraph-cluster --region us-east-1
```

### Step 5: Create Task Definition

Update `aws/ecs-task-definition.json` with:
- Your AWS Account ID
- RDS endpoint
- ECR repository URI
- Secrets Manager ARN

Then register:

```bash
aws ecs register-task-definition \
  --cli-input-json file://aws/ecs-task-definition.json \
  --region us-east-1
```

### Step 6: Create Application Load Balancer

1. Go to EC2 → Load Balancers → Create
2. Type: **Application Load Balancer**
3. Scheme: **Internet-facing**
4. Listeners: HTTP (port 80)
5. Availability Zones: Select 2+ subnets
6. Security Group: Allow HTTP/HTTPS from 0.0.0.0/0
7. Target Group: Create new
   - Name: `eto-subgraph-tg`
   - Protocol: HTTP
   - Port: 80
   - Health check path: `/health`
8. Create

### Step 7: Create ECS Service

```bash
aws ecs create-service \
  --cluster eto-subgraph-cluster \
  --service-name eto-subgraph-service \
  --task-definition eto-subgraph \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:REGION:ACCOUNT:targetgroup/eto-subgraph-tg/xxx,containerName=graph-node-nginx,containerPort=80"
```

## SSL Certificate Setup (Optional but Recommended)

### Option 1: AWS Certificate Manager (ACM)

1. Request certificate in ACM
2. Validate via DNS
3. Update ALB listener to use HTTPS (port 443)
4. Redirect HTTP → HTTPS

### Option 2: CloudFront CDN

1. Create CloudFront distribution
2. Origin: Your ALB DNS name
3. SSL certificate: Use ACM certificate
4. Update frontend to use CloudFront URL

## Environment Variables

Set these in ECS Task Definition or Secrets Manager:

```bash
POSTGRES_HOST=<rds-endpoint>
POSTGRES_USER=graph-node
POSTGRES_PASSWORD=<from-secrets-manager>
POSTGRES_DB=graph-node
ETHEREUM_RPC_URL=https://eto.ash.center/rpc
GRAPH_LOG=info
```

## Monitoring

### CloudWatch Logs

```bash
# View logs
aws logs tail /ecs/eto-subgraph --follow

# Set up alarms
aws cloudwatch put-metric-alarm \
  --alarm-name eto-subgraph-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

### Health Checks

- ALB health check: `/health` endpoint
- ECS health check: Configured in task definition
- CloudWatch alarms: CPU, memory, HTTP errors

## Cost Estimation

| Service | Size | Monthly Cost |
|---------|------|--------------|
| RDS PostgreSQL | db.t3.micro | ~$15 |
| ECS Fargate | 2 vCPU, 4GB RAM | ~$30 |
| Application Load Balancer | Standard | ~$20 |
| CloudFront CDN | 100GB transfer | ~$10 |
| CloudWatch Logs | 5GB | ~$2 |
| **Total** | | **~$77/month** |

## Troubleshooting

### Service won't start
- Check CloudWatch logs: `/ecs/eto-subgraph`
- Verify security groups allow traffic
- Check RDS connectivity from ECS task

### High latency
- Enable CloudFront CDN
- Increase ECS task CPU/memory
- Use RDS read replicas (if needed)

### Database connection errors
- Verify security group allows port 5432
- Check RDS endpoint is correct
- Verify password in Secrets Manager

## Next Steps

1. ✅ Deploy infrastructure (Terraform or manual)
2. ✅ Build and push Docker image
3. ✅ Create ECS service
4. ✅ Test GraphQL endpoint
5. ✅ Set up SSL certificate
6. ✅ Configure CloudFront CDN
7. ✅ Update frontend `VITE_SUBGRAPH_URL`
8. ✅ Set up monitoring/alerts
9. ✅ Configure backups

## Frontend Integration

After deployment, update your frontend:

```env
VITE_SUBGRAPH_URL=https://your-alb-dns-name/subgraphs/name/eto-protocol/eto-mainnet
# Or with CloudFront:
VITE_SUBGRAPH_URL=https://d1234567890.cloudfront.net/subgraphs/name/eto-protocol/eto-mainnet
```

The Zustand cache will automatically handle:
- ✅ Request caching (5 min TTL)
- ✅ Rate limiting (100 req/min)
- ✅ Error handling with fallback
- ✅ Query deduplication

