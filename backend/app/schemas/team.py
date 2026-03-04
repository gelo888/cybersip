from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class TeamRole(str, Enum):
    lead = "lead"
    member = "member"


# ── Team ──────────────────────────────────────────────────────────────

class TeamCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)


class TeamUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)


class TeamResponse(BaseModel):
    id: str
    name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Team Member ───────────────────────────────────────────────────────

class TeamMemberCreate(BaseModel):
    team_id: str
    user_id: str
    role: TeamRole = TeamRole.member


class TeamMemberUpdate(BaseModel):
    role: TeamRole


class TeamMemberResponse(BaseModel):
    team_id: str
    user_id: str
    role: TeamRole

    class Config:
        from_attributes = True


# ── Team ↔ Territory (many-to-many join) ──────────────────────────────

class TeamTerritoryCreate(BaseModel):
    team_id: str
    territory_id: str


class TeamTerritoryResponse(BaseModel):
    team_id: str
    territory_id: str

    class Config:
        from_attributes = True
