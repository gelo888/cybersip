from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.main import db
from app.schemas.competitor import (
    CompetitorCreate,
    CompetitorResponse,
    CompetitorUpdate,
    IntelConfidence,
    IntelCreate,
    IntelResponse,
    IntelUpdate,
)

router = APIRouter(tags=["Competitive Intelligence"])


# ── Competitors ─────────────────────────────────────────────────────

@router.post("/api/competitors", response_model=CompetitorResponse, status_code=201)
async def create_competitor(body: CompetitorCreate):
    """Register a competitor (e.g. 'CrowdStrike', 'Palo Alto')."""
    competitor = await db.competitor.create(
        data={
            "name": body.name,
            "website": body.website,
            "strengths": body.strengths,
            "weaknesses": body.weaknesses,
        }
    )
    return _competitor_to_response(competitor)


@router.get("/api/competitors", response_model=list[CompetitorResponse])
async def list_competitors(
    skip: int = Query(0, ge=0),
    take: int = Query(20, ge=1, le=500),
):
    """List all known competitors."""
    competitors = await db.competitor.find_many(
        skip=skip,
        take=take,
        order={"name": "asc"},
    )
    return [_competitor_to_response(c) for c in competitors]


@router.get("/api/competitors/{competitor_id}", response_model=CompetitorResponse)
async def get_competitor(competitor_id: str):
    """Get a single competitor by ID."""
    competitor = await db.competitor.find_unique(where={"id": competitor_id})
    if not competitor:
        raise HTTPException(status_code=404, detail="Competitor not found")
    return _competitor_to_response(competitor)


@router.patch("/api/competitors/{competitor_id}", response_model=CompetitorResponse)
async def update_competitor(competitor_id: str, body: CompetitorUpdate):
    """Update a competitor's details."""
    existing = await db.competitor.find_unique(where={"id": competitor_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Competitor not found")

    update_data = {}
    if body.name is not None:
        update_data["name"] = body.name
    if body.website is not None:
        update_data["website"] = body.website
    if body.strengths is not None:
        update_data["strengths"] = body.strengths
    if body.weaknesses is not None:
        update_data["weaknesses"] = body.weaknesses

    if not update_data:
        return _competitor_to_response(existing)

    competitor = await db.competitor.update(
        where={"id": competitor_id},
        data=update_data,
    )
    return _competitor_to_response(competitor)


@router.delete("/api/competitors/{competitor_id}", status_code=204)
async def delete_competitor(competitor_id: str):
    """Delete a competitor."""
    existing = await db.competitor.find_unique(where={"id": competitor_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Competitor not found")
    await db.competitor.delete(where={"id": competitor_id})
    return None


# ── Competitor Intel ────────────────────────────────────────────────

@router.post("/api/intel", response_model=IntelResponse, status_code=201)
async def create_intel(body: IntelCreate):
    """Log competitive intelligence about a competitor's presence at a company."""
    company = await db.company.find_unique(where={"id": body.company_id})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    competitor = await db.competitor.find_unique(where={"id": body.competitor_id})
    if not competitor:
        raise HTTPException(status_code=404, detail="Competitor not found")

    intel = await db.competitorintel.create(
        data={
            "companyId": body.company_id,
            "competitorId": body.competitor_id,
            "productName": body.product_name,
            "contractEnd": body.contract_end,
            "confidence": body.confidence.value,
        },
        include={"company": True, "competitor": True},
    )
    return _intel_to_response(intel)


@router.get("/api/intel", response_model=list[IntelResponse])
async def list_intel(
    company_id: Optional[str] = Query(None, description="Filter by company"),
    competitor_id: Optional[str] = Query(None, description="Filter by competitor"),
    confidence: Optional[IntelConfidence] = Query(None, description="Filter by confidence level"),
    skip: int = Query(0, ge=0),
    take: int = Query(20, ge=1, le=500),
):
    """List competitor intelligence records with optional filters."""
    where = {}
    if company_id:
        where["companyId"] = company_id
    if competitor_id:
        where["competitorId"] = competitor_id
    if confidence:
        where["confidence"] = confidence.value

    records = await db.competitorintel.find_many(
        where=where,
        include={"company": True, "competitor": True},
        skip=skip,
        take=take,
    )
    return [_intel_to_response(r) for r in records]


@router.get("/api/intel/{intel_id}", response_model=IntelResponse)
async def get_intel(intel_id: str):
    """Get a single intel record by ID."""
    intel = await db.competitorintel.find_unique(
        where={"id": intel_id},
        include={"company": True, "competitor": True},
    )
    if not intel:
        raise HTTPException(status_code=404, detail="Intel record not found")
    return _intel_to_response(intel)


@router.patch("/api/intel/{intel_id}", response_model=IntelResponse)
async def update_intel(intel_id: str, body: IntelUpdate):
    """Update a competitor intel record."""
    existing = await db.competitorintel.find_unique(where={"id": intel_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Intel record not found")

    update_data = {}
    if body.product_name is not None:
        update_data["productName"] = body.product_name
    if body.contract_end is not None:
        update_data["contractEnd"] = body.contract_end
    if body.confidence is not None:
        update_data["confidence"] = body.confidence.value

    if not update_data:
        existing = await db.competitorintel.find_unique(
            where={"id": intel_id},
            include={"company": True, "competitor": True},
        )
        return _intel_to_response(existing)

    intel = await db.competitorintel.update(
        where={"id": intel_id},
        data=update_data,
        include={"company": True, "competitor": True},
    )
    return _intel_to_response(intel)


@router.delete("/api/intel/{intel_id}", status_code=204)
async def delete_intel(intel_id: str):
    """Delete a competitor intel record."""
    existing = await db.competitorintel.find_unique(where={"id": intel_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Intel record not found")
    await db.competitorintel.delete(where={"id": intel_id})
    return None


# ── Response mappers ────────────────────────────────────────────────

def _competitor_to_response(competitor) -> dict:
    return {
        "id": competitor.id,
        "name": competitor.name,
        "website": competitor.website,
        "strengths": competitor.strengths,
        "weaknesses": competitor.weaknesses,
    }


def _intel_to_response(intel) -> dict:
    return {
        "id": intel.id,
        "company_id": intel.companyId,
        "company_name": intel.company.currentName if intel.company else "Unknown",
        "competitor_id": intel.competitorId,
        "competitor_name": intel.competitor.name if intel.competitor else "Unknown",
        "product_name": intel.productName,
        "contract_end": intel.contractEnd,
        "confidence": intel.confidence,
    }
