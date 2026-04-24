from typing import Optional
from pydantic import BaseModel

class Index(BaseModel):
    name: str
    current_value: float
    previous_close: float
    change_percent: float
    change_absolute: float
    day_high: float
    day_low: float
    sentiment: str

class SectorPerformance(BaseModel):
    change_percent: float
    sentiment: str
    key_drivers: list[str]
    top_gainers: list[str]
    top_losers: list[str]

class Stock(BaseModel):
    symbol: str
    name: str
    sector: str
    sub_sector: Optional[str] = None
    current_price: float
    previous_close: float
    change_percent: float
    change_absolute: float
    volume: int
    avg_volume_20d: Optional[int] = None
    market_cap_cr: Optional[float] = None
    pe_ratio: Optional[float] = None
    beta: Optional[float] = None
    week_52_high: Optional[float] = None
    week_52_low: Optional[float] = None

class MarketMetadata(BaseModel):
    date: str
    market_status: str
    currency: str

class MarketData(BaseModel):
    metadata: MarketMetadata
    indices: dict[str, Index]
    sector_performance: dict[str, SectorPerformance]
    stocks: dict[str, Stock]
