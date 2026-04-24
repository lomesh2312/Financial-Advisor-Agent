import logging
import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from groq import Groq
from config import GROQ_API_KEY
try:
    from services.observability import langfuse, safe_flush
except ImportError:
    langfuse = None
    def safe_flush(): pass

logger = logging.getLogger(__name__)

class CausalChain(BaseModel):
    event: str
    macro_variable: str
    sector_impact: str
    affected_holdings: str
    estimated_portfolio_impact: float
    confidence: float
    strength: str

class StrategicRecommendation(BaseModel):
    action: str
    current_allocation: float
    target_allocation: float
    shift: float
    reasoning: str
    expected_benefit: str
    tradeoff: str

class SectorIntelligence(BaseModel):
    sector: str
    trend_signal: str
    change_percent: float
    macro_rationale: str
    impact_on_portfolio: str

class AdvisorReport(BaseModel):
    portfolio_id: str
    executive_summary: str
    effective_sector_exposure: Dict[str, float]
    risk_diagnostics: Dict[str, Any]
    causal_driver_chains: List[CausalChain]
    stress_test_scenarios: List[Dict[str, Any]]
    material_risks: List[str]
    strategic_rebalancing_actions: List[StrategicRecommendation]
    sector_intelligence_view: List[SectorIntelligence]
    final_diagnosis: str
    confidence_level: str

ADVISOR_SYSTEM_PROMPT = """You are a Senior Portfolio Strategist / CIO. Generate an institutional-grade risk and intelligence report.
TONE: Concise, analytical, high-signal. Resemble a premium wealth management diagnostic.
NO GENERIC PHRASES like "may impact" or "growing sector". Use quantified economic logic.

REQUIREMENTS:
1. CAUSAL CHAINS: [Event] -> [Macro Var] -> [Sector Impact] -> [Holdings] -> [Impact %] -> [Confidence].
2. LOOK-THROUGH: Use provided effective sector exposure. Do NOT report "Mutual Funds" as a sector.
3. QUANTIFIED ACTIONS: Every rebalance must have Current %, Target %, and Shift % (+/-).
4. RISK DIAGNOSTICS: Refer to HHI, overlap, and sensitivity.
5. STRESS TESTS: Analyze provided scenarios.

JSON SCHEMA:
{
  "portfolio_id": "string",
  "executive_summary": "High-signal CIO summary",
  "effective_sector_exposure": {"SECTOR": float},
  "risk_diagnostics": {"hhi": float, "status": "string", "metrics": "string"},
  "causal_driver_chains": [{"event":"string","macro_variable":"string","sector_impact":"string","affected_holdings":"string","estimated_portfolio_impact":float,"confidence":float,"strength":"WEAK|MEDIUM|STRONG"}],
  "stress_test_scenarios": [{"scenario":"string","impact":float,"vulnerable_holdings":["string"]}],
  "material_risks": ["string"],
  "strategic_rebalancing_actions": [{"action":"string","current_allocation":float,"target_allocation":float,"shift":float,"reasoning":"string","expected_benefit":"string","tradeoff":"string"}],
  "sector_intelligence_view": [{"sector":"string","trend_signal":"BULLISH|BEARISH|NEUTRAL","change_percent":float,"macro_rationale":"string","impact_on_portfolio":"string"}],
  "final_diagnosis": "Final tactical stance",
  "confidence_level": "HIGH|MEDIUM|LOW"
}"""

def generate_advisor_report(market_context: Dict[str, Any], portfolio_analysis: Dict[str, Any]) -> AdvisorReport:
    try:
        client = Groq(api_key=GROQ_API_KEY)
        input_data = {
            "portfolio_id": portfolio_analysis.get("portfolio_id"),
            "stats": {"pnl_pct": portfolio_analysis.get("pnl_percent")},
            "exposure": portfolio_analysis.get("effective_sector_exposure"),
            "risk": portfolio_analysis.get("risk_diagnostics"),
            "stress": portfolio_analysis.get("stress_tests"),
            "market": market_context
        }
        
        # Convert news articles to dicts for JSON serialization
        if "news" in market_context:
            market_context["news"] = [n.dict() if hasattr(n, "dict") else n for n in market_context["news"]]

        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": ADVISOR_SYSTEM_PROMPT},
                {"role": "user", "content": f"Generate Institutional Report for {portfolio_analysis.get('portfolio_id')}:\n{json.dumps(input_data, default=str)}"}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        
        data = json.loads(completion.choices[0].message.content)
        
        # Robustness: Sync some fields from analysis if missing/hallucinated
        data["portfolio_id"] = portfolio_analysis.get("portfolio_id")
        data["effective_sector_exposure"] = portfolio_analysis.get("effective_sector_exposure")
        
        safe_flush()
        return AdvisorReport(**data)
    except Exception as e:
        logger.error(f"Institutional Advisor Error: {e}")
        safe_flush()
        raise e
