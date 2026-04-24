import logging
import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from groq import Groq
from config import GROQ_API_KEY
try:
    from services.observability import langfuse
except ImportError:
    langfuse = None

logger = logging.getLogger(__name__)

class Recommendation(BaseModel):
    action: str
    current: Optional[str] = "N/A"
    target: Optional[str] = "N/A"
    shift: Optional[str] = "N/A"
    reason: str

class AdvisorReport(BaseModel):
    summary: str
    key_drivers: List[str]
    risks: List[str]
    recommendations: List[Recommendation]
    confidence: str

ADVISOR_SYSTEM_PROMPT = """
You are a Senior Portfolio Strategist. Your response must be in valid JSON format.
Your goal is to generate a logically precise, data-grounded, and numbers-heavy portfolio analysis.

---

1. NO HALLUCINATION
- ONLY use the provided input data. DO NOT invent weights, exposures, or numbers.
- If data is missing (e.g., a specific stock's weight), say: "Data not available".

2. ALWAYS USE NUMBERS
- NEVER use qualitative statements alone. 
- ❌ BAD: "High banking exposure."
- ✅ GOOD: "Banking exposure is 71.87%, which dominates the portfolio risk."
- Reference actual holding weights from 'major_holdings' and allocation % from 'asset_allocation'.

3. MANDATORY CAUSAL CHAIN
- Every driver MUST follow: [News] → [Sector Impact %] → [Specific Holding + weight] → [Portfolio Effect].
- If no direct stock exposure: "No direct exposure, only indirect via mutual funds (X%)".

4. MUTUAL FUND REASONING
- NEVER assume internal fund holdings.
- Use: "indirect exposure", "broad sector linkage".
- Example: "61.92% in mutual funds → likely indirect exposure to banking → amplifies sector risk."

5. PROFESSIONAL VOCABULARY
- Terms like "bearish", "hawkish", "volatility", and "headwinds" are VALID if backed by numbers.
- Do NOT use them as filler; connect them to specific data points.

---

1. Analysis Summary (2-3 lines max):
- MUST include: Total P&L %, Top sector exposure %, and main sector trend.

2. Causal Drivers (2-4 points):
- Format: [News Signal] → [Sector Trend %] → [Holding/Fund + weight] → [Resulting Portfolio Impact].

3. Material Risks (2-3 points):
- MUST include specific % values and data-backed threats. No vague "high risk".

4. Strategic Actions (2-3 points):
- Format: [Sector/Holding] | [Current %] → [Target %] ([Change %]) | [Reason based on data].

5. Confidence:
- LOW / MEDIUM / HIGH based on the clarity of data linkages.
"""

ADVISOR_USER_PROMPT = """
Analyze the following data for Portfolio {portfolio_id}.

- Market Context: {market_context}
- Portfolio Analysis: {portfolio_analysis}

{{
  "summary": "P&L [X]% | Top Exposure [Y]% ([Sector]) | Main Trend: [Sentiment]",
  "key_drivers": ["..."],
  "risks": ["..."],
  "recommendations": [
    {{
      "action": "Increase/Reduce [Sector/Asset]",
      "current": "[X]%",
      "target": "[Y]%",
      "shift": "[Z]%",
      "reason": "..."
    }}
  ],
  "confidence": "..."
}}
"""

def get_fallback_report(error_msg: str) -> AdvisorReport:
    return AdvisorReport(
        summary=f"Analysis engine error: {error_msg}",
        key_drivers=["System interruption"],
        risks=["Data processing failed"],
        recommendations=[Recommendation(action="Retry", reason="API Error")],
        confidence="LOW"
    )

def generate_advisor_report(market_context: Dict[str, Any], portfolio_analysis: Dict[str, Any]) -> AdvisorReport:
    trace = None
    if langfuse:
        try:
            trace = langfuse.trace(
                name="advisor-report-v3",
                metadata={
                    "portfolio_id": portfolio_analysis.get("portfolio_id"),
                    "model": "llama-3.1-8b-instant"
                }
            )
        except Exception: pass

    try:
        logger.info(f"Generating report for portfolio_analysis: {portfolio_analysis}")
        if portfolio_analysis is None:
            raise ValueError("portfolio_analysis input is None")

        client = Groq(api_key=GROQ_API_KEY)

        user_prompt = ADVISOR_USER_PROMPT.replace("{portfolio_id}", str(portfolio_analysis.get("portfolio_id", "unknown")))
        user_prompt = user_prompt.replace("{market_context}", json.dumps(market_context))
        user_prompt = user_prompt.replace("{portfolio_analysis}", json.dumps(portfolio_analysis))

        generation = None
        if trace:
            try:
                generation = trace.generation(
                    name="advisor-llm-v3",
                    model="llama-3.1-8b-instant",
                    input=[{"role": "system", "content": ADVISOR_SYSTEM_PROMPT}, {"role": "user", "content": user_prompt}]
                )
            except Exception: pass

        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": ADVISOR_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )

        response_content = completion.choices[0].message.content
        if generation:
            generation.end(output=response_content)

        response_content = response_content.strip()
        if response_content.startswith("```json"):
            response_content = response_content[7:-3].strip()
        elif response_content.startswith("```"):
            response_content = response_content[3:-3].strip()
        data = json.loads(response_content)

        for field in ["key_drivers", "risks"]:
            if field in data and isinstance(data[field], list):
                new_list = []
                for item in data[field]:
                    if isinstance(item, dict):

                        new_list.append(" | ".join([f"{k}: {v}" for k, v in item.items()]))
                    else:
                        new_list.append(str(item))
                data[field] = new_list

        recs = []
        for r in data.get("recommendations", []):
            if isinstance(r, dict):
                recs.append(Recommendation(**r))
            else:
                recs.append(Recommendation(action=str(r), reason="Strategic adjustment"))
        data["recommendations"] = recs

        report = AdvisorReport(**data)
        if trace: langfuse.flush()
        return report

    except Exception as e:
        import traceback
        logger.error(f"Advisor v3 Error: {e}\n{traceback.format_exc()}")
        if trace:
            trace.event(name="error", metadata={"error": str(e)})
            langfuse.flush()
        return get_fallback_report(str(e))
