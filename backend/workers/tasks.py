import os
import uuid
import logging
import asyncio
import json
from typing import TypedDict, Optional, Any, List, Dict
import httpx
from backend.core.redis import get_redis_client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
  import replicate  # type: ignore
except Exception:
  replicate = None  # type: ignore

try:
  from openai import OpenAI  # type: ignore
except Exception:
  OpenAI = None  # type: ignore


class RunResult(TypedDict):
  model: str
  prompt: str
  user_id: str
  output_url: Optional[str]
  status: str # "processing", "completed" or "failed"
  error: Optional[str]


def _first_url_from(obj: Any) -> Optional[str]:
  """Extract the first plausible URL from various SDK responses."""
  if obj is None:
    return None
  if isinstance(obj, str):
    return obj if obj.startswith("http") else None
  if isinstance(obj, (list, tuple)):
    for item in obj:
      url = _first_url_from(item)
      if url:
        return url
    return None
  if isinstance(obj, dict):
    for k in ["url", "image", "output", "src"]:
      v = obj.get(k)
      if isinstance(v, str) and v.startswith("http"):
        return v
      if isinstance(v, (list, tuple, dict)):
        u = _first_url_from(v)
        if u:
          return u
    return None
  return None


def _run_replicate_sdxl_sync(prompt: str, **kwargs) -> Optional[str]:
  api_token = os.getenv("REPLICATE_API_TOKEN")
  if not api_token or replicate is None:
    logger.error("Replicate API token missing or library not installed")
    return None
  model_version = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c71dcde277882d13b833d5c75deae501615"
  
  input_payload = {"prompt": prompt}
  
  if "aspect_ratio" in kwargs:
      input_payload["aspect_ratio"] = kwargs["aspect_ratio"]
      
  if "guidance_scale" in kwargs:
      input_payload["guidance_scale"] = kwargs["guidance_scale"]
      
  if "seed" in kwargs:
      input_payload["seed"] = kwargs["seed"]

  if "safety_tolerance" in kwargs:
      input_payload["safety_tolerance"] = kwargs["safety_tolerance"]

  try:
    output: Any = replicate.run(model_version, input=input_payload)  # type: ignore
    return _first_url_from(output)
  except Exception as e:
    logger.exception(f"Replicate SDXL error: {e}")
    return None


def _run_openai_image_sync(model_name: str, prompt: str) -> Optional[str]:
  api_key = os.getenv("OPENAI_API_KEY")
  if not api_key or OpenAI is None:
    logger.error("OpenAI API key missing or library not installed")
    return None
  try:
    client = OpenAI(api_key=api_key)  # type: ignore
    resp = client.images.generate(model=model_name, prompt=prompt, n=1, size="1024x1024")  # type: ignore
    data: List[Any] = getattr(resp, "data", [])
    if data and isinstance(data, list):
      return _first_url_from(data[0])
    return None
  except Exception as e:
    logger.exception(f"OpenAI Image error ({model_name}): {e}")
    return None


def _run_generic_http_sync(model_key: str, prompt: str) -> Optional[str]:
  key = model_key.upper().replace("-", "_")
  url = os.getenv(f"HTTP_MODEL_{key}_URL")
  if not url:
    logger.warning(f"No HTTP URL configured for model {model_key} (HTTP_MODEL_{key}_URL)")
    return None
  headers = {"Content-Type": "application/json"}
  auth = os.getenv(f"HTTP_MODEL_{key}_AUTH")
  if auth:
    headers["Authorization"] = auth
  try:
    with httpx.Client(timeout=60) as client:
      resp = client.post(url, json={"prompt": prompt}, headers=headers)
      resp.raise_for_status()
      data = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else None
      return _first_url_from(data)
  except Exception as e:
    logger.exception(f"Generic HTTP error for {model_key}: {e}")
    return None


# Redis Client
redis_client = get_redis_client()
# Fallback in-memory store if Redis is not available
_memory_tasks: Dict[str, RunResult] = {}

def _save_task(task_id: str, data: RunResult):
    if redis_client:
        try:
            redis_client.setex(f"task:{task_id}", 3600, json.dumps(data)) # 1 hour TTL
        except Exception as e:
            logger.error(f"Redis set error: {e}")
            _memory_tasks[task_id] = data
    else:
        _memory_tasks[task_id] = data

def _get_task(task_id: str) -> Optional[RunResult]:
    if redis_client:
        try:
            data = redis_client.get(f"task:{task_id}")
            if data:
                return json.loads(data)
        except Exception as e:
            logger.error(f"Redis get error: {e}")
    return _memory_tasks.get(task_id)


