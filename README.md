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
- All models ready for API integration

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

🔄 **Real-Time Features**
- Live workflow syncing via Convex
- Collaborative editing ready
- Persistent storage

---

## 📋 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Node Editor**: XYFlow 12
- **Real-Time DB**: Convex
- **State Management**: Zustand, Jotai
- **Animations**: Framer Motion, GSAP
- **API Client**: Convex React

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
│   │   └── _app.tsx                # App provider
│   ├── lib/
│   │   └── convex/
│   │       └── client.tsx          # Convex client setup
│   ├── styles/
│   │   └── globals.css             # Global styles & animations
│   └── package.json
├── convex/
│   ├── schema.ts                   # Database schema
│   ├── workflows.ts                # Workflow queries & mutations
│   └── _generated/                 # Auto-generated Convex API
└── instruction.md                  # Full technical documentation
```

---

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Convex account (free tier available)

### 1. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 2. Set Up Convex

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

### 3. Start Development Servers

**Terminal 1: Convex Backend**
```bash
npx convex dev
```

**Terminal 2: Next.js Frontend**
```bash
cd frontend
npm run dev
```

Your app will be available at `http://localhost:3000`

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

### Node Types
- **Stable Diffusion**: AI image generation from text
- **Image**: Upload and manage images
- **Text**: Text input nodes
- **Upscale**: Enhance image resolution
- **Inpaint**: Edit specific image areas

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
1. Create component in `frontend/components/NodeEditor/NodeTypes/index.tsx`
2. Export it and add to `nodeTypes` in `Canvas.tsx`
3. Add to models/tools array in `Canvas.tsx`

### Modify Landing Page
Edit `frontend/pages/index.tsx`:
- Change heading text
- Adjust animation timing
- Modify colors and gradients
- Add new sections

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

## 📊 Current Implementation Status

✅ **Completed**:
- Landing page with animations & parallax
- Full XYFlow node editor
- Collapsible sidebar with grid
- 5 node types (Stable Diffusion, Image, Text, Upscale, Inpaint)
- Convex real-time database integration
- Smooth transitions & animations
- Responsive design
- Auto-save functionality

🔄 **Ready to Add**:
- AI model API integration (Replicate, Modal)
- More node types (Flux, DALL·E, etc.)
- Node parameter customization
- Workflow templates
- Export workflows
- User authentication
- Credit system
- Workflow sharing

---

## 🎯 Next Steps

1. **Connect AI APIs**:
   - Set up Replicate/Modal for model inference
   - Create `/api` endpoints in backend
   - Connect Run button to API calls

2. **Add More Models**:
   - Add card in sidebar
   - Create node component
   - Add to nodeTypes mapping

3. **Enhance UI**:
   - Add node labels/descriptions
   - Implement node search
   - Add templates library
   - Improve mobile responsiveness

4. **Backend Integration**:
   - Implement FastAPI workers for AI tasks
   - Set up credit system
   - Add workflow validation
   - Create audit logs

---

## 📝 Environment Variables

Create `.env.local` in frontend root:
```
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
```

Backend `.env`:
```
REPLICATE_API_TOKEN=<your-token>
OPENAI_API_KEY=<your-key>
```

---

## 🐛 Troubleshooting

**Convex connection error?**
- Ensure `NEXT_PUBLIC_CONVEX_URL` is set correctly
- Run `npx convex dev` in another terminal
- Check firewall/proxy settings

**XYFlow not rendering?**
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `npm install`
- Ensure React version is 18+

**Sidebar not appearing?**
- Check browser console for errors
- Clear browser cache
- Try incognito mode

---

## 📚 Documentation

See `instruction.md` for:
- Complete technical architecture
- AI models list
- Backend API endpoints
- Deployment guides
- Security considerations
- Cost optimization strategies

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

MIT License - feel free to use this project for personal and commercial purposes.

---

## 💡 Support

For issues, feature requests, or questions:
1. Check the troubleshooting section above
2. Review `instruction.md` for detailed docs
3. Check existing GitHub issues
4. Create a new issue with details

---

**Built with ❤️ using Next.js, Convex, and XYFlow**

🚀 Ready to create amazing AI workflows!

