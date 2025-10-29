# Quick Start

Use this guide to create your first workflow.

## Local run (three terminals)
```bash
# Terminal 1 – Convex (realtime backend)
npx convex dev
```

```bash
# Terminal 2 – FastAPI backend
python3 -m venv backend/.venv && source backend/.venv/bin/activate
python3 -m pip install -U pip
python3 -m pip install -r backend/requirements.txt
export INTERNAL_API_KEY=dev-secret
python3 -m uvicorn backend.main:app --reload
```

```bash
# Terminal 3 – Frontend
cd frontend
npm install
npm run dev
```

## 0. (Optional) Sign In with Clerk
- Create a Clerk app and set env: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.
- Sign in to sync workflows to your account and enable billing.

## 1. Open the App
- Local: http://localhost:3000
- Production: your deployed domain

## 2. Go to the Dashboard
- Click "Dashboard" in the top navigation
- Click "+ Create New Project" or select a template

## 3. Use the Editor
- Add nodes from the sidebar (Prompt, Image Upload, Image Model, Upscale, Inpaint)
- Right‑click anywhere on a node to open its actions (Duplicate, Delete, Settings)
- Click a node to select it and edit its fields

## 4. Connect Nodes
- Drag from the output handle (bottom) to the input handle (top)
- Outputs are yellow; inputs are cyan

## 5. Save and Reopen
- Work is auto-saved
- As a guest, workflows persist in the same browser via local storage
- With an account (if enabled), workflows sync to the backend

## 6. Mini Workflows
- Text → Image:
  1) Add Prompt → write description
  2) Add Image Model → connect Prompt → Model and generate
- Image → Upscale:
  1) Add Image Upload → pick image
  2) Add Upscale → connect Upload → Upscale and run
- Image → Inpaint:
  1) Add Image Upload → pick image
  2) Add Inpaint → connect Upload → Inpaint
  3) Write edit prompt and run
- Text → Image → Upscale:
  1) Prompt → Model (generate)
  2) Model → Upscale (run)

## 7. AI Input Bar (Optional)
- Click the “Ask AI” dock at the bottom
- Type instructions like: "Upload an image, remove background, then upscale 4x"
- Press Enter or click Generate to auto-build a starting workflow

## 8. Roles (If Auth Enabled with Clerk)
- Admin: manage organization, staff, and tickets
- Staff: handle tickets and monitor runs
- User: create and run workflows

## 9. Billing (Optional)
- Stripe recommended for subscriptions/top-ups.
- Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- Credits deducted per run according to model cost.

## 10. Troubleshooting
- Refresh the page if the editor does not render
- Use the dashboard to reopen existing projects
- Check the browser console for errors during development
- Clerk auth: ensure keys are set and origin is allowed in Clerk.
