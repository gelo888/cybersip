import asyncio
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.main import db
from app.schemas.contact import (
    ContactCreate,
    ContactListResponse,
    ContactResponse,
    ContactUpdate,
)

router = APIRouter(prefix="/api/contacts", tags=["Contacts"])


@router.post("/", response_model=ContactResponse, status_code=201)
async def create_contact(body: ContactCreate):
    """Create a new contact linked to a company."""
    company = await db.company.find_unique(where={"id": body.company_id})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    contact = await db.contact.create(
        data={
            "companyId": body.company_id,
            "firstName": body.first_name,
            "lastName": body.last_name,
            "title": body.title,
            "seniority": body.seniority.value if body.seniority else None,
            "roleInDeal": body.role_in_deal.value if body.role_in_deal else None,
            "email": body.email,
            "phone": body.phone,
            "isActive": body.is_active,
        },
        include={"company": True},
    )
    return _to_response(contact)


@router.get("/", response_model=ContactListResponse)
async def list_contacts(
    company_id: Optional[str] = Query(None, description="Filter by company"),
    skip: int = Query(0, ge=0),
    take: int = Query(20, ge=1, le=100),
):
    """List contacts, optionally filtered by company."""
    where = {}
    if company_id:
        where["companyId"] = company_id

    contacts, total = await asyncio.gather(
        db.contact.find_many(where=where, skip=skip, take=take, order={"firstName": "asc"}, include={"company": True}),
        db.contact.count(where=where),
    )
    return {"items": [_to_response(c) for c in contacts], "total": total}


@router.get("/{contact_id}", response_model=ContactResponse)
async def get_contact(contact_id: str):
    """Get a single contact by ID."""
    contact = await db.contact.find_unique(where={"id": contact_id}, include={"company": True})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return _to_response(contact)


@router.patch("/{contact_id}", response_model=ContactResponse)
async def update_contact(contact_id: str, body: ContactUpdate):
    """Update an existing contact. Only provided fields are changed."""
    existing = await db.contact.find_unique(where={"id": contact_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Contact not found")

    update_data = {}
    if body.first_name is not None:
        update_data["firstName"] = body.first_name
    if body.last_name is not None:
        update_data["lastName"] = body.last_name
    if body.title is not None:
        update_data["title"] = body.title
    if body.seniority is not None:
        update_data["seniority"] = body.seniority.value
    if body.role_in_deal is not None:
        update_data["roleInDeal"] = body.role_in_deal.value
    if body.email is not None:
        update_data["email"] = body.email
    if body.phone is not None:
        update_data["phone"] = body.phone
    if body.is_active is not None:
        update_data["isActive"] = body.is_active

    if not update_data:
        return _to_response(existing)

    contact = await db.contact.update(
        where={"id": contact_id},
        data=update_data,
        include={"company": True},
    )
    return _to_response(contact)


@router.delete("/{contact_id}", status_code=204)
async def delete_contact(contact_id: str):
    """Delete a contact by ID."""
    existing = await db.contact.find_unique(where={"id": contact_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Contact not found")
    await db.contact.delete(where={"id": contact_id})
    return None


def _to_response(contact) -> dict:
    """Maps Prisma Contact (with included company) to the ContactResponse shape."""
    return {
        "id": contact.id,
        "company_id": contact.companyId,
        "company_name": contact.company.currentName if contact.company else "",
        "first_name": contact.firstName,
        "last_name": contact.lastName,
        "title": contact.title,
        "seniority": contact.seniority,
        "role_in_deal": contact.roleInDeal,
        "email": contact.email,
        "phone": contact.phone,
        "is_active": contact.isActive,
    }
