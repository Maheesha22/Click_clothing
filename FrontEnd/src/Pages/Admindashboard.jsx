
import { useState } from 'react';
import './Admindashboard.css';

import {
  useToast,
  IcoMenu, IcoSearch, IcoBell, IcoChevron,
  IcoDash, IcoBox, IcoTag, IcoCart, IcoUsers,
  IcoArchive, IcoCard, IcoChartBar, IcoGear,
} from './adminpages/admin/shared';
import NotificationBell from '../Components/NotificationBell';
import logo from '../assets/Logo.jpg';

/* Star icon for Reviews nav */
const IcoStar = () => <svg className="ni" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

import Dashboard from './adminpages/admin/Dashboard';
import Products from './adminpages/admin/Products';
import Categories from './adminpages/admin/Categories';
import Orders from './adminpages/admin/Orders';
import Returns from './adminpages/admin/Returns';
import Reviews from './adminpages/admin/Reviews';
import Feedbacks from './adminpages/admin/Feedbacks';
import Customers from './adminpages/admin/Customers';
import Payments from './adminpages/admin/Payments';
import Reports from './adminpages/admin/Reports';
import Settings from './adminpages/admin/Settings';
import Logout from './adminpages/admin/Logout';
import BankSlips from './adminpages/admin/BankSlips';


const NAV = [
  { id: 'dash', label: 'Dashboard', Icon: IcoDash, group: 'Main' },
  { id: 'products', label: 'Products', Icon: IcoBox, group: 'Main' },
  { id: 'categories', label: 'Categories', Icon: IcoTag, group: 'Main' },
  { id: 'orders', label: 'Orders', Icon: IcoCart, group: 'Commerce' },
  { id: 'bank-slips', label: 'Bank Slips', Icon: IcoCard, group: 'Commerce' },
  { id: 'returns', label: 'Returns', Icon: IcoArchive, group: 'Commerce' },
  { id: 'customers', label: 'Customers', Icon: IcoUsers, group: 'Commerce' },
  { id: 'reviews', label: 'Reviews', Icon: IcoStar, group: 'Feedback & Reviews' },
  { id: 'feedbacks', label: 'Feedbacks', Icon: IcoStar, group: 'Feedback & Reviews' },
  { id: 'payments', label: 'Payments', Icon: IcoCard, group: 'Finance' },
  { id: 'reports', label: 'Reports', Icon: IcoChartBar, group: 'Finance' },
  { id: 'settings', label: 'Settings', Icon: IcoGear, group: null },
];


export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState('dash');
  const [restockItem, setRestockItem] = useState(null);
  const { toast, show } = useToast();

  const handleRestock = (item) => {
    setRestockItem(item);
    setActive('products');
  };

  const renderView = () => {
    switch (active) {
      case 'dash': return <Dashboard goOrders={() => setActive('orders')} onRestock={handleRestock} />;
      case 'products': return <Products 
        toast={show} 
        initialData={restockItem} 
        clearInitialData={() => setRestockItem(null)} 
      />;
      case 'categories': return <Categories toast={show} />;
      case 'orders': return <Orders />;
      case 'bank-slips': return <BankSlips />;
      case 'returns': return <Returns />;
      case 'reviews': return <Reviews />;
      case 'feedbacks': return <Feedbacks />;
      case 'customers': return <Customers />;
      case 'payments': return <Payments />;
      case 'reports': return <Reports toast={show} />;
      case 'settings': return <Settings toast={show} />;
      default: return null;
    }
  };

  let lastGroup = null;
  return (
    <>
      {/* ── SIDEBAR ── */}
      <aside className={`admin-sidebar${collapsed ? ' collapsed' : ' open'}`}>
        <div className="s-logo">
          <div className="s-mark"><img src={logo} className="s-mark-img" alt="Click Clothing"/></div>
          <div className="s-text">
            <span className="s-name">Click Clothing</span>
            <span className="s-sub">Store Admin</span>
          </div>
        </div>
        <nav className="s-nav">
          {NAV.map((item, idx) => {
            const divider = idx > 0 && item.group !== NAV[idx - 1]?.group;
            const showGroup = item.group && item.group !== lastGroup;
            if (item.group) lastGroup = item.group;
            return (
              <div key={item.id}>
                {divider && <div className="s-div" />}
                {showGroup && <div className="s-grp"><span className="lbl">{item.group}</span></div>}
                <button className={`nav-item${active === item.id ? ' active' : ''}`} onClick={() => { setActive(item.id); window.innerWidth <= 992 && setCollapsed(true); }}>
                  <item.Icon />
                  <span className="lbl">{item.label}</span>
                  {item.badge && <><span className="n-badge lbl">{item.badge}</span><span className="n-dot-nav" /></>}
                </button>
              </div>
            );
          })}
        </nav>
        <div className="s-foot">
          <Logout />
        </div>
      </aside>

      {/* ── MOBILE BACKDROP ── */}
      <div className={`admin-backdrop${!collapsed ? ' show' : ''}`} onClick={() => setCollapsed(true)} />

      {/* ── MAIN ── */}
      <div className={`main-wrap${collapsed ? ' collapsed' : ''}`}>
        <header className="top-hdr">
          <button className="menu-btn" onClick={() => setCollapsed(c => !c)}><IcoMenu /></button>
          <div className="h-search">
            <IcoSearch />
            <input className="h-inp" type="text" placeholder="Search products, orders, customers…" />
          </div>
          <div className="h-right">
            <NotificationBell />
            <div className="admin-pill">
              <div className="a-av">AD</div>
              <div><div className="a-name">Admin</div><div className="a-role">Super Admin</div></div>
              <IcoChevron />
            </div>
          </div>
        </header>
        <main className="pg">{renderView()}</main>
      </div>

      {/* ── TOAST ── */}
      <div className={`toast${toast.show ? ' show' : ''}`}>
        <span>{toast.icon}</span><span>{toast.msg}</span>
      </div>
    </>
  );
}
