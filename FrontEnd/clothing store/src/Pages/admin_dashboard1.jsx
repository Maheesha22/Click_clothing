import { useState, useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import "./admin_dashboard1.css";

Chart.register(...registerables);

// ── DATA ──────────────────────────────────────────────
const revenueLabels = ['1','3','5','7','9','11'];
const incomeData    = [30000,45000,35000,60000,50000,72500];
const expenseLineData = [20000,30000,25000,40000,35000,45000];
const barLabels     = Array.from({length:15},(_,i)=>String(i+1));
const barExpense    = [4000,6000,5000,8000,7000,9000,6500,11000,9500,8000,10000,7000,12000,9000,8500];
const barPrev       = [3000,4500,5500,6000,5000,7000,8000,7500,9000,8500,9000,6500,8000,10000,7500];
const profitValues  = [20000,35000,28000,42000,38000,46900];

const transactions = [
  { type:"out", detail:"Send to Amrit",     status:"Paid",      badge:"paid",      amount:"$25.33",  date:"6 Nov, 2024" },
  { type:"in",  detail:"Grocery Sold",      status:"Withdrawn", badge:"withdrawn", amount:"$363.33", date:"1 Oct, 2024" },
  { type:"out", detail:"Electricity billed",status:"Sent",      badge:"sent",      amount:"$4,633",  date:"3 Oct, 2024" },
  { type:"in",  detail:"Bank Credited",     status:"Received",  badge:"received",  amount:"$382",    date:"7 Oct, 2024" },
];

const products = [
  { id:"P001", name:"Men T-Shirt",     total:100, sold:70, remaining:30, soldW:55, remW:30, revenue:"Rs. 35,000" },
  { id:"P002", name:"Women Dress",     total:80,  sold:60, remaining:20, soldW:60, remW:20, revenue:"Rs. 72,000" },
  { id:"P003", name:"Kids Shirt",      total:60,  sold:40, remaining:20, soldW:50, remW:25, revenue:"Rs. 20,000" },
  { id:"P004", name:"Denim Jacket",    total:50,  sold:35, remaining:15, soldW:55, remW:18, revenue:"Rs. 87,500" },
  { id:"P005", name:"Casual Shirt",    total:90,  sold:55, remaining:35, soldW:58, remW:35, revenue:"Rs. 41,250" },
  { id:"P006", name:"Formal Pants",    total:70,  sold:45, remaining:25, soldW:55, remW:28, revenue:"Rs. 67,500" },
  { id:"P007", name:"Skirt",           total:65,  sold:50, remaining:15, soldW:60, remW:18, revenue:"Rs. 62,500" },
  { id:"P008", name:"Hoodie",          total:85,  sold:60, remaining:25, soldW:58, remW:28, revenue:"Rs. 90,000" },
  { id:"P009", name:"Sports Wear Set", total:40,  sold:25, remaining:15, soldW:40, remW:18, revenue:"Rs. 50,000" },
  { id:"P010", name:"Summer Top",      total:75,  sold:48, remaining:27, soldW:52, remW:30, revenue:"Rs. 38,400" },
];

const navItems = [
  { key:"dashboard",   label:"Dashboard",        icon:"🏠" },
  { key:"sales",       label:"Sales",            icon:"🛍️" },
  { key:"revenue",     label:"Revenue",          icon:"💰" },
  { key:"expenses",    label:"Expenses",         icon:"📊" },
  { key:"transaction", label:"Transaction",      icon:"💳" },
  { key:"reports",     label:"Download Reports", icon:"📥" },
];

// ── DASHBOARD PAGE ─────────────────────────────────────
function DashboardPage() {
  const revenueRef = useRef();
  const expenseRef = useRef();
  const profitRef  = useRef();
  const pieRef     = useRef();
  const charts     = useRef({});

  useEffect(() => {
    const noAxes = { x:{display:false}, y:{display:false} };
    const destroy = (k) => { if (charts.current[k]) { charts.current[k].destroy(); } };

    destroy("revenue");
    charts.current.revenue = new Chart(revenueRef.current, {
      type: "line",
      data: { labels: revenueLabels, datasets: [
        { data: incomeData,      borderColor:"#22d3ee", borderWidth:2, pointRadius:0, tension:0.4, fill:false },
        { data: expenseLineData, borderColor:"#a78bfa", borderWidth:2, pointRadius:0, tension:0.4, fill:false },
      ]},
      options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{enabled:false}}, scales:noAxes },
    });

    destroy("expense");
    charts.current.expense = new Chart(expenseRef.current, {
      type: "bar",
      data: { labels: barLabels, datasets: [
        { data:barExpense, backgroundColor:"#a78bfa", borderRadius:3, barPercentage:0.5 },
        { data:barPrev,    backgroundColor:"#5b21b6", borderRadius:3, barPercentage:0.5 },
      ]},
      options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{enabled:false}}, scales:noAxes },
    });

    destroy("profit");
    charts.current.profit = new Chart(profitRef.current, {
      type: "bar",
      data: { labels: revenueLabels, datasets:[{ data:profitValues, backgroundColor:"#4b5563", borderRadius:3, barPercentage:0.6 }]},
      options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{enabled:false}}, scales:noAxes },
    });

    destroy("pie");
    charts.current.pie = new Chart(pieRef.current, {
      type: "doughnut",
      data: { datasets:[{ data:[33,25,42], backgroundColor:["#a3e635","#f59e0b","#e5e7eb"], borderWidth:0 }]},
      options: { rotation:-90, circumference:180, cutout:"62%", responsive:false, plugins:{legend:{display:false},tooltip:{enabled:false}} },
    });

    return () => Object.values(charts.current).forEach(c => c.destroy());
  }, []);

  return (
    <div className="page-content">
      {/* KPI Cards */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-head">
            <span className="kpi-title">Total Revenue</span>
            <button className="view-btn">view report</button>
          </div>
          <div className="kpi-value">Rs. 72,500.00</div>
          <div className="chart-wrap"><canvas ref={revenueRef} /></div>
          <div className="legend">
            <span><em className="dot cyan-dot" />Income</span>
            <span><em className="dot purple-dot" />Expense</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-head">
            <div>
              <div className="kpi-title">Daily Expenses</div>
              <div className="kpi-sub">Date from 1–15 March, 2026</div>
            </div>
            <button className="view-btn">view report</button>
          </div>
          <div className="chart-wrap"><canvas ref={expenseRef} /></div>
          <div className="legend">
            <span><em className="dot purple-dot" />Expenses</span>
            <span><em className="dot darkpurple-dot" />Compare to last month</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-head"><span className="kpi-title">Net Profit</span></div>
          <div className="kpi-value">Rs.46,900.00</div>
          <div className="chart-wrap"><canvas ref={profitRef} /></div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="section">
        <div className="sec-title">Transaction</div>
        <div className="tx-grid">

          <div className="white-card">
            <div className="white-card-head">
              <span className="white-card-title">Recent Transactions</span>
              <button className="see-all">See all →</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Details</th>
                  <th>Payment Status</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr key={i}>
                    <td>
                      <div className="tx-row">
                        <div className={`tx-icon ${tx.type}`}>{tx.type === "out" ? "↗" : "↙"}</div>
                        {tx.detail}
                      </div>
                    </td>
                    <td><span className={`badge badge-${tx.badge}`}>{tx.status}</span></td>
                    <td className="fw">{tx.amount}</td>
                    <td className="muted">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="white-card">
            <div className="white-card-head">
              <span className="white-card-title">Recent Transactions</span>
            </div>
            <div className="pie-wrap">
              <canvas ref={pieRef} width={160} height={160} />
              <div className="pie-center">100%</div>
            </div>
            <div className="pie-legend">
              <div><em className="dot lime-dot" />Profit <strong>33%</strong></div>
              <div><em className="dot amber-dot" />Expense <strong>25%</strong></div>
              <div><em className="dot gray-dot" />Expense <strong>42%</strong></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── SALES DATA ─────────────────────────────────────────
const salesMonthlyLabels = ['Sep','Oct','Nov','Dec','Jan','Feb','Mar'];
const salesData    = [800, 900, 1050, 1350, 980, 1100, 1250];
const returnsData  = [20,  25,  18,   30,   22,  20,   18];

const topProducts = [
  { name:"Classic White Shirt", units:312, revenue:"Rs. 24,960", pct:72 },
  { name:"Slim Fit Jeans",      units:278, revenue:"Rs. 33,360", pct:62 },
  { name:"Floral Summer Dress", units:245, revenue:"Rs. 36,750", pct:55 },
  { name:"Leather Jacket",      units:189, revenue:"Rs. 56,700", pct:42 },
];

const recentSales = [
  { id:"#ORD-0041", customer:"Amara Silva",     product:"White Shirt",    qty:2, amount:"Rs. 1,598", status:"Completed",  date:"14 Mar, 2026" },
  { id:"#ORD-0040", customer:"Rajan Perera",    product:"Slim Fit Jeans", qty:1, amount:"Rs. 2,400", status:"Processing", date:"13 Mar, 2026" },
  { id:"#ORD-0039", customer:"Nisha Fernando",  product:"Summer Dress",   qty:3, amount:"Rs. 4,500", status:"Completed",  date:"12 Mar, 2026" },
  { id:"#ORD-0038", customer:"Kamal Bandara",   product:"Leather Jacket", qty:1, amount:"Rs. 5,670", status:"Completed",  date:"11 Mar, 2026" },
  { id:"#ORD-0037", customer:"Dilini Rajapaksa",product:"Hoodie",         qty:2, amount:"Rs. 3,200", status:"Cancelled",  date:"10 Mar, 2026" },
];

// ── SALES PAGE ─────────────────────────────────────────
function SalesPage() {
  const salesChartRef = useRef();
  const salesChart    = useRef(null);

  useEffect(() => {
    if (salesChart.current) salesChart.current.destroy();
    salesChart.current = new Chart(salesChartRef.current, {
      type: "bar",
      data: {
        labels: salesMonthlyLabels,
        datasets: [
          { label:"Sales",   data:salesData,   backgroundColor:"rgba(34,211,238,0.15)", borderColor:"#22d3ee", borderWidth:2, borderRadius:4, barPercentage:0.5 },
          { label:"Returns", data:returnsData, backgroundColor:"rgba(167,139,250,0.3)", borderColor:"#a78bfa", borderWidth:2, borderRadius:4, barPercentage:0.5 },
        ],
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins: { legend:{ display:true, position:"top", labels:{ color:"#9ca3af", font:{size:12}, boxWidth:32, padding:16 } } },
        scales: {
          x: { ticks:{color:"#9ca3af"}, grid:{color:"rgba(255,255,255,0.05)"} },
          y: { ticks:{color:"#9ca3af"}, grid:{color:"rgba(255,255,255,0.05)"} },
        },
      },
    });
    return () => { if (salesChart.current) salesChart.current.destroy(); };
  }, []);

  return (
    <div className="page-content sales-page">
      <div className="sales-page-header">
        <h2 className="sales-page-title">Sales Overview</h2>
      </div>

      {/* KPI Cards */}
      <div className="sales-kpi-row">
        <div className="sales-kpi-card">
          <div className="sales-kpi-label">TOTAL SALES</div>
          <div className="sales-kpi-value">1,284</div>
          <div className="sales-kpi-change positive">▲ 12% vs last month</div>
        </div>
        <div className="sales-kpi-card">
          <div className="sales-kpi-label">REVENUE</div>
          <div className="sales-kpi-value">Rs. 98,400</div>
          <div className="sales-kpi-change positive">▲ 8.3% vs last month</div>
        </div>
        <div className="sales-kpi-card">
          <div className="sales-kpi-label">RETURNS</div>
          <div className="sales-kpi-value">43</div>
          <div className="sales-kpi-change negative">▼ 3.1% vs last month</div>
        </div>
        <div className="sales-kpi-card">
          <div className="sales-kpi-label">AVG. ORDER VALUE</div>
          <div className="sales-kpi-value">Rs. 766</div>
          <div className="sales-kpi-change positive">▲ 5% vs last month</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="sales-charts-row">
        <div className="sales-dark-card sales-chart-card">
          <div className="sales-card-title">Monthly Sales Trend</div>
          <div style={{height:280}}><canvas ref={salesChartRef} /></div>
        </div>
        <div className="sales-dark-card sales-top-card">
          <div className="sales-card-title">Top Selling Products</div>
          <div className="top-products-list">
            {topProducts.map((p, i) => (
              <div key={i} className="top-product-item">
                <div className="top-product-info">
                  <div className="top-product-name">{p.name}</div>
                  <div className="top-product-units">{p.units} units sold</div>
                  <div className="top-product-bar-track">
                    <div className="top-product-bar-fill" style={{width:`${p.pct}%`}} />
                  </div>
                </div>
                <div className="top-product-revenue">{p.revenue}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="sales-dark-card sales-table-section">
        <div className="sales-table-head">
          <span className="sales-card-title">Recent Sales</span>
          <button className="sales-see-all">See all →</button>
        </div>
        <table className="recent-sales-table">
          <thead>
            <tr>
              <th>Order ID</th><th>Customer</th><th>Product</th>
              <th>Qty</th><th>Amount</th><th>Status</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentSales.map((s, i) => (
              <tr key={i}>
                <td className="order-id">{s.id}</td>
                <td className="customer-name">{s.customer}</td>
                <td>{s.product}</td>
                <td>{s.qty}</td>
                <td className="sale-amount">{s.amount}</td>
                <td><span className={`sale-badge sale-badge-${s.status.toLowerCase()}`}>{s.status}</span></td>
                <td className="sale-date">{s.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── COMING SOON ────────────────────────────────────────
function ComingSoon({ icon, title }) {
  return (
    <div className="coming-soon">
      <div className="coming-soon-icon">{icon}</div>
      <div className="coming-soon-title">{title}</div>
      <div className="coming-soon-sub">This section is under construction</div>
    </div>
  );
}

// ── MAIN EXPORT ────────────────────────────────────────
export default function Dashboard() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":   return <DashboardPage />;
      case "sales":       return <SalesPage />;
      case "revenue":     return <ComingSoon icon="💰" title="Revenue" />;
      case "expenses":    return <ComingSoon icon="📊" title="Expenses" />;
      case "transaction": return <ComingSoon icon="💳" title="Transactions" />;
      case "reports":     return <ComingSoon icon="📥" title="Download Reports" />;
      default:            return <DashboardPage />;
    }
  };

  return (
    <div className="dashboard-root">
      {/* Sidebar */}
      <aside className="sidebar">

        <div className="logo">
          <img src="" alt="" style={{ width: 40, height: 40, objectFit: 'contain', marginRight: 8 }} />
          <span style={{ fontWeight: 800, color: '#1e3a8a', fontSize: 18 }}>CLiCK</span>
        </div>

        <nav>
          {navItems.map((item) => (
            <div
              key={item.key}
              className={`nav-item ${activePage === item.key ? "active" : ""}`}
              onClick={() => setActivePage(item.key)}
            >
              <div className="nav-icon">{item.icon}</div>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="main">
        <header className="topbar">
          <div className="greeting">
            Hi Nithya <span className="online-dot" />
          </div>
          <div className="avatar">👤</div>
        </header>

        <div className="page-wrapper" key={activePage}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}