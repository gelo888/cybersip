from typing import Optional

from pydantic import BaseModel, Field


class IndustryResponse(BaseModel):
    """Single row from the industries catalog."""

    id: str
    name: str
    sector: Optional[str] = None

    class Config:
        from_attributes = True


class IndustryLinkInput(BaseModel):
    """Assign an industry to a company; exactly one link per request should have is_primary."""

    industry_id: str = Field(..., min_length=1, description="UUID of an Industry row")
    is_primary: bool = False


class CompanyIndustryResponse(BaseModel):
    """Flattened industry assignment on a company (for API consumers)."""

    industry_id: str
    name: str
    sector: Optional[str] = None
    is_primary: bool
