import os
from dotenv import load_dotenv

# Load from .env explicitly
load_dotenv(dotenv_path=".env")

print("--- ENVIRONMENT CHECK ---")
backend_key = os.getenv("INTERNAL_API_KEY")
print(f"INTERNAL_API_KEY in .env: '{backend_key}'")

replicate_key = os.getenv("REPLICATE_API_TOKEN")
if replicate_key:
    print(f"REPLICATE_API_TOKEN: Found ({replicate_key[:4]}...)")
else:
    print("REPLICATE_API_TOKEN: NOT FOUND")

print(f"Current file list in {os.getcwd()}:")
print(os.listdir("."))
print("-------------------------")

