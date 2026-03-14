#!/bin/bash
# ==============================================================
#  SewaSetu – Start All Services (tmux-based, SSH-safe)
#
#  Launches all 4 services inside a single tmux session called
#  "sewa". Each service gets its own tmux window so you can
#  attach later and see live logs.
#
#  All servers run in DEV / RELOAD mode so code changes are
#  picked up on save (Next.js live-reload for frontend, uvicorn --reload
#  for backends).
#
#  Usage:
#    ./scripts/start_all.sh          # start everything
#    tmux attach -t sewa             # re-attach to see logs
#    ./scripts/start_all.sh stop     # gracefully stop everything
# ==============================================================

set -euo pipefail

SESSION="sewa"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# ── Ports ─────────────────────────────────────────────────────
ADMIN_PORT=3005
CITIZEN_PORT=3006
BACKEND_PORT=8002
AI_PORT=8003

# ── Stop mode ─────────────────────────────────────────────────
if [[ "${1:-}" == "stop" ]]; then
    echo "  Stopping tmux session '$SESSION' ..."
    tmux kill-session -t "$SESSION" 2>/dev/null && echo "   Done." || echo "   Session not found."
    exit 0
fi

# ── Guard: don't create a second session ──────────────────────
if tmux has-session -t "$SESSION" 2>/dev/null; then
    echo "  Session '$SESSION' is already running!"
    echo "   Attach with:  tmux attach -t $SESSION"
    echo "   Stop with:    $0 stop"
    exit 1
fi

# ── Resolve public IP (for display only) ──────────────────────
PUBLIC_IP=$(curl -s --max-time 3 ifconfig.me 2>/dev/null || echo "localhost")

# ── Ensure venv & deps ───────────────────────────────────────
if [ ! -d "$PROJECT_DIR/venv" ]; then
    echo "  Creating Python virtual environment ..."
    python3 -m venv "$PROJECT_DIR/venv"
fi
source "$PROJECT_DIR/venv/bin/activate"
pip install -q -r "$PROJECT_DIR/backend/requirements.txt" 2>/dev/null
pip install -q -r "$PROJECT_DIR/ai_model_server/requirements.txt" 2>/dev/null

# ── Ensure node_modules ───────────────────────────────────────
for portal in frontend; do
    if [ ! -d "$PROJECT_DIR/$portal/node_modules" ]; then
        echo "  Installing $portal dependencies ..."
        (cd "$PROJECT_DIR/$portal" && npm install)
    fi
done

# ── Ensure log directories ────────────────────────────────────
mkdir -p "$PROJECT_DIR/logs/backend"
mkdir -p "$PROJECT_DIR/logs/ai-server"
mkdir -p "$PROJECT_DIR/logs/frontend"

# ── Init DB ───────────────────────────────────────────────────
(cd "$PROJECT_DIR" && python scripts/init_db.py 2>/dev/null) || true

# ── Create tmux session ──────────────────────────────────────
echo "  Launching tmux session '$SESSION' ..."

# Window 0 — Backend API
tmux new-session -d -s "$SESSION" -n "backend" \
    "cd $PROJECT_DIR && source venv/bin/activate && \
     export DEMO_MODE=true && \
     export BACKEND_PORT=$BACKEND_PORT && \
     export AI_SERVER_PORT=$AI_PORT && \
     export AI_SERVER_URL=http://127.0.0.1:$AI_PORT/api/classify && \
     uvicorn backend.main:app --host 0.0.0.0 --port $BACKEND_PORT --reload \
       2>&1 | $PROJECT_DIR/scripts/rotatelogs.sh $PROJECT_DIR/logs/backend/uvicorn.log; \
     echo '--- backend exited, press Enter ---'; read"

# Window 1 — AI Model Server
tmux new-window -t "$SESSION" -n "ai-server" \
    "cd $PROJECT_DIR && source venv/bin/activate && \
     export AI_SERVER_PORT=$AI_PORT && \
     uvicorn ai_model_server.main:app --host 0.0.0.0 --port $AI_PORT --reload \
       2>&1 | $PROJECT_DIR/scripts/rotatelogs.sh $PROJECT_DIR/logs/ai-server/uvicorn.log; \
     echo '--- ai-server exited, press Enter ---'; read"

# ── Build Next.js (required for production start) ────────────
echo "  Building Next.js frontend ..."
(cd "$PROJECT_DIR/frontend" && npm run build)

# Window 2 — Admin Portal (Next.js Prod)
tmux new-window -t "$SESSION" -n "admin" \
    "cd $PROJECT_DIR/frontend && \
     npm run start -- -p $ADMIN_PORT \
       2>&1 | $PROJECT_DIR/scripts/rotatelogs.sh $PROJECT_DIR/logs/frontend/admin.log; \
     echo '--- admin exited, press Enter ---'; read"

# Window 3 — Citizen Portal (Next.js Prod)
tmux new-window -t "$SESSION" -n "citizen" \
    "cd $PROJECT_DIR/frontend && \
     npm run start -- -p $CITIZEN_PORT \
       2>&1 | $PROJECT_DIR/scripts/rotatelogs.sh $PROJECT_DIR/logs/frontend/citizen.log; \
     echo '--- citizen exited, press Enter ---'; read"

# ── Done ──────────────────────────────────────────────────────
echo ""
echo "=========================================="
echo "    All SewaSetu services are UP!"
echo "=========================================="
echo ""
echo "   Backend API:     http://$PUBLIC_IP:$BACKEND_PORT"
echo "   API Docs:        http://$PUBLIC_IP:$BACKEND_PORT/docs"
echo "   AI Server:       http://$PUBLIC_IP:$AI_PORT"
echo "   Super Admin:     http://$PUBLIC_IP:$ADMIN_PORT"
echo "   Citizen Portal:  http://$PUBLIC_IP:$CITIZEN_PORT"
echo ""
echo "   Attach to logs:  tmux attach -t $SESSION"
echo "   Stop everything: $0 stop"
echo "=========================================="
