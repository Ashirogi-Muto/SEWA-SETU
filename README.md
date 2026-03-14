# SewaSetu

SewaSetu is a comprehensive civic issue reporting platform that empowers citizens to report local issues (like potholes, broken streetlights, or waste pileups) and allows government entities to track, manage, and resolve them efficiently.

## Core Features

- **Citizen Portal**: A public-facing web application where users can submit issues, attach photos, provide location data (via dropping a pin on a map), and record voice descriptions using Speech-to-Text (STT).
- **Admin Dashboard**: A centralized management interface for municipal workers and officials to view incoming reports, update their status, filter geographically or by category, and oversee the resolution workflow.
- **Field Admin Portal**: A mobile-optimized interface for field workers to view and manage assigned tasks.
- **AI Integration**:
  - **Automated Image Classification**: Automatically categorizes the issue (e.g., Pothole, Garbage) based on the user's uploaded photo using a custom-trained YOLOv8 model.
  - **Speech-to-Text (STT)**: Allows citizens to describe issues verbally. The system uses Sarvam AI API (with legacy Whisper fallback) to transcribe spoken descriptions.
- **Automated Escalation**: A background task scheduler escalates issues that have been pending beyond a specific time frame, ensuring timely resolutions.

## Project Structure

```text
sewa-setu/
├── backend/            # Main FastAPI Backend (Handles DB, REST APIs, and Auth)
├── ai_model_server/    # Dedicated FastAPI AI Server (YOLOv8 Classification & STT)
├── frontend/           # Next.js unified portal (Citizen, Admin, Field Admin)
├── docs/               # Project documentation and specifications
├── scripts/            # Utility scripts (startup, DB init, log rotation)
├── logs/               # Runtime logs (backend, ai-server, frontend)
└── sewasetu.db         # Auto-generated SQLite database (after first run)
```

## System Requirements

- **Python 3.10+**
- **Node.js 18+** / **npm**
- **FFmpeg** (Required for processing compressed audio for the Speech-to-Text inference)

## Local Development Setup

### Quick Start (Recommended)

The easiest way to run **everything** is with the all-in-one startup script. It uses **tmux** under the hood, so all services survive SSH disconnections and you can reconnect to see live logs at any time.

```bash
# Clone the repository
git clone https://github.com/Ashirogi-Muto/SEWA_SETU.git
cd SEWA_SETU

# Make the script executable (first time only)
chmod +x scripts/start_all.sh

# Launch all services
./scripts/start_all.sh
```

This single command will:
1. Create a Python virtual environment and install dependencies (if needed)
2. Install frontend dependencies (if needed)
3. Initialize the SQLite database
4. Start all 4 services inside a tmux session called **`sewa`**

#### Services & Ports

| Service | Port | Live-Reload |
|---|---|---|
| Backend API (uvicorn) | `8002` |  `--reload` — picks up Python changes on save |
| AI Model Server (uvicorn) | `8003` |  `--reload` — picks up Python changes on save |
| Frontend (Next.js) - Admin | `3005` |  Next.js live-reload |
| Frontend (Next.js) - Citizen | `3006` |  Next.js live-reload |

#### Surviving SSH Disconnects

Because the services run inside a **tmux session**, they stay alive even after you close your SSH connection or lose internet. When you reconnect:

```bash
# Re-attach to the running session
tmux attach -t sewa
```

#### Navigating Inside tmux

Once attached, each service has its own tmux **window**:

| Shortcut | Action |
|---|---|
| `Ctrl+B` then `0` | Switch to **backend** logs |
| `Ctrl+B` then `1` | Switch to **ai-server** logs |
| `Ctrl+B` then `2` | Switch to **frontend (admin)** logs |
| `Ctrl+B` then `3` | Switch to **frontend (citizen)** logs |
| `Ctrl+B` then `n` | Next window |
| `Ctrl+B` then `p` | Previous window |
| `Ctrl+B` then `d` | Detach (services keep running) |

#### Stopping All Services

```bash
./scripts/start_all.sh stop
```

This kills the entire tmux session and all services within it.

#### Logging

All services write logs to the `logs/` directory with automatic rotation (5MB per file, 3 backups):

```
logs/
├── backend/       # Backend structured JSON logs + uvicorn console
├── ai-server/     # AI server structured JSON logs + uvicorn console
└── frontend/      # Next.js console output (admin.log, citizen.log)
```

## Technologies Used
- **Frontend**: Next.js 15, React 19, Tailwind CSS, Leaflet (Maps)
- **Backend**: Python, FastAPI, SQLAlchemy, SQLite (aiosqlite)
- **AI Server**: YOLOv8 (ultralytics), Sarvam AI STT
