#!/bin/bash
# Enable Demo Mode
export DEMO_MODE=true

# Hardcoded Ports as requested
export BACKEND_PORT=8002
export AI_SERVER_PORT=8003
export AI_SERVER_URL="http://127.0.0.1:$AI_SERVER_PORT/api/classify"

# Get Public IP (for display)
PUBLIC_IP=$(curl -s ifconfig.me)
if [ -z "$PUBLIC_IP" ]; then
    PUBLIC_IP="0.0.0.0"
fi

echo "🚀 Starting SewaSetu Local Environment (Static Ports)..."
echo "----------------------------------------"

# 1. Activate Virtual Env
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r backend/requirements.txt
else
    source venv/bin/activate
fi

# 2. Check Database
python init_db.py

echo "✅ Ports Configured:"
echo "   - Backend: $BACKEND_PORT"
echo "   - AI Server: $AI_SERVER_PORT"

# 3. Start AI Model Server
echo "🤖 Starting AI Model Server..."
uvicorn ai_model_server.main:app --host 0.0.0.0 --port $AI_SERVER_PORT > ai_server.log 2>&1 &
AI_PID=$!

# 4. Start Backend
echo "🌍 Starting Backend Server..."
uvicorn backend.main:app --host 0.0.0.0 --port $BACKEND_PORT > backend.log 2>&1 &
BACKEND_PID=$!

echo "----------------------------------------"
echo "🎉 Services are LIVE!"
echo "   - Backend API: http://$PUBLIC_IP:$BACKEND_PORT"
echo "   - API Docs:    http://$PUBLIC_IP:$BACKEND_PORT/docs"
echo "   - AI Server:   http://$PUBLIC_IP:$AI_SERVER_PORT"
echo "   (Logs: backend.log, ai_server.log)"
echo "----------------------------------------"
echo "Press Ctrl+C to stop all services."

# Trap Ctrl+C to kill background processes
trap "kill $AI_PID $BACKEND_PID; exit" INT
wait
