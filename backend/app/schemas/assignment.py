from enum import Enum

from pydantic import BaseModel


class AssignmentRole(str, Enum):
    """Mirrors the AssignmentRole enum in the Prisma schema."""
    owner = "owner"
    collaborator = "collaborator"


class AssignmentCreate(BaseModel):
    """Request body for assigning a user to a company."""
    company_id: str
    user_id: str
    role: AssignmentRole = AssignmentRole.collaborator


class AssignmentUpdate(BaseModel):
    """Request body for changing the assignment role."""
    role: AssignmentRole


class AssignmentResponse(BaseModel):
    """Response body for a company assignment."""
    company_id: str
    user_id: str
    role: AssignmentRole

    class Config:
        from_attributes = True
