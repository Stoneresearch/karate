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
    for k in ["url", "image", "output", "src", "video", "audio"]:
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
  
  # Map common parameters
  if "aspect_ratio" in kwargs: input_payload["aspect_ratio"] = kwargs["aspect_ratio"]
  if "guidance_scale" in kwargs: input_payload["guidance_scale"] = kwargs["guidance_scale"]
  if "seed" in kwargs: input_payload["seed"] = kwargs["seed"]
  if "safety_tolerance" in kwargs: input_payload["safety_tolerance"] = kwargs["safety_tolerance"]

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
        else:
            # Extensive Replicate Slug Mapping
            slug_map = {
              # Images
              "dalle-3": "openai/dall-e-3", # If using a wrapper on Replicate
              "flux-pro-1.1-ultra": "black-forest-labs/flux-1.1-pro-ultra",
              "flux-pro-1.1": "black-forest-labs/flux-1.1-pro",
              "flux-dev-redux": "black-forest-labs/flux-dev", # Approximate
              "flux-canny-pro": "black-forest-labs/flux-canny-pro",
              "flux-depth-pro": "black-forest-labs/flux-depth-pro",
              "ideogram-v3": "ideogram-ai/ideogram-v2", # Fallback to v2 if v3 not public yet
              "ideogram-v2": "ideogram-ai/ideogram-v2",
              "minimax-image-01": "minimax/image-01",
              "recraft-v3-svg": "recraft-ai/recraft-v3-svg",
              "esrgan": "nightmareai/real-esrgan",
              "imagen-3": "google/imagen-3",
              "imagen-3-fast": "google/imagen-3-fast",
              "google-upscaler": "google/imagen-3-upscaler", # Approximate
              "gemini-1.5-flash": "google/gemini-1.5-flash", 
              "gemini-2.5-flash-image": "google/gemini-2.5-flash-image",
              
              # Video
              "hunyuan-video": "tencent/hunyuan-video",
              "wan-2.1-t2v": "wan-video/wan-2.1-t2v-14b",
              "wan-2.5": "wan-video/wan-2.5",
              "wan-2.2": "wan-video/wan-2.2",
              "sora-2": "openai/sora-2",
              "kling-v1": "kling-ai/kling-v1", 
              "luma-ray": "luma/ray",
              "runway-gen-3": "runwayml/runway-gen-3",
              "veo-2": "google/veo-2",
              "veo-3": "google/veo-3",
              "veo-3.1": "google/veo-3.1",
              "minimax-video": "minimax/video-01",
              
              # 3D
              "rodin": "rodin/rodin-v1",
              "trellis": "microsoft/trellis",
              "meshy": "meshy/meshy-3",
              "hunyuan-3d": "tencent/hunyuan-3d-1",
            }
            
            # Allow environment variable overrides for any slug
            env_key = f"REPLICATE_{model.upper().replace('-', '_').replace('/', '_')}"
            
            # Try map first, then fallback to model string if it looks like a slug (owner/name)
            slug = os.getenv(env_key, slug_map.get(model))
            if not slug and "/" in model:
                slug = model

            if slug:
                if replicate is not None and os.getenv("REPLICATE_API_TOKEN"):
                    def _run_generic(prompt_text: str, params: dict) -> Optional[str]:
                        try:
                            # Start with prompt
                            inputs = {"prompt": prompt_text}
                            
                            # Merge all other params, overriding prompt if strictly necessary (though we set it above)
                            # We exclude 'user_id', 'workflowId' etc if they were passed in params, 
                            # but params usually comes from **kwargs in calling function.
                            # Let's assume params contains only model inputs.
                            inputs.update(params)
                            
                            # Ensure prompt is set (if params had it, it's fine, if not, we set it)
                            if "prompt" not in inputs or not inputs["prompt"]:
                                inputs["prompt"] = prompt_text

                            logger.info(f"Running Replicate model {slug} with inputs keys: {list(inputs.keys())}")
                            output: Any = replicate.run(slug, input=inputs)
                            return _first_url_from(output)
                        except Exception as e:
                            logger.exception(f"Replicate generic error ({slug}): {e}")
                            return None
                    
                    output_url = await asyncio.to_thread(_run_generic, prompt, kwargs)
                else:
                    logger.warning(f"Missing configuration for Replicate model: {model}. Replicate lib: {replicate is not None}, Token: {bool(os.getenv('REPLICATE_API_TOKEN'))}")
                    error_msg = "Missing Replicate configuration (Token or Library)"
                    output_url = None
            else:
                # Fallback to generic HTTP
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
