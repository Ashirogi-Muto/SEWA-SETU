# SewaSetu

SewaSetu is a comprehensive civic issue reporting platform that empowers citizens to report local issues (like potholes, broken streetlights, or waste pileups) and allows government entities to track, manage, and resolve them efficiently.

## Core Features

- **Citizen Portal**: A public-facing web application where users can submit issues, attach photos, provide location data (via dropping a pin on a map), and record voice descriptions using Speech-to-Text (STT).
- **Admin Dashboard**: A centralized management interface for municipal workers and officials to view incoming reports, update their status, filter geographically or by category, and oversee the resolution workflow.
- **AI Integration**:
  - **Automated Image Classification**: Automatically categorizes the issue (e.g., Pothole, Garbage) based on the user's uploaded photo.
  - **Speech-to-Text (STT)**: Allows citizens to describe issues verbally. The system uses the local `openai/whisper-small` model to accurately transcribe spoken descriptions into text.
- **Automated Escalation**: A background task scheduler escalates issues that have been pending beyond a specific time frame, ensuring timely resolutions.

## Project Structure

This repository is set up as a monorepo consisting of the following core components:

```text
sewa-setu/
├── backend/            # Main FastAPI Backend (Handles DB, REST APIs, and Auth)
├── ai_model_server/    # Dedicated FastAPI AI Server (Runs Image Classification & Whisper STT)
├── citizen-portal/     # React based frontend for the public
├── admin-portal/       # React based frontend for the administration
├── docs/               # Project documentation and specifications
├── init_db.py          # Script to initialize the SQLite database
├── start_all.sh        # ⭐ One-command startup (tmux, SSH-safe, live-reload)
├── start_local.sh      # Legacy: launch backend + AI servers in foreground
└── start_frontend.sh   # Legacy: launch frontend portals in foreground
```

## System Requirements

- **Python 3.10+**
- **Node.js 18+** / **npm**
- **FFmpeg** (Required for processing compressed audio for the Speech-to-Text inference)

## Local Development Setup

To get the application running locally, you need to spin up the backend API servers as well as the frontend development servers.

### Quick Start (Recommended)

The easiest way to run **everything** is with the all-in-one startup script. It uses **tmux** under the hood, so all services survive SSH disconnections and you can reconnect to see live logs at any time.

```bash
# Clone the repository
git clone https://github.com/Ashirogi-Muto/SEWA_SETU.git
cd SEWA_SETU

# Make the script executable (first time only)
chmod +x start_all.sh

# Launch all services
./start_all.sh
```

This single command will:
1. Create a Python virtual environment and install dependencies (if needed)
2. Install Node.js dependencies for both portals (if needed)
3. Initialize the SQLite database
4. Start all 4 services inside a tmux session called **`sewa`**

#### Services & Ports

| Service | Port | Live-Reload |
|---|---|---|
| Backend API (uvicorn) | `8002` | ✅ `--reload` — picks up Python changes on save |
| AI Model Server (uvicorn) | `8003` | ✅ `--reload` — picks up Python changes on save |
| Admin Portal (Vite) | `3005` | ✅ HMR — instant browser updates on save |
| Citizen Portal (Vite) | `3006` | ✅ HMR — instant browser updates on save |

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
| `Ctrl+B` then `2` | Switch to **admin** portal logs |
| `Ctrl+B` then `3` | Switch to **citizen** portal logs |
| `Ctrl+B` then `n` | Next window |
| `Ctrl+B` then `p` | Previous window |
| `Ctrl+B` then `d` | Detach (services keep running) |

#### Stopping All Services

```bash
./start_all.sh stop
```

This kills the entire tmux session and all services within it.

---

### Alternative: Legacy Scripts

If you prefer to run backends and frontends in separate foreground terminals (these **will** stop when you close SSH):

```bash
# Terminal 1 — Backend + AI Server
chmod +x start_local.sh
./start_local.sh

# Terminal 2 — Frontend Portals
chmod +x start_frontend.sh
./start_frontend.sh
```

> **Note:** You may need to run `npm install` inside both `citizen-portal/` and `admin-portal/` the first time you set up the project.

## Environment Variables
The frontend apps communicate with the backend seamlessly. In a production build, ensure your API endpoints are configured correctly. Check the `vite.config.ts` in each portal directory for standard proxy configurations linking `/api` to the backend running on port 8002.

## Technologies Used
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui, Leaflet (Maps)
- **Backend Core**: Python, FastAPI, SQLAlchemy, SQLite
- **AI Backend**: PyTorch, Transformers, OpenAI Whisper, Pydub, ONNXRuntime
