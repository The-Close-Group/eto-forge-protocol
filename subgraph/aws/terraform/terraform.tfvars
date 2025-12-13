# =============================================================================
# ETO Protocol Subgraph - AWS Terraform Configuration
# Chain ID: 69670 | RPC: https://eto.ash.center/rpc
# =============================================================================

aws_region           = "us-east-1"
project_name         = "eto-subgraph"
vpc_cidr             = "10.0.0.0/16"

# Database Configuration
db_password          = "EtoSubgraph2025SecurePass!"  # Strong password for RDS
db_instance_class    = "db.t3.micro"
db_allocated_storage = 20

# Use existing IAM roles (since we have limited IAM permissions)
use_existing_iam_roles          = true
existing_ecs_execution_role_arn = "arn:aws:iam::905418078110:role/ecsTaskExecutionRole"
existing_ecs_task_role_arn      = "arn:aws:iam::905418078110:role/ecsTaskExecutionRole"

# Load Balancer
create_alb = true
