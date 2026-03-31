from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class ContractType(str, Enum):
    """Mirrors the ContractType enum in the Prisma schema."""
    our_contract = "our_contract"
    competitor_contract = "competitor_contract"


class ContractStatus(str, Enum):
    """Mirrors the ContractStatus enum in the Prisma schema."""
    active = "active"
    expired = "expired"
    renewed = "renewed"
    pending = "pending"


# ── Contract schemas ───────────────────────────────────────────────

class ContractCreate(BaseModel):
    """Request body for creating a contract."""
    company_id: str
    type: ContractType
    status: ContractStatus = ContractStatus.pending
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    total_value: Optional[Decimal] = None
    renewal_notice_days: Optional[int] = Field(None, ge=0)
    engagement_id: Optional[str] = None


class ContractUpdate(BaseModel):
    """Request body for updating a contract."""
    type: Optional[ContractType] = None
    status: Optional[ContractStatus] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    total_value: Optional[Decimal] = None
    renewal_notice_days: Optional[int] = Field(None, ge=0)
    engagement_id: Optional[str] = None


class ContractResponse(BaseModel):
    """Response body for a contract."""
    id: str
    company_id: str
    company_name: str
    type: ContractType
    status: ContractStatus
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    total_value: Optional[Decimal] = None
    renewal_notice_days: Optional[int] = None
    engagement_id: Optional[str] = None

    class Config:
        from_attributes = True


# ── Contract Line Item schemas ─────────────────────────────────────

class LineItemCreate(BaseModel):
    """Request body for adding a line item to a contract."""
    contract_id: str
    product_service_id: str
    quantity: int = Field(1, ge=1)
    unit_price: Decimal


class LineItemUpdate(BaseModel):
    """Request body for updating a contract line item."""
    quantity: Optional[int] = Field(None, ge=1)
    unit_price: Optional[Decimal] = None


class LineItemResponse(BaseModel):
    """Response body for a contract line item."""
    id: str
    contract_id: str
    product_service_id: str
    quantity: int
    unit_price: Decimal

    class Config:
        from_attributes = True
