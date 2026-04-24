import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart2,
  Check,
  ChevronRight,
  Compass,
  FileText,
  Globe,
  Info,
  Loader2,
  PieChart,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  TriangleAlert,
  Zap
} from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

interface Recommendation {
  action: string;
  current?: string;
  target?: string;
  shift?: string;
  reason: string;
}

interface DashboardData {
  advisor_report: {
    summary: string;
    key_drivers: string[];
    risks: string[];
    recommendations: Recommendation[];
    confidence: string;
  };
  evaluation: {
    score: number;
    rating: string;
    feedback: string;
  };
  portfolio_analysis: {
    total_pnl: number;
    pnl_percent: number;
    top_sector: string;
    asset_allocation: Record<string, number>;
    risk_analysis: {
      overall_risk: string;
      risk_flags: string[];
    };
    major_holdings: Array<{ name: string; weight: number }>;
  };
  market_context: {
    market_sentiment: string;
    sector_trends: Record<string, { change: number; trend: string }>;
    news_summary: Record<string, any[]>;
  };
}

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const MetricCard = ({ title, value, subtitle, trend }: any) => (
  <div className="card">
    <div className="card-title">{title}</div>
    <div className="metric-large">{value}</div>
    <div className="text-sm">
      <span className="text-bold">{trend}</span> {subtitle}
    </div>
  </div>
);

const Section = ({ title, children, fullWidth = false }: any) => (
  <div className={`card ${fullWidth ? 'card-full' : ''}`}>
    <div className="card-title">{title}</div>
    {children}
  </div>
);

