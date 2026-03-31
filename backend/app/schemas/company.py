from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.industry import CompanyIndustryResponse, IndustryLinkInput


class CompanyStatus(str, Enum):
    """Mirrors the CompanyStatus enum in the Prisma schema."""
    prospect = "prospect"
    active_client = "active_client"
    previous_client = "previous_client"
    lost = "lost"
    disqualified = "disqualified"


class CompanySize(str, Enum):
    """Mirrors the CompanySize enum in the Prisma schema."""
    SMB = "SMB"
    Mid_Market = "Mid_Market"
    Enterprise = "Enterprise"
    Government = "Government"


class CompanyCreate(BaseModel):
    """Request body for creating a new company. Only current_name is required;
    all other fields are optional and will use defaults from the Prisma schema."""
    current_name: str = Field(..., min_length=1, max_length=255)
    status: CompanyStatus = CompanyStatus.prospect
    company_size: Optional[CompanySize] = None
    employee_count: Optional[int] = Field(None, ge=0)
    revenue_range: Optional[str] = None
    website: Optional[str] = None
    stock_ticker: Optional[str] = None
    country: Optional[str] = None
    industry_links: Optional[list[IndustryLinkInput]] = Field(
        None,
        description="If set (including []), replaces all company–industry links after create.",
    )


class CompanyUpdate(BaseModel):
    """Request body for updating an existing company. All fields are optional;
    only the provided fields will be updated."""
    current_name: Optional[str] = Field(None, min_length=1, max_length=255)
    status: Optional[CompanyStatus] = None
    company_size: Optional[CompanySize] = None
    employee_count: Optional[int] = Field(None, ge=0)
    revenue_range: Optional[str] = None
    website: Optional[str] = None
    stock_ticker: Optional[str] = None
    country: Optional[str] = None
    industry_links: Optional[list[IndustryLinkInput]] = Field(
        None,
        description="If not None (including []), replaces all company–industry links.",
    )


class CompanyResponse(BaseModel):
    """Response body returned when reading a company. Maps directly to the
    companies table columns."""
    id: str
    current_name: str
    status: CompanyStatus
    company_size: Optional[CompanySize] = None
    employee_count: Optional[int] = None
    revenue_range: Optional[str] = None
    website: Optional[str] = None
    stock_ticker: Optional[str] = None
    country: Optional[str] = None
    industries: list[CompanyIndustryResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CompanyListResponse(BaseModel):
    items: list[CompanyResponse]
    total: int
