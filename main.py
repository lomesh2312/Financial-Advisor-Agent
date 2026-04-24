import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import uvicorn

from utils.data_loader import DataLoader
from services.portfolio_analytics import build_portfolio_analysis
from services.advisor_service import generate_advisor_report
from services.evaluation_service import evaluate_advisor_report

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s | %(levelname)-8s | %(name)s | %(message)s')
logger = logging.getLogger("main")

app = FastAPI(title="Financial Advisor Agent API", version="0.1.2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize global data loader
data_loader = DataLoader()

@app.on_event("startup")
async def startup_event():
    logger.info("Starting Institutional Financial Advisor Agent v0.1.2")

@app.get("/")
async def root():
    return {"app": "Institutional Financial Advisor", "version": "0.1.2", "status": "active"}

@app.get("/api/advisor-evaluation/{portfolio_id}")
async def get_advisor_evaluation(portfolio_id: str):
    logger.info(f"Processing institutional evaluation for portfolio: {portfolio_id}")
    
    try:
        portfolio = data_loader.get_portfolio_by_id(portfolio_id)
        if not portfolio:
            # Try searching keys if not direct match
            all_portfolios = data_loader.get_portfolios()
            if portfolio_id in all_portfolios:
                portfolio = all_portfolios[portfolio_id]
            else:
                raise HTTPException(status_code=404, detail=f"Portfolio {portfolio_id} not found. Available: {list(all_portfolios.keys())}")

        # 1. Quantitative Analysis (Institutional Look-through)
        portfolio_analysis = build_portfolio_analysis(portfolio, data_loader)
        
        # 2. Market Context
        market_data = data_loader.get_market_data()
        market_context = {
            "market_sentiment": market_data.metadata.sentiment if market_data and hasattr(market_data.metadata, 'sentiment') else "NEUTRAL",
            "sector_trends": {k: v.sentiment for k, v in market_data.sector_performance.items()} if market_data else {},
            "news": data_loader.get_news()[:10]
        }

        # 3. Generate Strategic Report
        advisor_report = generate_advisor_report(market_context, portfolio_analysis.dict())

        # 4. Independent Audit
        evaluation = evaluate_advisor_report(advisor_report)

        return {
            "portfolio_id": portfolio_id,
            "portfolio_analysis": portfolio_analysis.dict(),
            "advisor_report": advisor_report.dict(),
            "evaluation": evaluation.dict()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Internal error in evaluation: {e}", exc_info=True)
        return {"error": "Failed to generate evaluation", "detail": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
