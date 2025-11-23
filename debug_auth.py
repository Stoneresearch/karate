import os
from fastapi import FastAPI, Header, HTTPException, Depends
from dotenv import load_dotenv
import logging
import sys

# Force load from .env explicitly
load_dotenv(dotenv_path=".env")
load_dotenv(dotenv_path=".env.local", override=True) # Try both

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

print("--- DEBUG: AUTH CHECK ---")
backend_key = os.getenv("INTERNAL_API_KEY")
print(f"Backend sees INTERNAL_API_KEY: '{backend_key}'")
print(f"Current Working Directory: {os.getcwd()}")
print("File listing:")
print(os.listdir("."))
print("-------------------------")

app = FastAPI()

@app.post("/test-auth")
async def test_auth(x_api_key: str = Header(None)):
    expected = os.getenv("INTERNAL_API_KEY")
    return {
        "received_key": x_api_key,
        "expected_key": expected,
        "match": x_api_key == expected
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

