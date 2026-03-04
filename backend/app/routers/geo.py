import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException

from app.schemas.geo import (
    AdminDivisionResponse,
    CountriesByLevelResponse,
    GeoCountryResponse,
    GeoFeatureCollectionResponse,
    GeoFeaturesRequest,
    GeoRegionResponse,
    GeoSubRegionResponse,
)

router = APIRouter(prefix="/api/geo", tags=["Geographic Data"])

BASE_DIR = Path(__file__).resolve().parent.parent.parent
TERRITORIES_DIR = BASE_DIR / "territories"
GADM_DIR = BASE_DIR / "gadm_geojson"

_regional_data: list[dict] | None = None
_countries_by_level: dict | None = None


def _load_regional_data() -> list[dict]:
    global _regional_data
    if _regional_data is None:
        with open(TERRITORIES_DIR / "regional_territories.json") as f:
            _regional_data = json.load(f)
    return _regional_data


def _load_countries_by_level() -> dict:
    global _countries_by_level
    if _countries_by_level is None:
        with open(TERRITORIES_DIR / "countries-by-level.json") as f:
            _countries_by_level = json.load(f)
    return _countries_by_level


def _find_region(region_id: str) -> dict | None:
    for r in _load_regional_data():
        if r["id"] == region_id:
            return r
    return None


def _find_subregion(subregion_id: str) -> dict | None:
    for r in _load_regional_data():
        for sr in r.get("subRegions", []):
            if sr["id"] == subregion_id:
                return sr
    return None


def _load_gadm_file(gid_0: str, level: int) -> dict | None:
    path = GADM_DIR / gid_0 / f"gadm41_{gid_0}_{level}.json"
    if not path.exists():
        return None
    with open(path) as f:
        return json.load(f)


# ── Regions ───────────────────────────────────────────────────────────

@router.get("/regions", response_model=list[GeoRegionResponse])
async def list_geo_regions():
    """List all geographic regions with center coordinates and zoom."""
    return [
        {
            "id": r["id"],
            "name": r["name"],
            "center": r["center"],
            "zoom": r["zoom"],
        }
        for r in _load_regional_data()
    ]


# ── Subregions ────────────────────────────────────────────────────────

@router.get(
    "/regions/{region_id}/subregions",
    response_model=list[GeoSubRegionResponse],
)
async def list_subregions(region_id: str):
    """List subregions under a given region."""
    region = _find_region(region_id)
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")

    return [
        {
            "id": sr["id"],
            "name": sr["name"],
            "center": sr["center"],
            "zoom": sr["zoom"],
        }
        for sr in region.get("subRegions", [])
    ]


# ── Countries under a subregion ───────────────────────────────────────

@router.get(
    "/subregions/{subregion_id}/countries",
    response_model=list[GeoCountryResponse],
)
async def list_countries(subregion_id: str):
    """List countries under a given subregion."""
    sr = _find_subregion(subregion_id)
    if not sr:
        raise HTTPException(status_code=404, detail="Subregion not found")

    return [
        {
            "id": c["id"],
            "name": c["name"],
            "center": c["center"],
            "zoom": c["zoom"],
        }
        for c in sr.get("countries", [])
    ]


# ── Countries by level ────────────────────────────────────────────────

@router.get("/countries-by-level", response_model=CountriesByLevelResponse)
async def get_countries_by_level():
    """Return which countries have level-1 and level-2 admin division data."""
    return _load_countries_by_level()


# ── Admin divisions ──────────────────────────────────────────────────

@router.get(
    "/admin-divisions/{gid_0}",
    response_model=list[AdminDivisionResponse],
)
async def list_admin_divisions_level1(gid_0: str):
    """List level-1 admin divisions (states/provinces) for a country.
    Returns only gid + name metadata, no geometry."""
    data = _load_gadm_file(gid_0, 1)
    if not data:
        raise HTTPException(
            status_code=404,
            detail=f"No level-1 data for {gid_0}",
        )

    results: list[dict] = []
    for feature in data.get("features", []):
        props = feature.get("properties", {})
        results.append({
            "gid": props.get("GID_1", ""),
            "name": props.get("NAME_1", ""),
        })

    results.sort(key=lambda x: x["name"])
    return results


@router.get(
    "/admin-divisions/{gid_0}/{gid_1}",
    response_model=list[AdminDivisionResponse],
)
async def list_admin_divisions_level2(gid_0: str, gid_1: str):
    """List level-2 admin divisions (counties/districts) for a state/province.
    Returns only gid + name metadata, no geometry."""
    data = _load_gadm_file(gid_0, 2)
    if not data:
        raise HTTPException(
            status_code=404,
            detail=f"No level-2 data for {gid_0}",
        )

    results: list[dict] = []
    for feature in data.get("features", []):
        props = feature.get("properties", {})
        if props.get("GID_1") == gid_1:
            results.append({
                "gid": props.get("GID_2", ""),
                "name": props.get("NAME_2", ""),
            })

    results.sort(key=lambda x: x["name"])
    return results


# ── Batch GeoJSON features ───────────────────────────────────────────

@router.post("/features", response_model=GeoFeatureCollectionResponse)
async def get_geo_features(body: GeoFeaturesRequest):
    """Batch-fetch GeoJSON features by GID list.
    Returns a FeatureCollection with only the requested features."""
    level = body.level
    features: list[Any] = []

    gid_key = f"GID_{level}"
    country_key = "GID_0"

    country_codes: set[str] = set()
    for gid in body.gids:
        if level == 0:
            country_codes.add(gid)
        else:
            country_codes.add(gid.split(".")[0])

    for cc in country_codes:
        data = _load_gadm_file(cc, level)
        if not data:
            continue

        requested_gids = {g for g in body.gids if g == cc or g.startswith(cc + ".")}

        for feature in data.get("features", []):
            props = feature.get("properties", {})
            feature_gid = props.get(gid_key, "")
            if level == 0:
                feature_gid = props.get(country_key, "")

            if feature_gid in requested_gids:
                features.append(feature)

    return {"type": "FeatureCollection", "features": features}
