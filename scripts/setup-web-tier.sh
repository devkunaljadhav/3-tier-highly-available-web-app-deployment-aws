#!/bin/bash
# ==============================================================================
# AWS 3-Tier Architecture: Automated Web Tier Setup Script
# OS Target: Amazon Linux 2023 / Amazon Linux 2
# ==============================================================================

set -e

echo "=========================================================="
echo "🚀 Starting Web Tier Installation & Setup"
echo "=========================================================="

# 1. Update system packages
echo "📦 Updating OS packages..."
sudo dnf update -y || sudo yum update -y

# 2. Install Nginx Web Server
echo "🌐 Installing Nginx Web Server..."
sudo dnf install -y nginx || sudo yum install -y nginx

# 3. Install Node.js via official NVM
echo "🟢 Installing Node.js via NVM..."
export NVM_DIR="$HOME/.nvm"
if [ ! -d "$NVM_DIR" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

nvm install 18 || nvm install 16
nvm use 18 || nvm use 16

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# 4. Navigate to web-tier directory
WEB_DIR="$(dirname "$0")/../Web-tire/web-tier"
if [ -d "$WEB_DIR" ]; then
    cd "$WEB_DIR"
elif [ -d "/home/ec2-user/web-tier" ]; then
    cd /home/ec2-user/web-tier
fi

# 5. Install frontend dependencies & build React SPA
echo "📦 Installing React dependencies..."
npm install

echo "🔨 Building React production bundle..."
npm run build

# 6. Apply Nginx Configuration
echo "⚙️ Configuring Nginx..."
CONF_SRC="$(dirname "$0")/../nginx.conf"
if [ -f "$CONF_SRC" ]; then
    sudo cp "$CONF_SRC" /etc/nginx/nginx.conf
elif [ -f "/home/ec2-user/nginx.conf" ]; then
    sudo cp /home/ec2-user/nginx.conf /etc/nginx/nginx.conf
fi

# Fix ec2-user directory permissions so Nginx worker process can read build files
sudo chmod -R 755 /home/ec2-user

# 7. Test Nginx Configuration and restart service
echo "🔍 Validating Nginx configuration syntax..."
sudo nginx -t

echo "🔄 Restarting Nginx service..."
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "=========================================================="
echo "✅ Web Tier Setup Completed Successfully!"
echo "Nginx is running on port 80."
echo "Check health: curl http://localhost/health"
echo "=========================================================="
