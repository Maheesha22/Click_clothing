import { useState, useEffect } from 'react';
import API from '../../../services/api';
import { O_BADGE, Avatar, Badge, IcoBox, IcoCart, IcoUsers, IcoChartBar } from './shared';

/* ── Sales Analytics Chart ── */
function ChartSalesBar({ weeklyRevenue = [] }) {
  const today = new Date();
  const days = [];
  const rev = [];
  const ord = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const found = weeklyRevenue.find(w => w.day === iso);
    days.push(dayLabel);
    rev.push(found ? Number(found.revenue) : 0);
    ord.push(found ? Number(found.orderCount) : 0);
  }

  const maxRev = Math.max(...rev, 1);
  const maxH = 100;

  return (
    <div className="chart-wrap">
      <svg viewBox="0 0 600 160" width="100%" height="160" preserveAspectRatio="none">
        {/* Horizontal background lines */}
        {[0, 25, 50, 75, 100].map(p => {
          const y = 130 - (p / 100) * maxH;
          return <line key={p} x1="30" y1={y} x2="570" y2={y} stroke="#f1f3f5" strokeWidth="1" />;
        })}
        {days.map((d, i) => {
          const rx = 55 + i * 75;
          const revH = (rev[i] / maxRev) * maxH;
          const ordH = (ord[i] / Math.max(...ord, 1)) * maxH;
          return (
            <g key={d + i} className="chart-group">
              {/* Revenue bar */}
              <rect x={rx} y={130 - revH} width="16" height={revH} rx="3" fill="#111" />
              {/* Order bar */}
              <rect x={rx + 20} y={130 - ordH} width="16" height={ordH} rx="3" fill="#e2e6ea" />
              <text x={rx + 18} y="152" textAnchor="middle" fontSize="10" fontWeight="600" fill="#adb5bd">{d}</text>
            </g>
          );
        })}
      </svg>
      <div className="chart-legend">
        <div className="legend-item"><span style={{ background: '#111', width:12, height:12, borderRadius:4 }} /> Revenue</div>
        <div className="legend-item"><span style={{ background: '#e2e6ea', width:12, height:12, borderRadius:4 }} /> Orders</div>
      </div>
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
      const res = await API.get('/dashboard/stats');
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
            <div><div className="c-title">Sales Analytics</div><div className="c-sub">Revenue &amp; order trends</div></div>
            <div className="tog-grp">
              <button className={`tog-btn${tab === 'weekly' ? ' active' : ''}`} onClick={() => setTab('weekly')}>Chart</button>
              <button className={`tog-btn${tab === 'table' ? ' active' : ''}`} onClick={() => setTab('table')}>Table</button>
            </div>
          </div>
          {loading ? (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 13 }}>
              Loading analytics data…
            </div>
          ) : tab === 'table' ? (
            <div className="tbl-wrap" style={{ maxHeight: 180, overflowY: 'auto' }}>
              <table className="tbl tbl-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.weeklyRevenue?.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No data for the selected period</td></tr>
                  ) : (
                    [...(stats?.weeklyRevenue || [])].reverse().map((row, i) => (
                      <tr key={i}>
                        <td>{row.day}</td>
                        <td>{row.dayName}</td>
                        <td style={{ fontWeight: 700 }}>{row.orderCount}</td>
                        <td style={{ color: '#111', fontWeight: 800 }}>Rs. {Number(row.revenue).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <ChartSalesBar weeklyRevenue={stats?.weeklyRevenue || []} />
          )}
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
