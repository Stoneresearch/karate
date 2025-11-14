# Testing

This repo includes unit tests for the frontend (Next.js) and backend (FastAPI).

## Frontend (Vitest)

Location: `frontend/`

Commands:
```bash
cd frontend
npm install
npm run test          # watch mode
npm run test:ci       # single run (CI)
```

Notes:
- Tests run in a Node environment (API route tests, no DOM needed).
- `/api/run` is covered with authorization and happy-path tests. External calls are mocked.
- Add new tests in `frontend/__tests__/*.test.ts`.

## Backend (Pytest)

Location: `backend/`

Setup and run:
```bash
python3 -m venv backend/.venv && source backend/.venv/bin/activate
python3 -m pip install -U pip
python3 -m pip install -r backend/requirements.txt
pytest -q backend
```

Notes:
- Tests use `fastapi.testclient.TestClient`.
- `INTERNAL_API_KEY` is set within tests via `monkeypatch`.
- No external providers are required for tests (calls are stubbed to return `None` when keys are missing).

## Root Convenience Scripts

From repo root:
```bash
npm run test:frontend
npm run test:backend
npm run test           # runs both
```

## Troubleshooting
- Frontend: If imports fail, ensure `npm install` has run inside `frontend`.
- Backend: Verify your Python virtualenv is active and dependencies are installed.
- If `/api/run` returns 500 in dev, ensure:
  - Backend is running (`uvicorn backend.main:app --reload`)
  - `INTERNAL_API_KEY` matches between frontend request and backend
  - Convex dev server is optional for tests; not required to pass


