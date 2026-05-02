import { useState } from 'react';
import { MiniStats } from './shared';

/* ── Sales Over Time — area line chart ── */
function ChartSalesLine() {
  const pts = [[55,115],[120,94],[190,105],[260,68],[330,76],[400,42],[470,48],[535,15]];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'];
  const polyPts = pts.map(p => p.join(',')).join(' ');
  const areaPts = [...pts, [535,135],[55,135]].map(p => p.join(',')).join(' ');
  return (
    <div className="chart-wrap">
      <svg viewBox="0 0 560 160" width="100%" preserveAspectRatio="none">
        <defs>
          <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#111" stopOpacity="0.12"/>
            <stop offset="100%" stopColor="#111" stopOpacity="0.01"/>
          </linearGradient>
        </defs>
        {[15,55,95,130].map(y => <line key={y} x1="40" y1={y} x2="540" y2={y} stroke="#e4e4e4" strokeWidth="1"/>)}
        {[['$81k',15],['$60k',55],['$40k',95],['$20k',130]].map(([l,y]) =>
          <text key={l} x="32" y={y+3} textAnchor="end" fontSize="9" fill="#9a9a9a">{l}</text>)}
        <polygon points={areaPts} fill="url(#grad1)"/>
        <polyline points={polyPts} fill="none" stroke="#111" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
        {pts.map(([cx,cy]) => <circle key={cx} cx={cx} cy={cy} r="4" fill="#111"/>)}
        {months.map((m, i) => <text key={m} x={pts[i][0]} y="152" textAnchor="middle" fontSize="9" fill="#9a9a9a">{m}</text>)}
      </svg>
    </div>
  );
}

/* ── Top Selling Products — horizontal bar chart ── */
function ChartTopProducts() {
  const rows = [
    { label:'👕 White T-Shirt',  w:280, val:'340', fill:'#111' },
    { label:'👖 Denim Jeans',    w:230, val:'280', fill:'#333' },
    { label:'👗 Maxi Dress',     w:172, val:'210', fill:'#555' },
    { label:'🧥 Denim Jacket',   w:150, val:'185', fill:'#777' },
    { label:'👟 Sneakers',       w:130, val:'160', fill:'#999' },
  ];
  return (
    <div className="chart-wrap">
      <svg viewBox="0 0 520 185" width="100%">
        {rows.map((r, i) => {
          const y = 16 + i * 35;
          return (
            <g key={r.label}>
              <text x="122" y={y + 14} textAnchor="end" fontSize="9.5" fill="#444" fontWeight="600">{r.label}</text>
              <rect x="132" y={y} height="20" width={r.w} rx="4" fill={r.fill}/>
              <text x={136 + r.w} y={y + 14} fontSize="9" fill="#111" fontWeight="700">{r.val}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Customer Growth — vertical bar chart ── */
function ChartCustomerGrowth() {
  const data = [[48,82,53],[118,70,65],[188,76,59],[258,54,81],[328,62,73],[398,40,95],[468,44,91]];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];
  return (
    <div className="chart-wrap">
      <svg viewBox="0 0 560 160" width="100%" preserveAspectRatio="none">
        {[15,55,95,130].map(y => <line key={y} x1="40" y1={y} x2="540" y2={y} stroke="#e4e4e4" strokeWidth="1"/>)}
        {[['600',15],['450',55],['300',95],['150',130]].map(([l,y]) =>
          <text key={l} x="32" y={y+3} textAnchor="end" fontSize="9" fill="#9a9a9a">{l}</text>)}
        {data.map(([x,y,h], i) => (
          <g key={i}>
            <rect x={x} y={y} width="42" height={h} rx="4" fill="#111"/>
            <text x={x + 21} y="152" textAnchor="middle" fontSize="9" fill="#9a9a9a">{months[i]}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ── Payments Summary — donut chart ── */
function ChartPaymentDonut() {
  return (
    <div className="donut-row">
      <svg viewBox="0 0 180 180" width="150" height="150" style={{ flexShrink: 0 }}>
        <circle cx="90" cy="90" r="70" fill="none" stroke="#e4e4e4" strokeWidth="28"/>
        {/* Paid 95.3% */}
        <circle cx="90" cy="90" r="70" fill="none" stroke="#111" strokeWidth="28"
          strokeDasharray="440 462" strokeDashoffset="115" strokeLinecap="butt"/>
        {/* Pending 3.3% */}
        <circle cx="90" cy="90" r="70" fill="none" stroke="#f59e0b" strokeWidth="28"
          strokeDasharray="15 462" strokeDashoffset="-325" strokeLinecap="butt"/>
        {/* Failed 1.4% */}
        <circle cx="90" cy="90" r="70" fill="none" stroke="#ef4444" strokeWidth="28"
          strokeDasharray="7 462" strokeDashoffset="-340" strokeLinecap="butt"/>
        <text x="90" y="85"  textAnchor="middle" fontSize="13" fontWeight="800" fill="#111">$284k</text>
        <text x="90" y="101" textAnchor="middle" fontSize="9"  fill="#9a9a9a">Total</text>
      </svg>
      <div className="donut-legend">
        {[['#111','Paid','$271,440'],['#f59e0b','Pending','$9,480'],['#ef4444','Failed','$4,000']].map(([c,l,v]) => (
          <div key={l} className="donut-item">
            <span className="donut-dot" style={{ background: c }}/>
            <div><div className="donut-lbl">{l}</div><div className="donut-val">{v}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Reports({ toast }) {
  const [df, setDf] = useState('Today');
  return (
    <div className="view">
      <div className="ph">
        <div><h1 className="ph-title">Reports &amp; Analytics</h1><p className="ph-sub">Business performance at a glance.</p></div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn-secondary" onClick={()=>toast('📄','Exporting CSV…')}>⬇️ Export CSV</button>
          <button className="btn-primary"   onClick={()=>toast('📋','Exporting PDF…')}>⬇️ Export PDF</button>
        </div>
      </div>
      <div className="date-filters">
        {['Today','This Week','This Month','Custom Range'].map(d=>(
          <button key={d} className={`df-btn${df===d?' active':''}`} onClick={()=>{setDf(d);toast('📊','Updating report data…');}}>{d}</button>
        ))}
      </div>
      <MiniStats items={[['💰','$12,840',"Today's Revenue"],['🛒','94','Orders Today'],['👥','+12','New Customers'],['🔄','3.4%','Return Rate']]}/>
      <div className="charts-grid">
        <div className="card chart-panel">
          <div className="c-hdr"><div><div className="c-title">Sales Over Time</div><div className="c-sub">Monthly revenue trend</div></div></div>
          <ChartSalesLine/>
        </div>
        <div className="card chart-panel">
          <div className="c-hdr"><div><div className="c-title">Top Selling Products</div><div className="c-sub">Units sold this month</div></div></div>
          <ChartTopProducts/>
        </div>
        <div className="card chart-panel">
          <div className="c-hdr"><div><div className="c-title">Customer Growth</div><div className="c-sub">New customers per month</div></div></div>
          <ChartCustomerGrowth/>
        </div>
        <div className="card chart-panel">
          <div className="c-hdr"><div><div className="c-title">Payments Summary</div><div className="c-sub">Paid vs Pending vs Failed</div></div></div>
          <ChartPaymentDonut/>
        </div>
      </div>
    </div>
  );
  
}
