import asyncio
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.main import db
from app.schemas.company import (
    CompanyCreate,
    CompanyListResponse,
    CompanyResponse,
    CompanyStatus,
    CompanyUpdate,
)

router = APIRouter(prefix="/api/companies", tags=["Companies"])


@router.post("/", response_model=CompanyResponse, status_code=201)
async def create_company(body: CompanyCreate):
    """Create a new company record."""
    company = await db.company.create(
        data={
            "currentName": body.current_name,
            "status": body.status.value,
            "companySize": body.company_size.value if body.company_size else None,
            "employeeCount": body.employee_count,
            "revenueRange": body.revenue_range,
            "website": body.website,
            "stockTicker": body.stock_ticker,
            "country": body.country,
        }
    )
    return _to_response(company)


@router.get("/", response_model=CompanyListResponse)
async def list_companies(
    status: Optional[CompanyStatus] = Query(None, description="Filter by company status"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    take: int = Query(20, ge=1, le=500, description="Number of records to return"),
):
    """List companies with optional status filter and pagination."""
    where = {}
    if status:
        where["status"] = status.value

    companies, total = await asyncio.gather(
        db.company.find_many(where=where, skip=skip, take=take, order={"createdAt": "desc"}),
        db.company.count(where=where),
    )
    return {"items": [_to_response(c) for c in companies], "total": total}


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(company_id: str):
    """Get a single company by ID."""
    company = await db.company.find_unique(where={"id": company_id})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return _to_response(company)


@router.patch("/{company_id}", response_model=CompanyResponse)
async def update_company(company_id: str, body: CompanyUpdate):
    """Update an existing company. Only the provided fields will be changed."""
    existing = await db.company.find_unique(where={"id": company_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Company not found")

    update_data = {}
    if body.current_name is not None:
        update_data["currentName"] = body.current_name
    if body.status is not None:
        update_data["status"] = body.status.value
    if body.company_size is not None:
        update_data["companySize"] = body.company_size.value
    if body.employee_count is not None:
        update_data["employeeCount"] = body.employee_count
    if body.revenue_range is not None:
        update_data["revenueRange"] = body.revenue_range
    if body.website is not None:
        update_data["website"] = body.website
    if body.stock_ticker is not None:
        update_data["stockTicker"] = body.stock_ticker
    if body.country is not None:
        update_data["country"] = body.country

    if not update_data:
        return _to_response(existing)

    company = await db.company.update(
        where={"id": company_id},
        data=update_data,
    )
    return _to_response(company)


@router.delete("/{company_id}", status_code=204)
async def delete_company(company_id: str):
    """Delete a company by ID. Returns 204 on success."""
    existing = await db.company.find_unique(where={"id": company_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Company not found")
    await db.company.delete(where={"id": company_id})
    return None


def _to_response(company) -> dict:
    """Maps a Prisma Company record to the CompanyResponse shape.
    Prisma uses camelCase field names; the API returns snake_case."""
    return {
        "id": company.id,
        "current_name": company.currentName,
        "status": company.status,
        "company_size": company.companySize,
        "employee_count": company.employeeCount,
        "revenue_range": company.revenueRange,
        "website": company.website,
        "stock_ticker": company.stockTicker,
        "country": company.country,
        "created_at": company.createdAt,
        "updated_at": company.updatedAt,
    }
