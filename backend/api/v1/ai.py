from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
import os

def get_api_key(x_api_key: str | None = None):
    # In production, use security APIKeyHeader and secrets comparison
    expected = os.getenv("INTERNAL_API_KEY")
    if not expected:
        return None
    if x_api_key != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

router = APIRouter()

MODEL_COSTS = {"stable-diffusion-3.5": 1, "dalle-3": 2}

class InferRequest(BaseModel):
    model: str = Field(..., description="Model identifier")
    prompt: str = Field(..., min_length=1)

@router.post("/infer")
async def infer(req: InferRequest, _: bool | None = Depends(get_api_key)):
    model = req.model
    if model not in MODEL_COSTS:
        raise HTTPException(status_code=400, detail="Unknown model")
    # Stub: return echo until workers are wired
    return {"task_id": "stub", "model": model, "prompt": req.prompt}


