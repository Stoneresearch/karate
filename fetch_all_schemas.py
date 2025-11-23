import os
import replicate
from dotenv import load_dotenv
import json
import time

load_dotenv(".env")

# List of models from the sidebar to check (slugs from backend/workers/tasks.py)
models_to_check = [
    # Image Gen
    "stability-ai/sdxl", # Fallback for SD 3.5 if not public
    "black-forest-labs/flux-1.1-pro",
    "black-forest-labs/flux-1.1-pro-ultra",
    "black-forest-labs/flux-dev",
    "black-forest-labs/flux-canny-pro",
    "black-forest-labs/flux-depth-pro",
    "ideogram-ai/ideogram-v2",
    "minimax/image-01",
    "recraft-ai/recraft-v3-svg",
    "google/imagen-3",
    "google/imagen-3-fast",
    
    # Video Gen
    "tencent/hunyuan-video",
    "wan-video/wan-2.1-t2v-14b",
    "kling-ai/kling-v1",
    "luma/ray",
    "runwayml/runway-gen-3",
    "google/veo-2",
    "minimax/video-01",
    
    # 3D
    "rodin/rodin-v1",
    "microsoft/trellis",
    "meshy/meshy-3",
    "tencent/hunyuan-3d-1"
]

results = {}

print("--- FETCHING REPLICATE SCHEMAS ---")

for slug in models_to_check:
    try:
        print(f"Checking {slug}...")
        # Attempt to get the model
        try:
            model = replicate.models.get(slug)
        except Exception as e:
            print(f"⚠️  Model not found or private: {slug}")
            continue

        # Get latest version schema if available
        if model.latest_version:
            schema = model.latest_version.openapi_schema
            inputs = schema.get('components', {}).get('schemas', {}).get('Input', {}).get('properties', {})
            
            # Simplify schema for frontend
            simple_params = []
            for key, val in inputs.items():
                param = {
                    "name": key,
                    "label": val.get('title', key),
                    "type": val.get('type', 'string'),
                    "description": val.get('description', ''),
                    "default": val.get('default')
                }
                
                # Handle enums (selects)
                if 'enum' in val:
                    param['type'] = 'select'
                    param['options'] = val['enum']
                elif val.get('type') == 'integer' or val.get('type') == 'number':
                     param['type'] = 'number'
                     if 'minimum' in val: param['min'] = val['minimum']
                     if 'maximum' in val: param['max'] = val['maximum']
                elif val.get('type') == 'boolean':
                    param['type'] = 'boolean'
                
                simple_params.append(param)
            
            results[slug] = {
                "slug": slug,
                "parameters": simple_params
            }
            print(f"✅  Fetched schema for {slug}")
        else:
            print(f"⚠️  No latest version for {slug}")
            
    except Exception as e:
        print(f"❌  Error checking {slug}: {e}")
    
    # Be nice to the API
    time.sleep(0.5)

# Output as TS file content
print("\n--- GENERATED TS CONTENT ---")
print("export const MODEL_SCHEMAS: Record<string, ModelSchema> = {")
for slug, data in results.items():
    print(f"  '{slug}': {json.dumps(data, indent=4)},")
print("};")

