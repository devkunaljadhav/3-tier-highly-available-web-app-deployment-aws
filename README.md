# 🌐 AWS 3-Tier Enterprise Web Application Deployment

[![AWS](https://img.shields.io/badge/AWS-Cloud-orange?logo=amazon-aws)](https://aws.amazon.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://reactjs.org/)
[![Nginx](https://img.shields.io/badge/Nginx-Reverse_Proxy-009639?logo=nginx)](https://nginx.org/)
[![MySQL](https://img.shields.io/badge/Amazon_RDS-MySQL_8.0-blue?logo=mysql)](https://aws.amazon.com/rds/)

A production-grade, highly available, secure deployment of a **3-Tier Web Application** on Amazon Web Services (AWS) using React.js (Presentation Tier), Node.js Express & PM2 (Application Tier), and Amazon RDS MySQL (Database Tier) across Multi-AZs.

---

## 🏛️ System Architecture

![3-Tier Architecture](Archicture-diagram/image.webp)

```
[ Internet Users / Client Browser ]
                │
                ▼ (HTTP: 80 / HTTPS: 443)
[ External Application Load Balancer ] (Public Subnets)
                │
                ▼ (Port 80)
┌─────────────────────────────────────────────────────────────┐
│ 🌐 Web / Presentation Tier (Public Subnets)                  │
│  - React.js Single Page Application (SPA)                   │
│  - Nginx Web Server & Reverse Proxy (/api/)                 │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼ (HTTP: 80)
[ Internal Application Load Balancer ] (Private App Subnets)
                                │
                                ▼ (Port 4000)
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ Application Tier (Private Subnets)                       │
│  - Node.js Express REST API                                 │
│  - PM2 Process Manager for clustering & auto-restart        │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼ (TCP: 3306)
┌─────────────────────────────────────────────────────────────┐
│ 🗄️ Database Tier (Private DB Subnets)                       │
│  - Amazon RDS MySQL 8.x Multi-AZ Deployment                 │
│  - Isolated from Internet, accessible only via App Tier     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Repository Structure

```
.
├── App-tire/
│   └── app-tier/                  # Node.js backend REST API
│       ├── .env.example           # Environment variables template
│       ├── DbConfig.js            # Database configuration (dotenv support)
│       ├── TransactionService.js  # MySQL connection pool & CRUD operations
│       ├── index.js               # Express app routes & health endpoints
│       └── package.json           # Backend dependencies (mysql2, express)
├── Web-tire/
│   └── web-tier/                  # React.js frontend presentation tier
│       ├── public/                # Static assets & index.html
│       ├── src/                   # React components (Home, DatabaseDemo, Menu)
│       └── package.json           # Frontend dependencies & scripts
├── Documentation/
│   ├── DEPLOYMENT_GUIDE.md        # Step-by-step comprehensive deployment guide
│   ├── TROUBLESHOOTING_GUIDE.md   # Complete error diagnosis and fix handbook
│   └── 3-Tier Architecture Application Steps.txt
├── scripts/
│   ├── setup-app-tier.sh          # Automated App Tier setup script
│   ├── setup-web-tier.sh          # Automated Web Tier setup script
│   ├── db-init.sql                # MySQL database & table creation SQL
│   └── health-check.sh            # CLI diagnostic health check tool
├── nginx.conf                     # Production Nginx reverse proxy configuration
├── error.txt                      # Historical bug resolution log
└── README.md                      # Project overview & documentation
```

---

## 🚀 Quick Start Guide

### 1. Database Initialization
Run the initialization SQL script on your RDS MySQL instance:
```bash
mysql -h <rds-endpoint> -u admin -p < scripts/db-init.sql
```

### 2. Automated App Tier Setup (EC2 Private Subnet)
Execute the App Tier setup script:
```bash
chmod +x scripts/setup-app-tier.sh
./scripts/setup-app-tier.sh
```

### 3. Automated Web Tier Setup (EC2 Public Subnet)
Execute the Web Tier setup script:
```bash
chmod +x scripts/setup-web-tier.sh
./scripts/setup-web-tier.sh
```

---

## 🔍 Health Check Endpoints

| Tier / Component | Endpoint | Expected Response |
| :--- | :--- | :--- |
| **Web Tier (Nginx)** | `http://<web-alb-dns>/health` | `HTTP 200 OK (Web Tier Health Check OK)` |
| **API Health & DB Status** | `http://<web-alb-dns>/api/health` | `{"status":"UP","database":{"status":"connected"}}` |
| **App Tier Direct** | `http://localhost:4000/health` | System metadata & DB connectivity |

---

## 🛠️ Documentation & Troubleshooting

- 📖 **Full Deployment Guide**: [Documentation/DEPLOYMENT_GUIDE.md](Documentation/DEPLOYMENT_GUIDE.md)
- 🆘 **Troubleshooting Guide**: [Documentation/TROUBLESHOOTING_GUIDE.md](Documentation/TROUBLESHOOTING_GUIDE.md) (Fixes for 502 Bad Gateway, RDS Connection Timeout, Nginx errors, Target Group unhealthy states, etc.)

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.