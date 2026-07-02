import { useState, useEffect } from 'react';
import axios from 'axios';
import { O_BADGE, Avatar, Badge, IcoBox, IcoCart, IcoUsers, IcoChartBar } from './shared';

/* ── Revenue by Order Status Chart ── */
function ChartRevenueByStatus() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3000/api/orders/revenue-by-status')
      .then(res => {
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError(res.data.message);
        }
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>Loading chart...</div>;
  }
  if (error) {
    return <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: 13, fontWeight: 600 }}>{error}</div>;
  }

  const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered'];
  const STATUS_GRADIENTS = {
    pending: { start: '#FBBF24', end: '#D97706' },
    confirmed: { start: '#818CF8', end: '#4338CA' },
    shipped: { start: '#60A5FA', end: '#2563EB' },
    delivered: { start: '#34D399', end: '#059669' },
  };

  const chartData = STATUSES.map(st => {
    const found = data.find(d => d.status && d.status.toLowerCase() === st);
    return {
      status: st,
      label: st.charAt(0).toUpperCase() + st.slice(1),
      revenue: found ? Number(found.total_revenue) : 0,
      gradStart: STATUS_GRADIENTS[st].start,
      gradEnd: STATUS_GRADIENTS[st].end
    };
  });

  const maxRev = Math.max(...chartData.map(d => d.revenue), 1);
  const W = 620, H = 220;
  const padL = 74, padR = 12, padTop = 24, padBot = 40;
  const chartW = W - padL - padR;
  const chartH = H - padTop - padBot;
  
  // Clean, professional ticks
  const niceMax = (Math.ceil(maxRev / 5000) * 5000) || 5000;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(niceMax * t));

  const fmtTick = v => `Rs. ${v.toLocaleString('en-US')}`;
  const fmtRev = v => `Rs. ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const groupW = chartW / 4;
  const barW = Math.min(groupW * 0.45, 38);

  return (
    <div className="chart-wrap" style={{ position: 'relative', userSelect: 'none', height: 220, animation: 'fadeIn 0.5s ease forwards' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleUp { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        .chart-bar { transform-origin: bottom; animation: scaleUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none"
        style={{ display: 'block', overflow: 'visible' }}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          {chartData.map(d => (
            <linearGradient key={`grad-${d.status}`} id={`grad-${d.status}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={d.gradStart} />
              <stop offset="100%" stopColor={d.gradEnd} />
            </linearGradient>
          ))}
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Horizontal background lines & Y-axis labels */}
        {ticks.map((tick, i) => {
          const y = padTop + chartH - (tick / niceMax) * chartH;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={tick === 0 ? '#cbd5e1' : '#f1f5f9'} strokeWidth={tick === 0 ? 1.5 : 1} strokeDasharray={tick === 0 ? '0' : '4 4'} />
              <text x={padL - 12} y={y + 4} textAnchor="end" fontSize="11" fontWeight="600" fill="#94a3b8" style={{ fontFamily: 'inherit' }}>
                {fmtTick(tick)}
              </text>
            </g>
          );
        })}
        {/* Bars and X-axis labels */}
        {chartData.map((d, i) => {
          const cx = padL + i * groupW + groupW / 2;
          const revH = (d.revenue / niceMax) * chartH;
          const barX = cx - barW / 2;
          const baseY = padTop + chartH;
          const isHov = tooltip?.i === i;
          return (
            <g key={d.status}
              onMouseEnter={e => {
                const r = e.currentTarget.closest('svg').getBoundingClientRect();
                setTooltip({ i, svgX: e.clientX - r.left, svgY: e.clientY - r.top, d });
              }}
              onMouseMove={e => {
                const r = e.currentTarget.closest('svg').getBoundingClientRect();
                setTooltip(prev => prev ? { ...prev, svgX: e.clientX - r.left, svgY: e.clientY - r.top } : prev);
              }}
              style={{ cursor: 'pointer' }}
            >
              <rect x={cx - groupW / 2} y={padTop} width={groupW} height={chartH + padBot} fill="transparent" />
              {revH > 0 
                ? <rect className="chart-bar" x={barX} y={baseY - revH} width={barW} height={revH} rx="6" fill={`url(#grad-${d.status})`} style={{ opacity: isHov ? 0.9 : 1, transition: 'opacity 0.2s ease', filter: 'url(#shadow)' }} />
                : <rect className="chart-bar" x={barX} y={baseY - 3} width={barW} height={3} rx="1.5" fill="#e2e8f0" />
              }
              <text x={cx} y={H - 12} textAnchor="middle" fontSize="12" fontWeight="700" fill={isHov ? '#334155' : '#64748b'} style={{ transition: 'fill 0.2s ease', letterSpacing: '0.02em', fontFamily: 'inherit' }}>
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      
      {/* Sleek Tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute', left: tooltip.svgX, top: tooltip.svgY - 14, transform: 'translate(-50%, -100%)',
          pointerEvents: 'none', background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '10px', padding: '10px 16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)', whiteSpace: 'nowrap', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '4px'
        }}>
          <div style={{ fontSize: '11px', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{tooltip.d.label} Revenue</div>
          <div style={{ color: '#f8fafc', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: tooltip.d.gradStart, display: 'inline-block' }}></span>
            {fmtRev(tooltip.d.revenue)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Skeleton loader for stat-cards ── */
const StatSkeleton = () => (
  <div className="stat-grid">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="admin-card stat-card" style={{ opacity: 0.55 }}>
        <div className="stat-body">
          <div>
            <div className="stat-lbl" style={{ width: 90, height: 12, background: '#e5e5e5', borderRadius: 6 }} />
            <div className="stat-val" style={{ width: 120, height: 26, background: '#e5e5e5', borderRadius: 6, marginTop: 8 }} />
            <div className="stat-chg" style={{ width: 140, height: 10, background: '#f0f0f0', borderRadius: 6, marginTop: 8 }} />
          </div>
          <div className="stat-ico" style={{ opacity: 0.3 }}>⏳</div>
        </div>
      </div>
    ))}
  </div>
);

export default function Dashboard({ goOrders, onRestock }) {
  const [tab, setTab] = useState('weekly');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCat, setExpandedCat] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:3000/api/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.data);
      } else {
        setError(res.data.message || 'Failed to load dashboard');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Format helpers ── */
  const fmt = n => Number(n).toLocaleString();
  const fmtRs = n => `Rs. ${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  /* ── Build stat cards from real data ── */
  const statCards = stats ? [
    { lbl: 'Total Products', val: fmt(stats.totalProducts), chg: `↗ +${stats.newProductsThisMonth} this month`, ico: <IcoBox /> },
    { lbl: 'Total Orders', val: fmt(stats.totalOrders), chg: `↗ +${stats.ordersThisWeek} this week`, ico: <IcoCart /> },
    { lbl: 'Customers', val: fmt(stats.totalCustomers), chg: `↗ +${stats.newCustomersToday} new today`, ico: <IcoUsers /> },
    { lbl: 'Total Revenue', val: fmtRs(stats.totalRevenue), chg: 'All-time revenue', ico: <IcoChartBar /> },
  ] : [];

  /* ── Badge helper for order status ── */
  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'confirmed' || s === 'delivered') return 'b-delivered';
    if (s === 'shipped') return 'b-shipped';
    if (s === 'cancelled') return 'b-cancelled';
    if (s === 'processing') return 'b-processing';
    return 'b-pending';
  };

  return (
    <div className="view">
      <div className="ph">
        <div>
          <h1 className="ph-title">Dashboard Overview</h1>
          <p className="ph-sub">Welcome back, Admin — here's what's happening today.</p>
        </div>
        <button className="btn-secondary" style={{ fontSize: 12, padding: '7px 16px' }} onClick={fetchDashboard}>
          🔄 Refresh
        </button>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
          padding: '14px 20px', marginBottom: 18, color: '#991b1b', fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span>⚠️</span> {error}
          <button onClick={fetchDashboard} style={{
            marginLeft: 'auto', background: '#111', color: '#fff', border: 'none',
            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer'
          }}>Retry</button>
        </div>
      )}

      {/* ── Stat cards ── */}
      {loading ? <StatSkeleton /> : (
        <div className="stat-grid">
          {statCards.map(s => (
            <div key={s.lbl} className="admin-card stat-card">
              <div className="stat-body">
                <div>
                  <div className="stat-lbl">{s.lbl}</div>
                  <div className="stat-val">{s.val}</div>
                  <div className="stat-chg">
                    <span style={{ fontSize: 14 }}>{s.chg.split(' ')[0]}</span>
                    {s.chg.substring(s.chg.indexOf(' ') + 1)}
                  </div>
                </div>
                <div className="stat-ico">{s.ico}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Chart + Low stock ── */}
      <div className="mid-grid">
        <div className="chart-card">
          <div className="c-hdr">
            <div><div className="c-title">Revenue by Order Status</div></div>
          </div>
          <ChartRevenueByStatus />
        </div>

        <div className="ls-card">
          <div className="ls-hd">
            <div className="ls-ic">⚠️</div>
            <div>
              <div className="c-title">Low Stock Alerts</div>
              <div className="c-sub">
                {loading ? 'Loading…' : `${stats?.lowStockItems?.length || 0} items need attention`}
              </div>
            </div>
          </div>
          <div className="ls-list">
            {loading ? (
              <div style={{ padding: 30, textAlign: 'center', color: '#aaa', fontSize: 13 }}>Loading…</div>
            ) : !stats?.lowStockItems || stats.lowStockItems.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: '#22c55e', fontSize: 13, fontWeight: 600 }}>
                ✅ All stock levels healthy
              </div>
            ) : (
              (() => {
                const grouped = stats.lowStockItems.reduce((acc, item) => {
                  const cat = item.categoryName || 'Other';
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(item);
                  return acc;
                }, {});

                return Object.entries(grouped).map(([catName, items]) => {
                  const isExpanded = expandedCat === catName;
                  return (
                    <div key={catName} className="ls-group-wrap" style={{ marginBottom: 12 }}>
                      <button
                        className="ls-cat-head"
                        onClick={() => setExpandedCat(isExpanded ? null : catName)}
                        style={{
                          width: '100%', textAlign: 'left', padding: '14px 16px',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          background: isExpanded ? '#000' : '#f8fafc',
                          color: isExpanded ? '#fff' : '#475569',
                          border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 800, fontSize: '13px',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer',
                          boxShadow: isExpanded ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 16 }}>{isExpanded ? '' : ''}</span>
                          {catName}
                          <span style={{
                            background: isExpanded ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                            padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, marginLeft: 4
                          }}>
                            {items.length}
                          </span>
                        </span>
                        <span style={{ fontSize: 10, opacity: 0.5 }}>{isExpanded ? '▼' : '▶'}</span>
                      </button>

                      {isExpanded && (
                        <div className="ls-cat-body" style={{
                          marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 6,
                          animation: 'slideDownFade 0.3s ease forwards'
                        }}>
                          {items.map(item => (
                            <div key={item.variantId} className="ls-row" style={{
                              background: '#fff', border: '1px solid #f1f3f5', borderRadius: 12, padding: '12px 14px'
                            }}>
                              <div className="ls-l">
                                <div className="ls-th" style={{ width: 34, height: 34, background: '#f8fafc', borderRadius: 8 }}>
                                  {item.imageUrl ? (
                                    <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                                  ) : '👕'}
                                </div>
                                <div>
                                  <div className="ls-nm" style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{item.productName}</div>
                                  <div className="ls-sk" style={{ fontSize: 12, color: '#64748b' }}>{item.size} / {item.color}</div>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div className={`ls-cnt ${item.quantity <= 3 ? 'c-r' : 'c-o'}`} style={{ fontSize: 13, fontWeight: 800 }}>
                                  {item.quantity} left
                                </div>
                                <button className="restock-btn" style={{ fontSize: 11, fontWeight: 700 }} onClick={(e) => { e.stopPropagation(); onRestock(item); }}>Restock →</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                });
              })()
            )}
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <div className="card-hdr-pad">
          <div className="c-hdr" style={{ marginBottom: 0 }}>
            <div>
              <div className="c-title">Recent Orders</div>
              <div className="c-sub">Latest 6 business transactions</div>
            </div>
            <button className="btn-secondary" style={{ fontSize: 12 }} onClick={goOrders}>View Full Report</button>
          </div>
        </div>
        <div className="tbl-wrap">
          <table className="tbl" style={{ borderTop: '1px solid var(--g2)' }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: 24 }}>Order Number</th>
                <th>Customer Name</th>
                <th>Payment Method</th>
                <th>Order Status</th>
                <th style={{ textAlign: 'right', paddingRight: 24 }}>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>Loading latest orders…</td></tr>
              ) : stats?.recentOrders?.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>No orders recorded yet</td></tr>
              ) : (
                stats?.recentOrders?.map(o => {
                  const custName = o.first_name && o.last_name ? `${o.first_name} ${o.last_name}` : 'Guest Customer';
                  const initials = o.first_name && o.last_name ? `${o.first_name[0]}${o.last_name[0]}` : 'GC';
                  return (
                    <tr key={o.id}>
                      <td className="cell-id" style={{ paddingLeft: 24 }}>{o.order_number}</td>
                      <td>
                        <div className="av-cell">
                          <Avatar ini={initials} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="cell-nm">{custName}</span>
                            <span className="cell-sub">{o.email || 'No email provided'}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className="cell-dim">{o.payment_method}</span></td>
                      <td><Badge label={o.status || 'pending'} cls={getStatusBadge(o.status)} /></td>
                      <td className="cell-price" style={{ textAlign: 'right', paddingRight: 24 }}>{fmtRs(o.total_bill)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
