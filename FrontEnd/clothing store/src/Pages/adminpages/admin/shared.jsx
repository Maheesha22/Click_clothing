/**
 * shared.jsx
 * ─────────────────────────────────────────────────────────────
 * All static data, lookup maps, SVG icons, small reusable
 * components, the useToast hook, and the Modal component.
 * Every page file imports exactly what it needs from here.
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useRef, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════════════════════ */
export const INIT_PRODUCTS = [
  { id:'PRD-001', e:'', name:'Classic White T-Shirt',  sku:'SKU-1001', cat:'Tops',        price:990.00, stock:120, status:'Active'   },
  { id:'PRD-002', e:'', name:'Slim Fit Denim Jeans',   sku:'SKU-1002', cat:'Bottoms',     price:3000.00, stock:85,  status:'Active'   },
  { id:'PRD-003', e:'', name:'Classic Denim Jacket',   sku:'SKU-1003', cat:'Outerwear',   price:2500.00, stock:5,   status:'Active'   },
  { id:'PRD-004', e:'', name:'Floral Summer Dress',    sku:'SKU-1004', cat:'Dresses',     price:4000.00, stock:40,  status:'Active'   },
  { id:'PRD-005', e:'', name:'White Canvas Sneakers',  sku:'SKU-1005', cat:'Footwear',    price:1100.00, stock:0,   status:'Inactive' },
  { id:'PRD-006', e:'', name:'Knit Cardigan',          sku:'SKU-1006', cat:'Tops',        price:1300.00, stock:7,   status:'Active'   },
  { id:'PRD-007', e:'', name:'Cargo Shorts',           sku:'SKU-1007', cat:'Bottoms',     price:950.00, stock:60,  status:'Active'   },
  { id:'PRD-008', e:'', name:'Wool Scarf',             sku:'SKU-1008', cat:'Accessories', price:1500.00, stock:3,   status:'Active'   },
  { id:'PRD-009', e:'', name:'Oxford Button-Up Shirt', sku:'SKU-1009', cat:'Tops',        price:1590.00, stock:55,  status:'Active'   },
  { id:'PRD-010', e:'', name:'Leather Loafers',        sku:'SKU-1010', cat:'Footwear',    price:800.00, stock:0,   status:'Inactive' },
  { id:'PRD-011', e:'', name:'Leather Gloves',         sku:'SKU-1011', cat:'Accessories', price:1500.00, stock:90,  status:'Active'   },
  { id:'PRD-012', e:'', name:'Bohemian Maxi Dress',    sku:'SKU-1012', cat:'Dresses',     price:3400.00, stock:22,  status:'Active'   },
];

export const INIT_CATEGORIES = [
  { name:' Tops',        desc:'T-shirts, blouses, shirts',       count:48, status:'Active'   },
  { name:' Bottoms',     desc:'Jeans, trousers, shorts, skirts', count:36, status:'Active'   },
  { name:' Outerwear',   desc:'Jackets, coats, blazers',         count:24, status:'Active'   },
  { name:' Dresses',     desc:'Casual, formal & party dresses',  count:31, status:'Active'   },
  { name:' Footwear',    desc:'Sneakers, heels, boots, sandals', count:19, status:'Active'   },
  { name:' Accessories', desc:'Bags, scarves, hats, belts',      count:52, status:'Active'   },
  { name:' Swimwear',    desc:'Swimsuits, bikinis, cover-ups',   count:14, status:'Inactive' },
];

export const ORDERS_DATA = [
  { id:'#ORD-7821', ini:'SL', cust:'Sophie Laurent',  prod:'Floral Maxi Dress',    oSt:'Delivered',  pSt:'Paid',    total:'$89.99'  },
  { id:'#ORD-7820', ini:'MC', cust:'Marcus Chen',     prod:'Slim Fit Chinos',       oSt:'Processing', pSt:'Pending', total:'$64.50'  },
  { id:'#ORD-7819', ini:'AP', cust:'Aisha Patel',     prod:'Oversized Blazer',      oSt:'Shipped',    pSt:'Paid',    total:'$129.00' },
  { id:'#ORD-7818', ini:'TE', cust:'Tom Eriksen',     prod:'Graphic Tee Bundle',    oSt:'Pending',    pSt:'Pending', total:'$45.00'  },
  { id:'#ORD-7817', ini:'ZW', cust:'Zara Williams',   prod:'High-Waist Jeans',      oSt:'Delivered',  pSt:'Paid',    total:'$78.00'  },
  { id:'#ORD-7816', ini:'LO', cust:'Liam Ortega',     prod:'Linen Summer Shirt',    oSt:'Cancelled',  pSt:'Failed',  total:'$52.00'  },
  { id:'#ORD-7815', ini:'NR', cust:'Nina Russo',      prod:'Wool Coat',             oSt:'Delivered',  pSt:'Paid',    total:'$199.00' },
  { id:'#ORD-7814', ini:'JP', cust:'James Park',      prod:'Knit Cardigan',         oSt:'Processing', pSt:'Pending', total:'$69.00'  },
  { id:'#ORD-7813', ini:'EK', cust:'Elena Kim',       prod:'Leather Loafers',       oSt:'Shipped',    pSt:'Paid',    total:'$89.99'  },
  { id:'#ORD-7812', ini:'BT', cust:'Ben Torres',      prod:'Classic White T-Shirt', oSt:'Pending',    pSt:'Pending', total:'$24.99'  },
];

