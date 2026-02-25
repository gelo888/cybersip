from decimal import Decimal
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class PricingModel(str, Enum):
    """Mirrors the PricingModel enum in the Prisma schema."""
    per_seat = "per_seat"
    per_site = "per_site"
    flat = "flat"
    custom = "custom"


# ── Product Category schemas ───────────────────────────────────────

class CategoryCreate(BaseModel):
    """Request body for creating a product category."""
    name: str = Field(..., min_length=1, max_length=255)


class CategoryUpdate(BaseModel):
    """Request body for updating a product category."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)


class CategoryResponse(BaseModel):
    """Response body for a product category."""
    id: str
    name: str

    class Config:
        from_attributes = True


# ── Product / Service schemas ──────────────────────────────────────

class ProductCreate(BaseModel):
    """Request body for creating a product or service."""
    category_id: str
    name: str = Field(..., min_length=1, max_length=255)
    base_price: Optional[Decimal] = None
    pricing_model: Optional[PricingModel] = None


class ProductUpdate(BaseModel):
    """Request body for updating a product or service."""
    category_id: Optional[str] = None
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    base_price: Optional[Decimal] = None
    pricing_model: Optional[PricingModel] = None


class ProductResponse(BaseModel):
    """Response body for a product or service."""
    id: str
    category_id: str
    name: str
    base_price: Optional[Decimal] = None
    pricing_model: Optional[PricingModel] = None

    class Config:
        from_attributes = True
