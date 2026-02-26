import { useState, useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import "./admin_dashboard1.css";
//import logo from "./logo.png";

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

// ── SALES PAGE ─────────────────────────────────────────
function SalesPage() {
  return (
    <div className="page-content">
      <div className="section">
        <div className="sales-summary-card">
          <div className="sales-summary-title">
            Click Clothing Store – Product Sales Summary
          </div>

          <div className="sales-summary-kpis">
            <div className="s-kpi orange">
              <div className="s-kpi-icon">🌟</div>
              <div>
                <div className="s-kpi-label">Total Products</div>
                <div className="s-kpi-value">665</div>
              </div>
            </div>
            <div className="s-kpi green">
              <div className="s-kpi-icon">🛒</div>
              <div>
                <div className="s-kpi-label">Sold Products</div>
                <div className="s-kpi-value">488</div>
              </div>
            </div>
            <div className="s-kpi blue">
              <div className="s-kpi-icon">📦</div>
              <div>
                <div className="s-kpi-label">Remaining Stock</div>
                <div className="s-kpi-value">177</div>
              </div>
            </div>
            <div className="s-kpi purple">
              <div className="s-kpi-icon">💰</div>
              <div>
                <div className="s-kpi-label">Total Revenue</div>
                <div className="s-kpi-value">Rs. 5,54,150</div>
              </div>
            </div>
          </div>

          <div className="sales-table-wrap">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Total Products</th>
                  <th>Sold Products</th>
                  <th>Remaining Stock (Ithiriya)</th>
                  <th>💰 Total Revenue (Rs)</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="pid">{p.id}</td>
                    <td className="pname">{p.name}</td>
                    <td><span className="qty-badge orange-bg">{p.total}</span></td>
                    <td>
                      <span className="bar-cell">
                        <span className="mini-bar green-bar" style={{width: p.soldW}} />
                        <span className="bar-num green-num">{p.sold}</span>
                      </span>
                    </td>
                    <td>
                      <span className="bar-cell">
                        <span className="mini-bar blue-bar" style={{width: p.remW}} />
                        <span className="bar-num blue-num">{p.remaining}</span>
                      </span>
                    </td>
                    <td className="rev-cell">💚 {p.revenue}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td colSpan={2} className="total-label">TOTAL</td>
                  <td><span className="qty-badge yellow-bg">665</span></td>
                  <td><span className="qty-badge teal-bg">488</span></td>
                  <td><span className="qty-badge yellow-bg">177 📈</span></td>
                  <td className="total-rev">Rs. 5,54,150</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
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
          <img src={logo} alt="CLiCK Logo" />
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
            Hi NIthya <span className="online-dot" />
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