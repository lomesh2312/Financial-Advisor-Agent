import React from 'react';
import { TrendingUp, TrendingDown, Shield, Zap, Target, BarChart3 } from 'lucide-react';

interface Props {
  data: any;
}

export const SummaryPanel: React.FC<Props> = ({ data }) => {
  const summary = data?.executive_summary;
  const scores = summary?.scores;

  if (!summary) return null;

  return (
    <div className="terminal-panel">
      <div className="panel-header">Portfolio Executive Summary</div>
      
      {/* Primary Value Metrics */}
      <div className="metric-card">
        <div className="metric-label">Market Value</div>
        <div className="metric-value">
          ${summary.total_value?.toLocaleString()}
        </div>
        <div style={{ fontSize: '12px', marginTop: '4px', fontWeight: 700, color: summary.total_pnl_abs >= 0 ? '#34c759' : '#ff3b30' }}>
          {summary.total_pnl_abs >= 0 ? '▲' : '▼'} ${Math.abs(summary.total_pnl_abs).toLocaleString()} ({summary.total_pnl_pct}%)
        </div>
      </div>

      {/* Institutional Health Scores */}
      <div className="metric-card" style={{ background: '#000', color: '#fff' }}>
        <div className="metric-label" style={{ color: '#aaa' }}>Health Score</div>
        <div className="metric-value" style={{ color: '#fff' }}>{scores?.health_score}/100</div>
        <div style={{ fontSize: '10px', marginTop: '8px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Portfolio Status: {summary.one_line_diagnosis}
        </div>
      </div>

      {/* Metric Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border)' }}>
        <div className="metric-card" style={{ borderRight: '1px solid var(--border)', borderBottom: 'none' }}>
          <div className="metric-label">Risk Rating</div>
          <div style={{ fontSize: '16px', fontWeight: 800 }}>{scores?.risk_rating}</div>
          <div style={{ fontSize: '10px', color: '#888' }}>{scores?.risk_score_numeric}/10.0</div>
        </div>
        <div className="metric-card" style={{ borderBottom: 'none' }}>
          <div className="metric-label">Diversification</div>
          <div style={{ fontSize: '16px', fontWeight: 800 }}>{scores?.diversification_score}%</div>
          <div style={{ fontSize: '10px', color: '#888' }}>Target: 80%+</div>
        </div>
      </div>

      {/* Strategic Drivers */}
      <div style={{ padding: '16px' }}>
        <div className="metric-label" style={{ marginBottom: '12px' }}>Strategic Positives</div>
        {summary.key_positives.map((p: string, i: number) => (
          <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '11px', marginBottom: '8px', lineHeight: 1.4 }}>
            <TrendingUp size={14} color="#34c759" style={{ flexShrink: 0 }} />
            <span>{p}</span>
          </div>
        ))}
        
        <div className="metric-label" style={{ margin: '20px 0 12px 0' }}>Structural Vulnerabilities</div>
        {summary.key_risks.map((r: string, i: number) => (
          <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '11px', marginBottom: '8px', lineHeight: 1.4 }}>
            <Shield size={14} color="#ff3b30" style={{ flexShrink: 0 }} />
            <span>{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
