# terraform.tfvars - never commit secrets!

aws_region           = "us-east-1"
project_name         = "eto-subgraph"
vpc_cidr             = "10.0.0.0/16"
db_password          = "eto-subgraph-secure-2024"
db_instance_class    = "db.t3.micro"
db_allocated_storage = 20

# Use existing IAM roles (since your user doesn't have iam:CreateRole permission)
use_existing_iam_roles          = true
existing_ecs_execution_role_arn = "arn:aws:iam::905418078110:role/ecsTaskExecutionRole"
existing_ecs_task_role_arn      = "arn:aws:iam::905418078110:role/ecsTaskExecutionRole"

# Disable ALB creation (requires iam:CreateServiceLinkedRole which you don't have)
# You can enable this later once an admin creates the service-linked role
create_alb = false