export const CUSTOMERS_DATA = [
  { ini:'SL', name:'Sophie Laurent', id:'CUST-001', email:'sophie@email.com',  orders:14, spent:'$1,240.00', joined:'Jan 2025', status:'Active'   },
  { ini:'MC', name:'Marcus Chen',    id:'CUST-002', email:'marcus@email.com',  orders:8,  spent:'$876.50',   joined:'Mar 2025', status:'Active'   },
  { ini:'AP', name:'Aisha Patel',    id:'CUST-003', email:'aisha@email.com',   orders:22, spent:'$3,102.00', joined:'Nov 2024', status:'Active'   },
  { ini:'TE', name:'Tom Eriksen',    id:'CUST-004', email:'tom@email.com',     orders:3,  spent:'$145.00',   joined:'Feb 2026', status:'Inactive' },
  { ini:'ZW', name:'Zara Williams',  id:'CUST-005', email:'zara@email.com',    orders:11, spent:'$982.00',   joined:'Jun 2025', status:'Active'   },
  { ini:'LO', name:'Liam Ortega',    id:'CUST-006', email:'liam@email.com',    orders:7,  spent:'$563.00',   joined:'Sep 2025', status:'Active'   },
  { ini:'NR', name:'Nina Russo',     id:'CUST-007', email:'nina@email.com',    orders:19, spent:'$2,447.00', joined:'Aug 2024', status:'Active'   },
];

export const TRANSACTIONS = [
  { id:'PAY-9001', ini:'SL', cust:'Sophie Laurent', order:'#ORD-7821', amount:'$89.99',  method:'💳 COD',     status:'Paid',    date:'10 Mar 2026' },
  { id:'PAY-9002', ini:'MC', cust:'Marcus Chen',    order:'#ORD-7820', amount:'$64.50',  method:'🅿️ COD',     status:'Pending', date:'10 Mar 2026' },
  { id:'PAY-9003', ini:'AP', cust:'Aisha Patel',    order:'#ORD-7819', amount:'$129.00', method:'💳 COD',     status:'Paid',    date:'9 Mar 2026'  },
  { id:'PAY-9004', ini:'TE', cust:'Tom Eriksen',    order:'#ORD-7818', amount:'$45.00',  method:'💵 COD',     status:'Pending', date:'9 Mar 2026'  },
  { id:'PAY-9005', ini:'ZW', cust:'Zara Williams',  order:'#ORD-7817', amount:'$78.00',  method:'💳 COD',     status:'Paid',    date:'8 Mar 2026'  },
  { id:'PAY-9006', ini:'LO', cust:'Liam Ortega',    order:'#ORD-7816', amount:'$52.00',  method:'🅿️ COD',     status:'Failed',  date:'8 Mar 2026'  },
  { id:'PAY-9007', ini:'NR', cust:'Nina Russo',     order:'#ORD-7815', amount:'$199.00', method:'💳 COD',     status:'Paid',    date:'7 Mar 2026'  },
];

export const COURIERS = [
  { name:'🚚 DHL Express',  handled:142, period:'Feb 2026', amount:'$4,260', status:'Paid'       },
  { name:'📦 FedEx',        handled:98,  period:'Feb 2026', amount:'$2,940', status:'Pending'    },
  { name:'🏃 UPS',          handled:76,  period:'Feb 2026', amount:'$2,280', status:'Paid'       },
  { name:'⚡ Local Courier', handled:210, period:'Mar 2026', amount:'$3,150', status:'Pending'    },
  { name:'✈️ Aramex',       handled:55,  period:'Mar 2026', amount:'$1,650', status:'Processing' },
];

