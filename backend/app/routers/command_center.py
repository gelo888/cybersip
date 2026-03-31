import re
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Query

from app.main import db
from app.schemas.command_center import (
    ActionStreamItem,
    ActionStreamResponse,
    ActionStreamType,
    CommandCenterKpis,
    CommandCenterSummary,
    RenewalRadarItem,
)
from app.schemas.contract import ContractType

router = APIRouter(tags=["Command Center"])

RENEWAL_RADAR_LIMIT = 20

ACTION_STREAM_OUTCOME_MAX = 120
ACTION_STREAM_FETCH_CAP = 80
ACTION_STREAM_COMPANY_CAP = 15
ACTION_STREAM_COMPANY_MAX_LOOKBACK_DAYS = 14


def _truncate_message(text: str, max_len: int = ACTION_STREAM_OUTCOME_MAX) -> str:
    t = text.strip()
    if len(t) <= max_len:
        return t
    return t[: max_len - 1].rstrip() + "…"


def _engagement_stream_type(outcome: Optional[str]) -> ActionStreamType:
    if not outcome:
        return ActionStreamType.pipeline
    o = outcome.lower()
    if re.search(r"\blost\b", o):
        return ActionStreamType.loss
    if re.search(r"\bwon\b", o) or "signed" in o or "displaced" in o:
        return ActionStreamType.win
    return ActionStreamType.pipeline


def _format_engagement_type(raw: str) -> str:
    return raw.replace("_", " ").title()


@router.get("/api/command-center/action-stream", response_model=ActionStreamResponse)
async def get_command_center_action_stream(
    limit: int = Query(default=25, ge=1, le=100),
    days: int = Query(default=90, ge=1, le=365),
):
    """Recent CRM activity: engagements and newly created companies (DB-only v1)."""
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=days)
    company_cutoff = now - timedelta(
        days=min(days, ACTION_STREAM_COMPANY_MAX_LOOKBACK_DAYS)
    )

    engagements = await db.engagement.find_many(
        where={"createdAt": {"gte": cutoff}},
        include={"company": True, "stage": True},
        order={"createdAt": "desc"},
        take=ACTION_STREAM_FETCH_CAP,
    )

    companies = await db.company.find_many(
        where={"createdAt": {"gte": company_cutoff}},
        order={"createdAt": "desc"},
        take=ACTION_STREAM_COMPANY_CAP,
    )

    items: list[ActionStreamItem] = []

    for e in engagements:
        company_name = e.company.currentName if e.company else "Unknown account"
        stage_name = e.stage.name if e.stage else "Unknown stage"
        type_label = _format_engagement_type(str(e.type))
        msg = f"{company_name} — {stage_name} ({type_label})"
        if e.outcome:
            msg = f"{msg}: {_truncate_message(e.outcome)}"
        occurred = e.createdAt
        if occurred.tzinfo is None:
            occurred = occurred.replace(tzinfo=timezone.utc)
        items.append(
            ActionStreamItem(
                id=f"engagement:{e.id}",
                occurred_at=occurred,
                stream_type=_engagement_stream_type(e.outcome),
                message=msg,
                company_id=e.companyId,
                engagement_id=e.id,
            )
        )

    for c in companies:
        occurred = c.createdAt
        if occurred.tzinfo is None:
            occurred = occurred.replace(tzinfo=timezone.utc)
        items.append(
            ActionStreamItem(
                id=f"company:{c.id}",
                occurred_at=occurred,
                stream_type=ActionStreamType.win,
                message=f"New account: {c.currentName}",
                company_id=c.id,
            )
        )

    items.sort(key=lambda x: x.occurred_at, reverse=True)
    return ActionStreamResponse(items=items[:limit])


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
