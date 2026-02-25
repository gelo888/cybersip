from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.main import db
from app.schemas.product import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)

router = APIRouter(tags=["Products & Services"])


# ── Product Categories ──────────────────────────────────────────────

@router.post("/api/categories", response_model=CategoryResponse, status_code=201)
async def create_category(body: CategoryCreate):
    """Create a product category (e.g. 'Endpoint Security', 'Consulting')."""
    category = await db.productcategory.create(data={"name": body.name})
    return _category_to_response(category)


@router.get("/api/categories", response_model=list[CategoryResponse])
async def list_categories():
    """List all product categories."""
    categories = await db.productcategory.find_many(order={"name": "asc"})
    return [_category_to_response(c) for c in categories]


@router.patch("/api/categories/{category_id}", response_model=CategoryResponse)
async def update_category(category_id: str, body: CategoryUpdate):
    """Update a product category."""
    existing = await db.productcategory.find_unique(where={"id": category_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")

    if body.name is None:
        return _category_to_response(existing)

    category = await db.productcategory.update(
        where={"id": category_id},
        data={"name": body.name},
    )
    return _category_to_response(category)


@router.delete("/api/categories/{category_id}", status_code=204)
async def delete_category(category_id: str):
    """Delete a product category."""
    existing = await db.productcategory.find_unique(where={"id": category_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")
    await db.productcategory.delete(where={"id": category_id})
    return None


# ── Products / Services ────────────────────────────────────────────

@router.post("/api/products", response_model=ProductResponse, status_code=201)
async def create_product(body: ProductCreate):
    """Create a product or service within a category."""
    category = await db.productcategory.find_unique(where={"id": body.category_id})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    product = await db.productservice.create(
        data={
            "categoryId": body.category_id,
            "name": body.name,
            "basePrice": body.base_price,
            "pricingModel": body.pricing_model.value if body.pricing_model else None,
        }
    )
    return _product_to_response(product)


@router.get("/api/products", response_model=list[ProductResponse])
async def list_products(
    category_id: Optional[str] = Query(None, description="Filter by category"),
    skip: int = Query(0, ge=0),
    take: int = Query(20, ge=1, le=100),
):
    """List products/services, optionally filtered by category."""
    where = {}
    if category_id:
        where["categoryId"] = category_id

    products = await db.productservice.find_many(
        where=where,
        skip=skip,
        take=take,
        order={"name": "asc"},
    )
    return [_product_to_response(p) for p in products]


@router.get("/api/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    """Get a single product/service by ID."""
    product = await db.productservice.find_unique(where={"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return _product_to_response(product)


@router.patch("/api/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, body: ProductUpdate):
    """Update an existing product/service."""
    existing = await db.productservice.find_unique(where={"id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = {}
    if body.category_id is not None:
        category = await db.productcategory.find_unique(where={"id": body.category_id})
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        update_data["categoryId"] = body.category_id
    if body.name is not None:
        update_data["name"] = body.name
    if body.base_price is not None:
        update_data["basePrice"] = body.base_price
    if body.pricing_model is not None:
        update_data["pricingModel"] = body.pricing_model.value

    if not update_data:
        return _product_to_response(existing)

    product = await db.productservice.update(
        where={"id": product_id},
        data=update_data,
    )
    return _product_to_response(product)


@router.delete("/api/products/{product_id}", status_code=204)
async def delete_product(product_id: str):
    """Delete a product/service."""
    existing = await db.productservice.find_unique(where={"id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    await db.productservice.delete(where={"id": product_id})
    return None


# ── Response mappers ────────────────────────────────────────────────

def _category_to_response(category) -> dict:
    return {"id": category.id, "name": category.name}


def _product_to_response(product) -> dict:
    return {
        "id": product.id,
        "category_id": product.categoryId,
        "name": product.name,
        "base_price": product.basePrice,
        "pricing_model": product.pricingModel,
    }
