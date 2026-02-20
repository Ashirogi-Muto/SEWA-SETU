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
├── start_local.sh      # Script to launch the backend and AI servers locally
└── start_frontend.sh   # Script to launch the frontend web apps
```

## System Requirements

- **Python 3.10+**
- **Node.js 18+** / **npm**
- **FFmpeg** (Required for processing compressed audio for the Speech-to-Text inference)

## Local Development Setup

To get the application running locally, you need to spin up the backend API servers as well as the frontend development servers. 

### 1. Start the Backend and AI Servers
The simplest way to start the backend ecosystem is to use the provided bash script.

```bash
# Clone the repository
git clone https://github.com/Ashirogi-Muto/SEWA_SETU.git
cd SEWA_SETU

# Make scripts executable
chmod +x start_local.sh start_frontend.sh

# This script will automatically:
# - Create a python venv and install dependencies
# - Initialize the database (init_db.py)
# - Boot the AI Model Server on port 8003
# - Boot the Primary Backend on port 8002
./start_local.sh
```

### 2. Start the Frontend Portals
In a separate terminal window, run the frontend startup script. This script will concurrently launch both React portals.

```bash
npm run dev # (or run the following script)
./start_frontend.sh
```

By default:
- **Citizen Portal** will run on `http://localhost:5173`
- **Admin Portal** will run on `http://localhost:5174`

*Note: You may need to run `npm install` inside both the `citizen-portal` and `admin-portal` directories the very first time you set up the project.*

## Environment Variables
The frontend apps communicate with the backend seamlessly. In a production build, ensure your API endpoints are configured correctly. Check the `vite.config.ts` in each portal directory for standard proxy configurations linking `/api` to the backend running on port 8002.

## Technologies Used
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui, Leaflet (Maps)
- **Backend Core**: Python, FastAPI, SQLAlchemy, SQLite
- **AI Backend**: PyTorch, Transformers, OpenAI Whisper, Pydub, ONNXRuntime
