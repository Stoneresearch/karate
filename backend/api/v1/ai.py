from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, Field
from typing import Optional
import os
from ...workers.tasks import run_ai_model

def get_api_key(x_api_key: Optional[str] = Header(default=None)):
    # In production, use security APIKeyHeader and secrets comparison
    expected = os.getenv("INTERNAL_API_KEY")
    if not expected:
        return None
    if x_api_key != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

router = APIRouter()

# Expandable cost table. Keys must match backend workers model identifiers.
MODEL_COSTS = {
    "stable-diffusion-3.5": 1,
    "dalle-3": 2,
    "gpt-image-1": 2,
    # Replicate-backed models (configure slugs via env; see workers.tasks)
    "flux-pro-1.1": 2,
    "flux-dev-redux": 2,
    "flux-canny-pro": 2,
    "flux-depth-pro": 2,
    "ideogram-v3": 2,
    "ideogram-v2": 2,
    "minimax-image-01": 2,
    "recraft-v3-svg": 1,
    "esrgan": 1,
    "imagen-4": 2,
    "imagen-4-fast": 2,
    "imagen-4-ultra": 3,
    "imagen-3": 2,
    "imagen-3-fast": 2,
    "google-upscaler": 1,
    "gemini-2.5-flash-image": 2,
    "gemini-2.5-flash": 2,
    "veo-3": 3,
    "veo-3-fast": 3,
    "veo-3.1": 3,
    "veo-3.1-fast": 3,
    "veo-2": 3,
    "lyria-2": 3,
    # HTTP-configured models (configure per-model URLs in env)
    "bria": 2,
    "remove-background": 1,
    "content-aware-fill": 1,
    "bria-remove-bg": 1,
    "bria-content-fill": 1,
    "replace-background": 1,
    "bria-replace-background": 1,
    "relight-2": 1,
    "kolors-virtual-try-on": 2,
    "topaz-video-upscaler": 2,
    "bria-upscale": 1,
    "clarity-upscale": 1,
    "video-smoother": 2,
    "frame-interpolation": 2,
    "video-to-audio": 2,
    "audio-to-video": 2,
    "seedream-v4-edit": 2,
    "reve-edit": 2,
    "luma-photon": 2,
    "nvidia-sana": 2,
    "nvidia-consistency": 2,
    "vectorizer": 1,
    "text-to-vector": 1,
    "face-align": 1,
    "nano-banana": 1,
    "dreamshaper-v8": 2,
    "runway-aleph": 3,
    "runway-act-two": 3,
    "runway-gen-4": 3,
    "runway-gen-3": 3,
    "luma-reframe": 3,
    "luma-modify": 3,
    "veo-text-to-video": 3,
    "veo-image-to-video": 3,
    "sora-2": 4,
    "hunyuan-video-to-video": 3,
    "omnihuman-v1-5": 3,
    "sync-2-pro": 3,
    "pixverse-lipsync": 3,
    "kling-ai-avatar": 3,
    "rodin": 2,
    "hunyuan-3d": 3,
    "trellis-3d": 3,
    "meshy-3d": 3,
    "wan-vace-depth": 2,
    "wan-vace-pose": 2,
    "wan-vace-reframe": 2,
    "wan-vace-outpaint": 2,
    "wan-2-5": 3,
    "wan-2-2": 3,
    "wan-2-1-lora": 3,
}

class InferRequest(BaseModel):
    model: str = Field(..., description="Model identifier")
    prompt: str = Field(..., min_length=1)

@router.post("/infer")
async def infer(req: InferRequest, x_user_id: Optional[str] = Header(default=None), _: Optional[bool] = Depends(get_api_key)):
    model = req.model
    if model not in MODEL_COSTS:
        raise HTTPException(status_code=400, detail="Unknown model")
    # Minimal execution path (stubbed). Replace with queue in production.
    uid = x_user_id or "demo-user"
    result = await run_ai_model(model=model, prompt=req.prompt, user_id=uid)
    return {"task_id": "stub", **result}


