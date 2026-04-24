import React from 'react';
import { Compass, BarChart2, Zap, Wind } from 'lucide-react';

interface Props {
  data: any;
}

export const MarketRegime: React.FC<Props> = ({ data }) => {
  const regime = data?.market_regime;
  if (!regime) return null;

  return (
    <div className="terminal-panel">
      <div className="panel-header">Market Regime Analysis</div>
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Compass size={24} />
          </div>
          <div>
            <div className="metric-label">Current Regime</div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>{regime.regime_name}</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div className="metric-label">Regime Bias</div>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: 900, 
              padding: '4px 12px', 
              background: regime.bias === 'Risk-on' ? '#34c759' : '#000', 
              color: '#fff',
              borderRadius: '2px',
              textTransform: 'uppercase'
            }}>
              {regime.bias}
            </div>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: '#000', fontWeight: 500, lineHeight: 1.6, marginBottom: '20px' }}>
          {regime.reasoning}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="terminal-panel" style={{ padding: '12px' }}>
            <div className="metric-label" style={{ marginBottom: '8px' }}>Market Breadth</div>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>{regime.breadth_condition}</div>
          </div>
          <div className="terminal-panel" style={{ padding: '12px' }}>
            <div className="metric-label" style={{ marginBottom: '8px' }}>Volatility (VIX)</div>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>{regime.volatility_condition}</div>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <div className="metric-label" style={{ marginBottom: '8px' }}>Sector Leadership</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {regime.sector_leadership.map((s: string, i: number) => (
              <span key={i} style={{ padding: '4px 10px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
