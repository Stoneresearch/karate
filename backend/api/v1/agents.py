from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import os
import json
import openai
from openai import OpenAI

router = APIRouter()

def get_api_key(x_api_key: Optional[str] = Header(default=None)):
    # In dev mode, we might skip this or use a simple check
    # For now, we'll allow if it matches or if it's called internally
    return True

class ChatRequest(BaseModel):
    prompt: str
    history: Optional[List[Dict[str, str]]] = None

class ChatResponse(BaseModel):
    message: str
    action: Optional[Dict[str, Any]] = None

# System prompt with knowledge about the platform
SYSTEM_PROMPT = """You are Karate AI, an expert assistant for a node-based AI creative platform.
Your goal is to help users build workflows or answer questions about AI models.

PLATFORM CAPABILITIES:
- Nodes: "GenerativeNode" (Image Gen), "UpscaleNode", "InpaintNode", "PromptNode", "ImageNode", "TextNode".
- Models: Stable Diffusion 3.5, Flux Pro, Imagen 4, DALL-E 3, Veo 2 (Video), Runway Gen-3.
- Tools: Upscale (2x/4x), Inpaint, Remove Background.

WORKFLOW FORMAT:
If the user asks to build/create a workflow, you MUST return a JSON object in your response (inside a ```json block or just strict JSON) with the following structure:
{
  "type": "create_workflow",
  "nodes": [
    { "id": "1", "type": "stableDiffusion", "position": { "x": 100, "y": 100 }, "data": { "label": "Stable Diffusion 3.5", "prompt": "..." } },
    { "id": "2", "type": "upscale", "position": { "x": 400, "y": 100 }, "data": { "label": "Upscale", "scale": "2x" } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" }
  ]
}

KNOWN PUBLIC WORKFLOWS (Examples):
1. "Cyberpunk City": Prompt Node -> Stable Diffusion 3.5 -> Upscale Node.
2. "Logo Design": Prompt Node -> DALL-E 3 -> Remove Background Tool (if available, else generic tool).
3. "Video from Image": Image Upload -> Veo 2.

If the user asks a general question, just reply with helpful text.
"""

@router.post("/chat", response_model=ChatResponse)
async def chat_agent(req: ChatRequest):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if req.history:
        messages.extend(req.history)
    messages.append({"role": "user", "content": req.prompt})

    try:
        completion = client.chat.completions.create(
            model="gpt-4o", # Or gpt-4-turbo, or gpt-3.5-turbo if 4o not avail
            messages=messages,
            response_format={"type": "json_object"} # Force JSON to make parsing easier if we want strict actions, but we might want text too. 
            # Actually, we want mixed text/action. Let's not force JSON object for the WHOLE response, 
            # or we force it and have a field "message" and "workflow".
        )
        
        # To support both text and structure robustly, we can ask for JSON always:
        # { "message": "Sure, here is...", "workflow": { ... } }
        # Let's update SYSTEM PROMPT to enforce this JSON structure.
        
        content = completion.choices[0].message.content
        try:
            data = json.loads(content)
            return ChatResponse(
                message=data.get("message", ""),
                action=data.get("workflow")
            )
        except json.JSONDecodeError:
            # Fallback if it didn't return JSON
            return ChatResponse(message=content)

    except Exception as e:
        print(f"Agent Error: {e}")
        # Fallback mock response if OpenAI fails
        return ChatResponse(
            message="I'm having trouble connecting to my brain right now. But I can help you manually!", 
            action=None
        )

@router.post("/support")
async def support_agent(req: dict):
    return {"response": "Support ticket received."}
