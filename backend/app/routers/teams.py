from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.main import db
from app.schemas.team import (
    TeamMemberCreate,
    TeamMemberResponse,
    TeamMemberUpdate,
    TerritoryMemberCreate,
    TerritoryMemberResponse,
)

router = APIRouter(tags=["Team Members"])


# ── Team Members CRUD ─────────────────────────────────────────────────

@router.post("/api/team-members", response_model=TeamMemberResponse, status_code=201)
async def create_team_member(body: TeamMemberCreate):
    """Create a new team member."""
    member = await db.teammember.create(
        data={
            "firstName": body.first_name,
            "middleName": body.middle_name,
            "lastName": body.last_name,
            "role": body.role.value,
            "position": body.position,
            "email": body.email,
            "phoneNumber": body.phone_number,
        }
    )
    return _member_to_response(member)


@router.get("/api/team-members", response_model=list[TeamMemberResponse])
async def list_team_members(
    role: Optional[str] = Query(None, description="Filter by role (sales_team, leadership)"),
):
    """List all team members."""
    where: dict = {}
    if role:
        where["role"] = role

    members = await db.teammember.find_many(
        where=where,
        order={"lastName": "asc"},
    )
    return [_member_to_response(m) for m in members]


@router.get("/api/team-members/{member_id}", response_model=TeamMemberResponse)
async def get_team_member(member_id: str):
    """Get a single team member."""
    member = await db.teammember.find_unique(where={"id": member_id})
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")
    return _member_to_response(member)


@router.patch("/api/team-members/{member_id}", response_model=TeamMemberResponse)
async def update_team_member(member_id: str, body: TeamMemberUpdate):
    """Update a team member."""
    existing = await db.teammember.find_unique(where={"id": member_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Team member not found")

    update_data: dict = {}
    if body.first_name is not None:
        update_data["firstName"] = body.first_name
    if body.middle_name is not None:
        update_data["middleName"] = body.middle_name
    if body.last_name is not None:
        update_data["lastName"] = body.last_name
    if body.role is not None:
        update_data["role"] = body.role.value
    if body.position is not None:
        update_data["position"] = body.position
    if body.email is not None:
        update_data["email"] = body.email
    if body.phone_number is not None:
        update_data["phoneNumber"] = body.phone_number

    if not update_data:
        return _member_to_response(existing)

    member = await db.teammember.update(where={"id": member_id}, data=update_data)
    return _member_to_response(member)


@router.delete("/api/team-members/{member_id}", status_code=204)
async def delete_team_member(member_id: str):
    """Delete a team member."""
    existing = await db.teammember.find_unique(where={"id": member_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Team member not found")
    await db.teammember.delete(where={"id": member_id})
    return None


# ── Territory ↔ Member assignments ────────────────────────────────────

@router.post(
    "/api/territory-members",
    response_model=TerritoryMemberResponse,
    status_code=201,
)
async def assign_member_to_territory(body: TerritoryMemberCreate):
    """Assign a team member to a territory."""
    member = await db.teammember.find_unique(where={"id": body.team_member_id})
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")

    territory = await db.territory.find_unique(where={"id": body.territory_id})
    if not territory:
        raise HTTPException(status_code=404, detail="Territory not found")

    existing = await db.territorymember.find_unique(
        where={
            "teamMemberId_territoryId": {
                "teamMemberId": body.team_member_id,
                "territoryId": body.territory_id,
            }
        }
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Member is already assigned to this territory",
        )

    record = await db.territorymember.create(
        data={
            "teamMemberId": body.team_member_id,
            "territoryId": body.territory_id,
        }
    )
    return _territory_member_to_response(record)


@router.get(
    "/api/territory-members",
    response_model=list[TerritoryMemberResponse],
)
async def list_territory_members(
    team_member_id: Optional[str] = Query(None, description="Filter by member"),
    territory_id: Optional[str] = Query(None, description="Filter by territory"),
):
    """List territory-member assignments."""
    where: dict = {}
    if team_member_id:
        where["teamMemberId"] = team_member_id
    if territory_id:
        where["territoryId"] = territory_id

    records = await db.territorymember.find_many(where=where)
    return [_territory_member_to_response(r) for r in records]


@router.delete(
    "/api/territory-members/{member_id}/{territory_id}",
    status_code=204,
)
async def unassign_member_from_territory(member_id: str, territory_id: str):
    """Remove a member from a territory."""
    existing = await db.territorymember.find_unique(
        where={
            "teamMemberId_territoryId": {
                "teamMemberId": member_id,
                "territoryId": territory_id,
            }
        }
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Assignment not found")

    await db.territorymember.delete(
        where={
            "teamMemberId_territoryId": {
                "teamMemberId": member_id,
                "territoryId": territory_id,
            }
        }
    )
    return None


# ── Helpers ───────────────────────────────────────────────────────────

def _member_to_response(member) -> dict:
    return {
        "id": member.id,
        "first_name": member.firstName,
        "middle_name": member.middleName,
        "last_name": member.lastName,
        "role": member.role,
        "position": member.position,
        "email": member.email,
        "phone_number": member.phoneNumber,
        "created_at": member.createdAt,
        "updated_at": member.updatedAt,
    }


def _territory_member_to_response(record) -> dict:
    return {
        "team_member_id": record.teamMemberId,
        "territory_id": record.territoryId,
    }
