from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class MemberRole(str, Enum):
    sales_team = "sales_team"
    leadership = "leadership"


# ── Team Member ──────────────────────────────────────────────────────

class TeamMemberCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    role: MemberRole = MemberRole.sales_team
    position: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., min_length=3, max_length=255)
    phone_number: Optional[str] = Field(None, max_length=30)


class TeamMemberUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    role: Optional[MemberRole] = None
    position: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[str] = Field(None, min_length=3, max_length=255)
    phone_number: Optional[str] = Field(None, max_length=30)


class TeamMemberResponse(BaseModel):
    id: str
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    role: MemberRole
    position: str
    email: str
    phone_number: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Territory ↔ Member (many-to-many join) ───────────────────────────

class TerritoryMemberCreate(BaseModel):
    team_member_id: str
    territory_id: str


class TerritoryMemberResponse(BaseModel):
    team_member_id: str
    territory_id: str

    class Config:
        from_attributes = True
