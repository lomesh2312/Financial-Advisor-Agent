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
  Zap,
  Target,
  AlertOctagon,
  BrainCircuit,
  Scale,
  Waves
} from 'lucide-react';
import axios from 'axios';

const API_BASE = 'https://financial-advisor-backend-lomesh.onrender.com/api';

interface DashboardData {
  portfolio_id: string;
  portfolio_analysis: {
    total_pnl: number;
    pnl_percent: number;
    top_sector: string;
    effective_sector_exposure: Record<string, number>;
    risk_diagnostics: {
      hhi: number;
      hhi_status: string;
      overlap_risk: string;
      beta_sensitivity: number;
      rate_sensitivity: string;
      sector_concentration_risk: string;
    };
    stress_tests: Array<{ scenario: string; impact_percent: number; vulnerable_holdings: string[]; drawdown_estimate: string }>;
    major_holdings: Array<{ name: string; weight: number }>;
  };
  advisor_report: {
    executive_summary: string;
    causal_driver_chains: Array<{ event: string; macro_variable: string; sector_impact: string; affected_holdings: string; estimated_portfolio_impact: number; confidence: number; strength: string }>;
    strategic_rebalancing_actions: Array<{ action: string; current_allocation: number; target_allocation: number; shift: number; reasoning: string; expected_benefit: string; tradeoff: string }>;
    sector_intelligence_view: Array<{ sector: string; trend_signal: string; change_percent: number; macro_rationale: string; impact_on_portfolio: string }>;
    final_diagnosis: string;
    confidence_level: string;
  };
  evaluation: {
    score: number;
    rating: string;
    feedback: string;
  };
}

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const MetricCard = ({ title, value, subtitle, color = "#000" }: any) => (
  <div className="card" style={{ borderLeft: `4px solid ${color}` }}>
    <div className="card-title" style={{ fontSize: '10px', textTransform: 'uppercase', color: '#666' }}>{title}</div>
    <div className="metric-large" style={{ color: color }}>{value}</div>
    <div className="text-sm" style={{ color: '#888' }}>{subtitle}</div>
  </div>
);

