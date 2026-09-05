-- ==============================================================================
-- Database Initialization Script for AWS 3-Tier Architecture
-- Target: Amazon RDS MySQL / Aurora MySQL 8.x
-- ==============================================================================

-- 1. Create Database
CREATE DATABASE IF NOT EXISTS webappdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Select Database
USE webappdb;

-- 3. Create Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id INT NOT NULL AUTO_INCREMENT,
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Insert Sample Seed Data
INSERT INTO transactions (amount, description) VALUES
(250.00, 'AWS EC2 Elastic Compute Instance Charge'),
(85.50, 'Amazon RDS Multi-AZ Database Usage'),
(15.20, 'Application Load Balancer Ingress Traffic'),
(5.00, 'Amazon S3 Static Assets Storage');

-- 5. Verify records
SELECT * FROM transactions;
