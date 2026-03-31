from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.schemas.contract import ContractType


class ActionStreamType(str, Enum):
    """Maps to Command Center Action Stream icons (plus future N8N types)."""

    pipeline = "pipeline"
    win = "win"
    loss = "loss"
    competitor = "competitor"
    renewal = "renewal"
    breach = "breach"


class ActionStreamItem(BaseModel):
    """One timeline row from CRM activity (v1: engagements + new companies)."""

    id: str = Field(..., description="Stable id, e.g. engagement:{uuid}, company:{uuid}.")
    occurred_at: datetime
    stream_type: ActionStreamType
    message: str
    source: Literal["crm"] = "crm"
    company_id: Optional[str] = None
    engagement_id: Optional[str] = None


class ActionStreamResponse(BaseModel):
    items: list[ActionStreamItem]


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
