from typing import Optional
from pydantic import BaseModel

class Sector(BaseModel):
    name: str
    description: str
    index: Optional[str] = None
    sub_sectors: list[str] = []
    stocks: list[str] = []
    key_metrics: list[str] = []
    rate_sensitive: bool = False
    defensive: bool = False
    cyclical: bool = False
    export_oriented: bool = False
    commodity_linked: bool = False
    govt_capex_linked: bool = False

class MacroCorrelation(BaseModel):
    negative_impact: list[str]
    positive_impact: list[str]
    neutral: list[str]

class SectorMapping(BaseModel):
    sectors: dict[str, Sector]
    macro_correlations: dict[str, MacroCorrelation]
    defensive_sectors: list[str]
    cyclical_sectors: list[str]
    rate_sensitive_sectors: list[str]
    export_oriented_sectors: list[str]
