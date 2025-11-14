# Get Started

## Overview
- Karate AI – Design Studio is a node-based workflow editor for images and media.
- Sign-in is required to use the Editor and Dashboard. Guests can browse public pages (e.g., landing, docs).

## As a Guest (browse-only)
- You can view public pages like the landing and docs without an account.
- The Editor and Dashboard require sign-in.

## With an Account
- Sign in to use the Editor and Dashboard.
- Workflows sync to your account; access from any device.

## Authentication (Clerk)
- We use Clerk for authentication.
- Required environment variables:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
- Optional Convex URL override (frontend defaults to `http://localhost:3210`):
  - `NEXT_PUBLIC_CONVEX_URL`
- Steps:
  1) Create a Clerk application (`https://clerk.com`).
  2) Add your local domain to Allowed Origins (e.g., `http://localhost:3000`).
  3) Set the env vars above in your local `.env` and hosting provider.
  4) After sign-in, your workflows will sync to your account.

## Roles (if enabled)
- Admin: manage organization, staff, and tickets
- Staff: handle tickets and monitor runs
- User: create and run workflows

## Steps
1) Access the App
   - Local: http://localhost:3000
   - Production: your deployed domain

2) Open the Dashboard
   - Click "Dashboard" in the navigation.
   - Existing workflows (if any) are shown in "My Files".
   - Click "+ Create New Project" or pick a template to get started.

3) Open the Editor (requires sign-in)
   - You can reach the editor right after creating a project.
   - The editor shows a canvas where you can add and connect nodes.
   - Changes sync to your account.

4) Add Nodes
   - Use the sidebar in the editor to add models/tools.
   - Supported nodes include prompt/text input, image upload, upscale, inpaint, and more.

5) Connect Nodes
   - Drag from an output handle (bottom) to an input handle (top) to connect.
   - Yellow handles are outputs; cyan handles are inputs.

6) Save and Reopen
   - Changes save automatically.
   - As a guest, workflows are saved in local storage on the same browser.
   - With an account (Clerk), workflows sync to your user.

## Billing (optional)
- We support a credits-based model backed by Stripe.
- Required environment:
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
  - Set prices and products in Stripe for subscription or top-up credits.
  - Credits are consumed per model run (see docs for model costs).

7) Return to Dashboard
   - Use the navigation to return to the dashboard.
   - Open an existing workflow from "My Files".

## Troubleshooting
- If the editor does not load, refresh the page and check the browser console.
- If no workflows appear as a guest, ensure you are using the same browser and device.
- If authentication is enabled but sign in fails:
  - Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set.
  - Ensure your origin is allowed in Clerk dashboard.
  - Hard-refresh and retry.
- If Convex data does not appear:
  - Make sure `npx convex dev` is running.
  - If using a non-default port/URL, set `NEXT_PUBLIC_CONVEX_URL` in `frontend/.env.local`.


