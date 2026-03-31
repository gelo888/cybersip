from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.contract import ContractType


class CommandCenterKpis(BaseModel):
    """Aggregated KPIs for the Command Center dashboard."""

    pipeline_value: Decimal = Field(
        Decimal("0"),
        description="Sum of total_value on pending our_contract records (pipeline deals).",
    )
    expiring_90d_count: int = Field(
        ...,
        description="Active contracts with end_date within the next 90 days (UTC).",
    )
    active_our_contracts_count: int
    active_competitor_contracts_count: int


class RenewalRadarItem(BaseModel):
    """One contract in the renewal window for the radar strip."""

    contract_id: str
    company_id: str
    company_name: str
    end_date: Optional[datetime] = None
    total_value: Optional[Decimal] = None
    contract_type: ContractType
    territory_label: Optional[str] = None
    incumbent_label: str = Field(
        ...,
        description="Subtitle for the card: competitor name, Our renewal, or Competitor contract.",
    )


class CommandCenterSummary(BaseModel):
    kpis: CommandCenterKpis
    renewal_radar: list[RenewalRadarItem]
