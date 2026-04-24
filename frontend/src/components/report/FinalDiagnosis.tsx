import React from 'react';
import { Gavel, CheckCircle2 } from 'lucide-react';

interface Props {
  data: any;
}

export const FinalDiagnosis: React.FC<Props> = ({ data }) => {
  const diagnosis = data?.final_diagnosis;
  if (!diagnosis) return null;

  return (
    <div className="terminal-panel" style={{ background: '#000', color: '#fff', border: 'none' }}>
      <div className="panel-header" style={{ background: '#111', color: '#888', borderBottom: '1px solid #222' }}>Final investment verdict</div>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '4px', background: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Gavel size={32} />
          </div>
          <div>
            <div className="metric-label" style={{ color: '#888' }}>Analyst Verdict</div>
            <div style={{ fontSize: '20px', fontWeight: 400, lineHeight: 1.4, letterSpacing: '-0.01em' }}>
              {diagnosis.verdict}
            </div>
          </div>
        </div>

        <div className="metric-label" style={{ color: '#888', marginBottom: '16px' }}>Prioritized Action Plan</div>
        <div style={{ display: 'grid', gap: '12px' }}>
          {diagnosis.prioritized_actions.map((action: string, i: number) => (
            <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', background: '#111', border: '1px solid #222', borderRadius: '4px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #34c759', color: '#34c759', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 }}>
                {i + 1}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{action}</div>
              <CheckCircle2 size={16} color="#34c759" style={{ marginLeft: 'auto' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
