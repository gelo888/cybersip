from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.main import db
from app.schemas.contract import (
    ContractCreate,
    ContractResponse,
    ContractStatus,
    ContractType,
    ContractUpdate,
    LineItemCreate,
    LineItemResponse,
    LineItemUpdate,
)

router = APIRouter(tags=["Contracts"])


# ── Contracts ───────────────────────────────────────────────────────

@router.post("/api/contracts", response_model=ContractResponse, status_code=201)
async def create_contract(body: ContractCreate):
    """Create a new contract (our own or a known competitor contract)."""
    company = await db.company.find_unique(where={"id": body.company_id})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    contract = await db.contract.create(
        data={
            "companyId": body.company_id,
            "type": body.type.value,
            "status": body.status.value,
            "startDate": body.start_date,
            "endDate": body.end_date,
            "totalValue": body.total_value,
            "renewalNoticeDays": body.renewal_notice_days,
        }
    )
    return _contract_to_response(contract)


@router.get("/api/contracts", response_model=list[ContractResponse])
async def list_contracts(
    company_id: Optional[str] = Query(None, description="Filter by company"),
    type: Optional[ContractType] = Query(None, description="Filter by contract type"),
    status: Optional[ContractStatus] = Query(None, description="Filter by status"),
    skip: int = Query(0, ge=0),
    take: int = Query(20, ge=1, le=100),
):
    """List contracts with optional filters."""
    where = {}
    if company_id:
        where["companyId"] = company_id
    if type:
        where["type"] = type.value
    if status:
        where["status"] = status.value

    contracts = await db.contract.find_many(
        where=where,
        skip=skip,
        take=take,
        order={"endDate": "asc"},
    )
    return [_contract_to_response(c) for c in contracts]


@router.get("/api/contracts/{contract_id}", response_model=ContractResponse)
async def get_contract(contract_id: str):
    """Get a single contract by ID."""
    contract = await db.contract.find_unique(where={"id": contract_id})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return _contract_to_response(contract)


@router.patch("/api/contracts/{contract_id}", response_model=ContractResponse)
async def update_contract(contract_id: str, body: ContractUpdate):
    """Update an existing contract."""
    existing = await db.contract.find_unique(where={"id": contract_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Contract not found")

    update_data = {}
    if body.type is not None:
        update_data["type"] = body.type.value
    if body.status is not None:
        update_data["status"] = body.status.value
    if body.start_date is not None:
        update_data["startDate"] = body.start_date
    if body.end_date is not None:
        update_data["endDate"] = body.end_date
    if body.total_value is not None:
        update_data["totalValue"] = body.total_value
    if body.renewal_notice_days is not None:
        update_data["renewalNoticeDays"] = body.renewal_notice_days

    if not update_data:
        return _contract_to_response(existing)

    contract = await db.contract.update(
        where={"id": contract_id},
        data=update_data,
    )
    return _contract_to_response(contract)


@router.delete("/api/contracts/{contract_id}", status_code=204)
async def delete_contract(contract_id: str):
    """Delete a contract and its line items (cascade)."""
    existing = await db.contract.find_unique(where={"id": contract_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Contract not found")
    await db.contract.delete(where={"id": contract_id})
    return None


# ── Contract Line Items ────────────────────────────────────────────

@router.post("/api/contracts/{contract_id}/line-items", response_model=LineItemResponse, status_code=201)
async def create_line_item(contract_id: str, body: LineItemCreate):
    """Add a line item (product/service) to a contract."""
    contract = await db.contract.find_unique(where={"id": contract_id})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    product = await db.productservice.find_unique(where={"id": body.product_service_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product/Service not found")

    item = await db.contractlineitem.create(
        data={
            "contractId": contract_id,
            "productServiceId": body.product_service_id,
            "quantity": body.quantity,
            "unitPrice": body.unit_price,
        }
    )
    return _line_item_to_response(item)


@router.get("/api/contracts/{contract_id}/line-items", response_model=list[LineItemResponse])
async def list_line_items(contract_id: str):
    """List all line items for a contract."""
    contract = await db.contract.find_unique(where={"id": contract_id})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    items = await db.contractlineitem.find_many(
        where={"contractId": contract_id},
    )
    return [_line_item_to_response(i) for i in items]


@router.patch("/api/line-items/{item_id}", response_model=LineItemResponse)
async def update_line_item(item_id: str, body: LineItemUpdate):
    """Update a contract line item's quantity or price."""
    existing = await db.contractlineitem.find_unique(where={"id": item_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Line item not found")

    update_data = {}
    if body.quantity is not None:
        update_data["quantity"] = body.quantity
    if body.unit_price is not None:
        update_data["unitPrice"] = body.unit_price

    if not update_data:
        return _line_item_to_response(existing)

    item = await db.contractlineitem.update(
        where={"id": item_id},
        data=update_data,
    )
    return _line_item_to_response(item)


@router.delete("/api/line-items/{item_id}", status_code=204)
async def delete_line_item(item_id: str):
    """Remove a line item from a contract."""
    existing = await db.contractlineitem.find_unique(where={"id": item_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Line item not found")
    await db.contractlineitem.delete(where={"id": item_id})
    return None


# ── Response mappers ────────────────────────────────────────────────

def _contract_to_response(contract) -> dict:
    return {
        "id": contract.id,
        "company_id": contract.companyId,
        "type": contract.type,
        "status": contract.status,
        "start_date": contract.startDate,
        "end_date": contract.endDate,
        "total_value": contract.totalValue,
        "renewal_notice_days": contract.renewalNoticeDays,
    }


def _line_item_to_response(item) -> dict:
    return {
        "id": item.id,
        "contract_id": item.contractId,
        "product_service_id": item.productServiceId,
        "quantity": item.quantity,
        "unit_price": item.unitPrice,
    }
