# Convex Setup & Configuration

Karate AI relies heavily on Convex for its realtime database and serverless backend logic.

## 1. Schema Definitions (`convex/schema.ts`)

Our schema defines the following core tables:

- **`users`**:
    - `name`, `email`, `pictureUrl`: Profile info.
    - `credits`: Current balance (Integer).
    - `tokenIdentifier`: The unique ID from Clerk (critical for auth).
    - `identity`: JSON object storing full Clerk identity data.

- **`workflows`**:
    - `nodes`, `edges`: JSON blobs storing the react-flow graph state.
    - `title`: Project name.
    - `owner`: The `tokenIdentifier` of the creator (for RLS).

- **`runs`**:
    - `status`: 'queued', 'processing', 'completed', 'failed'.
    - `input`: JSON blob of the prompt/settings.
    - `output`: The resulting image/video URL.
    - `cost`: How many credits were deducted.
    - `workflowId`: (Optional) Link to the parent workflow.

- **`transactions`**:
    - Immutable ledger of all credit changes.

## 2. Authentication Flow

We use **Clerk** for user management but **Convex** for data authorization.

1.  **Frontend**: Wraps the app in `<ConvexProviderWithClerk>`.
2.  **Token Exchange**: The client fetches a JWT from Clerk and passes it to Convex.
3.  **Backend Verification**: Convex verifies the JWT against the configured Issuer URL in `convex/auth.config.ts`.
4.  **Resolver Access**: Inside a mutation/query, `ctx.auth.getUserIdentity()` returns the parsed user data.

**Important**: You must configure a JWT Template in Clerk named "convex" for this to work.

## 3. Initial Setup Command

To initialize the Convex project locally:

```bash
npx convex dev
```
This will:
1.  Log you in.
2.  Create/Link a project.
3.  Push the schema.
4.  Push the `auth.config.ts` (ensure `CLERK_ISSUER_URL` env var is set in Convex Dashboard).
5.  Generate TypeScript bindings in `convex/_generated`.

## 4. Admin Actions (Mutations)

### `users:getOrCreate`
Called automatically by the frontend `UserSync` component on load. It ensures the user exists in the DB and updates their profile picture/name from Clerk.

### `runs:create`
Transactional operation that:
1.  Reads user's current credits.
2.  Throws error if `balance < cost`.
3.  Updates `users` table (`credits = credits - cost`).
4.  Inserts row into `transactions`.
5.  Inserts row into `runs`.
6.  Returns the new `runId`.

## 5. Troubleshooting

-   **"No identity found"**:
    -   Check if the user is logged in on the frontend.
    -   Verify `convex/auth.config.ts` has the correct Clerk Issuer URL.
    -   Verify the "convex" JWT template exists in Clerk.
-   **"Insufficient credits"**:
    -   The system is working as intended! Use the admin script to grant free credits.
