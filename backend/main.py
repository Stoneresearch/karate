from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from backend.api.v1 import ai, agents

load_dotenv()

app = FastAPI(title="Karate Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "x-api-key"],
)

app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"]) 
app.include_router(agents.router, prefix="/api/v1/agents", tags=["agents"]) 

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

