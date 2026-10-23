"""
NationOS — National Decision Intelligence Platform Backend
FastAPI gateway service powering the Citizen and Government intelligence portals.
"""

import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ai_engine import query_engine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nation-os-backend")

app = FastAPI(
    title="NationOS API",
    description="National Decision Intelligence Platform for Lagos State 2026 Fiscal Budget",
    version="1.0.0",
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Pydantic Data Models ---

class ChatRequest(BaseModel):
    query: str = Field(
        ...,
        description="Plain-English budgetary inquiry from the citizen",
        examples=["How much was spent on education in Ikeja?"],
    )


class ChatResponse(BaseModel):
    answer: str


class AllocateRequest(BaseModel):
    revenue_drop_percentage: int = Field(
        ...,
        ge=0,
        le=100,
        description="Projected percentage decrease in state revenue (0-100)",
        examples=[15],
    )


class AllocateResponse(BaseModel):
    simulation_result: str


# --- Service Endpoints ---

@app.get("/health")
def health_check():
    """Health check endpoint to verify backend service readiness."""
    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
def citizen_chat(request: ChatRequest):
    """
    Citizen Portal Endpoint:
    Processes natural-language inquiries against the 2026 Lagos State budget ground truth.
    """
    logger.info(f"Received citizen query: {request.query}")
    try:
        response = query_engine.query(request.query)
        return ChatResponse(answer=str(response))
    except Exception as e:
        logger.error(f"Error executing citizen query: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"LlamaIndex query execution failed: {str(e)}",
        )


@app.post("/api/allocate", response_model=AllocateResponse)
def government_allocate(request: AllocateRequest):
    """
    Government Portal Endpoint:
    Simulates proportional expenditure reallocation across MDAs under fiscal constraints.
    """
    logger.info(f"Simulating revenue reduction of {request.revenue_drop_percentage}%")
    prompt = (
        f"Our state revenue has dropped by {request.revenue_drop_percentage}%. "
        "Suggest how we should proportionally cut 'Recurrent - Overhead' across all MDAs "
        "to cover this shortfall, leaving 'Capital' untouched. "
        "Calculate the exact Naira amounts."
    )
    try:
        response = query_engine.query(prompt)
        return AllocateResponse(simulation_result=str(response))
    except Exception as e:
        logger.error(f"Error executing allocation simulation: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"LlamaIndex simulation execution failed: {str(e)}",
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