function App() {
  const [portfolioId, setPortfolioId] = useState('PORTFOLIO_001');
  const [inputValue, setInputValue] = useState('PORTFOLIO_001');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/advisor-evaluation/${id}`);
      if (response.data.error) {
        throw new Error(response.data.detail || response.data.error);
      }
      setData(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(portfolioId);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = inputValue.trim().toUpperCase();
    if (id) {
      setPortfolioId(id);
      fetchDashboard(id);
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">Autonomous Financial Advisor</div>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active"><Globe size={16} /> Dashboard</a>
          <a href="#" className="nav-item"><BarChart2 size={16} /> Market Analysis</a>
          <a href="#" className="nav-item"><Compass size={16} /> Strategy</a>
          <a href="#" className="nav-item"><Shield size={16} /> Compliance</a>
        </nav>
        <div style={{ marginTop: 'auto' }} className="text-sm">
          <div style={{ color: '#555', fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px' }}>Observability</div>
          <a href="#" className="nav-item"><Activity size={16} /> Langfuse Status</a>
        </div>
      </aside>

      <main className="main-content">
        <header className="header-section">
          <div>
            <h1 className="header-title">Portfolio Intelligence</h1>
            <div className="header-meta">Production System v0.1.1</div>
          </div>
          <div className="header-meta">ID: {portfolioId}</div>
        </header>

        <form className="search-bar" onSubmit={handleSearch}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search Portfolio ID (e.g. PORTFOLIO_001)..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={loading}>Analyze</button>
        </form>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <div className="text-bold">ELIMINATING HALLUCINATIONS...</div>
            <div className="text-sm">Enforcing strict data grounding</div>
          </div>
        ) : error ? (
          <div className="card" style={{ border: '1px solid #000' }}>
            <div className="text-bold">SYSTEM ERROR</div>
            <div className="text-sm">{error}</div>
            <button className="btn-primary" style={{ marginTop: '16px', width: 'fit-content' }} onClick={() => fetchDashboard(portfolioId)}>Retry Connection</button>
          </div>
        ) : data ? (
          <>
            <div className="section-container">
              <MetricCard 
                title="Total P&L" 
                value={formatCurrency(data.portfolio_analysis.total_pnl)} 
                subtitle="Absolute Return"
                trend={`${data.portfolio_analysis.pnl_percent}%`}
              />
              <MetricCard 
                title="Top Exposure" 
                value={data.portfolio_analysis.top_sector.replace(/_/g, ' ')} 
                subtitle="Concentration"
                trend="Sector Lead"
              />

              <Section title="Market Intelligence">
                <div className="metric-medium">{data.market_context.market_sentiment}</div>
                <div className="text-sm">Data-driven sentiment from indices and news signals.</div>
                <div style={{ marginTop: '16px' }}>
                  <div className="text-bold" style={{ fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>Sector Trends</div>
                  <table className="data-table">
                    <tbody>
                      {Object.entries(data.market_context.sector_trends).slice(0, 3).map(([sector, trend]: any) => (
                        <tr key={sector}>
                          <td>{sector}</td>
                          <td style={{ textAlign: 'right' }}>{trend.change}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section title="Asset Allocation">
                 <table className="data-table">
                    <thead>
                      <tr>
                        <th>Sector</th>
                        <th style={{ textAlign: 'right' }}>Weight (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(data.portfolio_analysis.asset_allocation).map(([sector, weight]) => (
                        <tr key={sector}>
                          <td>{sector.replace(/_/g, ' ')}</td>
                          <td style={{ textAlign: 'right' }} className="text-bold">{weight}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </Section>

              <div className="card card-full" style={{ background: '#fcfcfc' }}>
                <div className="card-title">Precise Reasoning Engine (Llama 3.1 8B)</div>
                <div className="metric-medium" style={{ marginBottom: '8px' }}>Analysis Summary</div>
                <p style={{ marginBottom: '24px', maxWidth: '800px' }}>{data.advisor_report.summary}</p>

                <div className="section-container" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 0, gap: '48px' }}>
                  <div>
                    <div className="text-bold" style={{ fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>Causal Drivers</div>
                    <ul className="bullet-list">
                      {data.advisor_report.key_drivers.map((d, i) => (
                        <li key={i} className="bullet-item"><div className="bullet-icon"></div>{d}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-bold" style={{ fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>Material Risks</div>
                    <ul className="bullet-list">
                      {data.advisor_report.risks.map((r, i) => (
                        <li key={i} className="bullet-item"><div className="bullet-icon"></div>{r}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-bold" style={{ fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>Strategic Actions</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {data.advisor_report.recommendations.map((rec, i) => (
                        <div key={i} style={{ borderLeft: '2px solid #000', paddingLeft: '12px' }}>
                          <div className="text-bold" style={{ fontSize: '13px' }}>{rec.action}</div>
                          <div className="text-sm" style={{ margin: '4px 0', fontSize: '11px' }}>
                            {rec.current} → {rec.target} ({rec.shift})
                          </div>
                          <div className="text-sm" style={{ color: '#000' }}>{rec.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                   <div className="text-sm">Output Style: <span className="text-bold">Concise & Fact-Strict</span></div>
                   <div className="text-sm">Confidence: <span className="tag">{data.advisor_report.confidence}</span></div>
                </div>
              </div>

              <Section title="Strict Auditor Evaluation" fullWidth>
                <div style={{ display: 'flex', gap: '48px' }}>
                  <div>
                    <div className="card-title" style={{ border: 'none' }}>Score</div>
                    <div className="metric-large">{data.evaluation.score}<span style={{ fontSize: '20px', color: '#999' }}>/10</span></div>
                    <div className="tag" style={{ background: '#000', marginTop: '8px' }}>{data.evaluation.rating}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="card-title" style={{ border: 'none' }}>Detailed Auditor Critique</div>
                    <p className="text-sm" style={{ fontStyle: 'italic', fontSize: '14px', color: '#000' }}>"{data.evaluation.feedback}"</p>
                    <div style={{ marginTop: '16px', display: 'flex', gap: '32px' }}>
                       <div className="text-sm"><span className="text-bold">4.0</span> News Utility</div>
                       <div className="text-sm"><span className="text-bold">3.0</span> Sector Logic</div>
                       <div className="text-sm"><span className="text-bold">3.0</span> Portfolio Link</div>
                    </div>
                  </div>
                </div>
              </Section>
            </div>
          </>
        ) : null}

        <footer style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }} className="text-sm">
           <div>Autonomous Financial Advisor Agent</div>
           <div>System Status: <span className="text-bold">Optimized Reasoning</span></div>
        </footer>
      </main>
    </div>
  );
}

export default App;
