# Quick Start Guide

Follow these steps to get the complete Karate AI stack (Frontend, Backend, DB, Queue) running locally.

## 1. Prerequisites
-   **Node.js** (v18+)
-   **Python** (v3.10+)
-   **Redis** (Installed & Running)
    -   Mac: `brew install redis && brew services start redis`
-   **Convex Account**
-   **Clerk Account**

## 2. Backend Setup (Python + Redis)
The backend handles the heavy lifting of AI generation.

```bash
cd backend
# This script sets up the venv, installs deps, and starts the server
./start_backend.sh
```
*Keep this terminal running. It listens on `http://localhost:8000`.*

**Configuration:**
Create a `backend/.env` file (optional, script has defaults):
```env
INTERNAL_API_KEY=dev-secret
REPLICATE_API_TOKEN=r8_...  # Required for Flux/Stable Diffusion
REDIS_URL=redis://localhost:6379/0
```

## 3. Database Setup (Convex)
Convex handles real-time sync and user data.

```bash
# From project root
npx convex dev
```
*Follow the login prompts. Keep this terminal running.*

## 4. Frontend Setup (Next.js)
The user interface and editor.

```bash
cd frontend
# Create .env.local
echo "NEXT_PUBLIC_CONVEX_URL=<url_from_step_3>" >> .env.local
echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_clerk_key>" >> .env.local
# Must match the backend key!
echo "INTERNAL_API_KEY=dev-secret" >> .env.local 

npm install
npm run dev
```
*Access the app at `http://localhost:3000`.*

## 5. First Run Checklist
1.  Open `http://localhost:3000`.
2.  **Sign In** via Clerk.
3.  Check your terminal: You should see `grant_credits` logs or `UserSync` logs.
4.  **Grant Credits**: Since you start with 0, run this in a new terminal:
    ```bash
    npx tsx scripts/grant_credits.ts <your_email> 1000
    ```
5.  Refresh the page. You should see 1000 credits in the dashboard.
6.  Create a project, drag a **Flux Pro 1.1** node, and click **Generate**.

## 6. Common Issues
-   **"Unauthorized" / 401**: Your `INTERNAL_API_KEY` in `frontend/.env.local` does not match `backend/.env` (or the default "dev-secret").
-   **"Insufficient Credits"**: You forgot Step 4 (Grant Credits).
-   **Redis Connection Error**: Ensure Redis is running (`redis-cli ping` should return `PONG`).
