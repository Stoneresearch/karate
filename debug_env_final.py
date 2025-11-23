import os
from dotenv import load_dotenv

print("--- ENVIRONMENT DIAGNOSTIC ---")
# Try loading .env explicitly
load_dotenv(dotenv_path=".env")

replicate_key = os.getenv("REPLICATE_API_TOKEN")
if replicate_key:
    print(f"✅ REPLICATE_API_TOKEN found: {replicate_key[:4]}... (length: {len(replicate_key)})")
else:
    print("❌ REPLICATE_API_TOKEN NOT FOUND")

# Check if Flux Pro key is set (optional, but good to check)
flux_pro_model = os.getenv("REPLICATE_FLUX_PRO_1_1")
print(f"Flux Pro Model Config: {flux_pro_model}")

print("------------------------------")

