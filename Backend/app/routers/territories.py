from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.main import db
from app.schemas.territory import (
    CompanyTerritoryCreate,
    CompanyTerritoryResponse,
    RegionCreate,
    RegionResponse,
    RegionUpdate,
    TerritoryGroupCreate,
    TerritoryGroupResponse,
    TerritoryGroupUpdate,
)

router = APIRouter(tags=["Territories"])


# ── Regions ───────────────────────────────────────────────────────────

@router.post("/api/regions", response_model=RegionResponse, status_code=201)
async def create_region(body: RegionCreate):
    """Create a new region (APJ, EMEA, or Americas)."""
    region = await db.region.create(
        data={
            "name": body.name,
            "code": body.code.value,
        }
    )
    return _region_to_response(region)


@router.get("/api/regions", response_model=list[RegionResponse])
async def list_regions():
    """List all regions."""
    regions = await db.region.find_many(order={"name": "asc"})
    return [_region_to_response(r) for r in regions]


@router.patch("/api/regions/{region_id}", response_model=RegionResponse)
async def update_region(region_id: str, body: RegionUpdate):
    """Update a region's display name."""
    existing = await db.region.find_unique(where={"id": region_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Region not found")

    update_data = {}
    if body.name is not None:
        update_data["name"] = body.name

    if not update_data:
        return _region_to_response(existing)

    region = await db.region.update(where={"id": region_id}, data=update_data)
    return _region_to_response(region)


@router.delete("/api/regions/{region_id}", status_code=204)
async def delete_region(region_id: str):
    """Delete a region and all its territory groups (cascade)."""
    existing = await db.region.find_unique(where={"id": region_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Region not found")
    await db.region.delete(where={"id": region_id})
    return None


# ── Territory Groups ──────────────────────────────────────────────────

@router.post(
    "/api/territory-groups",
    response_model=TerritoryGroupResponse,
    status_code=201,
)
async def create_territory_group(body: TerritoryGroupCreate):
    """Create a territory group under a region."""
    region = await db.region.find_unique(where={"id": body.region_id})
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")

    group = await db.territorygroup.create(
        data={
            "regionId": body.region_id,
            "name": body.name,
            "description": body.description,
        }
    )
    return _group_to_response(group)


@router.get(
    "/api/territory-groups",
    response_model=list[TerritoryGroupResponse],
)
async def list_territory_groups(
    region_id: Optional[str] = Query(None, description="Filter by region"),
    skip: int = Query(0, ge=0),
    take: int = Query(20, ge=1, le=100),
):
    """List territory groups, optionally filtered by region."""
    where = {}
    if region_id:
        where["regionId"] = region_id

    groups = await db.territorygroup.find_many(
        where=where,
        skip=skip,
        take=take,
        order={"name": "asc"},
    )
    return [_group_to_response(g) for g in groups]


@router.get(
    "/api/territory-groups/{group_id}",
    response_model=TerritoryGroupResponse,
)
async def get_territory_group(group_id: str):
    """Get a single territory group by ID."""
    group = await db.territorygroup.find_unique(where={"id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Territory group not found")
    return _group_to_response(group)


@router.patch(
    "/api/territory-groups/{group_id}",
    response_model=TerritoryGroupResponse,
)
async def update_territory_group(group_id: str, body: TerritoryGroupUpdate):
    """Update a territory group's name or description."""
    existing = await db.territorygroup.find_unique(where={"id": group_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Territory group not found")

    update_data = {}
    if body.name is not None:
        update_data["name"] = body.name
    if body.description is not None:
        update_data["description"] = body.description

    if not update_data:
        return _group_to_response(existing)

    group = await db.territorygroup.update(
        where={"id": group_id}, data=update_data
    )
    return _group_to_response(group)


@router.delete("/api/territory-groups/{group_id}", status_code=204)
async def delete_territory_group(group_id: str):
    """Delete a territory group."""
    existing = await db.territorygroup.find_unique(where={"id": group_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Territory group not found")
    await db.territorygroup.delete(where={"id": group_id})
    return None


# ── Company ↔ Territory Group assignments ─────────────────────────────

@router.post(
    "/api/company-territories",
    response_model=CompanyTerritoryResponse,
    status_code=201,
)
async def create_company_territory(body: CompanyTerritoryCreate):
    """Assign a company to a territory group."""
    company = await db.company.find_unique(where={"id": body.company_id})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    group = await db.territorygroup.find_unique(
        where={"id": body.territory_group_id}
    )
    if not group:
        raise HTTPException(status_code=404, detail="Territory group not found")

    existing = await db.companyterritorygroup.find_unique(
        where={
            "companyId_territoryGroupId": {
                "companyId": body.company_id,
                "territoryGroupId": body.territory_group_id,
            }
        }
    )
    if existing:
        raise HTTPException(
            status_code=409, detail="Company already assigned to this territory group"
        )

    record = await db.companyterritorygroup.create(
        data={
            "companyId": body.company_id,
            "territoryGroupId": body.territory_group_id,
        }
    )
    return _company_territory_to_response(record)


@router.get(
    "/api/company-territories",
    response_model=list[CompanyTerritoryResponse],
)
async def list_company_territories(
    company_id: Optional[str] = Query(None, description="Filter by company"),
    territory_group_id: Optional[str] = Query(
        None, description="Filter by territory group"
    ),
):
    """List company-territory assignments."""
    where = {}
    if company_id:
        where["companyId"] = company_id
    if territory_group_id:
        where["territoryGroupId"] = territory_group_id

    records = await db.companyterritorygroup.find_many(where=where)
    return [_company_territory_to_response(r) for r in records]


@router.delete(
    "/api/company-territories/{company_id}/{territory_group_id}",
    status_code=204,
)
async def delete_company_territory(company_id: str, territory_group_id: str):
    """Remove a company from a territory group."""
    existing = await db.companyterritorygroup.find_unique(
        where={
            "companyId_territoryGroupId": {
                "companyId": company_id,
                "territoryGroupId": territory_group_id,
            }
        }
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Assignment not found")

    await db.companyterritorygroup.delete(
        where={
            "companyId_territoryGroupId": {
                "companyId": company_id,
                "territoryGroupId": territory_group_id,
            }
        }
    )
    return None


# ── Helpers ───────────────────────────────────────────────────────────

def _region_to_response(region) -> dict:
    return {
        "id": region.id,
        "name": region.name,
        "code": region.code,
    }


def _group_to_response(group) -> dict:
    return {
        "id": group.id,
        "region_id": group.regionId,
        "name": group.name,
        "description": group.description,
        "created_at": group.createdAt,
        "updated_at": group.updatedAt,
    }


def _company_territory_to_response(record) -> dict:
    return {
        "company_id": record.companyId,
        "territory_group_id": record.territoryGroupId,
    }