export const INVENTORY = [
  { name:'Classic White T-Shirt', sku:'SKU-1001', cat:'Tops',        stock:120, reorder:15, st:'In Stock'     },
  { name:'Slim Fit Denim Jeans',  sku:'SKU-1002', cat:'Bottoms',     stock:85,  reorder:20, st:'In Stock'     },
  { name:'Classic Denim Jacket',  sku:'SKU-1003', cat:'Outerwear',   stock:5,   reorder:20, st:'Out of Stock' },
  { name:'Floral Summer Dress',   sku:'SKU-1004', cat:'Dresses',     stock:40,  reorder:10, st:'In Stock'     },
  { name:'White Canvas Sneakers', sku:'SKU-1005', cat:'Footwear',    stock:0,   reorder:15, st:'Out of Stock' },
  { name:'Knit Cardigan',         sku:'SKU-1006', cat:'Tops',        stock:7,   reorder:15, st:'Low Stock'    },
  { name:'Wool Scarf',            sku:'SKU-1008', cat:'Accessories', stock:3,   reorder:10, st:'Low Stock'    },
  { name:'Leather Gloves',        sku:'SKU-1011', cat:'Accessories', stock:90,  reorder:12, st:'In Stock'     },
];

/* ── Lookup maps ── */
export const O_BADGE  = { Delivered:'b-delivered', Processing:'b-processing', Shipped:'b-shipped', Pending:'b-pending', Cancelled:'b-cancelled' };
export const P_BADGE  = { Paid:'b-paid', Pending:'b-pending', Failed:'b-failed' };
export const CAT_CLS  = { Tops:'cp-tops', Bottoms:'cp-bottoms', Outerwear:'cp-outerwear', Dresses:'cp-dresses', Footwear:'cp-footwear', Accessories:'cp-accessories' };
export const CAT_E    = { Tops:'', Bottoms:'', Outerwear:'🧥', Dresses:'', Footwear:'👟', Accessories:'' };
export const PER_PAGE = 10;

/* ═══════════════════════════════════════════════════════════
   INLINE SVG ICONS  (no icon library needed)
═══════════════════════════════════════════════════════════ */
export const IcoMenu     = () => <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
export const IcoSearch   = ({ w = 14 }) => <svg width={w} height={w} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
export const IcoBell     = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
export const IcoChevron  = () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>;
export const IcoPlus     = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
export const IcoClose    = () => <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
export const IcoDash     = () => <svg className="ni" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
export const IcoBox      = () => <svg className="ni" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
export const IcoTag      = () => <svg className="ni" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
export const IcoCart     = () => <svg className="ni" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
export const IcoUsers    = () => <svg className="ni" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
export const IcoArchive  = () => <svg className="ni" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>;
export const IcoCard     = () => <svg className="ni" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
export const IcoChartBar = () => <svg className="ni" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
export const IcoGear     = () => <svg className="ni" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
export const IcoLogout   = () => <svg className="ni" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

/* ═══════════════════════════════════════════════════════════
   REUSABLE SMALL COMPONENTS
═══════════════════════════════════════════════════════════ */
export const Badge = ({ label, cls }) => <span className={`badge ${cls}`}>{label}</span>;

export const Avatar = ({ ini }) => <div className="av">{ini}</div>;

export const StockBar = ({ stock }) => {
  const pct = Math.min(100, Math.round((stock / 120) * 100));
  const cls = stock === 0 ? 'sb-r' : stock <= 10 ? 'sb-a' : 'sb-g';
  return (
    <div className="stk-wrap">
      <div className="stk-bg"><div className={`stk-bar ${cls}`} style={{ width: `${pct}%` }} /></div>
      <span className="stk-num">{stock}</span>
    </div>
  );
};

export const MiniStats = ({ items }) => (
  <div className="mini-grid">
    {items.map(([ico, val, lbl]) => (
      <div key={lbl} className="mini-card">
        <div className="mini-ico">{ico}</div>
        <div><div className="mini-val">{val}</div><div className="mini-lbl">{lbl}</div></div>
      </div>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   TOAST HOOK
═══════════════════════════════════════════════════════════ */
export function useToast() {
  const [toast, setToast] = useState({ show: false, icon: '', msg: '' });
  const timer = useRef(null);
  const show = useCallback((icon, msg) => {
    clearTimeout(timer.current);
    setToast({ show: true, icon, msg });
    timer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  }, []);
  return { toast, show };
}

/* ═══════════════════════════════════════════════════════════
   MODAL
═══════════════════════════════════════════════════════════ */
export function Modal({ open, onClose, title, children, footer, compact }) {
  if (!open) return null;
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={compact ? { maxWidth: 380 } : {}}>
        {title && (
          <div className="m-hdr">
            <span className="m-title">{title}</span>
            <button className="m-x" onClick={onClose}><IcoClose /></button>
          </div>
        )}
        {children}
        {footer && <div className="m-ftr">{footer}</div>}
      </div>
    </div>
  );
}
