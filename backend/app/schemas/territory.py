from datetime import datetime
from enum import Enum
from typing import Any, Optional

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


# ── Segment Label ─────────────────────────────────────────────────────

class SegmentLabelCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    short_description: Optional[str] = None


class SegmentLabelUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    short_description: Optional[str] = None


class SegmentLabelResponse(BaseModel):
    id: str
    name: str
    short_description: Optional[str] = None

    class Config:
        from_attributes = True


# ── Territory ─────────────────────────────────────────────────────────

class TerritoryChildItem(BaseModel):
    id: str
    name: str


class TerritoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    level: int = Field(..., ge=0, le=2)
    color: str = Field(..., min_length=4, max_length=9)
    region_id: str
    subregion_id: str
    gid_0: Optional[str] = None
    gid_1: Optional[str] = None
    children: list[TerritoryChildItem] = Field(default_factory=list)
    segment_label_ids: list[str] = Field(default_factory=list)


class TerritoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    level: Optional[int] = Field(None, ge=0, le=2)
    color: Optional[str] = Field(None, min_length=4, max_length=9)
    region_id: Optional[str] = None
    subregion_id: Optional[str] = None
    gid_0: Optional[str] = None
    gid_1: Optional[str] = None
    children: Optional[list[TerritoryChildItem]] = None
    segment_label_ids: Optional[list[str]] = None


class TerritoryResponse(BaseModel):
    id: str
    name: str
    level: int
    color: str
    region_id: str
    subregion_id: str
    gid_0: Optional[str] = None
    gid_1: Optional[str] = None
    children: Any = []
    segments: list[SegmentLabelResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Company ↔ Territory (many-to-many join) ───────────────────────────

class CompanyTerritoryCreate(BaseModel):
    company_id: str
    territory_id: str


class CompanyTerritoryResponse(BaseModel):
    company_id: str
    territory_id: str

    class Config:
        from_attributes = True
