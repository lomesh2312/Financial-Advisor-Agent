from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, field_validator

# Phase 1: Institutional Report Schema Design
# This schema defines the structural requirements for a professional wealth management report.

class PortfolioHealthScores(BaseModel):
    health_score: float = Field(..., ge=0, le=100, description="Overall health of the portfolio")
    risk_score_numeric: float = Field(..., ge=0, le=10, description="Quantitative risk assessment (0-10)")
    risk_rating: str = Field(..., description="Qualitative risk bucket: Low, Moderate, High")
    diversification_score: float = Field(..., ge=0, le=100, description="Asset and sector variety metric")
    sentiment_score: float = Field(..., ge=-1, le=1, description="Aggregated market sentiment")
    confidence_score: float = Field(..., ge=0, le=1, description="AI confidence in the provided analysis")

class ExecutiveSummary(BaseModel):
    total_value: float = Field(..., description="Aggregated market value in currency")
    total_pnl_abs: float = Field(..., description="Absolute profit or loss")
    total_pnl_pct: float = Field(..., description="Percentage profit or loss")
    scores: PortfolioHealthScores
    key_positives: List[str] = Field(..., min_length=3, max_length=3, description="3 critical strengths")
    key_risks: List[str] = Field(..., min_length=3, max_length=3, description="3 critical vulnerabilities")
    one_line_diagnosis: str = Field(..., description="A single sentence professional diagnostic")

class SectorExposure(BaseModel):
    sector_name: str
    weight_pct: float
    risk_contribution_pct: float
    trend_signal: str = Field(..., description="Bullish, Neutral, or Bearish")
    concentration_flag: bool
    is_defensive: bool

class EffectiveExposure(BaseModel):
    direct_equity_exposure: Dict[str, float] = Field(..., description="Direct stock holdings by sector")
    indirect_mf_exposure: Dict[str, float] = Field(..., description="Underlying fund holdings decomposed by sector")
    combined_effective_exposure: List[SectorExposure] = Field(..., description="Aggregated look-through exposure")
    top_sectors: List[str]
    defensive_vs_cyclical_ratio: float = Field(..., description="Ratio of defensive assets to cyclical assets")
    domestic_vs_intl_ratio: float = Field(..., description="Geographic distribution ratio")

class HoldingAnalysis(BaseModel):
    holding_name: str
    allocation_pct: float
    role: str = Field(..., description="Core, Satellite, or Tactical")
    return_contribution: float
    risk_contribution: float
    sector_linkage: List[str]
    overlap_notes: Optional[str] = None
    valuation_note: str

class RiskDiagnostic(BaseModel):
    severity: str = Field(..., description="Low, Medium, High, or Critical")
    risk_type: str = Field(..., description="Concentration, Sector, Factor, Overlap, Style, or Liquidity")
    explanation: str
    evidence: str
    metrics: Dict[str, Any] = Field(..., description="Quantitative proof (e.g., HHI Score, Beta)")

class CausalNode(BaseModel):
    event: str = Field(..., description="Specific news or macro event")
    macro_impact: str = Field(..., description="Causal transmission to economic variables")
    affected_sectors: List[str]
    affected_holdings: List[str]
    estimated_portfolio_impact_pct: float
    confidence_level: float = Field(..., ge=0, le=1)
    transmission_strength: str = Field(..., description="Weak, Moderate, or Strong")

class MarketRegime(BaseModel):
    regime_name: str
    bias: str = Field(..., description="Risk-on, Risk-off, or Defensive")
    sector_leadership: List[str]
    breadth_condition: str
    volatility_condition: str
    reasoning: str

class StressScenario(BaseModel):
    scenario_name: str
    description: str
    projected_impact_pct: float
    vulnerable_assets: List[str]

class StrategicRecommendation(BaseModel):
    action: str = Field(..., description="The specific trade or adjustment")
    category: str = Field(..., description="Risk Reduction, Return Enhancement, or Diversification")
    current_allocation_pct: float
    target_allocation_pct: float
    suggested_shift_pct: float
    reasoning: str
    expected_benefit: str
    tradeoff: str = Field(..., description="What is being sacrificed for this benefit")

class FinalDiagnosis(BaseModel):
    verdict: str
    prioritized_actions: List[str] = Field(..., min_length=3, max_length=3)

class InstitutionalAdvisorReport(BaseModel):
    executive_summary: ExecutiveSummary
    effective_exposure: EffectiveExposure
    holdings_analysis: List[HoldingAnalysis]
    risk_diagnostics: List[RiskDiagnostic]
    causal_chains: List[CausalNode]
    market_regime: MarketRegime
    stress_test_scenarios: List[StressScenario]
    recommendations: List[StrategicRecommendation]
    optimization_ideas: List[str]
    final_diagnosis: FinalDiagnosis
