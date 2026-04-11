import { useState } from 'react';
import { ORDERS_DATA, O_BADGE, P_BADGE, IcoSearch, Avatar, Badge } from './shared';

export default function Orders() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const pills = ['all','Delivered','Processing','Shipped','Pending','Cancelled'];
  const rows = ORDERS_DATA.filter(o =>
    (filter==='all'||o.oSt===filter) &&
    (!search||[o.id,o.cust,o.prod].some(v=>v.toLowerCase().includes(search.toLowerCase())))
  );
  return (
    <div className="view">
      <div className="ph"><div><h1 className="ph-title">Orders <span className="ph-badge">12 new</span></h1><p className="ph-sub">Track and manage all customer orders.</p></div></div>
      <div className="filter-pills">
        {pills.map(p=><button key={p} className={`fp${filter===p?' active':''}`} onClick={()=>setFilter(p)}>{p==='all'?'All Orders':p}</button>)}
      </div>
      <div className="toolbar">
        <div className="tb-search"><IcoSearch w={13}/><input className="tb-inp" placeholder="Search orders, customers…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
      </div>
      <div className="card" style={{overflow:'hidden'}}>
        <div className="tbl-wrap">
          <table className="tbl" style={{minWidth:1020}}>
            <thead><tr><th>Order ID</th><th>Customer</th><th>Product(s)</th><th>Order Status</th><th>Payment</th><th>Total</th><th>Actions</th></tr></thead>
            <tbody>
              {rows.map(o=>(
                <tr key={o.id}>
                  <td className="cell-id">{o.id}</td>
                  <td><div className="av-cell"><Avatar ini={o.ini}/><span>{o.cust}</span></div></td>
                  <td className="cell-dim">{o.prod}</td>
                  <td><Badge label={o.oSt} cls={O_BADGE[o.oSt]}/></td>
                  <td><Badge label={o.pSt} cls={P_BADGE[o.pSt]}/></td>
                  <td className="cell-price">{o.total}</td>
                  <td><div className="act-grp"><button className="ab ab-view">👁 View</button><button className="ab ab-edit">✏️ Edit</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
