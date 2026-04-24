from typing import Optional
from pydantic import BaseModel

class NewsEntities(BaseModel):
    sectors: list[str]
    stocks: list[str]
    indices: list[str]
    keywords: list[str] = []

class NewsArticle(BaseModel):
    id: str
    headline: str
    summary: str
    published_at: str
    source: str
    sentiment: str
    sentiment_score: float
    scope: str
    impact_level: str
    entities: NewsEntities
    causal_factors: list[str]
    conflict_flag: Optional[bool] = False
    conflict_explanation: Optional[str] = None

class NewsData(BaseModel):
    news: list[NewsArticle]
