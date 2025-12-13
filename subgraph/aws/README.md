# AWS Deployment Files

## Quick Reference

### Files Structure
```
aws/
├── deploy.sh                    # Automated deployment script
├── ecs-task-definition.json     # ECS task definition template
├── AWS_DEPLOYMENT.md            # Full deployment guide
├── checklist.md                  # Deployment checklist
├── terraform/
│   ├── main.tf                  # Infrastructure as code
│   ├── variables.tf             # Terraform variables
│   └── terraform.tfvars.example # Example config
└── README.md                    # This file
```

## What's Missing for AWS Deployment?

### ✅ Already Created
- [x] Dockerfile for containerization
- [x] Nginx configuration with security
- [x] ECS Task Definition template
- [x] Terraform infrastructure code
- [x] Deployment automation script
- [x] Security groups configuration
- [x] RDS PostgreSQL setup
- [x] Load balancer configuration
- [x] CloudWatch logging setup
- [x] Secrets Manager integration

### ⚠️ Still Needed (Manual Steps)

1. **AWS Account Setup**
   - [ ] Create AWS account
   - [ ] Configure AWS CLI (`aws configure`)
   - [ ] Set up billing alerts

2. **Terraform Variables**
   - [ ] Copy `terraform/terraform.tfvars.example` to `terraform.tfvars`
   - [ ] Fill in secure database password
   - [ ] Review and adjust region/resources

3. **IPFS Deployment** (Choose one):
   - [ ] **Option A**: Deploy IPFS as separate ECS service (recommended)
   - [ ] **Option B**: Use managed IPFS (Pinata/Infura) - update subgraph.yaml
   - [ ] **Option C**: Include IPFS in same task (not recommended)

4. **SSL Certificate**
   - [ ] Request ACM certificate
   - [ ] Complete DNS validation
   - [ ] Update ALB listener to HTTPS

5. **CloudFront CDN** (Optional)
   - [ ] Create CloudFront distribution
   - [ ] Point to ALB
   - [ ] Configure caching rules

6. **Monitoring**
   - [ ] Set up CloudWatch alarms
   - [ ] Configure SNS notifications
   - [ ] Create CloudWatch dashboard

7. **Frontend Integration**
   - [ ] Update `VITE_SUBGRAPH_URL` environment variable
   - [ ] Test GraphQL queries
   - [ ] Verify Zustand caching works

## Quick Start Commands

```bash
# 1. Setup Terraform
cd subgraph/aws/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars

# 2. Deploy infrastructure
terraform init
terraform plan
terraform apply

# 3. Build and push Docker image
cd ../..
./aws/deploy.sh

# 4. Create ECS service (after getting outputs from Terraform)
# See AWS_DEPLOYMENT.md for full commands
```

## Cost Estimate

| Resource | Monthly Cost |
|----------|-------------|
| RDS (db.t3.micro) | ~$15 |
| ECS Fargate (2 vCPU, 4GB) | ~$30 |
| Application Load Balancer | ~$20 |
| CloudFront (100GB) | ~$10 |
| CloudWatch Logs | ~$2 |
| **Total** | **~$77/month** |

## Next Steps

1. Read `AWS_DEPLOYMENT.md` for detailed instructions
2. Follow `checklist.md` step by step
3. Test locally first (already working ✅)
4. Deploy to AWS staging environment
5. Monitor and optimize

