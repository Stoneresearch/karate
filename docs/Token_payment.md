# Token & Payment System

Karate AI uses a centralized, server-authoritative credit system.

## Pricing Model
Costs are calculated per-run based on the model and settings.

| Model Tier | Examples | Cost (Credits) |
|------------|----------|----------------|
| **Standard** | Stable Diffusion 3.5, Tools | 1 |
| **Pro** | Flux Pro 1.1, DALL-E 3 | 2 |
| **Ultra** | Imagen Ultra, Flux Ultra | 4 |
| **Video** | Runway, Luma, Kling | 10+ |

## Purchasing Credits
We integrate with **Stripe** for secure payments.
1.  Open **Settings** -> **Billing**.
2.  Select a Bundle (Starter, Creator, Pro).
3.  Complete checkout on Stripe.
4.  Credits are automatically added to your account via Webhook.

## Admin Tools (Free Credits)
For development and testing, you can bypass payment by using the admin CLI.

**Script Location**: `scripts/grant_credits.ts`

**Usage**:
```bash
npx tsx scripts/grant_credits.ts <user_email> <amount>
```
*Example*: `npx tsx scripts/grant_credits.ts aalwebagency@gmail.com 5000`

This script:
1.  Connects to Convex.
2.  Finds the user by email (or creates a placeholder if missing).
3.  Adds the specified amount to their balance.
4.  Logs an administrative transaction audit record.
