#!/bin/bash
# Get Public IP
PUBLIC_IP=$(curl -s ifconfig.me)

echo "🚀 Starting SewaSetu Frontends..."
echo "----------------------------------------"

# 1. Admin Portal (Port 3005)
echo "👑 Starting Admin Portal on Port 3005..."
cd admin-portal
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Admin Portal dependencies..."
    npm install
fi
# Start in background
npm run dev -- --host --port 3005 > ../admin.log 2>&1 &
ADMIN_PID=$!
cd ..

# 2. Citizen Portal (Port 3006)
echo "👥 Starting Citizen Portal on Port 3006..."
cd citizen-portal
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Citizen Portal dependencies..."
    npm install
fi
# Start in background
npm run dev -- --host --port 3006 > ../citizen.log 2>&1 &
CITIZEN_PID=$!
cd ..

echo "----------------------------------------"
echo "🎉 Frontends are LIVE!"
echo "   - Admin Portal:   http://$PUBLIC_IP:3005"
echo "   - Citizen Portal: http://$PUBLIC_IP:3006"
echo "   (Logs: admin.log, citizen.log)"
echo "----------------------------------------"
echo "Press Ctrl+C to stop frontends."

# Trap Ctrl+C
trap "kill $ADMIN_PID $CITIZEN_PID; exit" INT
wait
