#!/bin/bash
# ==============================================================================
# AWS 3-Tier Architecture Health Check & Diagnostics CLI Tool
# ==============================================================================

echo "=========================================================="
echo "🔍 AWS 3-Tier Architecture Health Check"
echo "=========================================================="

echo -n "1. Checking Local Nginx (Port 80)... "
if curl -s -f -o /dev/null http://localhost/health; then
    echo "✅ UP (200 OK)"
else
    echo "❌ DOWN or Unreachable"
fi

echo -n "2. Checking Local Backend App Tier (Port 4000)... "
if curl -s -f -o /dev/null http://localhost:4000/health; then
    echo "✅ UP (200 OK)"
else
    echo "❌ DOWN or Unreachable"
fi

echo ""
echo "📊 Backend Health Details:"
curl -s http://localhost:4000/health 2>/dev/null || echo "Backend /health endpoint did not respond"

echo ""
echo ""
echo "⚙️ PM2 Process Status:"
pm2 status 2>/dev/null || echo "PM2 not running or not installed"

echo ""
echo "🌐 Nginx Service Status:"
systemctl is-active nginx 2>/dev/null || echo "Nginx status check failed"
