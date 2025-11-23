import os
import sys
from pathlib import Path

def check_env_file():
    print("🔍 Starting Deep Environment Diagnosis...")
    
    cwd = Path.cwd()
    print(f"📂 Current Directory: {cwd}")
    
    # 1. Search for .env files
    candidates = [
        cwd / ".env",
        cwd / "backend" / ".env",
        cwd / ".env.local",
        cwd / ".env.txt"
    ]
    
    found_file = None
    for path in candidates:
        if path.exists():
            print(f"✅ Found file at: {path}")
            found_file = path
            # Check permissions
            try:
                with open(path, 'r') as f:
                    content = f.read()
                    print(f"   - File is readable (Size: {len(content)} bytes)")
                    
                    # Check for the token in the file content explicitly
                    if "REPLICATE_API_TOKEN" in content:
                        print("   - 'REPLICATE_API_TOKEN' string found in file")
                        for line in content.splitlines():
                            if line.strip().startswith("REPLICATE_API_TOKEN"):
                                parts = line.split("=")
                                if len(parts) > 1 and len(parts[1].strip()) > 5:
                                    print(f"   - Key appears to have a value (starts with: {parts[1].strip()[:4]}...)")
                                else:
                                    print("   - ⚠️  Key exists but value seems empty or too short")
                    else:
                        print("   - ❌ 'REPLICATE_API_TOKEN' NOT found in file text")
            except Exception as e:
                print(f"   - ❌ Error reading file: {e}")
        else:
            print(f"❌ No file at: {path}")

    print("\n📊 Checking Process Environment Variables (os.environ):")
    token = os.getenv("REPLICATE_API_TOKEN")
    if token:
        print(f"✅ REPLICATE_API_TOKEN is loaded in process! Value: {token[:4]}...")
    else:
        print("❌ REPLICATE_API_TOKEN is NOT loaded in process.")

    print("\n💡 Diagnosis:")
    if not found_file:
        print("1. You created the file, but it might be named wrong (e.g. .env.txt) or in the wrong folder.")
        print("   Action: Make sure it is named exactly '.env' (no extension) and is in the 'karate' folder.")
    elif found_file and not token:
        print("1. The file exists but the script isn't loading it.")
        print("   Action: Check for syntax errors in .env (spaces around '=', weird characters).")
    elif token:
        print("The token is loaded! If it fails, the token itself might be invalid/expired.")

if __name__ == "__main__":
    check_env_file()

