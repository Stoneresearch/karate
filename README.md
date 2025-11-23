# 🥋 Karate - AI Node-Based Creative Workflow Platform

**Karate** is a **production-ready, fully functional node-based AI workspace** that unifies all AI models, editing tools, and creative workflows into a single, modern platform built with **Next.js**, **Convex**, and **XYFlow**.

---

## 🚀 Features

✨ **Fully Functional Node Editor**
- Drag-and-drop node system with XYFlow
- Real-time collaboration with Convex
- Smooth animations and transitions
- Undo/redo functionality

🎨 **Complete AI Model Integration**
- Stable Diffusion 3.5, Flux Pro, DALL·E 3
- Ideogram V3, Minimax Image, Runway Gen-4
- **Non-blocking generation**: Jobs run in the background via Redis queue
- Real-time status polling

🛠️ **Professional Editing Tools**
- Upscale, Inpaint, Crop, Blur, Invert
- More tools ready to be added
- Tool parameters and settings

💫 **Modern UI/UX**
- Animated landing page with parallax effects
- Collapsible sidebar with model grid
- Smooth page transitions
- Dark mode with yellow/cyan accent colors
- Responsive design

🔄 **Real-Time & Reliable**
- Live workflow syncing via Convex
- **Redis-backed Job Queue**: Tasks survive backend restarts
- Persistent storage

---

## 📋 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Node Editor**: XYFlow 12
- **Real-Time DB**: Convex
- **Job Queue**: Redis
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
│   │   │   └── NodeTypes/
│   │   │       └── index.tsx        # All node component types
│   │   └── Realtime/
│   │       └── Collaboration.tsx    # Convex integration
│   ├── pages/
│   │   ├── index.tsx               # Animated landing page
│   │   ├── editor.tsx              # Editor page with loader
│   │   ├── api/                    # Next.js API Routes
│   │   │   ├── run.ts              # Job submission (non-blocking)
│   │   │   └── status.ts           # Job status polling
│   │   └── _app.tsx                # App provider
│   ├── lib/
│   │   ├── models.ts               # Centralized Model Definitions
│   │   └── convex/
│   │       └── client.tsx          # Convex client setup
│   └── package.json
├── convex/
│   ├── schema.ts                   # Database schema
│   ├── workflows.ts                # Workflow queries & mutations
│   ├── grant_credits.ts            # Admin script for credits
│   └── _generated/                 # Auto-generated Convex API
├── backend/                        # Python FastAPI Backend
│   ├── main.py                     # API Entrypoint
│   ├── api/v1/ai.py                # AI Endpoints
│   ├── workers/tasks.py            # Redis-backed Async Workers
│   └── core/
│       ├── config.py               # Centralized Backend Config
│       └── redis.py                # Redis Connection
└── docs/                           # Documentation (public + technical)
    ├── GET_STARTED.md
    ├── QUICK_START.md
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

This will:
- Create a `.env.local` file with your `NEXT_PUBLIC_CONVEX_URL`
- Set up your Convex project
- Generate TypeScript types

### 4. Start Development Servers

**Terminal 1: Convex Backend**
```bash
npx convex dev
```

**Terminal 2: Next.js Frontend**
```bash
cd frontend
npm run dev
```

**Terminal 3: Python Backend**

We have provided a helper script to automatically set up the virtual environment and install dependencies:

```bash
# From the project root
chmod +x start_backend.sh  # Make it executable (only needed once)
./start_backend.sh
```

Or manually:

```bash
python3 -m venv backend/.venv
source backend/.venv/bin/activate  # On Windows: backend\.venv\Scripts\activate
python3 -m pip install -U pip
python3 -m pip install -r backend/requirements.txt
export INTERNAL_API_KEY=dev-secret
python3 -m uvicorn backend.main:app --reload
```

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
1. **Toggle Sidebar**: Click the menu icon on the left
2. **Add Nodes**:
   - Click "AI Models" tab to see available models
   - Click "Tools" tab to see editing tools
   - Click any model/tool card to add it to the canvas
3. **Connect Nodes**: Drag from output handle to input handle
4. **Run Workflow**: Click the "Run" button in the top bar
5. **Save**: Changes auto-save to Convex

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

### Add New Node Types
1. Add definitions to `frontend/lib/models.ts` (frontend UI) and `backend/core/config.py` (backend costs).
2. Create component in `frontend/components/NodeEditor/NodeTypes/index.tsx`
3. Export it and add to `nodeTypes` in `Canvas.tsx`

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

**Built with ❤️ using Next.js, Convex, Redis, and XYFlow**

🚀 Ready to create amazing AI workflows!
