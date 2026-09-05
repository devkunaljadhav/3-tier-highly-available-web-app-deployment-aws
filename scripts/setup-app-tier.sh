#!/bin/bash
# ==============================================================================
# AWS 3-Tier Architecture: Automated App Tier Setup Script
# OS Target: Amazon Linux 2023 / Amazon Linux 2
# ==============================================================================

set -e

echo "=========================================================="
echo "🚀 Starting App Tier Installation & Setup"
echo "=========================================================="

# 1. Update system packages
echo "📦 Updating OS packages..."
sudo dnf update -y || sudo yum update -y

# 2. Install MariaDB / MySQL client tools
echo "🗄️ Installing Database Client..."
sudo dnf install -y mariadb105 || sudo yum install -y mariadb

# 3. Install Node.js 18 LTS via official NVM
echo "🟢 Installing Node.js via NVM..."
export NVM_DIR="$HOME/.nvm"
if [ ! -d "$NVM_DIR" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Install and activate Node.js 18 or 16
nvm install 18 || nvm install 16
nvm use 18 || nvm use 16

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# 4. Install PM2 Process Manager globally
echo "⚙️ Installing PM2 process manager..."
npm install -g pm2

# 5. Navigate to app-tier directory
cd "$(dirname "$0")/../App-tire/app-tier" || cd /home/ec2-user/app-tier

# 6. Install project dependencies
echo "📥 Installing Node.js dependencies..."
npm install

# 7. Start Backend with PM2
echo "🚀 Starting Backend Application with PM2..."
pm2 delete app-tier 2>/dev/null || true
pm2 start index.js --name "app-tier"

# 8. Save PM2 state & enable startup on reboot
pm2 save
sudo env PATH=$PATH:$(dirname $(which pm2)) pm2 startup systemd -u $USER --hp $HOME || true

echo "=========================================================="
echo "✅ App Tier Setup Completed Successfully!"
echo "Backend is running on port 4000."
echo "Verify status with: pm2 status"
echo "Check health: curl http://localhost:4000/health"
echo "=========================================================="
