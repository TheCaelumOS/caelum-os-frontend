export interface PresetData {
  summary: {
    add: number;
    change: number;
    destroy: number;
    policies: number;
  };
  security: {
    score: number;
    previousScore: number;
    subMetrics: { name: string; score: number }[];
    recommendation: string;
  };
  cost: {
    score: number;
    previousScore: number;
    subMetrics: { name: string; score: number }[];
    recommendation: string;
  };
  files: {
    Terraform: string;
    Dockerfile: string;
    'Kubernetes YAML': string;
    JSON: string;
  };
  explanations: {
    Terraform: string;
    Dockerfile: string;
    'Kubernetes YAML': string;
    JSON: string;
  };
}

export const PRESETS: { [key: string]: PresetData } = {
  // PRESET 1: AWS ECS
  aws_ecs: {
    summary: { add: 5, change: 1, destroy: 0, policies: 4 },
    security: {
      score: 96,
      previousScore: 78,
      subMetrics: [
        { name: 'Network Isolation', score: 98 },
        { name: 'IAM Compliance', score: 92 },
        { name: 'SSL/TLS Encryption', score: 100 }
      ],
      recommendation: "AWS IAM policies are strictly scoped to the container execution role. AWS Shield protection is enabled on CloudFront."
    },
    cost: {
      score: 85,
      previousScore: 60,
      subMetrics: [
        { name: 'Right-sizing Resources', score: 88 },
        { name: 'Spot Instances Usage', score: 75 },
        { name: 'Orphaned Volumes Cleared', score: 92 }
      ],
      recommendation: "Fargate container sizes have been downscaled from medium to micro based on typical node application footprint."
    },
    files: {
      Terraform: `# AWS Provider Configuration
provider "aws" {
  region = "us-east-1"
}

# Virtual Private Cloud (VPC)
resource "aws_vpc" "caelum_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = {
    Name = "caelum-production-vpc"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "caelum-fargate-cluster"
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Application Load Balancer
resource "aws_lb" "alb" {
  name               = "caelum-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb_sg.id]
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_b.id]
}

# ECS Task Definition with Fargate
resource "aws_ecs_task_definition" "app" {
  family                   = "caelum-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  container_definitions = jsonencode([{
    name      = "caelum-web"
    image     = "caelum/web-app:latest"
    essential = true
    portMappings = [{
      containerPort = 3000
      hostPort      = 3000
    }]
  }])
}`,
      Dockerfile: `# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
USER node
CMD ["npm", "start"]`,
      'Kubernetes YAML': `apiVersion: apps/v1
kind: Deployment
metadata:
  name: caelum-app-deployment
  labels:
    app: caelum-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: caelum-web
  template:
    metadata:
      labels:
        app: caelum-web
    spec:
      containers:
      - name: web-app
        image: caelum/web-app:latest
        ports:
        - containerPort: 3000
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "200m"
            memory: "256Mi"`,
      JSON: `{
  "caelumOrchestrationId": "clm-f47a9b",
  "provider": "aws",
  "targetService": "ecs-fargate",
  "specVersion": "2.0.1",
  "securityScan": {
    "status": "passed",
    "vulnerabilities": 0,
    "complianceRules": ["CIS-AWS-1.4", "PCI-DSS-v4.0"]
  },
  "estimatedCost": {
    "monthlyUsd": 76.50,
    "breakdown": {
      "fargateContainers": 32.40,
      "albLoadBalancer": 22.10,
      "natGateway": 22.00
    }
  }
}`
    },
    explanations: {
      Terraform: "This script tells AWS to set up a private sandbox (VPC) where your applications live, plus an Elastic Container Service (ECS) cluster using Fargate.\n\nFargate is 'serverless container hosting', meaning you don't manage any VMs; AWS manages the servers and bills you only for the CPU/RAM your app uses.",
      Dockerfile: "This is a two-stage build file for Node.js/Next.js.\n\nStage 1 compiles the application using the full Node development toolkit. Stage 2 copies only the production-compiled files into a barebones Alpine Linux container. This keeps the final image tiny and secure by stripping node_modules and developer tools.",
      'Kubernetes YAML': "This Kubernetes Manifest declares that 3 duplicate containers (replicas) of your app should run concurrently behind a controller.\n\nIf any container crashes, Kubernetes automatically recreates it. Resource limits are configured to prevent memory leaks from starving other services on the node.",
      JSON: "This metadata file is CaelumOS's internal specification. It indexes security scanning outcomes, tracks compliance guidelines like PCI-DSS, and estimates the exact cloud bill breakdown before deployment ($76.50/month) so you never encounter unexpected costs."
    }
  },

  // PRESET 2: AZURE KUBERNETES
  azure_k8s: {
    summary: { add: 8, change: 0, destroy: 0, policies: 6 },
    security: {
      score: 89,
      previousScore: 65,
      subMetrics: [
        { name: 'Network Isolation', score: 90 },
        { name: 'IAM Compliance', score: 85 },
        { name: 'SSL/TLS Encryption', score: 92 }
      ],
      recommendation: "Azure Active Directory integration is configured. Network security groups restrict port 80/443 access directly to Azure Front Door endpoints."
    },
    cost: {
      score: 92,
      previousScore: 70,
      subMetrics: [
        { name: 'Right-sizing Resources', score: 94 },
        { name: 'Spot Instances Usage', score: 90 },
        { name: 'Orphaned Volumes Cleared', score: 92 }
      ],
      recommendation: "Developer Kubernetes cluster is set to automatically power down nodes outside of business hours (8 PM - 7 AM), saving roughly 42% on VM runtime."
    },
    files: {
      Terraform: `# Azure Provider Configuration
provider "azurerm" {
  features {}
}

# Azure Resource Group
resource "azurerm_resource_group" "rg" {
  name     = "caelum-k8s-rg"
  location = "East US"
}

# Virtual Network
resource "azurerm_virtual_network" "vnet" {
  name                = "caelum-vnet"
  address_space       = ["10.1.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

# Azure Kubernetes Service (AKS)
resource "azurerm_kubernetes_cluster" "aks" {
  name                = "caelum-aks-dev"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "caelumdev"

  default_node_pool {
    name       = "devpool"
    node_count = 2
    vm_size    = "Standard_D2s_v5"
    os_disk_size_gb = 30
  }

  identity {
    type = "SystemAssigned"
  }
}`,
      Dockerfile: `# Build stage for Go application
FROM golang:1.20-alpine AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api

# Run stage
FROM alpine:3.18
WORKDIR /app
COPY --from=builder /src/main .
EXPOSE 8080
CMD ["./main"]`,
      'Kubernetes YAML': `apiVersion: apps/v1
kind: Deployment
metadata:
  name: go-api-service
  namespace: development
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "8080"
spec:
  replicas: 2
  selector:
    matchLabels:
      app: go-api
  template:
    metadata:
      labels:
        app: go-api
    spec:
      containers:
      - name: go-api
        image: caelum/go-api:latest
        ports:
        - containerPort: 8080
        resources:
          limits:
            cpu: "200m"
            memory: "256Mi"
          requests:
            cpu: "100m"
            memory: "128Mi"`,
      JSON: `{
  "caelumOrchestrationId": "clm-b88301",
  "provider": "azure",
  "targetService": "aks-kubernetes",
  "specVersion": "2.0.1",
  "securityScan": {
    "status": "passed",
    "vulnerabilities": 1,
    "vulnerabilitySeverity": "low"
  },
  "estimatedCost": {
    "monthlyUsd": 114.20,
    "breakdown": {
      "aksControlPlane": 0.00,
      "vmInstances": 94.20,
      "managedStorage": 20.00
    }
  }
}`
    },
    explanations: {
      Terraform: "This code configures Microsoft Azure to set up a Resource Group (a neat folder for your cloud resources) and provisions a managed Azure Kubernetes Service (AKS) cluster.\n\nThe cluster is configured with a 'Standard_D2s_v5' instance pool, optimized for light developer testing while keeping Azure bills low.",
      Dockerfile: "This is a two-stage Dockerfile designed for Go microservices.\n\nStage 1 downloads libraries and compiles Go source files into a statically linked binary. Stage 2 copies the single output binary onto a super lightweight Linux distribution (Alpine), yielding a final image size under 15MB.",
      'Kubernetes YAML': "This manifest deploys the compiled Go API container into your AKS cluster.\n\nIt embeds annotation configurations for Prometheus, signaling the monitoring agent to scrape application performance data and forward it to Grafana automatically.",
      JSON: "This specification contains metadata about your Azure deployment.\n\nIt marks a low-severity security alert (a warning to update package versions), outlines that the AKS control plane is free on Azure, and estimates the VM compute cost at $94.20 per month."
    }
  },

  // PRESET 3: POSTGRESQL DB
  postgres_db: {
    summary: { add: 4, change: 2, destroy: 0, policies: 5 },
    security: {
      score: 98,
      previousScore: 82,
      subMetrics: [
        { name: 'Network Isolation', score: 100 },
        { name: 'IAM Compliance', score: 95 },
        { name: 'SSL/TLS Encryption', score: 100 }
      ],
      recommendation: "Database is placed inside a private subnet. TLS 1.3 is enforced for all queries. Database storage is encrypted with customer-managed KMS keys."
    },
    cost: {
      score: 82,
      previousScore: 50,
      subMetrics: [
        { name: 'Right-sizing Resources', score: 80 },
        { name: 'Spot Instances Usage', score: 70 },
        { name: 'Orphaned Volumes Cleared', score: 96 }
      ],
      recommendation: "RDS storage is configured with GP3 volumes with IOPS matching query frequency. Backup retention period set to 7 days."
    },
    files: {
      Terraform: `# AWS RDS PostgreSQL Instance Configuration
resource "aws_db_instance" "postgres" {
  identifier           = "caelum-postgres-prod"
  allocated_storage    = 20
  max_allocated_storage = 100
  storage_type         = "gp3"
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.t4g.micro"
  db_name              = "caelum_db"
  username             = "caelum_admin"
  password             = var.db_password
  parameter_group_name = "default.postgres15"
  
  # Security
  publicly_accessible  = false
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  storage_encrypted    = true
  kms_key_id           = aws_kms_key.db_key.arn

  # Backups
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
}`,
      Dockerfile: `# Custom PostgreSQL image with automated backup scripts
FROM postgres:15-alpine
RUN apk add --no-cache aws-cli
COPY backup-script.sh /usr/local/bin/backup-script.sh
RUN chmod +x /usr/local/bin/backup-script.sh
# Run pg_dump CRON job in background
RUN echo "0 2 * * * /usr/local/bin/backup-script.sh" >> /etc/crontabs/root
CMD ["postgres"]`,
      'Kubernetes YAML': `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-data-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres-db
spec:
  serviceName: "postgres-service"
  replicas: 1
  selector:
    matchLabels:
      app: postgres-db
  template:
    metadata:
      labels:
        app: postgres-db
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data`,
      JSON: `{
  "caelumOrchestrationId": "clm-d558a2",
  "provider": "aws",
  "targetService": "rds-postgres",
  "specVersion": "2.0.1",
  "securityScan": {
    "status": "passed",
    "dataEncryption": "AES-256-KMS",
    "networkIsolation": "fully-isolated"
  },
  "estimatedCost": {
    "monthlyUsd": 44.50,
    "breakdown": {
      "dbInstanceCompute": 15.60,
      "allocatedStorage": 2.40,
      "kmsKeyArn": 1.00,
      "crossZoneReplication": 25.50
    }
  }
}`
    },
    explanations: {
      Terraform: "This Terraform script creates a relational database in AWS (RDS) running PostgreSQL.\n\nCrucially, 'publicly_accessible' is set to false, locking down the database so that hacker attacks from the open internet are physically blocked. Storage is also fully encrypted using a key you control.",
      Dockerfile: "This Dockerfile builds on top of the standard PostgreSQL Alpine container.\n\nIt embeds the AWS CLI and schedules a nightly task (Cron) that backs up the database state, compresses it, and securely transfers it to an AWS S3 bucket for disaster recovery.",
      'Kubernetes YAML': "This script configures a StatefulSet in Kubernetes. Unlike standard deployments, StatefulSets are designed for database software because they ensure that database disk data (PersistentVolumeClaims) remains mapped to the database instance even if the pod is rescheduled.",
      JSON: "This CaelumOS report estimates your RDS database cost at $44.50/month.\n\nThe calculation breaks down basic database compute, storage space, and key replication costs across multi-zone networks to guarantee high database availability."
    }
  }
};
