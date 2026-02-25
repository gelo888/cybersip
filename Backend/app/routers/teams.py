from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.main import db
from app.schemas.team import (
    TeamCreate,
    TeamMemberCreate,
    TeamMemberResponse,
    TeamMemberUpdate,
    TeamResponse,
    TeamTerritoryCreate,
    TeamTerritoryResponse,
    TeamUpdate,
)

router = APIRouter(tags=["Teams"])


# ── Teams ─────────────────────────────────────────────────────────────

@router.post("/api/teams", response_model=TeamResponse, status_code=201)
async def create_team(body: TeamCreate):
    """Create a new team."""
    team = await db.team.create(data={"name": body.name})
    return _team_to_response(team)


@router.get("/api/teams", response_model=list[TeamResponse])
async def list_teams():
    """List all teams."""
    teams = await db.team.find_many(order={"name": "asc"})
    return [_team_to_response(t) for t in teams]


@router.get("/api/teams/{team_id}", response_model=TeamResponse)
async def get_team(team_id: str):
    """Get a single team by ID."""
    team = await db.team.find_unique(where={"id": team_id})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return _team_to_response(team)


@router.patch("/api/teams/{team_id}", response_model=TeamResponse)
async def update_team(team_id: str, body: TeamUpdate):
    """Update a team's name."""
    existing = await db.team.find_unique(where={"id": team_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Team not found")

    update_data = {}
    if body.name is not None:
        update_data["name"] = body.name

    if not update_data:
        return _team_to_response(existing)

    team = await db.team.update(where={"id": team_id}, data=update_data)
    return _team_to_response(team)


@router.delete("/api/teams/{team_id}", status_code=204)
async def delete_team(team_id: str):
    """Delete a team."""
    existing = await db.team.find_unique(where={"id": team_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Team not found")
    await db.team.delete(where={"id": team_id})
    return None


# ── Team Members ──────────────────────────────────────────────────────

@router.post(
    "/api/team-members", response_model=TeamMemberResponse, status_code=201
)
async def create_team_member(body: TeamMemberCreate):
    """Add a user to a team."""
    team = await db.team.find_unique(where={"id": body.team_id})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    user = await db.user.find_unique(where={"id": body.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = await db.teammember.find_unique(
        where={
            "teamId_userId": {
                "teamId": body.team_id,
                "userId": body.user_id,
            }
        }
    )
    if existing:
        raise HTTPException(
            status_code=409, detail="User is already a member of this team"
        )

    member = await db.teammember.create(
        data={
            "teamId": body.team_id,
            "userId": body.user_id,
            "role": body.role.value,
        }
    )
    return _member_to_response(member)


@router.get("/api/team-members", response_model=list[TeamMemberResponse])
async def list_team_members(
    team_id: Optional[str] = Query(None, description="Filter by team"),
):
    """List team members, optionally filtered by team."""
    where = {}
    if team_id:
        where["teamId"] = team_id

    members = await db.teammember.find_many(where=where)
    return [_member_to_response(m) for m in members]


@router.patch(
    "/api/team-members/{team_id}/{user_id}",
    response_model=TeamMemberResponse,
)
async def update_team_member(team_id: str, user_id: str, body: TeamMemberUpdate):
    """Change a team member's role (lead / member)."""
    existing = await db.teammember.find_unique(
        where={
            "teamId_userId": {
                "teamId": team_id,
                "userId": user_id,
            }
        }
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Team member not found")

    member = await db.teammember.update(
        where={
            "teamId_userId": {
                "teamId": team_id,
                "userId": user_id,
            }
        },
        data={"role": body.role.value},
    )
    return _member_to_response(member)


@router.delete("/api/team-members/{team_id}/{user_id}", status_code=204)
async def delete_team_member(team_id: str, user_id: str):
    """Remove a user from a team."""
    existing = await db.teammember.find_unique(
        where={
            "teamId_userId": {
                "teamId": team_id,
                "userId": user_id,
            }
        }
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Team member not found")

    await db.teammember.delete(
        where={
            "teamId_userId": {
                "teamId": team_id,
                "userId": user_id,
            }
        }
    )
    return None


# ── Team ↔ Territory Group assignments ────────────────────────────────

@router.post(
    "/api/team-territories",
    response_model=TeamTerritoryResponse,
    status_code=201,
)
async def create_team_territory(body: TeamTerritoryCreate):
    """Assign a team to a territory group."""
    team = await db.team.find_unique(where={"id": body.team_id})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    group = await db.territorygroup.find_unique(
        where={"id": body.territory_group_id}
    )
    if not group:
        raise HTTPException(status_code=404, detail="Territory group not found")

    existing = await db.teamterritorygroup.find_unique(
        where={
            "teamId_territoryGroupId": {
                "teamId": body.team_id,
                "territoryGroupId": body.territory_group_id,
            }
        }
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Team is already assigned to this territory group",
        )

    record = await db.teamterritorygroup.create(
        data={
            "teamId": body.team_id,
            "territoryGroupId": body.territory_group_id,
        }
    )
    return _team_territory_to_response(record)


@router.get(
    "/api/team-territories",
    response_model=list[TeamTerritoryResponse],
)
async def list_team_territories(
    team_id: Optional[str] = Query(None, description="Filter by team"),
    territory_group_id: Optional[str] = Query(
        None, description="Filter by territory group"
    ),
):
    """List team-territory assignments."""
    where = {}
    if team_id:
        where["teamId"] = team_id
    if territory_group_id:
        where["territoryGroupId"] = territory_group_id

    records = await db.teamterritorygroup.find_many(where=where)
    return [_team_territory_to_response(r) for r in records]


@router.delete(
    "/api/team-territories/{team_id}/{territory_group_id}",
    status_code=204,
)
async def delete_team_territory(team_id: str, territory_group_id: str):
    """Remove a team from a territory group."""
    existing = await db.teamterritorygroup.find_unique(
        where={
            "teamId_territoryGroupId": {
                "teamId": team_id,
                "territoryGroupId": territory_group_id,
            }
        }
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Assignment not found")

    await db.teamterritorygroup.delete(
        where={
            "teamId_territoryGroupId": {
                "teamId": team_id,
                "territoryGroupId": territory_group_id,
            }
        }
    )
    return None


# ── Helpers ───────────────────────────────────────────────────────────

def _team_to_response(team) -> dict:
    return {
        "id": team.id,
        "name": team.name,
        "created_at": team.createdAt,
        "updated_at": team.updatedAt,
    }


def _member_to_response(member) -> dict:
    return {
        "team_id": member.teamId,
        "user_id": member.userId,
        "role": member.role,
    }


def _team_territory_to_response(record) -> dict:
    return {
        "team_id": record.teamId,
        "territory_group_id": record.territoryGroupId,
    }
