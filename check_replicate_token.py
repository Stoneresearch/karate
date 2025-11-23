import os
import dotenv

# Explicitly load .env
dotenv.load_dotenv(".env")

api_token = os.getenv("REPLICATE_API_TOKEN")
print(f"REPLICATE_API_TOKEN in python check: {api_token if api_token else 'MISSING'}")

# Double check if we can import replicate
try:
    import replicate
    print("Replicate library: INSTALLED")
except ImportError:
    print("Replicate library: MISSING")

