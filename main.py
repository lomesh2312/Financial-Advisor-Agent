import logging
import logging.config
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import APP_NAME, APP_VERSION, LOG_LEVEL
from utils.data_loader import DataLoader
from services.market_intelligence import build_market_context
from services.portfolio_analytics import build_portfolio_analysis
from services.advisor_service import generate_advisor_report
from services.evaluation_service import evaluate_advisor_report

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format='%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

data_loader: DataLoader = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global data_loader
    logger.info('Starting %s v%s', APP_NAME, APP_VERSION)
    try:
        data_loader = DataLoader()
    except Exception as e:
        logger.error(f"Critical error loading data: {e}")
    yield
    logger.info('Shutting down %s', APP_NAME)

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description='Production-ready Autonomous Financial Advisor Agent',
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/')
def root():
    return {"app": APP_NAME, "version": APP_VERSION, "status": "active"}

@app.get('/health')
def health():
    if not data_loader:
        return {"status": "error", "message": "DataLoader not initialized"}, 500

    loaded = {
        'market_data': data_loader.get_market_data() is not None,
        'news': len(data_loader.get_news()) > 0,
        'portfolios': len(data_loader.get_portfolios()) > 0,
        'mutual_funds': len(data_loader.get_mutual_funds()) > 0,
        'historical_data': len(data_loader.get_historical_data()) > 0,
        'sector_mapping': data_loader.get_sector_mapping() is not None
    }
    status = 'ok' if all(loaded.values()) else 'degraded'
    return {'status': status, 'data_sources': loaded}

@app.get('/api/advisor-evaluation/{portfolio_id}')
async def get_advisor_evaluation(portfolio_id: str):
    """
    Primary endpoint for the dashboard.
    Returns a unified object containing:
    1. Advisor Report
    2. Evaluation Result
    3. Portfolio Analysis
    4. Market Context
    """
    logger.info(f"Processing evaluation for portfolio: {portfolio_id}")

    try:

        portfolio = data_loader.get_portfolio_by_id(portfolio_id)
        if not portfolio:
            logger.warning(f"Portfolio {portfolio_id} not found")
            raise HTTPException(status_code=404, detail=f"Portfolio {portfolio_id} not found")

        market_context = build_market_context(data_loader)
        portfolio_analysis = build_portfolio_analysis(portfolio)

        report = generate_advisor_report(market_context, portfolio_analysis.model_dump())

        evaluation = evaluate_advisor_report(report)

        return {
            "advisor_report": report,
            "evaluation": evaluation,
            "portfolio_analysis": portfolio_analysis.model_dump(),
            "market_context": market_context
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Internal error in evaluation: {e}", exc_info=True)
        return {
            "error": "Failed to generate evaluation",
            "detail": str(e),
            "advisor_report": {
                "summary": "Error occurred during report generation.",
                "key_drivers": ["System Error"],
                "risks": ["Unable to analyze"],
                "recommendations": ["Try again later"],
                "confidence": "LOW"
            },
            "evaluation": {
                "score": 0,
                "rating": "N/A",
                "feedback": f"System error: {str(e)}"
            }
        }

@app.get('/api/debug/portfolios')
def list_portfolios():
    if not data_loader:
        return []
    return [p.id for p in data_loader.get_portfolios().values()]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
