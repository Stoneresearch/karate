from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging
from .api.v1 import ai, agents

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Startup Check for Critical Environment Variables
REQUIRED_ENV_VARS = [
    "INTERNAL_API_KEY",
    # "REPLICATE_API_TOKEN", # Optional depending on usage
    # "OPENAI_API_KEY",      # Optional depending on usage
]

missing_vars = [var for var in REQUIRED_ENV_VARS if not os.getenv(var)]
if missing_vars:
    logger.warning(f"⚠️  MISSING ENVIRONMENT VARIABLES: {', '.join(missing_vars)}")
    logger.warning("Some features may not work correctly.")
else:
    logger.info("✅ All critical environment variables found.")

app = FastAPI(title="Karate Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "x-api-key", "x-user-id"],
)

app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"]) 
app.include_router(agents.router, prefix="/api/v1/agents", tags=["agents"]) 

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
