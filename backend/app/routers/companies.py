import asyncio
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.main import db
from app.schemas.company import (
    CompanyCreate,
    CompanyListResponse,
    CompanyResponse,
    CompanySize,
    CompanyStatus,
    CompanyUpdate,
)
from app.schemas.industry import IndustryLinkInput

router = APIRouter(prefix="/api/companies", tags=["Companies"])

_COMPANY_INCLUDE_INDUSTRIES = {"industries": {"include": {"industry": True}}}


def _normalize_industry_links(links: list[IndustryLinkInput]) -> list[tuple[str, bool]]:
    """Validate structure; if non-empty and no primary marked, treat first as primary."""
    ids = [l.industry_id for l in links]
    if len(ids) != len(set(ids)):
        raise HTTPException(
            status_code=400,
            detail="Duplicate industry_id in industry_links",
        )
    primaries = sum(1 for l in links if l.is_primary)
    if primaries > 1:
        raise HTTPException(
            status_code=400,
            detail="At most one industry may have is_primary true",
        )
    out: list[tuple[str, bool]] = []
    if links and primaries == 0:
        for i, l in enumerate(links):
            out.append((l.industry_id, i == 0))
    else:
        for l in links:
            out.append((l.industry_id, l.is_primary))
    return out


async def _set_company_industries(company_id: str, links: list[IndustryLinkInput]) -> None:
    pairs = _normalize_industry_links(links)
    if not pairs:
        await db.companyindustry.delete_many(where={"companyId": company_id})
        return
    industry_ids = [p[0] for p in pairs]
    found = await db.industry.find_many(where={"id": {"in": industry_ids}})
    if len(found) != len(set(industry_ids)):
        raise HTTPException(
            status_code=400,
            detail="One or more industry_id values are invalid",
        )
    await db.companyindustry.delete_many(where={"companyId": company_id})
    for industry_id, is_primary in pairs:
        await db.companyindustry.create(
            data={
                "companyId": company_id,
                "industryId": industry_id,
                "isPrimary": is_primary,
            }
        )


def _industries_payload(company) -> list[dict]:
    if not getattr(company, "industries", None):
        return []
    out: list[dict] = []
    for ci in company.industries:
        ind = ci.industry
        out.append(
            {
                "industry_id": ci.industryId,
                "name": ind.name,
                "sector": ind.sector,
                "is_primary": ci.isPrimary,
            }
        )
    return out


def _to_response(company) -> dict:
    """Maps a Prisma Company record to the CompanyResponse shape."""
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
        "industries": _industries_payload(company),
        "created_at": company.createdAt,
        "updated_at": company.updatedAt,
    }


async def _load_company(company_id: str):
    return await db.company.find_unique(
        where={"id": company_id},
        include=_COMPANY_INCLUDE_INDUSTRIES,
    )


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
    if body.industry_links is not None:
        await _set_company_industries(company.id, body.industry_links)
    full = await _load_company(company.id)
    return _to_response(full)


@router.get("/", response_model=CompanyListResponse)
async def list_companies(
    status: Optional[CompanyStatus] = Query(None, description="Filter by company status"),
    company_size: Optional[CompanySize] = Query(
        None, description="Filter by company size segment"
    ),
    industry_id: Optional[str] = Query(
        None,
        description="Filter companies linked to this industry (any primary or secondary)",
    ),
    q: Optional[str] = Query(
        None,
        max_length=255,
        description="Search company name (case-insensitive contains)",
    ),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    take: int = Query(20, ge=1, le=500, description="Number of records to return"),
):
    """List companies with optional filters and pagination."""
    where = {}
    if status:
        where["status"] = status.value
    if company_size:
        where["companySize"] = company_size.value
    if industry_id:
        where["industries"] = {"some": {"industryId": industry_id}}
    if q and q.strip():
        where["currentName"] = {"contains": q.strip(), "mode": "insensitive"}

    companies, total = await asyncio.gather(
        db.company.find_many(
            where=where,
            skip=skip,
            take=take,
            order={"createdAt": "desc"},
            include=_COMPANY_INCLUDE_INDUSTRIES,
        ),
        db.company.count(where=where),
    )
    return {"items": [_to_response(c) for c in companies], "total": total}


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(company_id: str):
    """Get a single company by ID."""
    company = await _load_company(company_id)
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

    if update_data:
        await db.company.update(
            where={"id": company_id},
            data=update_data,
        )

    if body.industry_links is not None:
        await _set_company_industries(company_id, body.industry_links)

    full = await _load_company(company_id)
    return _to_response(full)


@router.delete("/{company_id}", status_code=204)
async def delete_company(company_id: str):
    """Delete a company by ID. Returns 204 on success."""
    existing = await db.company.find_unique(where={"id": company_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Company not found")
    await db.company.delete(where={"id": company_id})
    return None
