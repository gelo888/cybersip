from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter

from app.main import db
from app.schemas.command_center import (
    CommandCenterKpis,
    CommandCenterSummary,
    RenewalRadarItem,
)
from app.schemas.contract import ContractType

router = APIRouter(tags=["Command Center"])

RENEWAL_RADAR_LIMIT = 20


def _best_intel_for_contract(
    company_id: str,
    contract_end: datetime,
    intel_records: list,
):
    """Pick CompetitorIntel for this company with contract_end closest in time."""
    best = None
    best_delta: Optional[float] = None
    for intel in intel_records:
        if intel.companyId != company_id or intel.contractEnd is None:
            continue
        delta = abs((intel.contractEnd - contract_end).total_seconds())
        if best_delta is None or delta < best_delta:
            best_delta = delta
            best = intel
    return best


def _first_territory_name(company) -> Optional[str]:
    if not company or not company.territories:
        return None
    for ct in company.territories:
        if ct.territory and ct.territory.name:
            return ct.territory.name
    return None


@router.get("/api/command-center/summary", response_model=CommandCenterSummary)
async def get_command_center_summary():
    """Aggregated KPIs and renewal radar from contracts, companies, territories, intel."""
    now = datetime.now(timezone.utc)
    window_end = now + timedelta(days=90)

    pipeline_rows = await db.contract.find_many(
        where={
            "type": "our_contract",
            "status": "pending",
        },
    )
    pipeline_value = sum(
        (
            row.totalValue if row.totalValue is not None else Decimal(0)
            for row in pipeline_rows
        ),
        start=Decimal(0),
    )

    expiring_90d_count = await db.contract.count(
        where={
            "status": "active",
            "endDate": {"gte": now, "lte": window_end},
        },
    )

    active_our_contracts_count = await db.contract.count(
        where={"type": "our_contract", "status": "active"},
    )
    active_competitor_contracts_count = await db.contract.count(
        where={"type": "competitor_contract", "status": "active"},
    )

    renewal_contracts = await db.contract.find_many(
        where={
            "status": "active",
            "endDate": {"gte": now, "lte": window_end},
        },
        include={
            "company": {
                "include": {
                    "territories": {
                        "include": {"territory": True},
                    },
                },
            },
        },
        order={"endDate": "asc"},
        take=RENEWAL_RADAR_LIMIT,
    )

    company_ids = list({c.companyId for c in renewal_contracts})
    intel_records: list = []
    if company_ids:
        intel_records = await db.competitorintel.find_many(
            where={"companyId": {"in": company_ids}},
            include={"competitor": True},
        )

    renewal_radar: list[RenewalRadarItem] = []
    for c in renewal_contracts:
        company = c.company
        territory_label = _first_territory_name(company)
        company_name = company.currentName if company else "Unknown"

        if c.type == "our_contract":
            incumbent_label = "Our renewal"
        else:
            incumbent_label = "Competitor contract"
            if c.endDate is not None:
                match = _best_intel_for_contract(c.companyId, c.endDate, intel_records)
                if match and match.competitor and match.competitor.name:
                    incumbent_label = match.competitor.name

        renewal_radar.append(
            RenewalRadarItem(
                contract_id=c.id,
                company_id=c.companyId,
                company_name=company_name,
                end_date=c.endDate,
                total_value=c.totalValue,
                contract_type=ContractType(str(c.type)),
                territory_label=territory_label,
                incumbent_label=incumbent_label,
            )
        )

    return CommandCenterSummary(
        kpis=CommandCenterKpis(
            pipeline_value=pipeline_value,
            expiring_90d_count=expiring_90d_count,
            active_our_contracts_count=active_our_contracts_count,
            active_competitor_contracts_count=active_competitor_contracts_count,
        ),
        renewal_radar=renewal_radar,
    )
