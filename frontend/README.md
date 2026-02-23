# SewaSetu — AI-Powered Civic Bridge

**Hackathon-ready**: Smart civic issue reporting with AI auto-categorization, Hindi voice (STT), SLA tracking, and omnichannel access (PWA + WhatsApp).

---

## 🎯 Problem & Solution

**The Problem:** Citizens struggle to report civic issues (potholes, streetlights, waterlogging, waste) with clear categories and accountability. Manual categorization by authorities is slow, prone to errors, and inconsistent, leading to delayed resolutions.

**The Solution (SewaSetu):** A unified bridge between citizens and civic bodies featuring:
- **AI Auto-Categorization** — Analyzes image + voice to instantly determine category, severity, department, and SLA.
- **Hindi-First STT** — Integrates Sarvam AI for native Hindi voice notes, with a fallback to Whisper.
- **SLA Tracking** — Severity-based response timers and status tracking (OPEN → IN_PROGRESS → RESOLVED).
- **Omnichannel Access** — Built as a Mobile PWA with planned WhatsApp Bot integration for maximum accessibility.
- **Auto-Escalation** — Automated Twitter/X bot to escalate issues that breach their 48-hour SLAs.

---

## 💻 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js (App Router), Tailwind CSS, lucide-react |
| **Backend / DB** | Prisma ORM, SQLite (dev) / PostgreSQL (prod) |
| **AI / STT** | Sarvam AI (Hindi STT), Cloudflare Vision / YOLO (image), Groq (LLM) |
| **Storage** | Supabase (images/audio) |

---

## 🚀 20-STEP MASTER PLAN

| Status | Phase | Step | Feature |
|:---:|:---|:---|:---|
| ✅ | **Phase 1: Base** | 1-4 | APIs + Prisma + Karma + Basic AI fallback |
| ✅ | **Phase 1: Portals** | 5 | 📱 Citizen Portal (`/citizen`) Mobile PWA: Voice + GPS + Photo + Karma UI |
| 🔲 | **Phase 1: Portals** | 6 | 💻 Superadmin Portal (`/admin`): Heatmap + Leaderboard + Override |
| 🔲 | **Phase 1: Portals** | 7 | 📱 Field Admin (`/fieldadmin`): Tasks + "FIXED" button + Nearby heatmap |
| 🔲 | **Phase 1: Portals** | 8 | 🤖 Auto-Assignment: Report → AI Category → Department Routing (PWD, UPPCL, Jal Nigam, Sanitation, etc.) |
| 🔲 | **Phase 2: Features**| 9 | 🗺️ Shared Heatmap (Superadmin + Field Admin) |
| 🔲 | **Phase 2: Features**| 10 | ⏱️ SLA Timers (e.g., 24h UPPCL, 48h PWD) |
| 🔲 | **Phase 2: Features**| 11 | 📊 CSV Export + Stats |
| 🔲 | **Phase 2: Features**| 12 | 🇮🇳 Hindi Toggle |
| 🔲 | **Phase 2: Features**| 13 | 📈 Karma Badges + Leaderboard |
| 🔲 | **Phase 3: Killer** | 14 | 🤖 WhatsApp Bot Integration |
| 🔲 | **Phase 3: Killer** | 15 | 📱 Offline PWA (Queue & Sync) |
| 🔲 | **Phase 3: Killer** | 16 | 🐦 **Auto-Escalation Bot**: Auto-tweets local authorities if an issue breaches SLA |
| 🔲 | **Phase 4: AI & Deploy**| 17 | 🔧 AI 12-class YOLO fix (Image verification) |
| 🔲 | **Phase 4: AI & Deploy**| 18 | ☁️ Vercel Deployment (`sewasetu.in`) |
| 🔲 | **Phase 4: AI & Deploy**| 19 | 🎥 Demo Video + Pitch Deck |
| 🔲 | **Phase 4: AI & Deploy**| 20 | 🎉 Hackathon Submission |

---

## 📂 Repository Structure

```text
sewasetu/
├── app/                   # Next.js App Router
│   ├── (citizen)/         # Citizen Mobile PWA UI (Home, Report, Alerts, Profile)
│   ├── admin/             # Superadmin Dashboard
│   ├── fieldadmin/        # Field Worker Interface
│   └── api/               # Backend API Routes
├── components/            # Reusable UI components (BottomNav, etc.)
├── lib/                   # Core Business Logic & Config
│   ├── db/                # Prisma client & Supabase storage config
│   ├── services/          # External Integrations
│   │   ├── ai/            # Sarvam STT, Cloudflare Vision, Triage Pipeline
│   │   └── rules/         # SLA, Karma, & Dept Routing logic
│   └── utils/             # Helper functions
├── prisma/                # Database schema & migrations
├── public/                # Static assets (Map backgrounds, Logos)
└── types/                 # Shared TypeScript interfaces
```

---

## 🛠️ How to Run Locally

**1. Install dependencies**
```bash
npm install --legacy-peer-deps
```

**2. Setup the database**
```bash
npx prisma generate
npx prisma db push
```

**3. Start the development server**
```bash
npm run dev
```

**Quick Links:**
- Citizen App: [http://localhost:3001](http://localhost:3001)
- New Report: [http://localhost:3001/report](http://localhost:3001/report)
- Admin Panel: [http://localhost:3001/admin](http://localhost:3001/admin)

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure the following:

```env
# Database
DATABASE_URL="file:./dev.db" # SQLite for dev, replace with Postgres for prod

# AI & Voice Models
SARVAM_API_KEY="your_sarvam_key"
CLOUDFLARE_ACCOUNT_ID="your_cf_id"
CLOUDFLARE_AI_TOKEN="your_cf_token"
GROQ_API_KEY="your_groq_key"
HUGGINGFACE_API_KEY="your_hf_key"

# Storage
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

---

*Built with ❤️ by The Artifices*
