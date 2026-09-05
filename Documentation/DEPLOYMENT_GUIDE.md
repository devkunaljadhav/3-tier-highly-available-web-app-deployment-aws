# 🚀 AWS 3-Tier Architecture Application Deployment Guide

A production-grade, highly available, secure deployment guide for a 3-Tier Web Application on Amazon Web Services (AWS).

---

## 🏛️ Architecture Overview

The system is architected into 3 distinct isolated tiers across 2 Availability Zones:

```
[ Internet Users ]
       │
       ▼ (HTTP / HTTPS)
[ External Application Load Balancer (Public Subnets) ]
       │
       ▼ (Port 80)
[ Web Tier: Nginx + React.js SPA (Public Subnets) ]
       │
       ▼ (Reverse Proxy /api/ -> Port 80)
[ Internal Application Load Balancer (Private App Subnets) ]
       │
       ▼ (Port 4000)
[ Application Tier: Node.js Express + PM2 (Private App Subnets) ]
       │
       ▼ (Port 3306)
[ Database Tier: Amazon RDS MySQL Multi-AZ (Private DB Subnets) ]
```

---

## 📋 Infrastructure Prerequisites Checklist

### 1. VPC Configuration
- **VPC Name**: `3-tier-project-vpc`
- **CIDR Block**: `192.168.0.0/16`
- **Availability Zones**: `2` (e.g., `ap-south-1a` and `ap-south-1b`)
- **Subnets** (6 total):
  - `Public-Subnet-1` (192.168.1.0/24) & `Public-Subnet-2` (192.168.2.0/24)
  - `App-Private-Subnet-1` (192.168.3.0/24) & `App-Private-Subnet-2` (192.168.4.0/24)
  - `DB-Private-Subnet-1` (192.168.5.0/24) & `DB-Private-Subnet-2` (192.168.6.0/24)
- **Internet Gateway (IGW)**: Attached to VPC for Public Subnets.
- **NAT Gateway**: Deployed in a Public Subnet for outbound traffic from Private Subnets.

---

### 2. Security Groups Matrix

| Security Group | Inbound Rules | Purpose |
| :--- | :--- | :--- |
| **`WebALB-SG`** | HTTP (80) & HTTPS (443) from `0.0.0.0/0` | Public entrance for end users |
| **`Web-SG`** | HTTP (80) & HTTPS (443) from `WebALB-SG` | Allows traffic only from Web ALB |
| **`AppALB-SG`** | HTTP (80) from `Web-SG` | Internal load balancing for App tier |
| **`App-SG`** | Custom TCP (4000) from `AppALB-SG` | Node.js backend port access |
| **`Database-SG`**| MySQL (3306) from `App-SG` | Isolated database access |

---

### 3. IAM Role for EC2 Instances
- **Role Name**: `3-tier-ec2-role`
- **Trusted Entity**: `EC2`
- **Policies**:
  - `AmazonSSMManagedInstanceCore` (Allows SSH-less secure access via AWS Systems Manager Session Manager)
  - `AmazonS3ReadOnlyAccess` (To download application artifacts)

---

## 🚀 Step-by-Step Deployment Procedure

### Tier 1: Amazon RDS MySQL Database Setup
1. **Create DB Subnet Group**:
   - Name: `tier-db-subnet-group`
   - VPC: `3-tier-project-vpc`
   - Subnets: Select `DB-Private-Subnet-1` and `DB-Private-Subnet-2`.
2. **Create RDS Instance**:
   - Engine: **MySQL** (Community 8.0)
   - DB Identifier: `my3tierdb`
   - Master Username: `admin`
   - Master Password: `root123456`
   - VPC: `3-tier-project-vpc`
   - DB Subnet Group: `tier-db-subnet-group`
   - Public Access: **No**
   - VPC Security Group: Select `Database-SG`.
3. **Note the RDS Endpoint**:
   `my3tierdb.xxxxxx.ap-south-1.rds.amazonaws.com`

---

### Tier 2: Application Tier (Backend) Setup
1. **Launch App Tier EC2 Instance**:
   - Name: `App-Server`
   - AMI: Amazon Linux 2023 (or AL2)
   - Instance Type: `t3.micro`
   - Subnet: `App-Private-Subnet-1`
   - Auto-assign Public IP: **Disable**
   - Security Group: `App-SG`
   - IAM Instance Profile: `3-tier-ec2-role`
