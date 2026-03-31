from fastapi import APIRouter

from app.main import db
from app.schemas.industry import IndustryResponse

router = APIRouter(prefix="/api/industries", tags=["Industries"])


@router.get("/", response_model=list[IndustryResponse])
async def list_industries():
    """List all industries from the catalog (for picklists). Ordered by sector, then name."""
    rows = await db.industry.find_many()
    rows.sort(key=lambda r: ((r.sector or ""), r.name))
    return [
        IndustryResponse(id=r.id, name=r.name, sector=r.sector) for r in rows
    ]
