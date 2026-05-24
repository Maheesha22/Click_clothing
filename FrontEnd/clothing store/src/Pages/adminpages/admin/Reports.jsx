import { useState, useEffect } from 'react';
import API from '../../../services/api';
import { MiniStats } from './shared';

/* ── Sales Over Time — area line chart ── */
function ChartSalesLine() {
  const pts = [[55, 115], [120, 94], [190, 105], [260, 68], [330, 76], [400, 42], [470, 48], [535, 15]];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const polyPts = pts.map(p => p.join(',')).join(' ');
  const areaPts = [...pts, [535, 135], [55, 135]].map(p => p.join(',')).join(' ');
  return (
    <div className="chart-wrap">
      <svg viewBox="0 0 560 160" width="100%" preserveAspectRatio="none">
        <defs>
          <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#111" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#111" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[15, 55, 95, 130].map(y => <line key={y} x1="40" y1={y} x2="540" y2={y} stroke="#e4e4e4" strokeWidth="1" />)}
        {[['Rs. 81k', 15], ['Rs. 60k', 55], ['Rs. 40k', 95], ['Rs. 20k', 130]].map(([l, y]) =>
          <text key={l} x="32" y={y + 3} textAnchor="end" fontSize="9" fill="#9a9a9a">{l}</text>)}
        <polygon points={areaPts} fill="url(#grad1)" />
        <polyline points={polyPts} fill="none" stroke="#111" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r="4" fill="#111" />)}
        {months.map((m, i) => <text key={m} x={pts[i][0]} y="152" textAnchor="middle" fontSize="9" fill="#9a9a9a">{m}</text>)}
      </svg>
    </div>
  );
}

