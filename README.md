# 🥋 Karate - AI Node-Based Creative Workflow Platform

**Karate** is a **production-ready, fully functional node-based AI workspace** that unifies all AI models, editing tools, and creative workflows into a single, modern platform built with **Next.js**, **Convex**, and **XYFlow**.

---

## 🚀 Features

✨ **Fully Functional Node Editor**
- Drag-and-drop node system with XYFlow
- Real-time collaboration with Convex
- Smooth animations and transitions
- **Smart Caching**: Reuses outputs from completed nodes to save time and credits
- **Cancellation**: Stop running workflows instantly

🎨 **Complete AI Model Integration**
- **Latest Models**: Google Nano Banana, Imagen 4, Stable Diffusion 3.5, Flux Pro
- **Video Models**: Veo 2, Luma Ray 2, Runway Gen-3
- **Non-blocking generation**: Jobs run in the background via Redis/Celery
- Real-time status polling with progress updates

🛠️ **Professional Editing Tools**
- Upscale, Inpaint (smart mask), Crop, Blur
- **Flexible Inputs**: Tools work with connected nodes OR uploaded images
- **No Prompt Required**: Image-to-image tools run without text prompts
- Tool parameters and settings (aspect ratio, guidance, seed)

📂 **Asset Management**
- **My Media Gallery**: Modern, sliding modal to view all your assets
- **Drag & Drop**: Drag images from the gallery directly onto the canvas
- **Persistent Storage**: All uploads and generated outputs are stored permanently
- **Auto-Organization**: Automatically tracks file metadata

💫 **Modern UI/UX**
- Animated landing page with parallax effects
- Collapsible sidebar with model grid
- Smooth page transitions
- Dark mode with yellow/cyan accent colors
- Responsive design

---

## 📋 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion, HeroUI
- **Node Editor**: XYFlow 12
- **Real-Time DB**: Convex
- **Job Queue**: Redis + Celery
- **Backend**: Python FastAPI (Async)
- **State Management**: Zustand, Jotai
- **Animations**: Framer Motion, GSAP

---

## 🏗️ Project Structure

```
karate/
├── frontend/
│   ├── components/
│   │   ├── NodeEditor/
│   │   │   ├── Canvas.tsx           # Main editor canvas with XYFlow
│   │   │   ├── Sidebar.tsx          # Collapsible sidebar with models/tools
│   │   │   ├── MediaGallery.tsx     # "My Media" sliding gallery
│   │   │   └── NodeTypes/
│   │   │       └── index.tsx        # All node component types
│   │   └── Realtime/
│   │       └── Collaboration.tsx    # Convex integration
│   ├── pages/
│   │   ├── index.tsx               # Animated landing page
│   │   ├── editor.tsx              # Editor page with loader
│   │   ├── api/                    # Next.js API Routes
│   │   │   ├── run.ts              # Job submission (non-blocking)
│   │   │   └── status.ts           # Job status polling & result persistence
│   │   └── _app.tsx                # App provider
│   ├── lib/
│   │   ├── models.ts               # Centralized Model Definitions
│   │   └── convex/
│   │       └── client.tsx          # Convex client setup
│   └── package.json
├── convex/
│   ├── schema.ts                   # Database schema (including 'files' table)
│   ├── files.ts                    # File management mutations
│   ├── workflows.ts                # Workflow queries & mutations
│   └── _generated/                 # Auto-generated Convex API
├── backend/                        # Python FastAPI Backend
│   ├── main.py                     # API Entrypoint
│   ├── api/v1/ai.py                # AI Endpoints
│   ├── workers/tasks.py            # Celery Tasks (Replicate/AI integration)
│   ├── celery_app.py               # Celery App Configuration
│   └── core/
│       ├── config.py               # Centralized Backend Config
│       └── redis.py                # Redis Connection
├── start_worker.sh                 # Script to start the Celery worker
├── start_backend.sh                # Script to start the FastAPI server
└── docs/                           # Documentation (public + technical)
    ├── GET_STARTED.md
    ├── WORKFLOW_EDITOR_GUIDE.md
    └── instruction.md              # Full technical documentation
```

---

## 🔧 Installation & Setup

