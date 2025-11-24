#!/bin/bash

# Navigate to project root
cd "$(dirname "$0")"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}👷 Starting Karate Celery Worker...${NC}"

VENV_DIR="backend/.venv"
if [ -d "$VENV_DIR" ]; then
    source "$VENV_DIR/bin/activate"
fi

if [ -f backend/.env ]; then
  echo "Loading backend/.env file..."
  set -a
  source backend/.env
  set +a
fi

# Check Redis
if ! command -v redis-cli &> /dev/null; then
    echo -e "${YELLOW}⚠️  Redis CLI not found. Ensure Redis is running for the worker.${NC}"
else
    if ! redis-cli ping &> /dev/null; then
         echo -e "${YELLOW}⚠️  Could not connect to Redis. Is it running?${NC}"
    fi
fi

# Start Celery
# PYTHONPATH must include project root so "backend" module is found
export PYTHONPATH=$PYTHONPATH:$(pwd)

celery -A backend.celery_app worker --loglevel=info

