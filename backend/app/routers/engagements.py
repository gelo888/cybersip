from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.main import db
from app.schemas.engagement import (
    EngagementCreate,
    EngagementResponse,
    EngagementType,
    EngagementUpdate,
    StageCreate,
    StageResponse,
    StageUpdate,
)

router = APIRouter(tags=["Engagements"])


# ── Engagement Stages ───────────────────────────────────────────────
# Stages must exist before engagements can reference them (e.g.
# "Prospecting", "Pitched", "Proposal Sent", "Closed Won").

@router.post("/api/stages", response_model=StageResponse, status_code=201)
async def create_stage(body: StageCreate):
    """Create a new pipeline stage."""
    stage = await db.engagementstage.create(
        data={
            "name": body.name,
            "probability": body.probability,
        }
    )
    return _stage_to_response(stage)


@router.get("/api/stages", response_model=list[StageResponse])
async def list_stages():
    """List all pipeline stages ordered by probability."""
    stages = await db.engagementstage.find_many(
        order={"probability": "asc"},
    )
    return [_stage_to_response(s) for s in stages]


@router.patch("/api/stages/{stage_id}", response_model=StageResponse)
async def update_stage(stage_id: str, body: StageUpdate):
    """Update a pipeline stage."""
    existing = await db.engagementstage.find_unique(where={"id": stage_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Stage not found")

    update_data = {}
    if body.name is not None:
        update_data["name"] = body.name
    if body.probability is not None:
        update_data["probability"] = body.probability

    if not update_data:
        return _stage_to_response(existing)

    stage = await db.engagementstage.update(
        where={"id": stage_id},
        data=update_data,
    )
    return _stage_to_response(stage)


@router.delete("/api/stages/{stage_id}", status_code=204)
async def delete_stage(stage_id: str):
    """Delete a pipeline stage."""
    existing = await db.engagementstage.find_unique(where={"id": stage_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Stage not found")
    await db.engagementstage.delete(where={"id": stage_id})
    return None


# ── Engagements ─────────────────────────────────────────────────────

@router.post("/api/engagements", response_model=EngagementResponse, status_code=201)
async def create_engagement(body: EngagementCreate):
    """Log a new engagement (call, email, meeting, demo) for a company."""
    company = await db.company.find_unique(where={"id": body.company_id})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    stage = await db.engagementstage.find_unique(where={"id": body.stage_id})
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")

    engagement = await db.engagement.create(
        data={
            "companyId": body.company_id,
            "stageId": body.stage_id,
            "type": body.type.value,
            "outcome": body.outcome,
            "nextActionDate": body.next_action_date,
        }
    )
    return _engagement_to_response(engagement)


@router.get("/api/engagements", response_model=list[EngagementResponse])
async def list_engagements(
    company_id: Optional[str] = Query(None, description="Filter by company"),
    type: Optional[EngagementType] = Query(None, description="Filter by type"),
    skip: int = Query(0, ge=0),
    take: int = Query(20, ge=1, le=100),
):
    """List engagements, optionally filtered by company and/or type."""
    where = {}
    if company_id:
        where["companyId"] = company_id
    if type:
        where["type"] = type.value

    engagements = await db.engagement.find_many(
        where=where,
        skip=skip,
        take=take,
        order={"createdAt": "desc"},
    )
    return [_engagement_to_response(e) for e in engagements]


@router.get("/api/engagements/{engagement_id}", response_model=EngagementResponse)
async def get_engagement(engagement_id: str):
    """Get a single engagement by ID."""
    engagement = await db.engagement.find_unique(where={"id": engagement_id})
    if not engagement:
        raise HTTPException(status_code=404, detail="Engagement not found")
    return _engagement_to_response(engagement)


@router.patch("/api/engagements/{engagement_id}", response_model=EngagementResponse)
async def update_engagement(engagement_id: str, body: EngagementUpdate):
    """Update an existing engagement."""
    existing = await db.engagement.find_unique(where={"id": engagement_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Engagement not found")

    update_data = {}
    if body.stage_id is not None:
        stage = await db.engagementstage.find_unique(where={"id": body.stage_id})
        if not stage:
            raise HTTPException(status_code=404, detail="Stage not found")
        update_data["stageId"] = body.stage_id
    if body.type is not None:
        update_data["type"] = body.type.value
    if body.outcome is not None:
        update_data["outcome"] = body.outcome
    if body.next_action_date is not None:
        update_data["nextActionDate"] = body.next_action_date

    if not update_data:
        return _engagement_to_response(existing)

    engagement = await db.engagement.update(
        where={"id": engagement_id},
        data=update_data,
    )
    return _engagement_to_response(engagement)


@router.delete("/api/engagements/{engagement_id}", status_code=204)
async def delete_engagement(engagement_id: str):
    """Delete an engagement by ID."""
    existing = await db.engagement.find_unique(where={"id": engagement_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Engagement not found")
    await db.engagement.delete(where={"id": engagement_id})
    return None


# ── Response mappers ────────────────────────────────────────────────

def _stage_to_response(stage) -> dict:
    return {
        "id": stage.id,
        "name": stage.name,
        "probability": stage.probability,
    }


def _engagement_to_response(engagement) -> dict:
    return {
        "id": engagement.id,
        "company_id": engagement.companyId,
        "stage_id": engagement.stageId,
        "type": engagement.type,
        "outcome": engagement.outcome,
        "next_action_date": engagement.nextActionDate,
        "created_at": engagement.createdAt,
    }
