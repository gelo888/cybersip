from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from prisma import Json

from app.main import db
from app.schemas.territory import (
    CompanyTerritoryCreate,
    CompanyTerritoryResponse,
    RegionCreate,
    RegionResponse,
    RegionUpdate,
    SegmentLabelCreate,
    SegmentLabelResponse,
    SegmentLabelUpdate,
    TerritoryCreate,
    TerritoryResponse,
    TerritoryUpdate,
)

router = APIRouter(tags=["Territories"])


# ── Regions ───────────────────────────────────────────────────────────

@router.post("/api/regions", response_model=RegionResponse, status_code=201)
async def create_region(body: RegionCreate):
    """Create a new region (APJ, EMEA, or Americas)."""
    region = await db.region.create(
        data={"name": body.name, "code": body.code.value}
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
    """Delete a region."""
    existing = await db.region.find_unique(where={"id": region_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Region not found")
    await db.region.delete(where={"id": region_id})
    return None


# ── Segment Labels ────────────────────────────────────────────────────

@router.post(
    "/api/segment-labels",
    response_model=SegmentLabelResponse,
    status_code=201,
)
async def create_segment_label(body: SegmentLabelCreate):
    """Create a segment label."""
    label = await db.segmentlabel.create(
        data={"name": body.name, "shortDescription": body.short_description}
    )
    return _segment_to_response(label)


@router.get("/api/segment-labels", response_model=list[SegmentLabelResponse])
async def list_segment_labels():
    """List all segment labels."""
    labels = await db.segmentlabel.find_many(order={"name": "asc"})
    return [_segment_to_response(s) for s in labels]


@router.patch(
    "/api/segment-labels/{label_id}",
    response_model=SegmentLabelResponse,
)
async def update_segment_label(label_id: str, body: SegmentLabelUpdate):
    """Update a segment label."""
    existing = await db.segmentlabel.find_unique(where={"id": label_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Segment label not found")

    update_data = {}
    if body.name is not None:
        update_data["name"] = body.name
    if body.short_description is not None:
        update_data["shortDescription"] = body.short_description

    if not update_data:
        return _segment_to_response(existing)

    label = await db.segmentlabel.update(where={"id": label_id}, data=update_data)
    return _segment_to_response(label)


@router.delete("/api/segment-labels/{label_id}", status_code=204)
async def delete_segment_label(label_id: str):
    """Delete a segment label."""
    existing = await db.segmentlabel.find_unique(where={"id": label_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Segment label not found")
    await db.segmentlabel.delete(where={"id": label_id})
    return None


# ── Territories ───────────────────────────────────────────────────────

@router.post(
    "/api/territories",
    response_model=TerritoryResponse,
    status_code=201,
)
async def create_territory(body: TerritoryCreate):
    """Create a territory with optional segment label links."""
    children_json = [c.model_dump() for c in body.children]

    territory = await db.territory.create(
        data={
            "name": body.name,
            "level": body.level,
            "color": body.color,
            "regionId": body.region_id,
            "subregionId": body.subregion_id,
            "gid0": body.gid_0,
            "gid1": body.gid_1,
            "children": Json(children_json),
        }
    )

    if body.segment_label_ids:
        for sid in body.segment_label_ids:
            await db.territorysegment.create(
                data={"territoryId": territory.id, "segmentLabelId": sid}
            )

    return await _load_territory_response(territory.id)


@router.get("/api/territories", response_model=list[TerritoryResponse])
async def list_territories(
    region_id: Optional[str] = Query(None, description="Filter by region code"),
    level: Optional[int] = Query(None, ge=0, le=2, description="Filter by level"),
    skip: int = Query(0, ge=0),
    take: int = Query(50, ge=1, le=200),
):
    """List territories, optionally filtered by region or level."""
    where: dict = {}
    if region_id:
        where["regionId"] = region_id
    if level is not None:
        where["level"] = level

    territories = await db.territory.find_many(
        where=where,
        skip=skip,
        take=take,
        order={"name": "asc"},
        include={"segments": {"include": {"segmentLabel": True}}},
    )
    return [_territory_to_response(t) for t in territories]


@router.get("/api/territories/{territory_id}", response_model=TerritoryResponse)
async def get_territory(territory_id: str):
    """Get a single territory by ID."""
    return await _load_territory_response(territory_id)


@router.patch(
    "/api/territories/{territory_id}",
    response_model=TerritoryResponse,
)
async def update_territory(territory_id: str, body: TerritoryUpdate):
    """Update a territory."""
    existing = await db.territory.find_unique(where={"id": territory_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Territory not found")

    update_data: dict = {}
    if body.name is not None:
        update_data["name"] = body.name
    if body.level is not None:
        update_data["level"] = body.level
    if body.color is not None:
        update_data["color"] = body.color
    if body.region_id is not None:
        update_data["regionId"] = body.region_id
    if body.subregion_id is not None:
        update_data["subregionId"] = body.subregion_id
    if body.gid_0 is not None:
        update_data["gid0"] = body.gid_0
    if body.gid_1 is not None:
        update_data["gid1"] = body.gid_1
    if body.children is not None:
        update_data["children"] = Json([c.model_dump() for c in body.children])

    if update_data:
        await db.territory.update(where={"id": territory_id}, data=update_data)

    if body.segment_label_ids is not None:
        await db.territorysegment.delete_many(
            where={"territoryId": territory_id}
        )
        for sid in body.segment_label_ids:
            await db.territorysegment.create(
                data={"territoryId": territory_id, "segmentLabelId": sid}
            )

    return await _load_territory_response(territory_id)


@router.delete("/api/territories/{territory_id}", status_code=204)
async def delete_territory(territory_id: str):
    """Delete a territory."""
    existing = await db.territory.find_unique(where={"id": territory_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Territory not found")
    await db.territory.delete(where={"id": territory_id})
    return None


# ── Company ↔ Territory assignments ──────────────────────────────────

@router.post(
    "/api/company-territories",
    response_model=CompanyTerritoryResponse,
    status_code=201,
)
async def create_company_territory(body: CompanyTerritoryCreate):
    """Assign a company to a territory."""
    company = await db.company.find_unique(where={"id": body.company_id})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    territory = await db.territory.find_unique(where={"id": body.territory_id})
    if not territory:
        raise HTTPException(status_code=404, detail="Territory not found")

    existing = await db.companyterritory.find_unique(
        where={
            "companyId_territoryId": {
                "companyId": body.company_id,
                "territoryId": body.territory_id,
            }
        }
    )
    if existing:
        raise HTTPException(
            status_code=409, detail="Company already assigned to this territory"
        )

    record = await db.companyterritory.create(
        data={"companyId": body.company_id, "territoryId": body.territory_id}
    )
    return _company_territory_to_response(record)


@router.get(
    "/api/company-territories",
    response_model=list[CompanyTerritoryResponse],
)
async def list_company_territories(
    company_id: Optional[str] = Query(None, description="Filter by company"),
    territory_id: Optional[str] = Query(None, description="Filter by territory"),
):
    """List company-territory assignments."""
    where: dict = {}
    if company_id:
        where["companyId"] = company_id
    if territory_id:
        where["territoryId"] = territory_id

    records = await db.companyterritory.find_many(where=where)
    return [_company_territory_to_response(r) for r in records]


@router.delete(
    "/api/company-territories/{company_id}/{territory_id}",
    status_code=204,
)
async def delete_company_territory(company_id: str, territory_id: str):
    """Remove a company from a territory."""
    existing = await db.companyterritory.find_unique(
        where={
            "companyId_territoryId": {
                "companyId": company_id,
                "territoryId": territory_id,
            }
        }
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Assignment not found")

    await db.companyterritory.delete(
        where={
            "companyId_territoryId": {
                "companyId": company_id,
                "territoryId": territory_id,
            }
        }
    )
    return None


# ── Helpers ───────────────────────────────────────────────────────────

def _region_to_response(region) -> dict:
    return {"id": region.id, "name": region.name, "code": region.code}


def _segment_to_response(label) -> dict:
    return {
        "id": label.id,
        "name": label.name,
        "short_description": label.shortDescription,
    }


def _territory_to_response(territory) -> dict:
    segments = []
    if hasattr(territory, "segments") and territory.segments:
        segments = [
            _segment_to_response(ts.segmentLabel)
            for ts in territory.segments
            if ts.segmentLabel
        ]

    return {
        "id": territory.id,
        "name": territory.name,
        "level": territory.level,
        "color": territory.color,
        "region_id": territory.regionId,
        "subregion_id": territory.subregionId,
        "gid_0": territory.gid0,
        "gid_1": territory.gid1,
        "children": territory.children,
        "segments": segments,
        "created_at": territory.createdAt,
        "updated_at": territory.updatedAt,
    }


async def _load_territory_response(territory_id: str) -> dict:
    territory = await db.territory.find_unique(
        where={"id": territory_id},
        include={"segments": {"include": {"segmentLabel": True}}},
    )
    if not territory:
        raise HTTPException(status_code=404, detail="Territory not found")
    return _territory_to_response(territory)


def _company_territory_to_response(record) -> dict:
    return {
        "company_id": record.companyId,
        "territory_id": record.territoryId,
    }
