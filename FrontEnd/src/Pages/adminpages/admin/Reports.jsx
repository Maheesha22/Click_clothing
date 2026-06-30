/**
 * Reports.jsx
 * ─────────────────────────────────────────────────────────────
 * Reports & Analytics page for the Click Clothing admin dashboard.
 *
 * Date-filter bar: Today | This Week | This Month | All Time | Custom Range
 * On each filter click → fetches /api/reports/analytics?period=…
 * and re-renders all widgets:
 *   • KPI cards (Revenue, Orders, New Customers, Return Rate)
 *   • Sales Over Time chart
 *   • Top Selling Products chart
 *   • Customer Growth chart
 *   • Payments Summary donut
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import API from '../../../services/api';
import { MiniStats } from './shared';

/* ─── helpers ─── */
const fmt = (n) =>
  n >= 1_000_000
    ? `Rs ${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `Rs ${(n / 1_000).toFixed(1)}k`
    : `Rs ${n.toLocaleString()}`;

/* ══════════════════════════════════════════════════════════
   CHART COMPONENTS — all driven by live data props
══════════════════════════════════════════════════════════ */

/* ── Sales Over Time — area + line chart ── */
function ChartSalesLine({ data = [] }) {
  if (!data.length) return <EmptyChart label="No sales data for this period" />;

  const W = 560, H = 140, PAD_L = 50, PAD_R = 20, PAD_T = 10, PAD_B = 20;
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
  ]
    .map((p) => p.join(','))
    .join(' ');

  /* Y-axis ticks */
  const ticks = [0, 0.33, 0.67, 1].map((f) => ({
    y: Math.round(PAD_T + chartH - f * chartH),
    label: fmt(maxR * f),
  }));

  /* X-axis labels — show at most 8 evenly */
  const step  = Math.max(1, Math.ceil(data.length / 8));
  const xLbls = data.filter((_, i) => i % step === 0 || i === data.length - 1);

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H + 14}`} width="100%" preserveAspectRatio="none">
        <defs>
          <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#111" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#111" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* grid */}
        {ticks.map((t) => (
          <line key={t.y} x1={PAD_L} y1={t.y} x2={W - PAD_R} y2={t.y}
            stroke="#e4e4e4" strokeWidth="1" />
        ))}

        {/* y-axis labels */}
        {ticks.map((t) => (
          <text key={t.y} x={PAD_L - 4} y={t.y + 3} textAnchor="end"
            fontSize="9" fill="#9a9a9a">{t.label}</text>
        ))}

        {/* area fill */}
        <polygon points={areaPts} fill="url(#grad1)" />

        {/* line */}
        <polyline points={polyPts} fill="none" stroke="#111"
          strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* dots */}
        {pts.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="4" fill="#111" />
        ))}

        {/* x-axis labels */}
        {xLbls.map((d, i) => {
          const origIdx = data.indexOf(d);
          const x = PAD_L + (origIdx / Math.max(data.length - 1, 1)) * chartW;
          return (
            <text key={i} x={Math.round(x)} y={H + 12}
              textAnchor="middle" fontSize="9" fill="#9a9a9a">
              {d.dayName ? d.dayName.slice(0, 3) : d.month || d.day}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Top Selling Products — horizontal bar chart ── */
function ChartTopProducts({ data = [] }) {
  if (!data.length) return <EmptyChart label="No product sales for this period" />;

  const maxUnits = Math.max(...data.map((r) => Number(r.units)), 1);
  const BAR_MAX  = 280;

  const rows = data.map((r) => ({
    label: r.name,
    units: Number(r.units),
    w:     Math.round((Number(r.units) / maxUnits) * BAR_MAX),
  }));

  const shades = ['#111', '#333', '#555', '#777', '#999'];

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 520 ${Math.max(rows.length * 35 + 10, 60)}`} width="100%">
        {rows.map((r, i) => {
          const y = 8 + i * 35;
          return (
            <g key={r.label}>
              <text x="122" y={y + 14} textAnchor="end"
                fontSize="9.5" fill="#444" fontWeight="600"
                style={{ overflow: 'hidden' }}>
                {r.label.length > 18 ? r.label.slice(0, 17) + '…' : r.label}
              </text>
              <rect x="132" y={y} height="20" width={r.w} rx="4"
                fill={shades[i] ?? '#aaa'} />
              <text x={136 + r.w} y={y + 14} fontSize="9"
                fill="#111" fontWeight="700">{r.units}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Customer Growth — vertical bar chart ── */
function ChartCustomerGrowth({ data = [] }) {
  if (!data.length) return <EmptyChart label="No customer data for this period" />;

  const W = 560, H = 140, PAD_L = 45, PAD_R = 20, PAD_T = 10, PAD_B = 20;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const vals   = data.map((d) => Number(d.newCustomers));
  const maxVal = Math.max(...vals, 1);
  const barW   = Math.max(10, Math.floor((chartW / data.length) * 0.65));
  const step   = chartW / data.length;

  const ticks = [0, 0.33, 0.67, 1].map((f) => ({
    y:     Math.round(PAD_T + chartH - f * chartH),
    label: Math.round(maxVal * f),
  }));

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H + 14}`} width="100%" preserveAspectRatio="none">
        {ticks.map((t) => (
          <line key={t.y} x1={PAD_L} y1={t.y} x2={W - PAD_R} y2={t.y}
            stroke="#e4e4e4" strokeWidth="1" />
        ))}
        {ticks.map((t) => (
          <text key={t.y} x={PAD_L - 4} y={t.y + 3} textAnchor="end"
            fontSize="9" fill="#9a9a9a">{t.label}</text>
        ))}
        {data.map((d, i) => {
          const barH = Math.max(2, (Number(d.newCustomers) / maxVal) * chartH);
          const x    = PAD_L + i * step + (step - barW) / 2;
          const y    = PAD_T + chartH - barH;
          return (
            <g key={i}>
              <rect x={Math.round(x)} y={Math.round(y)}
                width={barW} height={Math.round(barH)} rx="4" fill="#111" />
              <text x={Math.round(x + barW / 2)} y={H + 12}
                textAnchor="middle" fontSize="9" fill="#9a9a9a">
                {d.month}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Payments Summary — donut chart ── */
function ChartPaymentDonut({ data = {} }) {
  const { paid = 0, pending = 0, failed = 0, total = 0 } = data;

  const CIRC  = 439.8; // 2π × 70
  const paidPct    = total > 0 ? paid    / total : 0;
  const pendingPct = total > 0 ? pending / total : 0;
  const failedPct  = total > 0 ? failed  / total : 0;

  /* dasharray for each arc segment */
  const paidArc    = paidPct    * CIRC;
  const pendingArc = pendingPct * CIRC;
  const failedArc  = failedPct  * CIRC;

  /* stroke offsets — start from top (−90 deg = offset 115 from circle's 0) */
  const paidOffset    = 115;
  const pendingOffset = -(paidArc    - 115);
  const failedOffset  = -(paidArc + pendingArc - 115);

  return (
    <div className="donut-row">
      <svg viewBox="0 0 180 180" width="150" height="150" style={{ flexShrink: 0 }}>
        {/* track */}
        <circle cx="90" cy="90" r="70" fill="none"
          stroke="#e4e4e4" strokeWidth="28" />

        {total === 0 ? (
          /* empty state ring */
          <circle cx="90" cy="90" r="70" fill="none"
            stroke="#ddd" strokeWidth="28" />
        ) : (
          <>
            {/* paid */}
            <circle cx="90" cy="90" r="70" fill="none"
              stroke="#111" strokeWidth="28"
              strokeDasharray={`${paidArc} ${CIRC}`}
              strokeDashoffset={paidOffset}
              strokeLinecap="butt" />
            {/* pending */}
            <circle cx="90" cy="90" r="70" fill="none"
              stroke="#f59e0b" strokeWidth="28"
              strokeDasharray={`${pendingArc} ${CIRC}`}
              strokeDashoffset={pendingOffset}
              strokeLinecap="butt" />
            {/* failed */}
            <circle cx="90" cy="90" r="70" fill="none"
              stroke="#ef4444" strokeWidth="28"
              strokeDasharray={`${failedArc} ${CIRC}`}
              strokeDashoffset={failedOffset}
              strokeLinecap="butt" />
          </>
        )}

        <text x="90" y="85" textAnchor="middle"
          fontSize="13" fontWeight="800" fill="#111">{fmt(total)}</text>
        <text x="90" y="101" textAnchor="middle"
          fontSize="9" fill="#9a9a9a">Total</text>
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

/* ── Empty / loading states ── */
function EmptyChart({ label }) {
  return (
    <div style={{
      height: 120, display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: '#bbb', fontSize: 13,
    }}>
      {label}
    </div>
  );
}

function SkeletonChart() {
  return (
    <div style={{
      height: 120, background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)',
      backgroundSize: '400% 100%', animation: 'shimmer 1.4s infinite',
      borderRadius: 8,
    }} />
  );
}

/* ══════════════════════════════════════════════════════════
   CUSTOM DATE PICKER MODAL
══════════════════════════════════════════════════════════ */
function CustomRangeModal({ onApply, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const [start, setStart] = useState('');
  const [end,   setEnd]   = useState(today);

  const handleApply = () => {
    if (!start || !end) return;
    if (start > end)    return;
    onApply(start, end);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: 12, padding: '28px 32px',
        width: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#111' }}>
          Custom Date Range
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>
            Start Date
            <input type="date" value={start} max={end || today}
              onChange={(e) => setStart(e.target.value)}
              style={inputStyle} />
          </label>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>
            End Date
            <input type="date" value={end} min={start} max={today}
              onChange={(e) => setEnd(e.target.value)}
              style={inputStyle} />
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={btnSecStyle}>Cancel</button>
          <button
            onClick={handleApply}
            disabled={!start || !end || start > end}
            style={{
              ...btnPrimStyle,
              opacity: (!start || !end || start > end) ? 0.45 : 1,
            }}
          >
            Apply Range
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  display: 'block', width: '100%', marginTop: 6, padding: '8px 10px',
  border: '1px solid #ddd', borderRadius: 8, fontSize: 13,
  outline: 'none', boxSizing: 'border-box',
};
const btnSecStyle = {
  flex: 1, padding: '9px 0', border: '1px solid #ddd', borderRadius: 8,
  background: '#f5f5f5', cursor: 'pointer', fontSize: 13, fontWeight: 600,
};
const btnPrimStyle = {
  flex: 2, padding: '9px 0', border: 'none', borderRadius: 8,
  background: '#111', color: '#fff', cursor: 'pointer',
  fontSize: 13, fontWeight: 700,
};

/* ══════════════════════════════════════════════════════════
   FILTER DEFINITIONS
══════════════════════════════════════════════════════════ */
const FILTERS = [
  { label: 'Today',        period: 'today'   },
  { label: 'This Week',    period: 'week'    },
  { label: 'This Month',   period: 'month'   },
  { label: 'All Time',     period: 'alltime' },
  { label: 'Custom Range', period: 'custom'  },
];

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function Reports({ toast }) {
  /* active filter */
  const [activeFilter, setActiveFilter] = useState('alltime');
  const [customRange,  setCustomRange]  = useState({ start: '', end: '' });
  const [showModal,    setShowModal]    = useState(false);

  /* analytics data */
  const [analytics,   setAnalytics]    = useState(null);
  const [loading,     setLoading]      = useState(false);
  const [error,       setError]        = useState(null);

  /* ── fetch from backend ── */
  const fetchAnalytics = useCallback(async (period, start, end) => {
    setLoading(true);
    setError(null);
    try {
      const params = { period };
      if (period === 'custom') { params.start = start; params.end = end; }

      const res = await API.get('/reports/analytics', { params });

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

  /* initial load */
  useEffect(() => {
    fetchAnalytics('alltime');
  }, [fetchAnalytics]);

  /* ── handle filter button click ── */
  const handleFilter = (period) => {
    if (period === 'custom') {
      setShowModal(true);          // open modal first
      return;
    }
    setActiveFilter(period);
    toast?.('📊', `Updating report data…`);
    fetchAnalytics(period);
  };

  /* ── handle custom range apply ── */
  const handleCustomApply = (start, end) => {
    setShowModal(false);
    setCustomRange({ start, end });
    setActiveFilter('custom');
    toast?.('📊', `Loading ${start} – ${end}…`);
    fetchAnalytics('custom', start, end);
  };

  /* ── KPI cards from analytics ── */
  const kpiItems = analytics
    ? [
        ['💰', fmt(analytics.revenue),        "Revenue"],
        ['🛒', analytics.orders.toLocaleString(), "Orders"],
        ['👥', `+${analytics.newCustomers}`,   "New Customers"],
        ['🔄', `${analytics.returnRate}%`,     "Return Rate"],
      ]
    : [
        ['💰', '—', "Revenue"],
        ['🛒', '—', "Orders"],
        ['👥', '—', "New Customers"],
        ['🔄', '—', "Return Rate"],
      ];

  /* ── active label for display ── */
  const activeLbl =
    activeFilter === 'custom' && customRange.start
      ? `${customRange.start} – ${customRange.end}`
      : FILTERS.find((f) => f.period === activeFilter)?.label ?? 'All Time';

  return (
    <div className="view">
      {/* ── Page header ── */}
      <div className="ph">
        <div>
          <h1 className="ph-title">Reports &amp; Analytics</h1>
          <p className="ph-sub">Business performance at a glance.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary"
            onClick={() => toast?.('📄', 'Exporting CSV…')}>
            ⬇️ Export CSV
          </button>
          <button className="btn-primary"
            onClick={() => toast?.('📋', 'Exporting PDF…')}>
            ⬇️ Export PDF
          </button>
        </div>
      </div>

      {/* ── Date filter bar ── */}
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

        {/* period badge */}
        {!loading && analytics && (
          <span style={{
            marginLeft: 'auto', fontSize: 12, color: '#888',
            alignSelf: 'center', whiteSpace: 'nowrap',
          }}>
            Showing: <strong style={{ color: '#111' }}>{activeLbl}</strong>
          </span>
        )}

        {/* loading spinner */}
        {loading && (
          <span style={{
            marginLeft: 'auto', fontSize: 12, color: '#888',
            alignSelf: 'center',
          }}>
            ⟳ Loading…
          </span>
        )}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fca5a5',
          borderRadius: 8, padding: '10px 16px', marginBottom: 16,
          fontSize: 13, color: '#b91c1c', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>⚠️ {error}</span>
          <button
            onClick={() => fetchAnalytics(
              activeFilter,
              customRange.start,
              customRange.end,
            )}
            style={{
              background: 'none', border: '1px solid #fca5a5',
              borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
              fontSize: 12, color: '#b91c1c',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── KPI mini stats ── */}
      <MiniStats items={kpiItems} />

      {/* ── Charts grid ── */}
      <div className="charts-grid">

        {/* Sales Over Time */}
        <div className="admin-card chart-panel">
          <div className="c-hdr">
            <div>
              <div className="c-title">Sales Over Time</div>
              <div className="c-sub">Revenue trend · {activeLbl}</div>
            </div>
          </div>
          {loading
            ? <SkeletonChart />
            : <ChartSalesLine data={analytics?.salesChart ?? []} />
          }
        </div>

        {/* Top Selling Products */}
        <div className="admin-card chart-panel">
          <div className="c-hdr">
            <div>
              <div className="c-title">Top Selling Products</div>
              <div className="c-sub">Units sold · {activeLbl}</div>
            </div>
          </div>
          {loading
            ? <SkeletonChart />
            : <ChartTopProducts data={analytics?.topProducts ?? []} />
          }
        </div>

        {/* Customer Growth */}
        <div className="admin-card chart-panel">
          <div className="c-hdr">
            <div>
              <div className="c-title">Customer Growth</div>
              <div className="c-sub">New customers per month (last 7)</div>
            </div>
          </div>
          {loading
            ? <SkeletonChart />
            : <ChartCustomerGrowth data={analytics?.customerGrowth ?? []} />
          }
        </div>

        {/* Payments Summary */}
        <div className="admin-card chart-panel">
          <div className="c-hdr">
            <div>
              <div className="c-title">Payments Summary</div>
              <div className="c-sub">Paid vs Pending vs Failed · {activeLbl}</div>
            </div>
          </div>
          {loading
            ? <SkeletonChart />
            : <ChartPaymentDonut data={analytics?.paymentSummary ?? {}} />
          }
        </div>

      </div>

      {/* ── Custom date range modal ── */}
      {showModal && (
        <CustomRangeModal
          onApply={handleCustomApply}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </div>
  );
}
