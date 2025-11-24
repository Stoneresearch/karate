from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, Field
from typing import Optional, Dict
import os
from ...core.config import MODEL_COSTS
from ...workers.tasks import run_ai_model_background, get_task_status

def get_api_key(x_api_key: Optional[str] = Header(default=None)):
    # In production, use security APIKeyHeader and secrets comparison
    expected = os.getenv("INTERNAL_API_KEY")
    
    if not expected:
        # Log error if key is missing server-side
        import logging
        logging.getLogger("uvicorn").error("INTERNAL_API_KEY not set in backend environment")
        return None
        
    if x_api_key != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

router = APIRouter()

class InferRequest(BaseModel):
    model: str = Field(..., description="Model identifier")
    prompt: Optional[str] = Field(default="")
    image: Optional[str] = None
    mask: Optional[str] = None
    aspect_ratio: Optional[str] = None
    guidance_scale: Optional[float] = None
    output_format: Optional[str] = None
    safety_tolerance: Optional[int] = None
    seed: Optional[int] = None

@router.get("/models", response_model=Dict[str, int])
async def get_models():
    """Return list of available models and their token costs."""
    return MODEL_COSTS

@router.post("/infer")
async def infer(req: InferRequest, x_user_id: Optional[str] = Header(default=None), _: Optional[bool] = Depends(get_api_key)):
    model = req.model
    
    # Allow known models OR valid Replicate slugs (owner/name)
    if model not in MODEL_COSTS and "/" not in model:
        raise HTTPException(status_code=400, detail="Unknown model")
    
    uid = x_user_id
    if not uid:
        raise HTTPException(status_code=401, detail="Missing user ID")
    # New async path: return task_id immediately
    # Pass all extra arguments as kwargs
    extra_params = {
        "image": req.image,
        "mask": req.mask,
        "aspect_ratio": req.aspect_ratio,
        "guidance_scale": req.guidance_scale,
        "output_format": req.output_format,
        "safety_tolerance": req.safety_tolerance,
        "seed": req.seed,
    }
    # Filter out None values
    extra_params = {k: v for k, v in extra_params.items() if v is not None}
    
    task_id = await run_ai_model_background(model=model, prompt=req.prompt, user_id=uid, **extra_params)
    return {"task_id": task_id, "status": "processing"}

@router.get("/status/{task_id}")
async def get_status(task_id: str, _: Optional[bool] = Depends(get_api_key)):
    result = get_task_status(task_id)
    if not result:
        raise HTTPException(status_code=404, detail="Task not found")
    return result
