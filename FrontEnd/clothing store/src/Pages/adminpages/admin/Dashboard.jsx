import { useState } from 'react';
import { ORDERS_DATA, O_BADGE, Avatar, Badge, MiniStats } from './shared';

/* ── Sales Analytics — grouped bar chart (Dashboard only) ── */
function ChartSalesBar() {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const rev  = [62, 88, 75, 112, 118, 120, 100];
  const ord  = [30, 42, 36,  54,  60,  70,  48];
  return (
    <div className="chart-wrap">
      <svg viewBox="0 0 560 160" width="100%" preserveAspectRatio="none">
        {[10, 50, 90, 130].map(y => <line key={y} x1="40" y1={y} x2="540" y2={y} stroke="#e4e4e4" strokeWidth="1"/>)}
        {[['$9k',10],['$6k',50],['$3k',90],['$0',130]].map(([l,y]) =>
          <text key={l} x="32" y={y+3} textAnchor="end" fontSize="9" fill="#9a9a9a">{l}</text>)}
        {days.map((d, i) => {
          const rx = 52 + i * 70;
          return (
            <g key={d}>
              <rect x={rx}    y={130 - rev[i]} width="22" height={rev[i]} rx="4" fill="#111"/>
              <rect x={rx+24} y={130 - ord[i]} width="22" height={ord[i]} rx="4" fill="#d1d5db"/>
              <text x={rx + 23} y="150" textAnchor="middle" fontSize="9" fill="#9a9a9a">{d}</text>
            </g>
          );
        })}
      </svg>
      <div className="chart-legend">
        <span className="legend-item"><i style={{ background:'#111' }}/>Revenue</span>
        <span className="legend-item"><i style={{ background:'#d1d5db' }}/>Orders</span>
      </div>
    </div>
  );
}

export default function Dashboard({ goOrders }) {
  const [tab, setTab] = useState('weekly');
  return (
    <div className="view">
      <div className="ph">
        <div>
          <h1 className="ph-title">Dashboard Overview</h1>
          <p className="ph-sub">Welcome back, Admin — here's what's happening today.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        {[
          { lbl:'Total Products', val:'1,284',    chg:'↗ +18 this month',       ico:'📦' },
          { lbl:'Total Orders',   val:'8,471',    chg:'↗ +124 this week',       ico:'🛒' },
          { lbl:'Customers',      val:'3,920',    chg:'↗ +52 new today',        ico:'👥' },
          { lbl:'Total Revenue',  val:'$284,920', chg:'↗ +12.4% vs last month', ico:'📈' },
        ].map(s => (
          <div key={s.lbl} className="card stat-card">
            <div className="stat-body">
              <div>
                <div className="stat-lbl">{s.lbl}</div>
                <div className="stat-val">{s.val}</div>
                <div className="stat-chg">{s.chg}</div>
              </div>
              <div className="stat-ico">{s.ico}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Low stock */}
      <div className="mid-grid">
        <div className="chart-card">
          <div className="c-hdr">
            <div><div className="c-title">Sales Analytics</div><div className="c-sub">Revenue &amp; order trends</div></div>
            <div className="tog-grp">
              <button className={`tog-btn${tab === 'weekly' ? ' active' : ''}`}  onClick={() => setTab('weekly')}>Weekly</button>
              <button className={`tog-btn${tab === 'monthly' ? ' active' : ''}`} onClick={() => setTab('monthly')}>Monthly</button>
            </div>
          </div>
          <ChartSalesBar />
        </div>

        <div className="ls-card">
          <div className="ls-hd">
            <div className="ls-ic">⚠️</div>
            <div><div className="c-title">Low Stock Alerts</div><div className="c-sub">4 items need attention</div></div>
          </div>
          <div className="ls-list">
            {[
              { e:'', nm:'Striped Polo Shirt', sku:'SKU-4421', cnt:'3 left', cls:'c-r' },
              { e:'', nm:'Denim Jacket (M)',   sku:'SKU-3312', cnt:'5 left', cls:'c-o' },
              { e:'', nm:'White Sneakers',      sku:'SKU-5501', cnt:'7 left', cls:'c-o' },
              { e:'', nm:'Knit Cardigan (S)',   sku:'SKU-2287', cnt:'4 left', cls:'c-r' },
            ].map(item => (
              <div key={item.sku} className="ls-row">
                <div className="ls-l">
                  <div className="ls-th">{item.e}</div>
                  <div><div className="ls-nm">{item.nm}</div><div className="ls-sk">{item.sku}</div></div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div className={`ls-cnt ${item.cls}`}>{item.cnt}</div>
                  <button className="restock-btn">Restock →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders table */}
      <div className="admin_card" style={{ padding:'20px 22px' }}>
        <div className="c-hdr">
          <div><div className="c-title">Recent Orders</div><div className="c-sub">Latest 6 transactions</div></div>
          <button className="btn-secondary" style={{ fontSize:12, padding:'7px 14px' }} onClick={goOrders}>View All</button>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Status</th><th>Price</th></tr></thead>
            <tbody>
              {ORDERS_DATA.slice(0, 6).map(o => (
                <tr key={o.id}>
                  <td className="cell-id">{o.id}</td>
                  <td><div className="av-cell"><Avatar ini={o.ini}/><span>{o.cust}</span></div></td>
                  <td className="cell-dim">{o.prod}</td>
                  <td><Badge label={o.oSt} cls={O_BADGE[o.oSt]}/></td>
                  <td className="cell-price">{o.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
