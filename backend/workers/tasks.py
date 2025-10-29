import os
import asyncio
from typing import TypedDict, Optional, Any, List
import httpx

try:
  # replicate and openai are optional at dev time; handle gracefully if missing
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
    # common keys
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


def _run_replicate_sdxl_sync(prompt: str) -> Optional[str]:
  api_token = os.getenv("REPLICATE_API_TOKEN")
  if not api_token or replicate is None:
    return None
  # Example SDXL model/version from docs; replace with a preferred version as needed
  model_version = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c71dcde277882d13b833d5c75deae501615"
  try:
    # replicate.run returns a list of URLs or a single URL
    output: Any = replicate.run(model_version, input={"prompt": prompt})  # type: ignore
    return _first_url_from(output)
  except Exception:
    return None


def _run_openai_image_sync(model_name: str, prompt: str) -> Optional[str]:
  api_key = os.getenv("OPENAI_API_KEY")
  if not api_key or OpenAI is None:
    return None
  try:
    client = OpenAI(api_key=api_key)  # type: ignore
    resp = client.images.generate(model=model_name, prompt=prompt, n=1, size="1024x1024")  # type: ignore
    data: List[Any] = getattr(resp, "data", [])
    if data and isinstance(data, list):
      return _first_url_from(data[0])
    return None
  except Exception:
    return None


def _run_generic_http_sync(model_key: str, prompt: str) -> Optional[str]:
  """Call a configurable HTTP endpoint for a model.
  Expects env vars:
    HTTP_MODEL_{MODEL_KEY}_URL  (e.g., HTTP_MODEL_RUNWAY_GEN_4_URL)
    HTTP_MODEL_{MODEL_KEY}_AUTH (optional header value, e.g., "Bearer sk-...")
  Sends JSON: {"prompt": prompt}. Expects JSON response with a URL somewhere.
  """
  key = model_key.upper().replace("-", "_")
  url = os.getenv(f"HTTP_MODEL_{key}_URL")
  if not url:
    return None
  headers = {"Content-Type": "application/json"}
  auth = os.getenv(f"HTTP_MODEL_{key}_AUTH")
  if auth:
    headers["Authorization"] = auth
  try:
    with httpx.Client(timeout=60) as client:
      resp = client.post(url, json={"prompt": prompt}, headers=headers)
      data = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else None
      return _first_url_from(data)
  except Exception:
    return None


async def run_ai_model(model: str, prompt: str, user_id: str) -> RunResult:
  output_url: Optional[str] = None

  if model == "stable-diffusion-3.5":
    # Use Replicate SDXL as the stand-in for SD 3.5 (can be swapped later)
    output_url = await asyncio.to_thread(_run_replicate_sdxl_sync, prompt)
  elif model == "dalle-3":
    output_url = await asyncio.to_thread(_run_openai_image_sync, "dall-e-3", prompt)
  elif model == "gpt-image-1":
    output_url = await asyncio.to_thread(_run_openai_image_sync, "gpt-image-1", prompt)
  elif model in {"flux-pro-1.1", "ideogram-v3", "minimax-image-01", "recraft-v3-svg", "esrgan", "imagen-4", "imagen-4-fast", "imagen-4-ultra", "imagen-3", "imagen-3-fast", "google-upscaler"}:
    # Generic Replicate path driven by env slugs. Configure env vars:
    #   REPLICATE_FLUX_PRO_1_1, REPLICATE_IDEOGRAM_V3, REPLICATE_MINIMAX_IMAGE_01,
    #   REPLICATE_RECRAFT_V3_SVG, REPLICATE_ESRGAN
    slug_map = {
      "flux-pro-1.1": os.getenv("REPLICATE_FLUX_PRO_1_1"),
      "ideogram-v3": os.getenv("REPLICATE_IDEOGRAM_V3"),
      "minimax-image-01": os.getenv("REPLICATE_MINIMAX_IMAGE_01"),
      "recraft-v3-svg": os.getenv("REPLICATE_RECRAFT_V3_SVG"),
      "esrgan": os.getenv("REPLICATE_ESRGAN"),
      # Google Imagen & Upscaler families via Replicate
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
          output: Any = replicate.run(slug, input={"prompt": prompt_text})  # type: ignore
          return _first_url_from(output)
        except Exception:
          return None
      output_url = await asyncio.to_thread(_run_generic, prompt)
    else:
      output_url = None
  elif model in {
    # Extended set routed by generic HTTP endpoints; configure per-model URLs in env
    "flux-dev-redux", "flux-canny-pro", "flux-depth-pro",
    "ideogram-v2", "bria", "remove-background", "content-aware-fill",
    "bria-remove-bg", "bria-content-fill", "replace-background", "bria-replace-background",
    "relight-2", "kolors-virtual-try-on", "topaz-video-upscaler", "bria-upscale",
    "runway-aleph", "runway-act-two", "runway-gen-4", "runway-gen-3",
    "luma-reframe", "luma-modify", "veo-text-to-video", "veo-image-to-video",
    "sora-2", "hunyuan-video-to-video", "omnihuman-v1-5", "sync-2-pro",
    "pixverse-lipsync", "kling-ai-avatar", "rodin", "hunyuan-3d", "trellis-3d", "meshy-3d",
    "wan-vace-depth", "wan-vace-pose", "wan-vace-reframe", "wan-vace-outpaint",
    "wan-2-5", "wan-2-2", "wan-2-1-lora",
  }:
    output_url = await asyncio.to_thread(_run_generic_http_sync, model, prompt)
  else:
    # Fallback: attempt generic HTTP runner if configured
    output_url = await asyncio.to_thread(_run_generic_http_sync, model, prompt)

  return {"model": model, "prompt": prompt, "user_id": user_id, "output_url": output_url}

