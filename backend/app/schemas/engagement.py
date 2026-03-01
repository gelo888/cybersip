from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class EngagementType(str, Enum):
    """Mirrors the EngagementType enum in the Prisma schema."""
    call = "call"
    email = "email"
    meeting = "meeting"
    demo = "demo"


# ── Engagement Stage schemas ────────────────────────────────────────

class StageCreate(BaseModel):
    """Request body for creating a pipeline stage."""
    name: str = Field(..., min_length=1, max_length=255)
    probability: int = Field(0, ge=0, le=100)


class StageUpdate(BaseModel):
    """Request body for updating a pipeline stage."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    probability: Optional[int] = Field(None, ge=0, le=100)


class StageResponse(BaseModel):
    """Response body for a pipeline stage."""
    id: str
    name: str
    probability: int

    class Config:
        from_attributes = True


# ── Engagement schemas ──────────────────────────────────────────────

class EngagementCreate(BaseModel):
    """Request body for logging a new engagement against a company."""
    company_id: str
    stage_id: str
    type: EngagementType
    outcome: Optional[str] = None
    next_action_date: Optional[datetime] = None


class EngagementUpdate(BaseModel):
    """Request body for updating an existing engagement."""
    stage_id: Optional[str] = None
    type: Optional[EngagementType] = None
    outcome: Optional[str] = None
    next_action_date: Optional[datetime] = None


class EngagementResponse(BaseModel):
    """Response body returned when reading an engagement."""
    id: str
    company_id: str
    company_name: str
    stage_id: str
    stage_name: str
    type: EngagementType
    outcome: Optional[str] = None
    next_action_date: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