2. **Connect via AWS SSM Session Manager**:
   ```bash
   sudo -s
   cd /home/ec2-user
   ```
3. **Initialize Database Schema**:
   ```bash
   # Install DB client
   sudo dnf install -y mariadb105

   # Connect and run SQL initialization
   mysql -h <YOUR-RDS-ENDPOINT> -u admin -p
   ```
   Paste the content of [scripts/db-init.sql](file:///d:/DevOps%20%2831-05-26%29/CLASS/Projects/3-tier-app-deployment-aws/scripts/db-init.sql).

4. **Deploy Application Code**:
   ```bash
   # Run automated App setup script or execute:
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   source ~/.bashrc
   nvm install 18 && nvm use 18
   npm install -g pm2

   # Copy app-tier code to /home/ec2-user/app-tier
   cd /home/ec2-user/app-tier
   npm install
   pm2 start index.js --name "app-tier"
   pm2 save
   pm2 startup

   # Verify health check
   curl http://localhost:4000/health
   ```

5. **Create Internal Application Load Balancer**:
   - **Target Group (`App-TG`)**:
     - Target Type: Instance | Protocol: HTTP | Port: 4000
     - Health Check Path: `/health`
     - Register `App-Server`.
   - **Load Balancer (`app-internal-alb`)**:
     - Scheme: **Internal**
     - Subnets: Select Private App Subnets (`App-Private-Subnet-1`, `App-Private-Subnet-2`).
     - Security Group: `AppALB-SG`
     - Listener: Port 80 -> Forward to `App-TG`.
   - **Note the Internal ALB DNS Name**:
     `internal-app-internal-alb-xxxx.ap-south-1.elb.amazonaws.com`

---

### Tier 3: Presentation Tier (Web / Nginx) Setup
1. **Launch Web Tier EC2 Instance**:
   - Name: `Web-Server`
   - AMI: Amazon Linux 2023
   - Instance Type: `t3.micro`
   - Subnet: `Public-Subnet-1`
   - Auto-assign Public IP: **Enable**
   - Security Group: `Web-SG`
   - IAM Instance Profile: `3-tier-ec2-role`

2. **Connect via Session Manager**:
   ```bash
   sudo -s
   cd /home/ec2-user
   ```

3. **Deploy Web Code & Configure Nginx**:
   ```bash
   # Install Node.js
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   source ~/.bashrc
   nvm install 18 && nvm use 18

   # Build React frontend
   cd /home/ec2-user/web-tier
   npm install
   npm run build

   # Install Nginx
   sudo dnf install -y nginx

   # Update /etc/nginx/nginx.conf with proxy_pass pointing to Internal ALB DNS
   sudo cp /home/ec2-user/nginx.conf /etc/nginx/nginx.conf
   sudo chmod -R 755 /home/ec2-user

   # Test and start Nginx
   sudo nginx -t
   sudo systemctl restart nginx
   sudo systemctl enable nginx
   ```

4. **Create External Internet-Facing Application Load Balancer**:
   - **Target Group (`Web-TG`)**:
     - Target Type: Instance | Protocol: HTTP | Port: 80
     - Health Check Path: `/health` (or `/`)
     - Register `Web-Server`.
   - **Load Balancer (`app-external-alb`)**:
     - Scheme: **Internet-facing**
     - Subnets: Select Public Subnets (`Public-Subnet-1`, `Public-Subnet-2`).
     - Security Group: `WebALB-SG`
     - Listener: Port 80 -> Forward to `Web-TG`.

---

## 🎯 Verification

Open your web browser and navigate to your **External ALB DNS Name**:
- `http://<app-external-alb-xxxx.ap-south-1.elb.amazonaws.com>`
- Test the **DB Demo** page: Add a transaction and verify persistence in MySQL.
- Run health checks:
  - Web Tier: `http://<external-alb-dns>/health`
  - API Health: `http://<external-alb-dns>/api/health`

---

## 🆘 Troubleshooting
Refer to the complete [TROUBLESHOOTING_GUIDE.md](file:///d:/DevOps%20%2831-05-26%29/CLASS/Projects/3-tier-app-deployment-aws/Documentation/TROUBLESHOOTING_GUIDE.md) for solutions to any errors encountered during setup.
