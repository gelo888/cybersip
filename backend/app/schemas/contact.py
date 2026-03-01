from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class ContactSeniority(str, Enum):
    """Mirrors the ContactSeniority enum in the Prisma schema."""
    C_Suite = "C_Suite"
    VP = "VP"
    Director = "Director"
    Manager = "Manager"


class RoleInDeal(str, Enum):
    """Mirrors the RoleInDeal enum in the Prisma schema."""
    decision_maker = "decision_maker"
    influencer = "influencer"
    champion = "champion"
    blocker = "blocker"


class ContactCreate(BaseModel):
    """Request body for creating a new contact within a company."""
    company_id: str
    first_name: str = Field(..., min_length=1, max_length=255)
    last_name: str = Field(..., min_length=1, max_length=255)
    title: Optional[str] = None
    seniority: Optional[ContactSeniority] = None
    role_in_deal: Optional[RoleInDeal] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    is_active: bool = True


class ContactUpdate(BaseModel):
    """Request body for updating an existing contact. All fields optional."""
    first_name: Optional[str] = Field(None, min_length=1, max_length=255)
    last_name: Optional[str] = Field(None, min_length=1, max_length=255)
    title: Optional[str] = None
    seniority: Optional[ContactSeniority] = None
    role_in_deal: Optional[RoleInDeal] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None


class ContactResponse(BaseModel):
    """Response body returned when reading a contact."""
    id: str
    company_id: str
    company_name: str
    first_name: str
    last_name: str
    title: Optional[str] = None
    seniority: Optional[ContactSeniority] = None
    role_in_deal: Optional[RoleInDeal] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class ContactListResponse(BaseModel):
    items: list[ContactResponse]
    total: int
