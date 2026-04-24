from typing import Optional
from pydantic import BaseModel

class StockHolding(BaseModel):
    symbol: str
    name: str
    sector: str
    quantity: int
    avg_buy_price: float
    current_price: float
    investment_value: float
    current_value: float
    gain_loss: float
    gain_loss_percent: float
    day_change: float
    day_change_percent: float
    weight_in_portfolio: float

class MutualFundHolding(BaseModel):
    scheme_code: str
    scheme_name: str
    category: str
    amc: str
    units: float
    avg_nav: float
    current_nav: Optional[float] = None
    current_price: Optional[float] = None
    investment_value: float
    current_value: float
    gain_loss: float
    gain_loss_percent: float
    day_change: float
    day_change_percent: float
    weight_in_portfolio: float
    top_holdings: list[str] = []

class Holdings(BaseModel):
    stocks: list[StockHolding]
    mutual_funds: list[MutualFundHolding]

class DaySummary(BaseModel):
    day_change_absolute: float
    day_change_percent: float
    top_gainer: Optional[dict] = None
    top_loser: Optional[dict] = None

class RiskMetrics(BaseModel):
    concentration_risk: bool
    single_stock_max_weight: float
    single_sector_max_weight: float
    beta: float
    volatility: str
    concentration_warning: Optional[str] = None

class PortfolioAnalytics(BaseModel):
    sector_allocation: dict[str, float]
    asset_type_allocation: dict[str, float]
    risk_metrics: RiskMetrics
    day_summary: DaySummary

class Portfolio(BaseModel):
    id: str
    user_id: str
    user_name: str
    portfolio_type: str
    risk_profile: str
    investment_horizon: str
    description: str
    total_investment: float
    current_value: float
    overall_gain_loss: float
    overall_gain_loss_percent: float
    holdings: Holdings
    analytics: PortfolioAnalytics
