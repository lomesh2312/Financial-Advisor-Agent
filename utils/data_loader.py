import json
import logging
from pathlib import Path
from typing import Optional
from config import DATA_DIR
from models.market import MarketData, Stock, Index, SectorPerformance, MarketMetadata
from models.news import NewsData, NewsArticle
from models.portfolio import Portfolio
from models.mutual_fund import MutualFund, FundReturns, FundHolding
from models.sector import SectorMapping, Sector, MacroCorrelation
logger = logging.getLogger(__name__)

class DataLoader:

    def __init__(self, data_dir: Path=DATA_DIR):
        self._data_dir = data_dir
        self._market_data: Optional[MarketData] = None
        self._news_data: Optional[NewsData] = None
        self._portfolios: Optional[dict[str, Portfolio]] = None
        self._mutual_funds: Optional[dict[str, MutualFund]] = None
        self._historical_data: Optional[dict] = None
        self._sector_mapping: Optional[SectorMapping] = None
        self._load_all()

    def _read_json(self, filename: str) ->Optional[dict]:
        path = self._data_dir / filename
        if not path.exists():
            logger.warning('Data file not found: %s', path)
            return None
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            logger.error('Invalid JSON in %s: %s', filename, e)
            return None

    def _load_all(self):
        logger.info('Loading all data files from %s', self._data_dir)
        self._load_market_data()
        self._load_news()
        self._load_portfolios()
        self._load_mutual_funds()
        self._load_historical_data()
        self._load_sector_mapping()
        logger.info('All data files loaded successfully')

    def _load_market_data(self):
        raw = self._read_json('market_data.json')
        if raw is None:
            return
        try:
            meta = MarketMetadata(**raw['metadata'])
            indices = {k: Index(**v) for k, v in raw.get('indices', {}).items()
                }
            sector_perf = {k: SectorPerformance(**v) for k, v in raw.get(
                'sector_performance', {}).items()}
            stocks = {}
            for symbol, data in raw.get('stocks', {}).items():
                normalized = {**data, 'symbol': symbol, 'week_52_high':
                    data.pop('52_week_high', None), 'week_52_low': data.pop
                    ('52_week_low', None)}
                try:
                    stocks[symbol] = Stock(**normalized)
                except Exception as e:
                    logger.warning('Skipping stock %s: %s', symbol, e)
            self._market_data = MarketData(metadata=meta, indices=indices,
                sector_performance=sector_perf, stocks=stocks)
            logger.info('market_data.json loaded — %d stocks', len(stocks))
        except Exception as e:
            logger.error('Failed to parse market_data.json: %s', e)

    def _load_news(self):
        raw = self._read_json('news_data.json')
        if raw is None:
            return
        try:
            articles = []
            for item in raw.get('news', []):
                try:
                    articles.append(NewsArticle(**item))
                except Exception as e:
                    logger.warning('Skipping news item %s: %s', item.get(
                        'id'), e)
            self._news_data = NewsData(news=articles)
            logger.info('news_data.json loaded — %d articles', len(articles))
        except Exception as e:
            logger.error('Failed to parse news_data.json: %s', e)

    def _load_portfolios(self):
        raw = self._read_json('portfolios.json')
        if raw is None:
            return
        self._portfolios = {}
        for pid, data in raw.get('portfolios', {}).items():
            try:
                self._portfolios[pid] = Portfolio(id=pid, **data)
            except Exception as e:
                logger.warning('Skipping portfolio %s: %s', pid, e)
        logger.info('portfolios.json loaded — %d portfolios', len(self.
            _portfolios))

    def _load_mutual_funds(self):
        raw = self._read_json('mutual_funds.json')
        if raw is None:
            return
        self._mutual_funds = {}
        for code, data in raw.get('mutual_funds', {}).items():
            try:
                returns_raw = data.pop('returns', {})
                returns = FundReturns(one_day=returns_raw.get('1_day', 0),
                    one_week=returns_raw.get('1_week', 0), one_month=
                    returns_raw.get('1_month', 0), three_month=returns_raw.
                    get('3_month', 0), six_month=returns_raw.get('6_month',
                    0), one_year=returns_raw.get('1_year', 0),
                    three_year_cagr=returns_raw.get('3_year_cagr'),
                    five_year_cagr=returns_raw.get('5_year_cagr'))
                raw_holdings = data.pop('top_holdings', []) or data.pop(
                    'top_equity_holdings', [])
                holdings = []
                for h in raw_holdings:
                    if isinstance(h, dict):
                        holdings.append(FundHolding(**h))
                sector_alloc = data.pop('sector_allocation', {}) or data.pop(
                    'geographic_allocation', {})
                for unused in ('portfolio_characteristics', 'asset_allocation'
                    ):
                    data.pop(unused, None)
                self._mutual_funds[code] = MutualFund(**data, returns=
                    returns, top_holdings=holdings, sector_allocation=
                    sector_alloc)
            except Exception as e:
                logger.warning('Skipping mutual fund %s: %s', code, e)
        logger.info('mutual_funds.json loaded — %d funds', len(self.
            _mutual_funds))

    def _load_historical_data(self):
        raw = self._read_json('historical_data.json')
        if raw is None:
            return
        self._historical_data = raw
        logger.info('historical_data.json loaded')

    def _load_sector_mapping(self):
        raw = self._read_json('sector_mapping.json')
        if raw is None:
            return
        try:
            sectors = {}
            for name, data in raw.get('sectors', {}).items():
                try:
                    sectors[name] = Sector(name=name, **data)
                except Exception as e:
                    logger.warning('Skipping sector %s: %s', name, e)
            macro = {k: MacroCorrelation(**v) for k, v in raw.get(
                'macro_correlations', {}).items()}
            self._sector_mapping = SectorMapping(sectors=sectors,
                macro_correlations=macro, defensive_sectors=raw.get(
                'defensive_sectors', []), cyclical_sectors=raw.get(
                'cyclical_sectors', []), rate_sensitive_sectors=raw.get(
                'rate_sensitive_sectors', []), export_oriented_sectors=raw.
                get('export_oriented_sectors', []))
            logger.info('sector_mapping.json loaded — %d sectors', len(sectors)
                )
        except Exception as e:
            logger.error('Failed to parse sector_mapping.json: %s', e)

    def get_market_data(self) ->Optional[MarketData]:
        return self._market_data

    def get_news(self) ->list[NewsArticle]:
        if self._news_data is None:
            return []
        return self._news_data.news

    def get_portfolios(self) ->dict[str, Portfolio]:
        return self._portfolios or {}

    def get_mutual_funds(self) ->dict[str, MutualFund]:
        return self._mutual_funds or {}

    def get_historical_data(self) ->dict:
        return self._historical_data or {}

    def get_sector_mapping(self) ->Optional[SectorMapping]:
        return self._sector_mapping

    def get_portfolio_by_id(self, portfolio_id: str) ->Optional[Portfolio]:
        portfolios = self.get_portfolios()
        portfolio = portfolios.get(portfolio_id)
        if portfolio is None:
            logger.warning('Portfolio not found: %s', portfolio_id)
        return portfolio

    def get_stock(self, symbol: str) ->Optional[Stock]:
        market = self.get_market_data()
        if market is None:
            return None
        stock = market.stocks.get(symbol)
        if stock is None:
            logger.warning('Stock not found: %s', symbol)
        return stock

    def get_sector_data(self, sector_name: str) ->Optional[Sector]:
        mapping = self.get_sector_mapping()
        if mapping is None:
            return None
        sector = mapping.sectors.get(sector_name)
        if sector is None:
            logger.warning('Sector not found: %s', sector_name)
        return sector
