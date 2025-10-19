from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
import os

router = APIRouter()

def get_api_key(x_api_key: str | None = None):
    expected = os.getenv("INTERNAL_API_KEY")
    if not expected:
        return None
    if x_api_key != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

class SupportRequest(BaseModel):
    ticket: str = Field(..., min_length=1)

@router.post("/support")
async def support_agent(req: SupportRequest, _: bool | None = Depends(get_api_key)):
    return {"response": f"Stubbed response for: {req.ticket}"}


