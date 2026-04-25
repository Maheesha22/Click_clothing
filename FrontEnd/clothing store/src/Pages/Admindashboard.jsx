/**
 * Click Clothing Store — Admin Dashboard
 * ─────────────────────────────────────────
 * ZERO external libraries.
 * Only React (useState, useRef, useCallback) is used.
 * All charts are pure inline SVG.
 *
 * Setup:
 *   1. Place all files in the same folder as AdminDashboard.css.
 *   2. In index.jsx / App.jsx:
 *        import AdminDashboard from './AdminDashboard';
 *   3. Add DM Sans to public/index.html <head>:
 *        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap" rel="stylesheet"/>
 */
import { useState } from 'react';
import './AdminDashboard.css';

import {
  useToast,
  IcoMenu, IcoSearch, IcoBell, IcoChevron,
  IcoDash, IcoBox, IcoTag, IcoCart, IcoUsers,
  IcoArchive, IcoCard, IcoChartBar, IcoGear,
} from './shared';

import Dashboard  from './Dashboard';
import Products   from './Products';
import Categories from './Categories';
import Orders     from './Orders';
import Customers  from './Customers';
import Inventory  from './Inventory';
import Payments   from './Payments';
import Reports    from './Reports';
import Settings   from './Settings';
import Logout     from './Logout';

/* ═══════════════════════════════════════════════════════════
   SIDEBAR NAV CONFIG
═══════════════════════════════════════════════════════════ */
const NAV = [
  { id:'dash',       label:'Dashboard',  Icon:IcoDash,     group:'Main'     },
  { id:'products',   label:'Products',   Icon:IcoBox,      group:'Main'     },
  { id:'categories', label:'Categories', Icon:IcoTag,      group:'Main'     },
  { id:'orders',     label:'Orders',     Icon:IcoCart,     badge:'12', group:'Commerce' },
  { id:'customers',  label:'Customers',  Icon:IcoUsers,    group:'Commerce' },
  { id:'inventory',  label:'Inventory',  Icon:IcoArchive,  group:'Commerce' },
  { id:'payments',   label:'Payments',   Icon:IcoCard,     group:'Finance'  },
  { id:'reports',    label:'Reports',    Icon:IcoChartBar, group:'Finance'  },
  { id:'settings',   label:'Settings',   Icon:IcoGear,     group:null       },
];

/* ═══════════════════════════════════════════════════════════
   ROOT COMPONENT
═══════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive]       = useState('dash');
  const { toast, show }           = useToast();

  const renderView = () => {
    switch (active) {
      case 'dash':       return <Dashboard  goOrders={()=>setActive('orders')}/>;
      case 'products':   return <Products   toast={show}/>;
      case 'categories': return <Categories toast={show}/>;
      case 'orders':     return <Orders/>;
      case 'customers':  return <Customers/>;
      case 'inventory':  return <Inventory  toast={show}/>;
      case 'payments':   return <Payments/>;
      case 'reports':    return <Reports    toast={show}/>;
      case 'settings':   return <Settings   toast={show}/>;
      default:           return null;
    }
  };

  let lastGroup = null;
  return (
    <>
      {/* ── SIDEBAR ── */}
      <aside className={`sidebar${collapsed?' collapsed':''}`}>
        <div className="s-logo">
          <div className="s-mark">👕</div>
          <div className="s-text">
            <span className="s-name">Click Clothing</span>
            <span className="s-sub">Store Admin</span>
          </div>
        </div>
        <nav className="s-nav">
          {NAV.map((item, idx) => {
            const divider   = idx > 0 && item.group !== NAV[idx-1]?.group;
            const showGroup = item.group && item.group !== lastGroup;
            if (item.group) lastGroup = item.group;
            return (
              <div key={item.id}>
                {divider   && <div className="s-div"/>}
                {showGroup && <div className="s-grp"><span className="lbl">{item.group}</span></div>}
                <button className={`nav-item${active===item.id?' active':''}`} onClick={()=>setActive(item.id)}>
                  <item.Icon/>
                  <span className="lbl">{item.label}</span>
                  {item.badge && <><span className="n-badge lbl">{item.badge}</span><span className="n-dot-nav"/></>}
                </button>
              </div>
            );
          })}
        </nav>
        <div className="s-foot">
          <Logout/>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className={`main-wrap${collapsed?' collapsed':''}`}>
        <header className="top-hdr">
          <button className="menu-btn" onClick={()=>setCollapsed(c=>!c)}><IcoMenu/></button>
          <div className="h-search">
            <IcoSearch/>
            <input className="h-inp" type="text" placeholder="Search products, orders, customers…"/>
          </div>
          <div className="h-right">
            <div className="icon-btn"><IcoBell/><span className="notif-dot"/></div>
            <div className="admin-pill">
              <div className="a-av">AD</div>
              <div><div className="a-name">Admin</div><div className="a-role">Super Admin</div></div>
              <IcoChevron/>
            </div>
          </div>
        </header>
        <main className="pg">{renderView()}</main>
      </div>

      {/* ── TOAST ── */}
      <div className={`toast${toast.show?' show':''}`}>
        <span>{toast.icon}</span><span>{toast.msg}</span>
      </div>
    </>
  );
}