### Prerequisites
- Node.js 20.9+ (required by Next.js 16) and npm/yarn
- Convex account (free tier available)
- Python 3.10+ (for backend)
- **Redis**: Required for task queue persistence

### 1. Install Redis (Required)
**macOS (Homebrew):**
```bash
brew install redis
brew services start redis
```
**Linux:**
```bash
sudo apt-get install redis-server
sudo service redis-server start
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Set Up Convex

```bash
# Install Convex CLI globally (if not already installed)
npm install -g convex

# From the project root, initialize Convex
cd .. && npx convex init
```

### 4. Start Development Servers

You need to run **three** terminals to have the full stack operational.

**Terminal 1: Convex Backend**
```bash
npx convex dev
```

**Terminal 2: Next.js Frontend**
```bash
cd frontend
npm run dev
```

**Terminal 3: Python Backend & Worker**
The backend handles API requests, and the worker processes the heavy AI tasks.

**Option A: Run both with scripts (Recommended)**
Open two separate tabs for these:

```bash
# Tab 1: Start the API Server
./start_backend.sh

# Tab 2: Start the Celery Worker
./start_worker.sh
```

**Option B: Manual Setup**

```bash
# Create venv
python3 -m venv backend/.venv
source backend/.venv/bin/activate

# Install deps
pip install -r backend/requirements.txt

# Start API
python3 -m uvicorn backend.main:app --reload

# Start Worker (in another terminal, same venv)
celery -A backend.celery_app worker --loglevel=info
```

### What is `start_worker.sh`?
This script launches the **Celery Worker**.
- It activates the Python virtual environment.
- It connects to **Redis** (the message broker).
- It listens for tasks added to the queue by the API (e.g., "generate image").
- It executes the AI model calls (to Replicate, OpenAI, etc.) asynchronously.
- **Without this running, your AI generation requests will stay in "Processing" forever.**

---

## 💰 Credit System & Admin Tools

The platform includes a credit system for usage limits.

### Granting Credits (Admin)
You can grant credits to any test user via the CLI script:

```bash
# Syntax
npx tsx convex/grant_credits.ts <user_email> <amount>

# Example
npx tsx convex/grant_credits.ts user@example.com 1000
```

---

## 📖 Usage Guide

### Landing Page
- Visit `http://localhost:3000`
- See animated hero with 3D sphere parallax
- View AI models and editing tools sections
- Click "START NOW" or "Open Editor" to go to the editor

### Editor
1. **Toggle Sidebar**: Click the menu icon on the left.
2. **My Media**: Click the "My Media" icon to open your gallery. Drag saved images onto the canvas.
3. **Add Nodes**:
   - Click "AI Models" or "Tools" in the sidebar.
   - Click any card to add it.
4. **Connect Nodes**: Drag from output handle to input handle.
5. **Run Workflow**:
   - Click "Run" in the top bar to execute the whole flow.
   - Click "Run" on a specific node to execute just that step.
   - Click "Stop" to cancel execution.
6. **Save**: Changes auto-save to Convex.

---

## 🎨 Customization

### Change Accent Colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      yellow: { 400: '#YOUR_COLOR' },
      cyan: { 400: '#YOUR_COLOR' },
    },
  },
}
```

---

## 🚀 Deployment

### Deploy to Vercel (Frontend)
```bash
cd frontend
npm install -g vercel
vercel --prod
```

### Deploy Convex Backend
```bash
npx convex deploy --prod
```

Set `NEXT_PUBLIC_CONVEX_URL` environment variable in Vercel to your production Convex URL.

---

## 📝 Environment Variables

Create `.env.local` in frontend root:
```
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
```

Backend `.env` (create in `backend/.env`):
```
INTERNAL_API_KEY=dev-secret
REPLICATE_API_TOKEN=<your-token>
OPENAI_API_KEY=<your-key>
REDIS_URL=redis://localhost:6379/0  # Optional if local
```

---

## 💡 Support

For issues, feature requests, or questions:
1. Check the troubleshooting section above
2. Review `instruction.md` for detailed docs
3. Check existing GitHub issues
4. Create a new issue with details

---

**Built with ❤️ using Next.js, Convex, Redis, Celery, and XYFlow**

🚀 Ready to create amazing AI workflows!
