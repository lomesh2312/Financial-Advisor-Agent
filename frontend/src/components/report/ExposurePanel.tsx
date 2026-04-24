import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface Props {
  data: any;
}

export const ExposurePanel: React.FC<Props> = ({ data }) => {
  const exposure = data?.effective_exposure;
  if (!exposure) return null;

  const combinedData = exposure.combined_effective_exposure.map((s: any) => ({
    name: s.sector_name,
    value: s.weight_pct,
    risk: s.risk_contribution_pct,
    signal: s.trend_signal
  }));

  const COLORS = ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#eeeeee'];

  return (
    <div className="terminal-panel">
      <div className="panel-header">Effective Sector Exposure (Look-Through)</div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '300px', borderBottom: '1px solid var(--border)' }}>
        {/* Allocation Pie */}
        <div style={{ padding: '20px', position: 'relative' }}>
          <div className="metric-label" style={{ position: 'absolute', top: 20, left: 20 }}>Total Weight Allocation</div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={combinedData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {combinedData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Contribution Bar */}
        <div style={{ padding: '20px', position: 'relative' }}>
          <div className="metric-label" style={{ position: 'absolute', top: 20, left: 20 }}>Sector Risk Contribution %</div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={combinedData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '10px' }} />
              <Tooltip />
              <Bar dataKey="risk" fill="#000" radius={[0, 2, 2, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detail Table */}
      <table className="data-table" style={{ width: '100%', fontSize: '11px' }}>
        <thead>
          <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
            <th style={{ textAlign: 'left', padding: '12px' }}>Sector</th>
            <th style={{ textAlign: 'right', padding: '12px' }}>Weight</th>
            <th style={{ textAlign: 'center', padding: '12px' }}>Signal</th>
            <th style={{ textAlign: 'center', padding: '12px' }}>Risk</th>
          </tr>
        </thead>
        <tbody>
          {exposure.combined_effective_exposure.map((s: any, i: number) => (
            <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '12px', fontWeight: 600 }}>{s.sector_name}</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{s.weight_pct}%</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                <span className={`badge ${s.trend_signal === 'Bullish' ? 'badge-low' : 'badge-low'}`} 
                      style={{ border: '1px solid #000', background: s.trend_signal === 'Bullish' ? '#000' : 'transparent', color: s.trend_signal === 'Bullish' ? '#fff' : '#000' }}>
                  {s.trend_signal}
                </span>
              </td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                <div style={{ width: '40px', height: '4px', background: '#eee', margin: '0 auto' }}>
                  <div style={{ width: `${s.risk_contribution_pct}%`, height: '100%', background: '#ff3b30' }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mix Ratios */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '16px', background: 'var(--bg-secondary)' }}>
        <div>
          <div className="metric-label">Defensive/Cyclical Mix</div>
          <div style={{ fontSize: '14px', fontWeight: 700 }}>
            {(exposure.defensive_vs_cyclical_ratio * 100).toFixed(0)}% / {((1 - exposure.defensive_vs_cyclical_ratio) * 100).toFixed(0)}%
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="metric-label">Domestic/Intl Exposure</div>
          <div style={{ fontSize: '14px', fontWeight: 700 }}>
            {(exposure.domestic_vs_intl_ratio * 100).toFixed(0)}% / {((1 - exposure.domestic_vs_intl_ratio) * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
};
