import logging
import json
from typing import Dict, Any, Optional
from pydantic import BaseModel
from groq import Groq
from config import GROQ_API_KEY
from services.advisor_service import AdvisorReport
try:
    from services.observability import langfuse
except ImportError:
    langfuse = None

logger = logging.getLogger(__name__)

class EvaluationResult(BaseModel):
    score: float
    rating: str
    feedback: str

EVALUATION_SYSTEM_PROMPT = """
You are a Senior Financial Auditor. Your response must be in valid JSON format.
Your task is to evaluate an Advisor Report for logical depth and factual precision.

---

Evaluate and SUM the following components:
1. News Usage (0–4): Citation of news and logical link to sector performance.
2. Sector Reasoning (0–3): Accuracy of sector-level impact explanation.
3. Portfolio Linkage (0–3): Use of actual numbers (weights, percentages) to link assets to the portfolio.

---

- Excellent Reasoning (Strict causal chain, heavy numbers) → 8.5–10
- Good Reasoning (Structured, uses most data) → 7.0–8.4
- Average Reasoning (Lacks some depth or specific weights) → 5.0–6.9
- Poor Reasoning (Generic, missing causal chain, no numbers) → <5.0

---

- Missing Allocation Numbers: -2 (Crucial: Every point must use % weights).
- Broken Causal Chain: -3 (News -> Sector -> Asset -> Impact).
- Hallucination: -5 (Inventing numbers not in the input).
- Generic Language: -2 (ONLY if used as a filler without supporting data).

---

- DO NOT give all reports the same score.
- Be generous to reports that follow the causal chain and use provided % weights.
- Highlight specific flaws: e.g., "Missed 71.87% banking allocation reference".

Return STRICT JSON ONLY.
"""

EVALUATION_USER_PROMPT = """
Evaluate the following report against the rubric.

ADVISOR REPORT:
{report_json}

JSON FORMAT:
{{
  "score": (float 0.0 - 10.0),
  "rating": "LOW | MEDIUM | HIGH",
  "feedback": "..."
}}
"""

def evaluate_advisor_report(report: AdvisorReport) -> EvaluationResult:
    trace = None
    if langfuse:
        try:
            trace = langfuse.trace(name="advisor-evaluation-v3")
        except Exception: pass

    try:
        client = Groq(api_key=GROQ_API_KEY)
        report_json = json.dumps(report.model_dump(), indent=2)
        user_prompt = EVALUATION_USER_PROMPT.replace("{report_json}", report_json)

        generation = None
        if trace:
            try:
                generation = trace.generation(
                    name="evaluation-llm-v3",
                    model="llama-3.1-8b-instant",
                    input=[{"role": "system", "content": EVALUATION_SYSTEM_PROMPT}, {"role": "user", "content": user_prompt}]
                )
            except Exception: pass

        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": EVALUATION_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.0
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

        score = data.get("score", 0.0)
        if score >= 8.5: data["rating"] = "HIGH"
        elif score >= 7.0: data["rating"] = "MEDIUM-HIGH"
        elif score >= 5.0: data["rating"] = "MEDIUM"
        else: data["rating"] = "LOW"

        result = EvaluationResult(**data)
        if trace: langfuse.flush()
        return result

    except Exception as e:
        logger.error(f"Evaluation v3 Error: {e}")
        return EvaluationResult(
            score=0.0,
            rating="LOW",
            feedback=f"Evaluation failed: {str(e)}"
        )
