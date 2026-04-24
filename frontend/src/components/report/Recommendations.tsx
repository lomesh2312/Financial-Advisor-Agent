import React from 'react';
import { RefreshCw, ArrowRight, CheckCircle2, ChevronRight, Scale } from 'lucide-react';

interface Props {
  data: any;
}

export const Recommendations: React.FC<Props> = ({ data }) => {
  const recommendations = data?.recommendations;
  if (!recommendations) return null;

  return (
    <div className="terminal-panel">
      <div className="panel-header">Strategic Rebalancing workbench</div>
      
      <div style={{ padding: '16px' }}>
        {recommendations.map((rec: any, i: number) => (
          <div key={i} className="terminal-panel" style={{ marginBottom: '20px', padding: '0' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
              {/* Left Column: The Action */}
              <div style={{ padding: '20px', width: '280px', borderRight: '1px solid var(--border)', background: '#fcfcfc' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ padding: '4px', background: '#000', borderRadius: '4px' }}>
                    <RefreshCw size={14} color="#fff" />
                  </div>
                  <span className="badge badge-low" style={{ border: '1px solid #000' }}>{rec.category}</span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2 }}>{rec.action}</div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '12px', border: '1px solid #eee', borderRadius: '4px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="metric-label" style={{ fontSize: '8px' }}>Current</div>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>{rec.current_allocation_pct}%</div>
                  </div>
                  <ArrowRight size={14} color="#ccc" />
                  <div style={{ textAlign: 'center' }}>
                    <div className="metric-label" style={{ fontSize: '8px' }}>Target</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#34c759' }}>{rec.target_allocation_pct}%</div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div className="metric-label" style={{ fontSize: '8px' }}>Delta</div>
                    <div style={{ fontSize: '12px', fontWeight: 800 }}>{rec.suggested_shift_pct > 0 ? '+' : ''}{rec.suggested_shift_pct}%</div>
                  </div>
                </div>
              </div>

              {/* Right Column: The Logic */}
              <div style={{ padding: '20px', flex: 1 }}>
                <div className="metric-label">Rational & Evidence</div>
                <p style={{ fontSize: '12px', color: '#000', fontWeight: 500, lineHeight: 1.5, marginBottom: '16px' }}>{rec.reasoning}</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <CheckCircle2 size={14} color="#34c759" />
                      <div className="metric-label" style={{ marginBottom: 0 }}>Expected Benefit</div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#444' }}>{rec.expected_benefit}</div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <Scale size={14} color="#ff3b30" />
                      <div className="metric-label" style={{ marginBottom: 0 }}>Strategic Tradeoff</div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#444' }}>{rec.tradeoff}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Optimization Ideas */}
        <div style={{ marginTop: '24px' }}>
          <div className="metric-label" style={{ marginBottom: '12px' }}>Additional Optimization Ideas</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {(data?.optimization_ideas || []).map((idea: string, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px solid #f0f0f0', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                <ChevronRight size={14} />
                {idea}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
