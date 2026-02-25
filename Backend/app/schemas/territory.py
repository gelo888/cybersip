from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class RegionCode(str, Enum):
    APJ = "APJ"
    EMEA = "EMEA"
    Americas = "Americas"


# ── Region ────────────────────────────────────────────────────────────

class RegionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    code: RegionCode


class RegionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)


class RegionResponse(BaseModel):
    id: str
    name: str
    code: RegionCode

    class Config:
        from_attributes = True


# ── Territory Group ───────────────────────────────────────────────────

class TerritoryGroupCreate(BaseModel):
    region_id: str
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class TerritoryGroupUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


class TerritoryGroupResponse(BaseModel):
    id: str
    region_id: str
    name: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Company ↔ Territory Group (many-to-many join) ─────────────────────

class CompanyTerritoryCreate(BaseModel):
    company_id: str
    territory_group_id: str


class CompanyTerritoryResponse(BaseModel):
    company_id: str
    territory_group_id: str

    class Config:
        from_attributes = True
