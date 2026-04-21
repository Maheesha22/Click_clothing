import { CUSTOMERS_DATA, IcoSearch, Avatar, Badge } from './shared';

export default function Customers() {
  return (
    <div className="view">
      <div className="ph"><div><h1 className="ph-title">Customers</h1><p className="ph-sub">Manage your customer base.</p></div></div>
      <div className="toolbar">
        <div className="tb-search"><IcoSearch w={13}/><input className="tb-inp" placeholder="Search customers…"/></div>
        <select className="tb-sel"><option value="">All Status</option><option>Active</option><option>Inactive</option></select>
      </div>
      <div className="card" style={{overflow:'hidden'}}>
        <div className="tbl-wrap">
          <table className="tbl" style={{minWidth:900}}>
            <thead><tr><th>Customer</th><th>Email</th><th>Orders</th><th>Total Spent</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {CUSTOMERS_DATA.map(c=>(
                <tr key={c.id}>
                  <td><div className="av-cell"><Avatar ini={c.ini}/><div><div className="cell-nm">{c.name}</div><div className="cell-sub">{c.id}</div></div></div></td>
                  <td className="cell-dim">{c.email}</td>
                  <td className="cell-price">{c.orders}</td>
                  <td className="cell-price">{c.spent}</td>
                  <td className="cell-dim">{c.joined}</td>
                  <td><Badge label={c.status} cls={c.status==='Active'?'b-active':'b-inactive'}/></td>
                  <td><div className="act-grp"><button className="ab ab-view">👁 View</button><button className="ab ab-edit">✏️ Edit</button><button className="ab ab-del">🗑️</button></div></td>
                </tr>
      
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
