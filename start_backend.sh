#!/bin/bash

# Navigate to project root
cd "$(dirname "$0")"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting Karate Backend...${NC}"

# Check if python3 is available
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 is not installed."
    exit 1
fi

# Check/Create Virtual Environment
VENV_DIR="backend/.venv"
if [ ! -d "$VENV_DIR" ]; then
    echo -e "${YELLOW}📦 Creating virtual environment at $VENV_DIR...${NC}"
    python3 -m venv "$VENV_DIR"
fi

# Activate Virtual Environment
source "$VENV_DIR/bin/activate"

# Check if requirements installed (simple check for uvicorn)
if ! python3 -c "import uvicorn" &> /dev/null; then
    echo -e "${YELLOW}⬇️  Installing dependencies...${NC}"
    pip install -U pip
    pip install -r backend/requirements.txt
fi

# Check Environment Variables
if [ -f .env ]; then
  echo "Loading .env file..."
  export $(grep -v '^#' .env | xargs)
else
  echo "⚠️  No .env file found!"
fi

export INTERNAL_API_KEY=${INTERNAL_API_KEY:-"dev-secret"}

echo -e "${GREEN}✅ Environment ready. Starting server...${NC}"
echo -e "${GREEN}🔑 INTERNAL_API_KEY: $INTERNAL_API_KEY${NC}"
if [ -z "$REPLICATE_API_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  REPLICATE_API_TOKEN is MISSING${NC}"
else
    echo -e "${GREEN}✅ REPLICATE_API_TOKEN is SET${NC}"
fi

# Start Server
python3 -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