const SectionHeader = ({ title, icon: Icon }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
    {Icon && <Icon size={20} color="#000" />}
    <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{title}</h2>
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
      if (response.data.error) throw new Error(response.data.detail);
      setData(response.data);
    } catch (err: any) {
      setError(err.message || "Institutional Node Offline");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(portfolioId); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = inputValue.trim().toUpperCase();
    if (id) { setPortfolioId(id); fetchDashboard(id); }
  };

  return (
    <div className="app-container">
      <nav className="sidebar" style={{ background: '#0a0a0a' }}>
        <div className="sidebar-header">
          <div className="sidebar-title" style={{ color: '#fff', letterSpacing: '2px' }}>ANTIGRAVITY.CIO</div>
        </div>
        <div style={{ padding: '20px', color: '#555', fontSize: '11px' }}>INSTITUTIONAL TERMINAL</div>
        <div className="sidebar-nav">
          <button className={`nav-item active`} style={{ color: '#fff' }}><Activity size={16} /> Risk Engine</button>
          <button className="nav-item"><Waves size={16} /> Stress Test</button>
          <button className="nav-item"><Scale size={16} /> Rebalancer</button>
        </div>
      </nav>

      <main className="main-content">
        <header className="header-section" style={{ borderBottom: '2px solid #000', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>Institutional Risk Intelligence v0.1.4</h1>
            <div style={{ color: '#666', fontSize: '13px' }}>Wealth Management Diagnostic • Real-time</div>
          </div>
          <form className="search-bar" onSubmit={handleSearch} style={{ margin: 0 }}>
            <input className="input-field" placeholder="PORTFOLIO_ID" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            <button type="submit" className="btn-primary" disabled={loading}>Analyze</button>
          </form>
        </header>

        {loading ? (
          <div className="loading-container">
            <Loader2 className="spinner" size={48} color="#000" />
            <div style={{ marginTop: '20px', fontWeight: 600, letterSpacing: '1px' }}>DECOMPOSING MULTI-ASSET HOLDINGS...</div>
          </div>
        ) : error ? (
          <div className="card" style={{ borderColor: '#ff4d4f', background: '#fff1f0' }}>
            <div style={{ color: '#cf1322', fontWeight: 700 }}>DIAGNOSTIC FAILURE</div>
            <p>{error}</p>
            <button className="btn-primary" onClick={() => fetchDashboard(portfolioId)}>Retry Connection</button>
          </div>
        ) : data ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Top Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              <MetricCard title="Net P&L" value={formatCurrency(data.portfolio_analysis.total_pnl)} subtitle={`${data.portfolio_analysis.pnl_percent}% Performance`} color="#000" />
              <MetricCard title="HHI Index" value={data.portfolio_analysis.risk_diagnostics.hhi} subtitle={data.portfolio_analysis.risk_diagnostics.hhi_status} color={data.portfolio_analysis.risk_diagnostics.hhi > 2500 ? "#cf1322" : "#000"} />
              <MetricCard title="Beta Sensitivity" value={data.portfolio_analysis.risk_diagnostics.beta_sensitivity} subtitle="Systemic Exposure" color="#000" />
              <MetricCard title="Risk Tier" value={data.evaluation.rating} subtitle={`Audit Score: ${data.evaluation.score}/10`} color={data.evaluation.rating === 'HIGH' ? '#27ae60' : '#faad14'} />
            </div>

            {/* Executive Summary */}
            <div className="card" style={{ background: '#fcfcfc', border: '1px solid #ddd' }}>
              <SectionHeader title="Executive CIO Summary" icon={FileText} />
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#222', fontWeight: 400 }}>{data.advisor_report.executive_summary}</p>
            </div>

            {/* Effective Exposure & Risk */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
              <div className="card">
                <SectionHeader title="Effective Sector Exposure (Look-through)" icon={BarChart2} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {Object.entries(data.portfolio_analysis.effective_sector_exposure).map(([s, w]) => (
                    <div key={s}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                        <span style={{ fontWeight: 600 }}>{s}</span>
                        <span>{w}%</span>
                      </div>
                      <div style={{ height: '8px', background: '#f0f0f0', borderRadius: '4px' }}>
                        <div style={{ height: '100%', background: '#000', width: `${w}%`, borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <SectionHeader title="Risk Diagnostics" icon={ShieldAlert} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="tag" style={{ justifyContent: 'space-between', padding: '10px', background: '#f9f9f9', width: '100%' }}>
                    <span>Overlap Risk</span><span style={{ fontWeight: 700 }}>{data.portfolio_analysis.risk_diagnostics.overlap_risk}</span>
                  </div>
                  <div className="tag" style={{ justifyContent: 'space-between', padding: '10px', background: '#f9f9f9', width: '100%' }}>
                    <span>Rate Sensitivity</span><span style={{ fontWeight: 700 }}>{data.portfolio_analysis.risk_diagnostics.rate_sensitivity}</span>
                  </div>
                  <div className="tag" style={{ justifyContent: 'space-between', padding: '10px', background: '#f9f9f9', width: '100%' }}>
                    <span>Concentration</span><span style={{ fontWeight: 700 }}>{data.portfolio_analysis.risk_diagnostics.sector_concentration_risk}</span>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <div className="text-bold" style={{ fontSize: '11px', marginBottom: '8px' }}>MATERIAL RISKS</div>
                    {data.advisor_report.material_risks.map((r, i) => (
                      <div key={i} style={{ fontSize: '12px', color: '#555', marginBottom: '5px', display: 'flex', gap: '8px' }}>
                        <AlertOctagon size={12} color="#cf1322" /> {r}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Causal Reasoning Chains */}
            <div className="card">
              <SectionHeader title="Causal Driver Chains" icon={BrainCircuit} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {data.advisor_report.causal_driver_chains.map((chain, i) => (
                  <div key={i} style={{ padding: '20px', background: '#fcfcfc', border: '1px solid #eee', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ background: '#000', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>{chain.strength}</div>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{chain.event}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', textAlign: 'center', fontSize: '11px' }}>
                      <div style={{ background: '#fff', padding: '8px', border: '1px solid #eee' }}>
                        <div style={{ color: '#888', marginBottom: '4px' }}>MACO VAR</div>
                        <div className="text-bold">{chain.macro_variable}</div>
                      </div>
                      <div style={{ background: '#fff', padding: '8px', border: '1px solid #eee' }}>
                        <div style={{ color: '#888', marginBottom: '4px' }}>SECTOR</div>
                        <div className="text-bold">{chain.sector_impact}</div>
                      </div>
                      <div style={{ background: '#fff', padding: '8px', border: '1px solid #eee' }}>
                        <div style={{ color: '#888', marginBottom: '4px' }}>HOLDINGS</div>
                        <div className="text-bold">{chain.affected_holdings}</div>
                      </div>
                      <div style={{ background: '#fff', padding: '8px', border: '1px solid #eee' }}>
                        <div style={{ color: '#888', marginBottom: '4px' }}>IMPACT</div>
                        <div className="text-bold" style={{ color: chain.estimated_portfolio_impact < 0 ? '#cf1322' : '#27ae60' }}>{chain.estimated_portfolio_impact}%</div>
                      </div>
                      <div style={{ background: '#fff', padding: '8px', border: '1px solid #eee' }}>
                        <div style={{ color: '#888', marginBottom: '4px' }}>CONFIDENCE</div>
                        <div className="text-bold">{(chain.confidence * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stress Tests & Rebalancing */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="card">
                <SectionHeader title="Scenario Stress Tests" icon={Zap} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {data.portfolio_analysis.stress_tests.map((test, i) => (
                    <div key={i} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px' }}>{test.scenario}</span>
                        <span style={{ color: '#cf1322', fontWeight: 700 }}>{test.impact_percent}%</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{test.drawdown_estimate}</div>
                      <div style={{ marginTop: '8px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {test.vulnerable_holdings.map(h => <span key={h} className="tag" style={{ fontSize: '9px' }}>{h}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <SectionHeader title="Strategic Rebalancing Actions" icon={Target} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {data.advisor_report.strategic_rebalancing_actions.map((action, i) => (
                    <div key={i} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontWeight: 700 }}>{action.action}</span>
                        <span style={{ fontWeight: 700, color: action.shift < 0 ? '#cf1322' : '#27ae60' }}>{action.shift > 0 ? '+' : ''}{action.shift}%</span>
                      </div>
                      <div style={{ display: 'flex', gap: '15px', fontSize: '11px', color: '#888', marginBottom: '10px' }}>
                        <span>Current: {action.current_allocation}%</span>
                        <span>Target: {action.target_allocation}%</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#444', marginBottom: '8px' }}>{action.reasoning}</div>
                      <div style={{ fontSize: '11px', background: '#f9f9f9', padding: '8px', borderRadius: '4px' }}>
                        <div style={{ color: '#27ae60' }}>Benefit: {action.expected_benefit}</div>
                        <div style={{ color: '#faad14' }}>Tradeoff: {action.tradeoff}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Final Diagnosis */}
            <div className="card" style={{ background: '#000', color: '#fff' }}>
              <SectionHeader title="Final Tactical Diagnosis" icon={ShieldCheck} />
              <p style={{ fontSize: '18px', fontWeight: 300, lineHeight: '1.6', color: '#ccc' }}>{data.advisor_report.final_diagnosis}</p>
              <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #333', display: 'inline-block', fontSize: '12px' }}>
                CONFIDENCE: <span style={{ fontWeight: 700 }}>{data.advisor_report.confidence_level}</span>
              </div>
            </div>

          </div>
        ) : null}
      </main>
    </div>
  );
}

export default App;
