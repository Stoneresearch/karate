import os
import replicate
from dotenv import load_dotenv
import json

load_dotenv(".env")

models_to_check = [
    "black-forest-labs/flux-1.1-pro",
    "ideogram-ai/ideogram-v2",
    "tencent/hunyuan-video",
    "google/imagen-3",
    "wan-video/wan-2.1-1.3b", # Guessing, let's search
    "recraft-ai/recraft-v3-svg"
]

print("--- CHECKING REPLICATE MODELS ---")

def check_model(slug):
    try:
        model = replicate.models.get(slug)
        latest = model.latest_version
        if not latest:
            # Some models like flux-pro might not expose versions publicly the same way, 
            # or might be deployment only? Actually Flux Pro is usually an endpoint.
            # Let's try to get the model details.
            print(f"✅ {slug}: Found (No public version list?)")
            return
            
        print(f"✅ {slug}: Found")
        
        # Print Schema keys
        schema = latest.openapi_schema
        inputs = schema.get('components', {}).get('schemas', {}).get('Input', {}).get('properties', {})
        print(f"   Inputs: {list(inputs.keys())}")
        
    except Exception as e:
        print(f"❌ {slug}: {e}")

for m in models_to_check:
    check_model(m)

# Search for Wan
print("\n--- SEARCHING FOR 'WAN' ---")
try:
    results = replicate.models.search("wan 2.1")
    for r in results:
        print(f"Found: {r.owner}/{r.name}")
except Exception as e:
    print(f"Search error: {e}")

