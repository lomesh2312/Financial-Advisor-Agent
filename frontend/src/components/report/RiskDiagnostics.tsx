import React from 'react';
import { AlertTriangle, ShieldAlert, Activity, Layers } from 'lucide-react';

interface Props {
  data: any;
}

export const RiskDiagnostics: React.FC<Props> = ({ data }) => {
  const risks = data?.risk_diagnostics;
  if (!risks) return null;

  const getSeverityClass = (sev: string) => {
    switch(sev.toLowerCase()) {
      case 'critical': return 'badge-critical';
      case 'high': return 'badge-high';
      case 'medium': return 'badge-med';
      default: return 'badge-low';
    }
  };

  return (
    <div className="terminal-panel">
      <div className="panel-header">Risk Diagnostic Engine</div>
      
      <div style={{ padding: '16px' }}>
        {risks.map((risk: any, i: number) => (
          <div key={i} className="metric-card" style={{ padding: '20px', marginBottom: '16px', border: '1px solid var(--border)', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <ShieldAlert size={18} color={risk.severity === 'Critical' ? '#000' : '#ff3b30'} />
                <span style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase' }}>{risk.risk_type}</span>
              </div>
              <span className={`badge ${getSeverityClass(risk.severity)}`}>{risk.severity}</span>
            </div>

            <p style={{ fontSize: '13px', color: '#000', lineHeight: 1.5, marginBottom: '12px', fontWeight: 500 }}>
              {risk.explanation}
            </p>

            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderLeft: '3px solid #000', marginBottom: '12px' }}>
              <div className="metric-label">Evidence & Logic</div>
              <p style={{ fontSize: '11px', color: '#555', margin: 0 }}>{risk.evidence}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '16px' }}>
              {Object.entries(risk.metrics || {}).map(([key, val]: [string, any]) => (
                <div key={key}>
                  <div className="metric-label">{key.replace('_', ' ')}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Global Risk Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div className="terminal-panel" style={{ padding: '12px', textAlign: 'center' }}>
            <Activity size={16} style={{ marginBottom: '8px' }} />
            <div className="metric-label">Beta</div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>0.92</div>
          </div>
          <div className="terminal-panel" style={{ padding: '12px', textAlign: 'center' }}>
            <Layers size={16} style={{ marginBottom: '8px' }} />
            <div className="metric-label">HHI Index</div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>2480</div>
          </div>
          <div className="terminal-panel" style={{ padding: '12px', textAlign: 'center' }}>
            <AlertTriangle size={16} style={{ marginBottom: '8px' }} />
            <div className="metric-label">Vol (1Y)</div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>14.2%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
