from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class IntelConfidence(str, Enum):
    """Mirrors the IntelConfidence enum in the Prisma schema."""
    confirmed = "confirmed"
    rumor = "rumor"
    inferred = "inferred"


# ── Competitor schemas ─────────────────────────────────────────────

class CompetitorCreate(BaseModel):
    """Request body for creating a competitor record."""
    name: str = Field(..., min_length=1, max_length=255)
    website: Optional[str] = None
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)


class CompetitorUpdate(BaseModel):
    """Request body for updating a competitor."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    website: Optional[str] = None
    strengths: Optional[list[str]] = None
    weaknesses: Optional[list[str]] = None


class CompetitorResponse(BaseModel):
    """Response body for a competitor."""
    id: str
    name: str
    website: Optional[str] = None
    strengths: list[str]
    weaknesses: list[str]

    class Config:
        from_attributes = True


# ── Competitor Intel schemas ───────────────────────────────────────

class IntelCreate(BaseModel):
    """Request body for logging competitor intelligence on a company."""
    company_id: str
    competitor_id: str
    product_name: Optional[str] = None
    contract_end: Optional[datetime] = None
    confidence: IntelConfidence = IntelConfidence.rumor


class IntelUpdate(BaseModel):
    """Request body for updating competitor intelligence."""
    product_name: Optional[str] = None
    contract_end: Optional[datetime] = None
    confidence: Optional[IntelConfidence] = None


class IntelResponse(BaseModel):
    """Response body for competitor intelligence."""
    id: str
    company_id: str
    company_name: str
    competitor_id: str
    competitor_name: str
    product_name: Optional[str] = None
    contract_end: Optional[datetime] = None
    confidence: IntelConfidence

    class Config:
        from_attributes = True
