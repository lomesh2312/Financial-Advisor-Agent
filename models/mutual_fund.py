from typing import Optional
from pydantic import BaseModel, model_validator

class FundReturns(BaseModel):
    one_day: float
    one_week: float
    one_month: float
    three_month: float
    six_month: float
    one_year: float
    three_year_cagr: Optional[float] = None
    five_year_cagr: Optional[float] = None

class FundHolding(BaseModel):
    stock: Optional[str] = None
    issuer: Optional[str] = None
    weight: float
    sector: Optional[str] = None
    rating: Optional[str] = None
    market: Optional[str] = None

class MutualFund(BaseModel):
    scheme_code: str
    scheme_name: str
    amc: str
    category: str
    sub_category: Optional[str] = None
    risk_rating: str
    current_nav: float
    previous_nav: float
    nav_change: float
    nav_change_percent: float
    aum_cr: float
    expense_ratio: float
    benchmark: str
    fund_manager: str
    inception_date: str
    returns: FundReturns
    top_holdings: list[FundHolding] = []
    sector_allocation: dict[str, float] = {}
