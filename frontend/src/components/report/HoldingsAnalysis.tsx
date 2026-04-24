import React from 'react';
import { Target, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  data: any;
}

export const HoldingsAnalysis: React.FC<Props> = ({ data }) => {
  const holdings = data?.holdings_analysis;
  if (!holdings) return null;

  return (
    <div className="terminal-panel">
      <div className="panel-header">Portfolio Holdings Audit & Linkage</div>
      
      <table className="data-table" style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
            <th style={{ textAlign: 'left', padding: '12px' }}>Holding / Role</th>
            <th style={{ textAlign: 'right', padding: '12px' }}>Weight</th>
            <th style={{ textAlign: 'center', padding: '12px' }}>Contrib (Ret/Risk)</th>
            <th style={{ textAlign: 'left', padding: '12px' }}>Strategic Observation</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h: any, i: number) => (
            <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '12px' }}>
                <div style={{ fontWeight: 800, fontSize: '12px' }}>{h.holding_name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  {h.role === 'Core' && <ShieldCheck size={10} color="#34c759" />}
                  {h.role === 'Tactical' && <Zap size={10} color="#ff3b30" />}
                  {h.role === 'Satellite' && <Target size={10} color="#000" />}
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>{h.role}</span>
                </div>
              </td>
              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>{h.allocation_pct}%</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ color: h.return_contribution >= 0 ? '#34c759' : '#ff3b30', fontWeight: 700 }}>
                    {h.return_contribution >= 0 ? '+' : ''}{h.return_contribution}%
                  </span>
                  <span style={{ color: '#888' }}>/</span>
                  <span style={{ fontWeight: 700 }}>{h.risk_contribution}%</span>
                </div>
              </td>
              <td style={{ padding: '12px', color: '#444', lineHeight: 1.4 }}>
                <div style={{ fontWeight: 600, color: '#000', marginBottom: '2px' }}>{h.sector_linkage.join(' • ')}</div>
                {h.valuation_note}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
