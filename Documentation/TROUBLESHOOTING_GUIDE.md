# 🛠️ AWS 3-Tier Application Deployment - Comprehensive Troubleshooting & Error Resolution Guide

This handbook provides step-by-step diagnostic procedures, root-cause explanations, and immediate command fixes for all errors encountered during the deployment and operation of the AWS 3-Tier Web Application.

---

## 📑 Table of Contents
1. [Database & Amazon RDS MySQL Errors](#1-database--amazon-rds-mysql-errors)
2. [Nginx & Web Tier Errors (502, 403, 404, 504)](#2-nginx--web-tier-errors)
3. [App Tier & Node.js / PM2 Runtime Errors](#3-app-tier--nodejs--pm2-runtime-errors)
4. [AWS Application Load Balancer & Target Group Unhealthy States](#4-aws-alb--target-group-unhealthy-states)
5. [AWS Systems Manager (SSM) Connection Failures](#5-aws-systems-manager-ssm-connection-failures)
6. [Frontend React Build & Memory Errors](#6-frontend-react-build--memory-errors)
7. [Quick Diagnostic Command Cheat Sheet](#7-quick-diagnostic-command-cheat-sheet)

---

## 1. Database & Amazon RDS MySQL Errors

### 🔴 Error 1.1: `ER_NOT_SUPPORTED_AUTH_MODE` (Authentication Protocol Error)
- **Symptom**: App tier logs show: `Client does not support authentication protocol requested by server; consider upgrading MySQL client`.
- **Root Cause**: MySQL 8.x defaults to `caching_sha2_password`, which is incompatible with the legacy `mysql` npm driver.
- **Solution**:
  1. Use the modernized `mysql2` driver (already configured in this repository).
  2. If connecting directly or if authentication still fails, log in to MySQL on RDS and update the user authentication plugin:
     ```sql
     ALTER USER 'admin'@'%' IDENTIFIED WITH mysql_native_password BY 'root123456';
     FLUSH PRIVILEGES;
     ```

---

### 🔴 Error 1.2: `ETIMEDOUT` / Connection Timeout to RDS
- **Symptom**: `mysql -h <rds-endpoint> -u admin -p` hangs indefinitely or throws `ETIMEDOUT`.
- **Root Cause**: Security Group or Subnet Routing isolation.
- **Fix Checklist**:
  1. **Security Group Rule**: Verify that `Database-SG` has an Inbound Rule:
     - **Type**: `MySQL/Aurora (3306)`
     - **Source**: `App-SG` (or VPC CIDR `192.168.0.0/16`)
  2. **DB Subnet Group**: Ensure the RDS instance is placed in DB Subnets inside the custom VPC, NOT the default VPC.
  3. **App Server Subnet Route Table**: Verify the private subnet route table has a route to the NAT Gateway: `0.0.0.0/0 -> nat-xxxxxxxx`.

---

### 🔴 Error 1.3: `ER_NO_SUCH_TABLE: Table 'webappdb.transactions' doesn't exist`
- **Symptom**: Backend API returns `Table 'webappdb.transactions' doesn't exist`.
- **Solution**: Initialize the database and table schema:
  ```bash
  mysql -h <rds-endpoint> -u admin -p
  ```
  Run the SQL initialization commands from [scripts/db-init.sql](file:///d:/DevOps%20%2831-05-26%29/CLASS/Projects/3-tier-app-deployment-aws/scripts/db-init.sql):
  ```sql
  CREATE DATABASE IF NOT EXISTS webappdb;
  USE webappdb;
  CREATE TABLE IF NOT EXISTS transactions (
      id INT NOT NULL AUTO_INCREMENT,
      amount DECIMAL(10,2) NOT NULL,
      description VARCHAR(255) NOT NULL,
      PRIMARY KEY (id)
  );
  ```

---

## 2. Nginx & Web Tier Errors

### 🔴 Error 2.1: `502 Bad Gateway` on `/api/transaction`
- **Symptom**: Browser shows `502 Bad Gateway` or frontend reports fetch failure when accessing `/api/transaction`.
- **Root Cause**: Nginx reverse proxy cannot reach the Internal Application Load Balancer or Backend App instances.
- **Fix Steps**:
  1. **Check Nginx Config Proxy URL**:
     Open `/etc/nginx/nginx.conf` and verify `proxy_pass` points to the correct Internal ALB DNS name:
     ```nginx
     location /api/ {
         proxy_pass http://<YOUR-INTERNAL-ALB-DNS-NAME>:80/;
     }
     ```
  2. **Check AppALB Security Group**:
     - `AppALB-SG` Inbound must allow HTTP (Port 80) from `Web-SG`.
  3. **Check Backend App Tier Service**:
     Connect to the App Server and verify PM2 is active:
     ```bash
     pm2 status
     curl http://localhost:4000/health
     ```

---

### 🔴 Error 2.2: `403 Forbidden` on Web Tier Root (`/`)
- **Symptom**: Browsing to Web Server IP shows `403 Forbidden`.
- **Root Cause**: The Nginx process (`nginx` user) does not have read/execute permissions to traverse `/home/ec2-user/web-tier/build`.
- **Solution**:
  ```bash
  sudo chmod -R 755 /home/ec2-user
  sudo systemctl restart nginx
  ```

---

### 🔴 Error 2.3: `nginx: [emerg] unexpected "try_files"` (Nginx Syntax Error)
- **Symptom**: `systemctl start nginx` fails. Running `sudo nginx -t` shows:
  `nginx: [emerg] unexpected "try_files" in /etc/nginx/nginx.conf`.
- **Root Cause**: Missing semicolon `;` on the preceding line (`index index.html index.htm;`).
- **Solution**:
  Ensure line ends with a semicolon:
  ```nginx
  location / {
      root        /home/ec2-user/web-tier/build;
      index       index.html index.htm;
      try_files   $uri $uri/ /index.html;
  }
  ```
  Validate with:
  ```bash
  sudo nginx -t
  sudo systemctl restart nginx
  ```

---

### 🔴 Error 2.4: `404 Not Found` upon browser page refresh in React
- **Symptom**: Navigating to `/db` works, but refreshing the browser on `/db` results in Nginx 404.
- **Root Cause**: React is a Single Page Application (SPA). Nginx tries to look for a physical `/db` directory on disk.
- **Solution**: Add `try_files $uri $uri/ /index.html;` to Nginx `location /` block.

---

## 3. App Tier & Node.js / PM2 Runtime Errors

### 🔴 Error 3.1: PM2 Process in `errored` or `restart loop` State
- **Symptom**: `pm2 status` shows `status: errored` with high restart count.
- **Diagnosis**:
  ```bash
  pm2 logs app-tier --lines 50 --err
  ```
- **Common causes & solutions**:
  1. **Missing npm packages**: Run `cd /home/ec2-user/app-tier && npm install`.
  2. **Wrong Node version**: Run `node -v`. If < 16, switch using NVM: `nvm use 18 || nvm use 16`.
  3. **Port conflict**: `sudo fuser -k 4000/tcp` then `pm2 restart app-tier`.

---

### 🔴 Error 3.2: PM2 Does Not Auto-Start after EC2 Reboot
- **Symptom**: App server reboots and API goes down.
- **Solution**:
  ```bash
  pm2 save
  sudo env PATH=$PATH:$(dirname $(which pm2)) pm2 startup systemd -u ec2-user --hp /home/ec2-user
  ```

---

## 4. AWS ALB & Target Group Unhealthy States

### 🔴 Error 4.1: Target Group `App-TG` Status is `Unhealthy`
- **Symptom**: AWS Console Target Group shows `0/1 targets healthy`.
- **Fix Checklist**:
  1. **Health Check Path**: Ensure Health check path in App-TG is set to `/health` with Port `4000` (HTTP).
  2. **Security Group**: Ensure `App-SG` Inbound allows Port 4000 from `AppALB-SG`.
  3. **Test locally on App Instance**:
     ```bash
     curl -i http://localhost:4000/health
     # Must return HTTP 200 OK
     ```

---

### 🔴 Error 4.2: Target Group `Web-TG` Status is `Unhealthy`
- **Symptom**: External Load Balancer reports Web Tier instances as `Unhealthy`.
- **Fix Checklist**:
  1. **Health Check Path**: Ensure Health check path in Web-TG is set to `/health` on Port `80` (HTTP).
  2. **Security Group**: Ensure `Web-SG` Inbound allows Port 80 from `WebALB-SG`.
  3. **Nginx Status**: Verify Nginx is active: `sudo systemctl status nginx`.

---

## 5. AWS Systems Manager (SSM) Connection Failures

### 🔴 Error 5.1: "Session Manager cannot connect to instance"
- **Symptom**: In AWS EC2 console, "Connect via Session Manager" is greyed out or fails to start session.
- **Root Cause & Fixes**:
  1. **IAM Role**: Ensure the IAM Role attached to the EC2 instance contains policy:
     - `AmazonSSMManagedInstanceCore` (or `AdministratorAccess`).
  2. **Outbound Internet Access**: Private instances require outbound connectivity to reach AWS SSM endpoints.
     - Ensure Private Subnet has a Route `0.0.0.0/0` targeting a **NAT Gateway** in a Public Subnet.
  3. **Restart SSM Agent**:
     ```bash
     sudo systemctl status amazon-ssm-agent
     sudo systemctl restart amazon-ssm-agent
     ```

---

## 6. Frontend React Build & Memory Errors

### 🔴 Error 6.1: `npm run build` Fails due to Out of Memory on `t2.micro`
- **Symptom**: Build gets killed with `JavaScript heap out of memory` or `SIGKILL`.
- **Solution**: Add temporary Swap Space:
  ```bash
  sudo fallocate -l 1G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  free -m
  npm run build
  ```

---

### 🔴 Error 6.2: `npm run build` Fails due to `Treating warnings as errors because process.env.CI = true`
- **Solution**: Run build with CI disabled:
  ```bash
  CI=false npm run build
  ```

---

## 7. Quick Diagnostic Command Cheat Sheet

| Diagnostic Need | Command |
| :--- | :--- |
| **Check Nginx Config** | `sudo nginx -t` |
| **View Nginx Error Logs** | `sudo tail -n 50 /var/log/nginx/error.log` |
| **Check PM2 Status** | `pm2 status` |
| **View Backend Live Logs** | `pm2 logs app-tier` |
| **Test Backend Health** | `curl -i http://localhost:4000/health` |
| **Test Web Health** | `curl -i http://localhost/health` |
| **Test RDS MySQL Port** | `nc -zv <rds-endpoint> 3306` |
| **Check Listening Ports** | `sudo netstat -tulpn` or `ss -tulpn` |
| **Check System Memory & Swap** | `free -h` |
| **Check Directory Permissions** | `ls -ld /home/ec2-user/web-tier/build` |
