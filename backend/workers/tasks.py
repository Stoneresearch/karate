import os
import logging
import uuid
from typing import Optional, Any, List, TypedDict
import httpx
from celery.result import AsyncResult
from backend.celery_app import celery_app

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

@celery_app.task(bind=True, name="backend.workers.tasks.process_ai_task")
def process_ai_task(self, model: str, prompt: str, user_id: str, **kwargs):
    output_url: Optional[str] = None
    error_msg: Optional[str] = None
    
    # Store initial state in task meta
    self.update_state(state='PROCESSING', meta={
        "model": model, 
        "prompt": prompt, 
        "user_id": user_id,
        "status": "processing"
    })

    try:
        if model == "stable-diffusion-3.5":
             output_url = _run_replicate_sdxl_sync(prompt, **kwargs)
        elif model == "dalle-3":
             output_url = _run_openai_image_sync("dall-e-3", prompt)
        elif model == "gpt-image-1":
             output_url = _run_openai_image_sync("gpt-image-1", prompt)
        else:
            # Slug logic
            env_key = f"REPLICATE_{model.upper().replace('-', '_').replace('/', '_')}"
            slug = os.getenv(env_key, model)

            if "/" in slug:
                if replicate is not None and os.getenv("REPLICATE_API_TOKEN"):
                    inputs = {"prompt": prompt}
                    inputs.update(kwargs)
                    if "prompt" not in inputs or not inputs["prompt"]:
                        inputs["prompt"] = prompt

                    logger.info(f"Running Replicate model {slug} with keys: {list(inputs.keys())}")
                    try:
                        output: Any = replicate.run(slug, input=inputs)
                        output_url = _first_url_from(output)
                    except Exception as e:
                        # If we get a specific "Failed to authenticate user DB record" error from Replicate
                        # it usually means the model is private or doesn't exist, or the token is invalid.
                        # However, for "Nano Banana Pro", if it's a private model, we need to ensure the token has access.
                        # It could also be a confusing error message from Replicate for "Model not found".
                        logger.exception(f"Replicate error: {e}")
                        error_msg = str(e)
                        if "Failed to authenticate user DB record" in error_msg:
                             error_msg = f"Authentication failed for model {slug}. Please check if the model exists and your Replicate token has access."
                else:
                    error_msg = "Missing Replicate config"
            else:
                output_url = _run_generic_http_sync(model, prompt)

        if output_url:
            return {
                "model": model,
                "prompt": prompt,
                "user_id": user_id,
                "output_url": output_url,
                "status": "completed",
                "error": None
            }
        else:
            # Fail implicitly if no URL but no exception
            raise Exception(error_msg or "No output URL generated")

    except Exception as e:
        logger.exception(f"Task failed: {e}")
        # Celery handles exception state automatically if we raise, 
        # but we want to return a structured error result often.
        # However, raising lets Celery retry if configured. 
        # For now, let's return a failed structure.
        return {
            "model": model,
            "prompt": prompt,
            "user_id": user_id,
            "output_url": None,
            "status": "failed",
            "error": str(e)
        }

# Compatibility layer for API
async def run_ai_model_background(model: str, prompt: str, user_id: str, **kwargs) -> str:
    # .delay() is the standard way to call Celery tasks
    task = process_ai_task.delay(model, prompt, user_id, **kwargs)
    return task.id

def get_task_status(task_id: str) -> Optional[RunResult]:
    try:
        result = AsyncResult(task_id, app=celery_app)
        if result.ready():
            # If it returned a dict (success or handled failure)
            data = result.result
            if isinstance(data, dict):
                return data
            # If it raised an exception unhandled
            elif isinstance(data, Exception):
                 return {
                    "model": "unknown", "prompt": "", "user_id": "", 
                    "output_url": None, "status": "failed", "error": str(data)
                }
        else:
            # Processing
            # Try to get meta info if available?
            return {
                "model": "unknown", "prompt": "", "user_id": "",
                "output_url": None, "status": "processing", "error": None
            }
    except Exception as e:
        logger.error(f"Error fetching status: {e}")
        return None
    return None
