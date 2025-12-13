# AWS Deployment Checklist

## Pre-Deployment

- [ ] AWS account created and configured
- [ ] AWS CLI installed (`aws --version`)
- [ ] Terraform installed (optional, `terraform --version`)
- [ ] Docker installed and running
- [ ] Domain name ready (optional, for SSL)
- [ ] Budget alerts configured in AWS

## Infrastructure Setup

### Using Terraform (Recommended)
- [ ] `terraform.tfvars` created with secure password
- [ ] `terraform init` completed
- [ ] `terraform plan` reviewed
- [ ] `terraform apply` executed
- [ ] Outputs saved (ALB DNS, RDS endpoint, etc.)

### Manual Setup
- [ ] VPC created with public/private subnets
- [ ] Internet Gateway attached
- [ ] NAT Gateway created (for private subnets)
- [ ] Route tables configured
- [ ] Security groups created:
  - [ ] ALB security group (ports 80, 443)
  - [ ] ECS security group (port 80 from ALB)
  - [ ] RDS security group (port 5432 from ECS)
- [ ] RDS PostgreSQL created:
  - [ ] Instance: db.t3.micro
  - [ ] Database: graph-node
  - [ ] Username: graph-node
  - [ ] Password stored in Secrets Manager
  - [ ] Backup enabled (7 days retention)
- [ ] ECR repository created
- [ ] ECS cluster created
- [ ] CloudWatch log group created
- [ ] IAM roles created:
  - [ ] ECS execution role
  - [ ] ECS task role
  - [ ] Secrets Manager access policy

## Application Deployment

- [ ] Docker image built locally
- [ ] Image pushed to ECR (`./aws/deploy.sh`)
- [ ] Task definition updated with:
  - [ ] ECR image URI
  - [ ] Environment variables
  - [ ] Secrets Manager ARN
  - [ ] Health check configuration
- [ ] ECS service created:
  - [ ] Task definition registered
  - [ ] Service created with ALB target group
  - [ ] Desired count: 1 (or more for HA)
  - [ ] Auto-scaling configured (optional)

## Load Balancer & Networking

- [ ] Application Load Balancer created
- [ ] Target group created with health check
- [ ] Listener configured (HTTP port 80)
- [ ] HTTPS listener added (port 443, if SSL configured)
- [ ] ALB DNS name noted

## SSL & Security

- [ ] SSL certificate requested in ACM
- [ ] DNS validation completed
- [ ] HTTPS listener added to ALB
- [ ] HTTP → HTTPS redirect configured
- [ ] Security groups reviewed
- [ ] Secrets Manager password rotated (if needed)

## CDN (Optional but Recommended)

- [ ] CloudFront distribution created
- [ ] Origin: ALB DNS name
- [ ] SSL certificate attached
- [ ] Caching policy configured
- [ ] CloudFront URL noted

## Monitoring & Alarms

- [ ] CloudWatch alarms created:
  - [ ] High CPU (>80%)
  - [ ] High memory (>80%)
  - [ ] HTTP 5xx errors
  - [ ] Service unavailable
- [ ] SNS topic created for alerts
- [ ] Email/Slack notifications configured
- [ ] Dashboard created in CloudWatch

## Testing

- [ ] Health check endpoint works (`/health`)
- [ ] GraphQL query test successful
- [ ] Rate limiting verified (100 req/min)
- [ ] CORS headers correct
- [ ] SSL certificate valid (if configured)
- [ ] CloudFront caching works (if used)

## Frontend Integration

- [ ] `VITE_SUBGRAPH_URL` updated in `.env`
- [ ] Frontend rebuilt and deployed
- [ ] GraphQL queries working from frontend
- [ ] Zustand cache functioning
- [ ] Error handling tested

## Backup & Disaster Recovery

- [ ] RDS automated backups enabled
- [ ] Backup retention: 7 days
- [ ] Manual snapshot taken
- [ ] Restore procedure documented
- [ ] Disaster recovery plan created

## Documentation

- [ ] Deployment guide reviewed
- [ ] Runbook created for operations
- [ ] Troubleshooting guide written
- [ ] Team access configured
- [ ] Cost monitoring setup

## Post-Deployment

- [ ] Service running stable for 24 hours
- [ ] Performance metrics reviewed
- [ ] Cost analysis completed
- [ ] Security audit performed
- [ ] Documentation updated

## Maintenance

- [ ] Regular backup verification scheduled
- [ ] Security updates planned
- [ ] Cost optimization review monthly
- [ ] Performance tuning as needed