/* ── Top Selling Products — horizontal bar chart ── */
function ChartTopProducts({ data }) {
  if (!data || data.length === 0) return <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '13px' }}>No sales data in this period</div>;

  const colors = ['#111', '#333', '#555', '#777', '#999'];
  const maxQty = Math.max(...data.map(d => Number(d.quantity)));

  return (
    <div className="chart-wrap">
      <svg viewBox="0 0 520 185" width="100%">
        {data.map((r, i) => {
          const y = 16 + i * 35;
          const width = maxQty > 0 ? (Number(r.quantity) / maxQty) * 300 : 0;
          return (
            <g key={r.name}>
              <text x="122" y={y + 14} textAnchor="end" fontSize="9.5" fill="#444" fontWeight="600">{r.name}</text>
              <rect x="132" y={y} height="20" width={width} rx="4" fill={colors[i] || '#bbb'} />
              <text x={136 + width} y={y + 14} fontSize="9" fill="#111" fontWeight="700">{r.quantity}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Customer Growth — vertical bar chart ── */
function ChartCustomerGrowth() {
  const data = [[48, 82, 53], [118, 70, 65], [188, 76, 59], [258, 54, 81], [328, 62, 73], [398, 40, 95], [468, 44, 91]];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  return (
    <div className="chart-wrap">
      <svg viewBox="0 0 560 160" width="100%" preserveAspectRatio="none">
        {[15, 55, 95, 130].map(y => <line key={y} x1="40" y1={y} x2="540" y2={y} stroke="#e4e4e4" strokeWidth="1" />)}
        {[['600', 15], ['450', 55], ['300', 95], ['150', 130]].map(([l, y]) =>
          <text key={l} x="32" y={y + 3} textAnchor="end" fontSize="9" fill="#9a9a9a">{l}</text>)}
        {data.map(([x, y, h], i) => (
          <g key={i}>
            <rect x={x} y={y} width="42" height={h} rx="4" fill="#111" />
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
        <circle cx="90" cy="90" r="70" fill="none" stroke="#e4e4e4" strokeWidth="28" />
        {/* Paid 95.3% */}
        <circle cx="90" cy="90" r="70" fill="none" stroke="#111" strokeWidth="28"
          strokeDasharray="440 462" strokeDashoffset="115" strokeLinecap="butt" />
        {/* Pending 3.3% */}
        <circle cx="90" cy="90" r="70" fill="none" stroke="#f59e0b" strokeWidth="28"
          strokeDasharray="15 462" strokeDashoffset="-325" strokeLinecap="butt" />
        {/* Failed 1.4% */}
        <circle cx="90" cy="90" r="70" fill="none" stroke="#ef4444" strokeWidth="28"
          strokeDasharray="7 462" strokeDashoffset="-340" strokeLinecap="butt" />
        <text x="90" y="85" textAnchor="middle" fontSize="13" fontWeight="800" fill="#111">Rs. 284k</text>
        <text x="90" y="101" textAnchor="middle" fontSize="9" fill="#9a9a9a">Total</text>
      </svg>
      <div className="donut-legend">
        {[['#111', 'Paid', 'Rs. 271,440'], ['#f59e0b', 'Pending', 'Rs. 9,480'], ['#ef4444', 'Failed', 'Rs. 4,000']].map(([c, l, v]) => (
          <div key={l} className="donut-item">
            <span className="donut-dot" style={{ background: c }} />
            <div><div className="donut-lbl">{l}</div><div className="donut-val">{v}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Reports({ toast }) {
  const [df, setDf] = useState('This Month');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const dates = getRangeDates(df);
    fetchReports(dates.start, dates.end);
  }, [df]);

  const getRangeDates = (type) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (type === 'Today') return { start: today, end: today };

    if (type === 'This Week') {
      const first = now.getDate() - now.getDay();
      const start = new Date(now.setDate(first)).toISOString().split('T')[0];
      return { start, end: today };
    }

    if (type === 'This Month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      return { start, end: today };
    }

    if (type === 'All Time') return { start: '2000-01-01', end: today };

    if (type === 'Custom Range') return { start: customRange.start, end: customRange.end };

    return { start: today, end: today };
  };

  const fetchReports = async (start, end) => {
    if (df === 'Custom Range' && (!start || !end)) return;

    setLoading(true);
    try {
      const url = start && end
        ? `/reports/stats?startDate=${start}&endDate=${end}`
        : '/reports/stats';

      const res = await API.get(url);
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomApply = () => {
    fetchReports(customRange.start, customRange.end);
    toast('📊', 'Updating custom report…');
  };

  const fmtRs = n => `Rs. ${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmt = n => Number(n).toLocaleString();

  const getLabel = (base) => {
    if (df === 'Today') return `${base} Today`;
    if (df === 'This Week') return `${base} This Week`;
    if (df === 'This Month') return `${base} This Month`;
    if (df === 'All Time') return `Total ${base} (All Time)`;
    return `${base} in Range`;
  };

  const reportStats = stats ? [
    ['💰', fmtRs(stats.totalRevenue), getLabel('Revenue')],
    ['🛒', fmt(stats.orderCount), getLabel('Orders')],
    ['👥', `+${stats.customerCount}`, getLabel('New Customers')],
    ['🔄', `${stats.returnRate}%`, 'Return Rate']
  ] : [
    ['💰', 'Rs. 0.00', getLabel('Revenue')],
    ['🛒', '0', getLabel('Orders')],
    ['👥', '+0', getLabel('New Customers')],
    ['🔄', '0%', 'Return Rate']
  ];

  return (
    <div className="view">
      <div className="ph">
        <div><h1 className="ph-title">Reports &amp; Analytics</h1><p className="ph-sub">Business performance at a glance.</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={() => toast('📄', 'Exporting CSV…')}>⬇️ Export CSV</button>
          <button className="btn-primary" onClick={() => toast('📋', 'Exporting PDF…')}>⬇️ Export PDF</button>
        </div>
      </div>

      <div className="date-filters-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div className="date-filters">
          {['Today', 'This Week', 'This Month', 'All Time', 'Custom Range'].map(d => (
            <button key={d} className={`df-btn${df === d ? ' active' : ''}`} onClick={() => { setDf(d); if (d !== 'Custom Range') toast('📊', 'Updating report data…'); }}>{d}</button>
          ))}
        </div>

        {df === 'Custom Range' && (
          <div className="custom-date-inputs" style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#fff', padding: '6px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <input type="date" value={customRange.start} onChange={e => setCustomRange(prev => ({ ...prev, start: e.target.value }))} style={{ border: 'none', fontSize: 13, outline: 'none' }} />
            <span style={{ color: '#cbd5e1' }}>→</span>
            <input type="date" value={customRange.end} onChange={e => setCustomRange(prev => ({ ...prev, end: e.target.value }))} style={{ border: 'none', fontSize: 13, outline: 'none' }} />
            <button className="btn-primary" onClick={handleCustomApply} style={{ padding: '4px 12px', fontSize: 12 }}>Apply</button>
          </div>
        )}
      </div>

      {loading && !stats ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: '#666', fontSize: '14px' }}>
          <div style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid #eee', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '12px' }} />
          <div>Loading analytics data...</div>
        </div>
      ) : (
        <>
          <MiniStats items={reportStats} />
          <div className="charts-grid">
            <div className="admin-card chart-panel">
              <div className="c-hdr"><div><div className="c-title">Sales Over Time</div><div className="c-sub">Daily revenue trend</div></div></div>
              <ChartSalesLine />
            </div>
            <div className="admin-card chart-panel">
              <div className="c-hdr"><div><div className="c-title">Top Selling Products</div><div className="c-sub">Units sold in this period</div></div></div>
              <ChartTopProducts data={stats?.topProducts} />
            </div>
            <div className="admin-card chart-panel">
              <div className="c-hdr"><div><div className="c-title">Customer Growth</div><div className="c-sub">New customers per month</div></div></div>
              <ChartCustomerGrowth />
            </div>
            <div className="admin-card chart-panel">
              <div className="c-hdr"><div><div className="c-title">Payments Summary</div><div className="c-sub">Paid vs Pending vs Failed</div></div></div>
              <ChartPaymentDonut />
            </div>
          </div>

          <div className="admin-card" style={{ marginTop: '24px' }}>
            <div className="c-hdr">
              <div>
                <div className="c-title">Recent Orders in Period</div>
                <div className="c-sub">Detailed log of transactions for the selected range</div>
              </div>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#999' }}>No orders found in this period</td></tr>
                  ) : (
                    stats.recentOrders.map(o => (
                      <tr key={o.id}>
                        <td className="cell-id">#{o.order_number}</td>
                        <td>{o.first_name ? `${o.first_name} ${o.last_name}` : 'Guest'}</td>
                        <td>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            backgroundColor: o.status === 'confirmed' ? '#e0f7fa' : '#eee',
                            color: o.status === 'confirmed' ? '#006064' : '#666'
                          }}>
                            {o.status}
                          </span>
                        </td>
                        <td style={{ fontWeight: 'bold' }}>Rs. {Number(o.total_bill).toLocaleString()}</td>
                        <td style={{ color: '#666', fontSize: '13px' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );

}