async def run_ai_model_background(model: str, prompt: str, user_id: str, **kwargs) -> str:
    """Starts an AI task in the background and returns a task ID."""
    task_id = str(uuid.uuid4())
    initial_state: RunResult = {
        "model": model,
        "prompt": prompt,
        "user_id": user_id,
        "output_url": None,
        "status": "processing",
        "error": None
    }
    _save_task(task_id, initial_state)
    
    asyncio.create_task(_process_ai_task(task_id, model, prompt, user_id, **kwargs))
    return task_id

async def _process_ai_task(task_id: str, model: str, prompt: str, user_id: str, **kwargs):
    """Internal background processor."""
    output_url: Optional[str] = None
    error_msg: Optional[str] = None
    
    try:
        if model == "stable-diffusion-3.5":
            output_url = await asyncio.to_thread(_run_replicate_sdxl_sync, prompt, **kwargs)
        elif model == "dalle-3":
            output_url = await asyncio.to_thread(_run_openai_image_sync, "dall-e-3", prompt)
        elif model == "gpt-image-1":
            output_url = await asyncio.to_thread(_run_openai_image_sync, "gpt-image-1", prompt)
        elif model in {"flux-pro-1.1-ultra", "flux-pro-1.1", "ideogram-v3", "minimax-image-01", "recraft-v3-svg", "esrgan", "imagen-4", "imagen-4-fast", "imagen-4-ultra", "imagen-3", "imagen-3-fast", "google-upscaler"}:
            slug_map = {
              "flux-pro-1.1-ultra": os.getenv("REPLICATE_FLUX_PRO_1_1_ULTRA", "black-forest-labs/flux-1.1-pro-ultra"),
              "flux-pro-1.1": os.getenv("REPLICATE_FLUX_PRO_1_1", "black-forest-labs/flux-1.1-pro"),
              "ideogram-v3": os.getenv("REPLICATE_IDEOGRAM_V3", "ideogram-ai/ideogram-v3"),
              "minimax-image-01": os.getenv("REPLICATE_MINIMAX_IMAGE_01"),
              "recraft-v3-svg": os.getenv("REPLICATE_RECRAFT_V3_SVG"),
              "esrgan": os.getenv("REPLICATE_ESRGAN"),
              "imagen-4": os.getenv("REPLICATE_IMAGEN_4"),
              "imagen-4-fast": os.getenv("REPLICATE_IMAGEN_4_FAST"),
              "imagen-4-ultra": os.getenv("REPLICATE_IMAGEN_4_ULTRA"),
              "imagen-3": os.getenv("REPLICATE_IMAGEN_3"),
              "imagen-3-fast": os.getenv("REPLICATE_IMAGEN_3_FAST"),
              "google-upscaler": os.getenv("REPLICATE_GOOGLE_UPSCALER"),
            }
            slug = slug_map.get(model)
            if slug and replicate is not None and os.getenv("REPLICATE_API_TOKEN"):
                def _run_generic(prompt_text: str) -> Optional[str]:
                    try:
                        output: Any = replicate.run(slug, input={"prompt": prompt_text})
                        return _first_url_from(output)
                    except Exception as e:
                        logger.exception(f"Replicate generic error ({slug}): {e}")
                        return None
                output_url = await asyncio.to_thread(_run_generic, prompt)
            else:
                logger.warning(f"Missing configuration for Replicate model: {model}")
                error_msg = f"Missing configuration for model: {model}"
                output_url = None
        else:
            output_url = await asyncio.to_thread(_run_generic_http_sync, model, prompt)
        
        current_state = _get_task(task_id)
        if not current_state:
             # Should not happen, but robust check
             current_state = {
                "model": model, "prompt": prompt, "user_id": user_id, 
                "output_url": None, "status": "processing", "error": None
             }

        if output_url:
            current_state["output_url"] = output_url
            current_state["status"] = "completed"
        else:
            current_state["status"] = "failed"
            current_state["error"] = error_msg or "No output URL generated"
            
        _save_task(task_id, current_state)
            
    except Exception as e:
        logger.exception(f"Task {task_id} failed: {e}")
        current_state = _get_task(task_id) or {
            "model": model, "prompt": prompt, "user_id": user_id, 
            "output_url": None, "status": "processing", "error": None
        }
        current_state["status"] = "failed"
        current_state["error"] = str(e)
        _save_task(task_id, current_state)

def get_task_status(task_id: str) -> Optional[RunResult]:
    return _get_task(task_id)

async def run_ai_model(model: str, prompt: str, user_id: str) -> RunResult:
    """Legacy sync-wrapper (deprecated)."""
    task_id = await run_ai_model_background(model, prompt, user_id)
    # Polling wait for legacy calls
    for _ in range(20): # Wait up to 10s
        status = get_task_status(task_id)
        if status and status["status"] in ["completed", "failed"]:
             return status
        await asyncio.sleep(0.5)
    return get_task_status(task_id) or {"model": model, "prompt": prompt, "user_id": user_id, "output_url": None, "status": "processing", "error": "Timeout"}
