# What's Missing for AWS Deployment

## ✅ Complete (Ready to Deploy)

1. **Infrastructure as Code**
   - ✅ Terraform configuration (`terraform/main.tf`)
   - ✅ Variables file (`terraform/variables.tf`)
   - ✅ Example config (`terraform.tfvars.example`)

2. **Container Configuration**
   - ✅ Dockerfile (Graph Node + Nginx)
   - ✅ Nginx security config (`nginx.conf`)
   - ✅ Health check endpoint

3. **ECS Configuration**
   - ✅ Task definition template (`ecs-task-definition.json`)
   - ✅ IAM roles configuration
   - ✅ CloudWatch logging setup
   - ✅ Secrets Manager integration

4. **Security**
   - ✅ Rate limiting (100 req/min)
   - ✅ CORS protection
   - ✅ Request size limits
   - ✅ Security groups
   - ✅ Private subnets for RDS

5. **Deployment Automation**
   - ✅ Deployment script (`deploy.sh`)
   - ✅ Documentation (`AWS_DEPLOYMENT.md`)
   - ✅ Checklist (`checklist.md`)

## ⚠️ Manual Steps Required

### 1. AWS Account Setup (5 minutes)
```bash
# Install AWS CLI if not installed
brew install awscli  # macOS
# or
sudo apt install awscli  # Linux

# Configure
aws configure
# Enter: Access Key ID, Secret Key, Region (us-east-1), Output format (json)
```

### 2. Terraform Configuration (2 minutes)
```bash
cd subgraph/aws/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars - set secure db_password
```

### 3. IPFS Deployment Decision (10 minutes)

**Choose ONE approach:**

#### Option A: Separate ECS Service (Recommended)
- Deploy IPFS as separate ECS task
- Update task definition to include IPFS container
- Use service discovery for IPFS hostname

#### Option B: Managed IPFS Service (Easiest)
- Sign up for Pinata or Infura IPFS
- Update `subgraph.yaml` to use their endpoint
- No IPFS container needed

#### Option C: Same Container (Not Recommended)
- Include IPFS in Dockerfile (current approach)
- Works but not ideal for production scaling

### 4. SSL Certificate (15 minutes)
```bash
# Request certificate in ACM
aws acm request-certificate \
  --domain-name subgraph.eto.ash.center \
  --validation-method DNS \
  --region us-east-1

# Complete DNS validation (add CNAME to DNS)
# Then update ALB listener to use HTTPS
```

### 5. CloudFront CDN (Optional, 10 minutes)
- Create CloudFront distribution
- Origin: ALB DNS name
- SSL certificate: Use ACM cert
- Update frontend URL

### 6. Monitoring Setup (10 minutes)
```bash
# Create CloudWatch alarms
aws cloudwatch put-metric-alarm \
  --alarm-name eto-subgraph-high-cpu \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] AWS account created
- [ ] AWS CLI configured
- [ ] Terraform installed (`terraform --version`)
- [ ] Docker installed and running
- [ ] Domain name ready (for SSL)

### Infrastructure
- [ ] `terraform.tfvars` created with secure password
- [ ] `terraform init` completed
- [ ] `terraform plan` reviewed
- [ ] `terraform apply` executed
- [ ] Outputs saved (ALB DNS, RDS endpoint)

### Application
- [ ] Docker image built and pushed (`./aws/deploy.sh`)
- [ ] Task definition updated with real values
- [ ] ECS service created
- [ ] Health checks passing

### Security
- [ ] SSL certificate requested and validated
- [ ] HTTPS listener added to ALB
- [ ] Security groups reviewed
- [ ] Secrets Manager password set

### Frontend
- [ ] `VITE_SUBGRAPH_URL` updated
- [ ] Frontend rebuilt
- [ ] GraphQL queries tested
- [ ] Zustand cache verified

## 🚀 Quick Deploy Commands

```bash
# 1. Setup
cd subgraph/aws/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars

# 2. Deploy infrastructure
terraform init
terraform apply

# 3. Get outputs
ALB_DNS=$(terraform output -raw alb_dns_name)
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)

# 4. Build and push image
cd ../..
./aws/deploy.sh

# 5. Update task definition with real values
# Edit aws/ecs-task-definition.json:
# - Replace YOUR_RDS_ENDPOINT with $RDS_ENDPOINT
# - Replace YOUR_ECR_REPO with ECR URI from deploy.sh
# - Replace YOUR_ACCOUNT_ID with your AWS account ID

# 6. Register task definition
aws ecs register-task-definition \
  --cli-input-json file://aws/ecs-task-definition.json

# 7. Create ECS service (get subnet/SG IDs from Terraform outputs)
aws ecs create-service \
  --cluster eto-subgraph-cluster \
  --service-name eto-subgraph-service \
  --task-definition eto-subgraph \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:REGION:ACCOUNT:targetgroup/eto-subgraph-tg/xxx,containerName=graph-node-nginx,containerPort=80"
```

## 💰 Estimated Costs

| Service | Size | Monthly |
|---------|------|---------|
| RDS PostgreSQL | db.t3.micro | $15 |
| ECS Fargate | 2 vCPU, 4GB | $30 |
| ALB | Standard | $20 |
| CloudFront | 100GB | $10 |
| CloudWatch | 5GB logs | $2 |
| **Total** | | **~$77** |

## 🎯 Next Steps

1. **Read**: `AWS_DEPLOYMENT.md` for detailed guide
2. **Follow**: `checklist.md` step-by-step
3. **Deploy**: Run terraform apply
4. **Test**: Verify GraphQL endpoint works
5. **Monitor**: Set up CloudWatch alarms
6. **Optimize**: Review costs and performance

## ⚡ Fastest Path to Production

1. Use Terraform to create infrastructure (15 min)
2. Use `deploy.sh` to push Docker image (5 min)
3. Create ECS service manually via console (10 min)
4. Test endpoint (5 min)
5. Update frontend URL (2 min)

**Total time: ~37 minutes** (excluding SSL certificate validation)

