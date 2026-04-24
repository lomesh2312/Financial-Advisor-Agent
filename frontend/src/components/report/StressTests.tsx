import React from 'react';
import { Thermometer, AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';

interface Props {
  data: any;
}

export const StressTests: React.FC<Props> = ({ data }) => {
  const scenarios = data?.stress_test_scenarios;
  if (!scenarios) return null;

  return (
    <div className="terminal-panel">
      <div className="panel-header">Institutional Stress Test Scenarios</div>
      
      <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {scenarios.map((scenario: any, i: number) => {
          const isNegative = scenario.projected_impact_pct < 0;
          return (
            <div key={i} className="terminal-panel" style={{ padding: '16px', borderLeft: `4px solid ${isNegative ? '#ff3b30' : '#34c759'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, maxWidth: '70%' }}>{scenario.scenario_name}</div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 900, 
                  color: isNegative ? '#ff3b30' : '#34c759' 
                }}>
                  {isNegative ? '' : '+'}{scenario.projected_impact_pct}%
                </div>
              </div>

              <p style={{ fontSize: '11px', color: '#555', lineHeight: 1.4, marginBottom: '16px', height: '32px', overflow: 'hidden' }}>
                {scenario.description}
              </p>

              <div className="metric-label" style={{ fontSize: '9px', marginBottom: '8px' }}>Vulnerable Assets</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {scenario.vulnerable_assets.map((asset: string, idx: number) => (
                  <span key={idx} style={{ padding: '1px 6px', background: '#f0f0f0', borderRadius: '2px', fontSize: '9px', fontWeight: 600 }}>
                    {asset}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Probability Distribution Placeholder */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)', background: '#fcfcfc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Thermometer size={14} />
          <div className="metric-label">Monte Carlo Estimated Tail Risk (VaR 95%)</div>
        </div>
        <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '15%', width: '70%', height: '100%', background: '#ccc' }} />
          <div style={{ position: 'absolute', left: '45%', width: '4px', height: '100%', background: '#000' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '9px', fontWeight: 700, color: '#888' }}>
          <span>-12.4% (Max Drawdown)</span>
          <span>+4.2% (Mean)</span>
          <span>+18.1% (Upside)</span>
        </div>
      </div>
    </div>
  );
};
