import logging
from typing import Dict, List, Any
from models.market import MarketData
from models.news import NewsArticle
logger = logging.getLogger(__name__)

def calculate_market_sentiment(market_data: MarketData) ->str:
    if not market_data or not market_data.indices:
        return 'NEUTRAL'

    def get_sentiment(change: float) ->str:
        if change < -0.5:
            return 'BEARISH'
        elif change > 0.5:
            return 'BULLISH'
        return 'NEUTRAL'
    nifty = market_data.indices.get('NIFTY50')
    sensex = market_data.indices.get('SENSEX')
    if not nifty or not sensex:
        return 'NEUTRAL'
    nifty_sent = get_sentiment(nifty.change_percent)
    sensex_sent = get_sentiment(sensex.change_percent)
    if nifty_sent == 'BULLISH' and sensex_sent == 'BULLISH':
        return 'BULLISH'
    if nifty_sent == 'BEARISH' and sensex_sent == 'BEARISH':
        return 'BEARISH'
    return 'NEUTRAL'

def extract_sector_trends(market_data: MarketData) ->Dict[str, Any]:
    trends = {}
    if not market_data or not market_data.sector_performance:
        return trends
    for sector_name, perf in market_data.sector_performance.items():
        trends[sector_name] = {'change': perf.change_percent, 'trend': perf
            .sentiment}
    return trends

def process_news(news_articles: List[NewsArticle], sectors: List[str]) ->Dict[
    str, List[Dict[str, Any]]]:
    news_summary = {sector: [] for sector in sectors}
    for article in news_articles:
        summary_item = {'id': article.id, 'headline': article.headline,
            'sentiment': article.sentiment, 'impact': article.impact_level}
        news_sectors = article.entities.sectors
        for sector in news_sectors:
            if sector in news_summary:
                news_summary[sector].append(summary_item)
    return news_summary

def build_market_context(data_loader) ->Dict[str, Any]:
    market_data = data_loader.get_market_data()
    news_data = data_loader.get_news()
    sector_mapping = data_loader.get_sector_mapping()
    sectors = list(sector_mapping.sectors.keys()) if sector_mapping else []
    context = {'market_sentiment': calculate_market_sentiment(market_data),
        'sector_trends': extract_sector_trends(market_data), 'news_summary':
        process_news(news_data, sectors)}
    return context
