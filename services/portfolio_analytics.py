import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from models.portfolio import Portfolio, StockHolding, MutualFundHolding

logger = logging.getLogger(__name__)

class RiskAnalysis(BaseModel):
    overall_risk: str
    risk_flags: List[str]

class MajorHolding(BaseModel):
    name: str
    weight: float

class PortfolioAnalysis(BaseModel):
    portfolio_id: str
    total_pnl: float
    pnl_percent: float
    top_sector: str
    asset_allocation: Dict[str, float]
    risk_analysis: RiskAnalysis
    major_holdings: List[MajorHolding]

def get_current_nav(mf: MutualFundHolding) -> float:

    nav = mf.current_nav if mf.current_nav is not None else mf.current_price
    return nav if nav is not None else mf.avg_nav

def get_total_current_value(portfolio: Portfolio) -> float:

    total = sum(s.current_price * s.quantity for s in portfolio.holdings.stocks)
    total += sum(get_current_nav(m) * m.units for m in portfolio.holdings.mutual_funds)
    return total

def calculate_pnl(portfolio: Portfolio) -> tuple[float, float]:

    total_pnl = 0.0
    total_investment = 0.0

    for stock in portfolio.holdings.stocks:
        investment = stock.avg_buy_price * stock.quantity
        total_investment += investment
        pnl = (stock.current_price - stock.avg_buy_price) * stock.quantity
        total_pnl += pnl

    for mf in portfolio.holdings.mutual_funds:
        investment = mf.avg_nav * mf.units
        total_investment += investment
        pnl = (get_current_nav(mf) - mf.avg_nav) * mf.units
        total_pnl += pnl

    pnl_percent = (total_pnl / total_investment * 100) if total_investment > 0 else 0.0

    return round(total_pnl, 2), round(pnl_percent, 2)

def compute_asset_allocation(portfolio: Portfolio) -> Dict[str, float]:

    sector_values = {}
    total_current_value = get_total_current_value(portfolio)

    for stock in portfolio.holdings.stocks:
        sector = stock.sector.upper()
        val = stock.current_price * stock.quantity
        sector_values[sector] = sector_values.get(sector, 0.0) + val

    for mf in portfolio.holdings.mutual_funds:
        sector = "MUTUAL_FUNDS"
        val = get_current_nav(mf) * mf.units
        sector_values[sector] = sector_values.get(sector, 0.0) + val

    if total_current_value == 0:
        return {}

    allocation = {sector: round((val / total_current_value) * 100, 2) for sector, val in sector_values.items()}
    return allocation

def detect_risk(allocation: Dict[str, float], portfolio: Portfolio) -> RiskAnalysis:

    risk_flags = []
    max_sector_alloc = 0.0

    for sector, pct in allocation.items():
        if pct > max_sector_alloc:
            max_sector_alloc = pct

        if pct > 40:
            risk_flags.append(f"High {sector.lower()} exposure")

    if max_sector_alloc > 40:
        overall_risk = "HIGH"
    elif max_sector_alloc > 25:
        overall_risk = "MODERATE"
    else:
        overall_risk = "LOW"

    total_current_value = get_total_current_value(portfolio)

    for stock in portfolio.holdings.stocks:
        val = stock.current_price * stock.quantity
        weight = (val / total_current_value * 100) if total_current_value > 0 else 0.0
        if weight > 20:
            risk_flags.append(f"Overexposed to {stock.symbol}")
            risk_flags.append("Overexposed to single stock")

    if len(allocation) < 4:
        risk_flags.append("Poor diversification")

    return RiskAnalysis(overall_risk=overall_risk, risk_flags=list(set(risk_flags)))

def get_major_holdings(portfolio: Portfolio) -> List[MajorHolding]:

    all_holdings = []
    total_current_value = get_total_current_value(portfolio)

    for stock in portfolio.holdings.stocks:
        val = stock.current_price * stock.quantity
        weight = (val / total_current_value * 100) if total_current_value > 0 else 0.0
        all_holdings.append(MajorHolding(name=stock.name, weight=round(weight, 2)))

    for mf in portfolio.holdings.mutual_funds:
        val = get_current_nav(mf) * mf.units
        weight = (val / total_current_value * 100) if total_current_value > 0 else 0.0
        all_holdings.append(MajorHolding(name=mf.scheme_name, weight=round(weight, 2)))

    all_holdings.sort(key=lambda x: x.weight, reverse=True)

    return all_holdings[:5]

def build_portfolio_analysis(portfolio: Portfolio) -> PortfolioAnalysis:

    total_pnl, pnl_percent = calculate_pnl(portfolio)
    allocation = compute_asset_allocation(portfolio)

    top_sector = "NONE"
    if allocation:
        top_sector = max(allocation, key=allocation.get)

    risk_analysis = detect_risk(allocation, portfolio)
    major_holdings = get_major_holdings(portfolio)

    return PortfolioAnalysis(
        portfolio_id=portfolio.id,
        total_pnl=total_pnl,
        pnl_percent=pnl_percent,
        top_sector=top_sector,
        asset_allocation=allocation,
        risk_analysis=risk_analysis,
        major_holdings=major_holdings
    )
