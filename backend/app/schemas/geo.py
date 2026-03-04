from typing import Any

from pydantic import BaseModel, Field


class GeoRegionResponse(BaseModel):
    id: str
    name: str
    center: list[float]
    zoom: float


class GeoSubRegionResponse(BaseModel):
    id: str
    name: str
    center: list[float]
    zoom: float


class GeoCountryResponse(BaseModel):
    id: str
    name: str
    center: list[float]
    zoom: float


class AdminDivisionResponse(BaseModel):
    gid: str
    name: str


class CountriesByLevelResponse(BaseModel):
    level_1: list[str]
    level_2: list[str]


class GeoFeaturesRequest(BaseModel):
    gids: list[str] = Field(..., min_length=1, max_length=100)
    level: int = Field(..., ge=0, le=2)


class GeoFeatureCollectionResponse(BaseModel):
    type: str = "FeatureCollection"
    features: list[Any] = []
