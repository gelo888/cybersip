from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.main import db
from app.schemas.assignment import (
    AssignmentCreate,
    AssignmentResponse,
    AssignmentUpdate,
)

router = APIRouter(prefix="/api/assignments", tags=["Company Assignments"])


@router.post("/", response_model=AssignmentResponse, status_code=201)
async def create_assignment(body: AssignmentCreate):
    """Assign a user to a company with a role (owner or collaborator)."""
    company = await db.company.find_unique(where={"id": body.company_id})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    user = await db.user.find_unique(where={"id": body.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = await db.companyassignment.find_unique(
        where={
            "companyId_userId": {
                "companyId": body.company_id,
                "userId": body.user_id,
            }
        }
    )
    if existing:
        raise HTTPException(status_code=409, detail="Assignment already exists")

    assignment = await db.companyassignment.create(
        data={
            "companyId": body.company_id,
            "userId": body.user_id,
            "role": body.role.value,
        }
    )
    return _to_response(assignment)


@router.get("/", response_model=list[AssignmentResponse])
async def list_assignments(
    company_id: Optional[str] = Query(None, description="Filter by company"),
    user_id: Optional[str] = Query(None, description="Filter by user"),
):
    """List company assignments, optionally filtered by company or user."""
    where = {}
    if company_id:
        where["companyId"] = company_id
    if user_id:
        where["userId"] = user_id

    assignments = await db.companyassignment.find_many(where=where)
    return [_to_response(a) for a in assignments]


@router.patch("/{company_id}/{user_id}", response_model=AssignmentResponse)
async def update_assignment(company_id: str, user_id: str, body: AssignmentUpdate):
    """Change the role of an existing company assignment."""
    existing = await db.companyassignment.find_unique(
        where={
            "companyId_userId": {
                "companyId": company_id,
                "userId": user_id,
            }
        }
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Assignment not found")

    assignment = await db.companyassignment.update(
        where={
            "companyId_userId": {
                "companyId": company_id,
                "userId": user_id,
            }
        },
        data={"role": body.role.value},
    )
    return _to_response(assignment)


@router.delete("/{company_id}/{user_id}", status_code=204)
async def delete_assignment(company_id: str, user_id: str):
    """Remove a user's assignment from a company."""
    existing = await db.companyassignment.find_unique(
        where={
            "companyId_userId": {
                "companyId": company_id,
                "userId": user_id,
            }
        }
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Assignment not found")

    await db.companyassignment.delete(
        where={
            "companyId_userId": {
                "companyId": company_id,
                "userId": user_id,
            }
        }
    )
    return None


def _to_response(assignment) -> dict:
    """Maps Prisma CompanyAssignment to the AssignmentResponse shape."""
    return {
        "company_id": assignment.companyId,
        "user_id": assignment.userId,
        "role": assignment.role,
    }
