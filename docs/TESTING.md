# Testing Guide

## Overview
We have tests covering the API integration layer to ensure the critical path (Run Request -> Credit Deduction -> Backend Call) works correctly.

## Frontend Tests
Located in `frontend/__tests__/`.
Uses **Vitest** and **React Testing Library**.

### Critical Test: `api-run.test.ts`
This test suite verifies the `/api/run` endpoint logic:
1.  **Auth Check**: Ensures anonymous users get 401.
2.  **Input Validation**: Ensures Model and Prompt are required.
3.  **Credit Check**: Mocks Convex to simulate "Insufficient Credits" scenarios.
4.  **Backend Integration**: Mocks the `fetch` call to the Python backend to ensure correct parameters (API Key, Model ID) are passed.

**Running Frontend Tests**:
```bash
cd frontend
npm run test
```

## Backend Tests
Located in `backend/tests/`.
Uses **Pytest**.

### Scope
-   Verifies FastAPI endpoints (`/infer`).
-   Verifies Task Queue logic.
-   Verifies Model Cost calculations.

**Running Backend Tests**:
```bash
cd backend
source .venv/bin/activate
pytest
```

## Manual Testing (End-to-End)
For a full system test:
1.  Start all services (Convex, Frontend, Backend/Redis).
2.  Log in with a test account.
3.  Grant 0 credits (`npx tsx scripts/grant_credits.ts <email> 0`).
4.  Attempt to run -> **Expect**: "Insufficient credits" error.
5.  Grant 100 credits.
6.  Attempt to run -> **Expect**: Success, Image generated, Balance becomes 98 (or similar).
