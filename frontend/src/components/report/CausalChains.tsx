import React from 'react';
import { Share2, ArrowRight, Zap, Info } from 'lucide-react';

interface Props {
  data: any;
}

export const CausalChains: React.FC<Props> = ({ data }) => {
  const chains = data?.causal_chains;
  if (!chains) return null;

  return (
    <div className="terminal-panel">
      <div className="panel-header">Causal Transmission Audit (News → Impact)</div>
      
      <div style={{ padding: '20px' }}>
        {chains.map((chain: any, i: number) => (
          <div key={i} style={{ marginBottom: '32px', position: 'relative' }}>
            {/* News Event Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyCenter: 'center', flexShrink: 0 }}>
                <Zap size={16} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800 }}>{chain.event}</div>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Transmission Confidence: {chain.confidence_level * 100}%</div>
              </div>
            </div>

            {/* Causal Graph Visualization */}
            <div style={{ display: 'flex', alignItems: 'stretch', gap: '8px' }}>
              {/* Macro Impact Node */}
              <div className="terminal-panel" style={{ flex: 1, padding: '12px', background: '#fcfcfc' }}>
                <div className="metric-label" style={{ fontSize: '9px' }}>Macro Impact</div>
                <div style={{ fontSize: '11px', fontWeight: 600 }}>{chain.macro_impact}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', color: '#ccc' }}><ArrowRight size={16} /></div>

              {/* Sector Node */}
              <div className="terminal-panel" style={{ flex: 1, padding: '12px', background: '#fcfcfc' }}>
                <div className="metric-label" style={{ fontSize: '9px' }}>Affected Sectors</div>
                <div style={{ fontSize: '11px', fontWeight: 600 }}>{chain.affected_sectors.join(', ')}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', color: '#ccc' }}><ArrowRight size={16} /></div>

              {/* Portfolio Node */}
              <div className="terminal-panel" style={{ flex: 1, padding: '12px', border: '1px solid #000', background: '#000', color: '#fff' }}>
                <div className="metric-label" style={{ fontSize: '9px', color: '#888' }}>Portfolio Impact</div>
                <div style={{ fontSize: '12px', fontWeight: 800 }}>{chain.estimated_portfolio_impact_pct > 0 ? '+' : ''}{chain.estimated_portfolio_impact_pct}%</div>
                <div style={{ fontSize: '9px', opacity: 0.7 }}>Strength: {chain.transmission_strength}</div>
              </div>
            </div>

            {/* Affected Holdings Tag List */}
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: '#888', marginRight: '4px', alignSelf: 'center' }}>Key Exposure:</span>
              {chain.affected_holdings.map((h: string, idx: number) => (
                <span key={idx} style={{ padding: '2px 8px', border: '1px solid #eee', borderRadius: '12px', fontSize: '10px', fontWeight: 600, background: '#fff' }}>
                  {h}
                </span>
              ))}
            </div>

            {i < chains.length - 1 && <div style={{ height: '1px', background: '#eee', marginTop: '32px' }} />}
          </div>
        ))}

        <div style={{ display: 'flex', gap: '8px', padding: '12px', background: '#f8f9fa', border: '1px dashed #ddd', borderRadius: '4px' }}>
          <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>
            Impact estimates are calculated using factor sensitivity analysis. Transmission strength reflects the historical correlation between macro signals and effective sector weights.
          </p>
        </div>
      </div>
    </div>
  );
};
