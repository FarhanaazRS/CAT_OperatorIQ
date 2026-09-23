import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.database import get_db
from app.db import models
from app.routes.intelligence import get_unified_operator_intelligence
from app.core.config import settings

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    operator_id: str

# Use os.getenv at runtime to ensure it picks up the key loaded from .env
@router.post("/chat")
async def chat_with_assistant(req: ChatRequest, db: Session = Depends(get_db)):
    GROQ_API_KEY = settings.XAI_API_KEY
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="API Key not configured")
        
    operator = db.query(models.Operator).filter(models.Operator.operator_id == req.operator_id).first()
    if not operator:
        raise HTTPException(status_code=404, detail="Operator not found")
        
    # Gather Context
    intel = get_unified_operator_intelligence(req.operator_id, db)
    
    # Build System Prompt
    system_prompt = f"""You are OperatorIQ Assistant, an intelligent assistant for heavy-equipment operators.
Your job is to help the operator understand their current task, machine condition, safety status, fuel usage, productivity, training and shift performance.

Use the supplied OperatorIQ operational context as the primary source of truth.
Never invent machine telemetry, safety events, task information, fuel values, operator performance values or training records.
If the supplied context does not contain the answer, say that the information is not currently available.

Keep responses concise and operational. Non-technical when speaking to the operator.
Prioritize safety when the user asks about unsafe operating conditions.

When appropriate:
1. State what is happening.
2. Explain why.
3. Give one clear recommended action.

OPERATOR CONTEXT:
ID: {operator.operator_id}
Name: {operator.operator_name}
Skill: {operator.skill_level}
Safety Score: {operator.safety_score}/100
Productivity Score: {operator.average_productivity_score}/100
Training Score: {operator.training_score}/100

INTELLIGENCE CONTEXT:
Task ETA: {intel.get('task_eta', 'None')}
Machine Health: {intel.get('machine', 'None')}
Fuel: {intel.get('fuel', 'None')}
Safety: {intel.get('safety', 'None')}
Current Insights: {intel.get('insights', 'None')}
"""

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "openai/gpt-oss-20b",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": req.message}
                    ],
                    "temperature": 0.2,
                    "max_tokens": 150
                },
                timeout=10.0
            )
        except Exception as e:
            raise HTTPException(status_code=502, detail=str(e))
        
    if response.status_code != 200:
        print(response.text)
        raise HTTPException(status_code=502, detail="Error communicating with LLM")
        
    data = response.json()
    reply = data["choices"][0]["message"]["content"]
    
    # Determine sources based on what they asked
    sources = []
    lower_msg = req.message.lower()
    if "task" in lower_msg or "finish" in lower_msg or "behind" in lower_msg: sources.append("task_eta")
    if "fuel" in lower_msg: sources.append("fuel_usage")
    if "safe" in lower_msg or "incident" in lower_msg: sources.append("safety_monitor")
    if "machine" in lower_msg or "health" in lower_msg: sources.append("machine_telemetry")
    if not sources: sources.append("operator_profile")
    
    return {
        "response": reply,
        "sources": sources
    }
