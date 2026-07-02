/**
 * Reports.jsx
 * Reports & Analytics page — Click Clothing Admin Dashboard
 * Fetches all data from /api/reports/analytics (no hardcoded values)
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MiniStats } from './shared';

const API_BASE = 'http://localhost:3000/api';

/* ─── Currency formatter ─── */
const fmt = (n) => {
  n = Number(n) || 0;
  if (n >= 1_000_000) return `Rs ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `Rs ${(n / 1_000).toFixed(1)}k`;
  return `Rs ${n.toLocaleString()}`;
};

/* ─────────────────────────────────────────────
   CHART: Sales Over Time (SVG line chart)
───────────────────────────────────────────── */
function ChartSalesLine({ data = [] }) {
  if (!data.length) return <EmptyChart label="No sales data for this period" />;

  const W = 560, H = 150, PAD_L = 56, PAD_R = 20, PAD_T = 12, PAD_B = 24;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const revenues = data.map((d) => Number(d.revenue));
  const maxR     = Math.max(...revenues, 1);

  const pts = data.map((d, i) => {
    const x = PAD_L + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = PAD_T + chartH - (Number(d.revenue) / maxR) * chartH;
    return [Math.round(x), Math.round(y)];
  });

  const polyPts = pts.map((p) => p.join(',')).join(' ');
  const areaPts = [
    ...pts,
    [pts[pts.length - 1][0], PAD_T + chartH],
    [pts[0][0], PAD_T + chartH],
  ].map((p) => p.join(',')).join(' ');

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y:     Math.round(PAD_T + chartH - f * chartH),
    label: fmt(maxR * f),
  }));

  const step  = Math.max(1, Math.ceil(data.length / 7));
  const xLbls = data.filter((_, i) => i % step === 0 || i === data.length - 1);

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H + 16}`} width="100%" preserveAspectRatio="none">
        <defs>
          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#111" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#111" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {/* grid lines */}
        {ticks.map((t) => (
          <line key={t.y} x1={PAD_L} y1={t.y} x2={W - PAD_R} y2={t.y}
            stroke="#ebebeb" strokeWidth="1" />
        ))}
        {/* y-axis labels */}
        {ticks.map((t) => (
          <text key={t.y} x={PAD_L - 5} y={t.y + 3} textAnchor="end"
            fontSize="9" fill="#aaa">{t.label}</text>
        ))}
        {/* area fill */}
        <polygon points={areaPts} fill="url(#salesGrad)" />
        {/* line */}
        <polyline points={polyPts} fill="none" stroke="#111"
          strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {/* dots */}
        {pts.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="3.5" fill="#fff" stroke="#111" strokeWidth="2" />
        ))}
        {/* x-axis labels */}
        {xLbls.map((d, i) => {
          const origIdx = data.indexOf(d);
          const x = PAD_L + (origIdx / Math.max(data.length - 1, 1)) * chartW;
          return (
            <text key={i} x={Math.round(x)} y={H + 14}
              textAnchor="middle" fontSize="9" fill="#aaa">
              {d.dayName ? d.dayName.slice(0, 3) : d.month || d.day}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CHART: Top Selling Products (horizontal bars)
───────────────────────────────────────────── */
function ChartTopProducts({ data = [] }) {
  if (!data.length) return <EmptyChart label="No product sales for this period" />;

  const maxUnits = Math.max(...data.map((r) => Number(r.units)), 1);
  const BAR_MAX  = 280;
  const shades   = ['#111', '#2d2d2d', '#555', '#777', '#999'];

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 520 ${data.length * 38 + 10}`} width="100%">
        {data.map((r, i) => {
          const y  = 8 + i * 38;
          const bw = Math.round((Number(r.units) / maxUnits) * BAR_MAX);
          return (
            <g key={r.name}>
              <text x="128" y={y + 14} textAnchor="end"
                fontSize="10" fill="#444" fontWeight="600">
                {r.name.length > 17 ? r.name.slice(0, 16) + '…' : r.name}
              </text>
              <rect x="136" y={y + 1} height="22" width={bw} rx="5"
                fill={shades[i] ?? '#bbb'} />
              <text x={140 + bw} y={y + 16} fontSize="10"
                fill="#111" fontWeight="700">{r.units} units</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CHART: Customer Growth (vertical bars)
───────────────────────────────────────────── */
function ChartCustomerGrowth({ data = [] }) {
  if (!data.length) return <EmptyChart label="No customer data available" />;

  const W = 560, H = 150, PAD_L = 40, PAD_R = 20, PAD_T = 12, PAD_B = 24;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const vals   = data.map((d) => Number(d.newCustomers));
  const maxVal = Math.max(...vals, 1);
  const step   = chartW / data.length;
  const barW   = Math.max(10, Math.floor(step * 0.6));

  const ticks = [0, 0.5, 1].map((f) => ({
    y:     Math.round(PAD_T + chartH - f * chartH),
    label: Math.round(maxVal * f),
  }));

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H + 16}`} width="100%" preserveAspectRatio="none">
        {ticks.map((t) => (
          <line key={t.y} x1={PAD_L} y1={t.y} x2={W - PAD_R} y2={t.y}
            stroke="#ebebeb" strokeWidth="1" />
        ))}
        {ticks.map((t) => (
          <text key={t.y} x={PAD_L - 4} y={t.y + 3} textAnchor="end"
            fontSize="9" fill="#aaa">{t.label}</text>
        ))}
        {data.map((d, i) => {
          const barH = Math.max(3, (Number(d.newCustomers) / maxVal) * chartH);
          const x    = PAD_L + i * step + (step - barW) / 2;
          const y    = PAD_T + chartH - barH;
          return (
            <g key={i}>
              <rect x={Math.round(x)} y={Math.round(y)}
                width={barW} height={Math.round(barH)} rx="4" fill="#111" />
              <text x={Math.round(x + barW / 2)} y={H + 14}
                textAnchor="middle" fontSize="9" fill="#aaa">
                {d.month}
              </text>
              {Number(d.newCustomers) > 0 && (
                <text x={Math.round(x + barW / 2)} y={Math.round(y) - 4}
                  textAnchor="middle" fontSize="9" fill="#555" fontWeight="700">
                  {d.newCustomers}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CHART: Payment Summary (donut)
───────────────────────────────────────────── */
function ChartPaymentDonut({ data = {} }) {
  const { paid = 0, pending = 0, failed = 0, total = 0 } = data;

  const CIRC       = 2 * Math.PI * 70; // ≈ 439.8
  const paidPct    = total > 0 ? paid    / total : 0;
  const pendingPct = total > 0 ? pending / total : 0;
  const failedPct  = total > 0 ? failed  / total : 0;

  const paidArc    = paidPct    * CIRC;
  const pendingArc = pendingPct * CIRC;
  const failedArc  = failedPct  * CIRC;

  // SVG circles start at 3 o'clock; rotate to 12 o'clock via dashoffset
  const paidOff    = CIRC * 0.25;
  const pendingOff = -(paidArc    - CIRC * 0.25);
  const failedOff  = -(paidArc + pendingArc - CIRC * 0.25);

  return (
    <div className="donut-row">
      <svg viewBox="0 0 180 180" width="150" height="150" style={{ flexShrink: 0 }}>
        {/* track */}
        <circle cx="90" cy="90" r="70" fill="none" stroke="#f0f0f0" strokeWidth="26" />
        {total === 0 ? (
          <circle cx="90" cy="90" r="70" fill="none" stroke="#e5e5e5" strokeWidth="26" />
        ) : (
          <>
            <circle cx="90" cy="90" r="70" fill="none" stroke="#111" strokeWidth="26"
              strokeDasharray={`${paidArc} ${CIRC}`} strokeDashoffset={paidOff} strokeLinecap="butt" />
            <circle cx="90" cy="90" r="70" fill="none" stroke="#f59e0b" strokeWidth="26"
              strokeDasharray={`${pendingArc} ${CIRC}`} strokeDashoffset={pendingOff} strokeLinecap="butt" />
            <circle cx="90" cy="90" r="70" fill="none" stroke="#ef4444" strokeWidth="26"
              strokeDasharray={`${failedArc} ${CIRC}`} strokeDashoffset={failedOff} strokeLinecap="butt" />
          </>
        )}
        <text x="90" y="85" textAnchor="middle" fontSize="13" fontWeight="800" fill="#111">
          {fmt(total)}
        </text>
        <text x="90" y="102" textAnchor="middle" fontSize="9" fill="#aaa">Total</text>
      </svg>

      <div className="donut-legend">
        {[
          ['#111',    'Paid',    paid],
          ['#f59e0b', 'Pending', pending],
          ['#ef4444', 'Failed',  failed],
        ].map(([c, lbl, val]) => (
          <div key={lbl} className="donut-item">
            <span className="donut-dot" style={{ background: c }} />
            <div>
              <div className="donut-lbl">{lbl}</div>
              <div className="donut-val">{fmt(val)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Shared empty / skeleton states ─── */
function EmptyChart({ label }) {
  return (
    <div style={{
      height: 130, display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: '#ccc', fontSize: 13, gap: 8,
    }}>
      <span style={{ fontSize: 20 }}>📭</span> {label}
    </div>
  );
}

function SkeletonChart() {
  return (
    <div style={{
      height: 130,
      background: 'linear-gradient(90deg,#f5f5f5 25%,#ebebeb 50%,#f5f5f5 75%)',
      backgroundSize: '400% 100%',
      animation: 'shimmer 1.4s infinite',
      borderRadius: 8,
    }} />
  );
}

/* ─────────────────────────────────────────────
   CUSTOM DATE RANGE MODAL
───────────────────────────────────────────── */
function CustomRangeModal({ onApply, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const [start, setStart] = useState('');
  const [end,   setEnd]   = useState(today);
  const valid = start && end && start <= end;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 14, padding: '28px 32px',
        width: 330, boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
      }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 800, color: '#111' }}>
          Custom Date Range
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            ['Start Date', start, setStart, undefined, end || today],
            ['End Date',   end,   setEnd,   start,     today],
          ].map(([label, val, setter, minDate, maxDate]) => (
            <label key={label} style={{ fontSize: 12, fontWeight: 700, color: '#555' }}>
              {label}
              <input type="date" value={val} min={minDate} max={maxDate}
                onChange={(e) => setter(e.target.value)}
                style={{
                  display: 'block', width: '100%', marginTop: 6,
                  padding: '9px 12px', border: '1.5px solid #e0e0e0',
                  borderRadius: 8, fontSize: 13, outline: 'none',
                  boxSizing: 'border-box', fontFamily: 'inherit',
                }} />
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '10px 0', border: '1.5px solid #e0e0e0',
              borderRadius: 8, background: '#f5f5f5', cursor: 'pointer',
              fontSize: 13, fontWeight: 600 }}>
            Cancel
          </button>
          <button onClick={() => valid && onApply(start, end)}
            disabled={!valid}
            style={{ flex: 2, padding: '10px 0', border: 'none', borderRadius: 8,
              background: valid ? '#111' : '#ccc', color: '#fff', cursor: valid ? 'pointer' : 'default',
              fontSize: 13, fontWeight: 700 }}>
            Apply Range
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FILTER TABS
───────────────────────────────────────────── */
const FILTERS = [
  { label: 'Today',        period: 'today'   },
  { label: 'This Week',    period: 'week'    },
  { label: 'This Month',   period: 'month'   },
  { label: 'All Time',     period: 'alltime' },
  { label: 'Custom Range', period: 'custom'  },
];

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function Reports({ toast }) {
  const [activeFilter, setActiveFilter] = useState('alltime');
  const [customRange,  setCustomRange]  = useState({ start: '', end: '' });
  const [showModal,    setShowModal]    = useState(false);
  const [analytics,    setAnalytics]   = useState(null);
  const [loading,      setLoading]     = useState(false);
  const [error,        setError]       = useState(null);

  /* Fetch all analytics in one call */
  const fetchAnalytics = useCallback(async (period, start, end) => {
    setLoading(true);
    setError(null);
    try {
      const params = { period };
      if (period === 'custom') { params.start = start; params.end = end; }
      const res = await axios.get(`${API_BASE}/reports/analytics`, { params });
      if (res.data.success) {
        setAnalytics(res.data.data);
      } else {
        throw new Error(res.data.message || 'Unknown error');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to load data';
      setError(msg);
      toast?.('❌', `Report error: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchAnalytics('alltime'); }, [fetchAnalytics]);

  /* Filter click */
  const handleFilter = (period) => {
    if (period === 'custom') { setShowModal(true); return; }
    setActiveFilter(period);
    fetchAnalytics(period);
  };

  /* Custom range apply */
  const handleCustomApply = (start, end) => {
    setShowModal(false);
    setCustomRange({ start, end });
    setActiveFilter('custom');
    fetchAnalytics('custom', start, end);
  };

  /* Build query string for exports */
  const exportParams = () => {
    const p = activeFilter === 'custom'
      ? `period=custom&start=${customRange.start}&end=${customRange.end}`
      : `period=${activeFilter}`;
    return p;
  };

  /* Export handlers — open in new tab */
  const handleExportCsv = () => {
    window.open(`${API_BASE}/reports/export-csv?${exportParams()}`, '_blank');
    toast?.('📄', 'Downloading CSV…');
  };

  const handleExportPdf = () => {
    window.open(`${API_BASE}/reports/export-pdf?${exportParams()}`, '_blank');
    toast?.('📋', 'Opening PDF…');
  };

  /* KPI cards */
  const kpiItems = analytics
    ? [
        ['💰', fmt(analytics.revenue),               'Revenue'],
        ['🛒', analytics.orders.toLocaleString(),     'Orders'],
        ['👥', `+${analytics.newCustomers}`,          'New Customers'],
        ['🔄', `${analytics.returnRate}%`,            'Return Rate'],
      ]
    : [
        ['💰', '—', 'Revenue'],
        ['🛒', '—', 'Orders'],
        ['👥', '—', 'New Customers'],
        ['🔄', '—', 'Return Rate'],
      ];

  const activeLbl =
    activeFilter === 'custom' && customRange.start
      ? `${customRange.start} – ${customRange.end}`
      : FILTERS.find((f) => f.period === activeFilter)?.label ?? 'All Time';

  return (
    <div className="view">
      {/* Page header */}
      <div className="ph">
        <div>
          <h1 className="ph-title">Reports &amp; Analytics</h1>
          <p className="ph-sub">Business performance at a glance.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={handleExportCsv} disabled={loading}>
            ⬇️ Export CSV
          </button>
          <button className="btn-primary" onClick={handleExportPdf} disabled={loading}>
            ⬇️ Export PDF
          </button>
        </div>
      </div>

      {/* Date filter bar */}
      <div className="date-filters">
        {FILTERS.map(({ label, period }) => (
          <button
            key={period}
            className={`df-btn${activeFilter === period ? ' active' : ''}`}
            onClick={() => handleFilter(period)}
            disabled={loading}
          >
            {label}
            {period === 'custom' && customRange.start && activeFilter === 'custom' && (
              <span style={{ fontSize: 10, marginLeft: 4, opacity: 0.7 }}>
                ({customRange.start.slice(5)} → {customRange.end.slice(5)})
              </span>
            )}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#999', alignSelf: 'center', whiteSpace: 'nowrap' }}>
          {loading
            ? '⟳ Loading…'
            : analytics
              ? <>Showing: <strong style={{ color: '#111' }}>{activeLbl}</strong></>
              : null
          }
        </span>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fca5a5',
          borderRadius: 8, padding: '10px 16px', marginBottom: 16,
          fontSize: 13, color: '#b91c1c', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>⚠️ {error}</span>
          <button
            onClick={() => fetchAnalytics(activeFilter, customRange.start, customRange.end)}
            style={{
              background: 'none', border: '1px solid #fca5a5', borderRadius: 6,
              padding: '4px 12px', cursor: 'pointer', fontSize: 12, color: '#b91c1c',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI cards */}
      <MiniStats items={kpiItems} />

      {/* Charts grid */}
      <div className="charts-grid">

        {/* Sales Over Time */}
        <div className="admin-card chart-panel">
          <div className="c-hdr">
            <div>
              <div className="c-title">Sales Over Time</div>
              <div className="c-sub">Revenue trend · {activeLbl}</div>
            </div>
          </div>
          {loading ? <SkeletonChart /> : <ChartSalesLine data={analytics?.salesChart ?? []} />}
        </div>

        {/* Top Selling Products */}
        <div className="admin-card chart-panel">
          <div className="c-hdr">
            <div>
              <div className="c-title">Top Selling Products</div>
              <div className="c-sub">Units sold · {activeLbl}</div>
            </div>
          </div>
          {loading ? <SkeletonChart /> : <ChartTopProducts data={analytics?.topProducts ?? []} />}
        </div>

        {/* Customer Growth */}
        <div className="admin-card chart-panel">
          <div className="c-hdr">
            <div>
              <div className="c-title">Customer Growth</div>
              <div className="c-sub">New customers per month · last 7 months</div>
            </div>
          </div>
          {loading ? <SkeletonChart /> : <ChartCustomerGrowth data={analytics?.customerGrowth ?? []} />}
        </div>

        {/* Payments Summary */}
        <div className="admin-card chart-panel">
          <div className="c-hdr">
            <div>
              <div className="c-title">Payments Summary</div>
              <div className="c-sub">Paid vs Pending vs Failed · {activeLbl}</div>
            </div>
          </div>
          {loading ? <SkeletonChart /> : <ChartPaymentDonut data={analytics?.paymentSummary ?? {}} />}
        </div>

      </div>

      {/* Custom date range modal */}
      {showModal && (
        <CustomRangeModal
          onApply={handleCustomApply}
          onClose={() => setShowModal(false)}
        />
      )}

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </div>
  );
}
