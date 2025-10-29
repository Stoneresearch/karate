from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, Field
from typing import Optional
import os
import httpx

router = APIRouter()

def get_api_key(x_api_key: Optional[str] = Header(default=None)):
    expected = os.getenv("INTERNAL_API_KEY")
    if not expected:
        return None
    if x_api_key != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

class SupportRequest(BaseModel):
    ticket: str = Field(..., min_length=1)

@router.post("/support")
async def support_agent(req: SupportRequest, _: Optional[bool] = Depends(get_api_key)):
  # 1) Optionally post to Slack via webhook (if configured)
  slack_webhook = os.getenv("SLACK_WEBHOOK_URL")
  if slack_webhook:
    try:
      async with httpx.AsyncClient(timeout=5) as client:
        await client.post(slack_webhook, json={
          "text": f"New support ticket:\n{req.ticket}"
        })
    except Exception:
      pass

  # 2) Log action to Convex via HTTP bridge (placeholder; real apps call Convex function)
  # In this MVP we don't have a public Convex HTTP function; keep behavior local.

  return {"response": f"Thanks for your message. Our support will review: {req.ticket}"}


