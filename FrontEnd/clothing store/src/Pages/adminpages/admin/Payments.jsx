import { TRANSACTIONS, COURIERS, Avatar, Badge, MiniStats } from './shared';

export default function Payments() {
  const tBadge = { Paid:'b-paid', Pending:'b-pending', Failed:'b-failed' };
  const cBadge = { Paid:'b-courier-paid', Pending:'b-courier-pending', Processing:'b-courier-processing' };
  return (
    <div className="view">
      <div className="ph"><div><h1 className="ph-title">Payments</h1><p className="ph-sub">Transaction records &amp; courier payment management.</p></div></div>
      <MiniStats items={[['💰','$284,920','Total Revenue'],['✅','$271,440','Paid'],['⏳','$9,480','Pending'],['❌','$4,000','Failed']]}/>

      <div className="card" style={{overflow:'hidden',marginBottom:16}}>
        <div className="card-hdr-pad"><div className="c-title">Payment Transactions</div></div>
        <div className="tbl-wrap">
          <table className="tbl" style={{minWidth:1000}}>
            <thead><tr><th>Payment ID</th><th>Customer</th><th>Order ID</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {TRANSACTIONS.map(t=>(
                <tr key={t.id}>
                  <td className="cell-id">{t.id}</td>
                  <td><div className="av-cell"><Avatar ini={t.ini}/><span>{t.cust}</span></div></td>
                  <td className="cell-dim">{t.order}</td>
                  <td className="cell-price">{t.amount}</td>
                  <td className="cell-dim">{t.method}</td>
                  <td><Badge label={t.status} cls={tBadge[t.status]}/></td>
                  <td className="cell-dim">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{overflow:'hidden'}}>
        <div className="card-hdr-pad"><div className="c-title">Courier Service Payments</div><div className="c-sub" style={{marginTop:4}}>Delivery partner settlements</div></div>
        <div className="tbl-wrap">
          <table className="tbl" style={{minWidth:860}}>
            <thead><tr><th>Courier Service</th><th>Orders Handled</th><th>Settlement Period</th><th>Total Amount</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {COURIERS.map(c=>(
                <tr key={c.name}>
                  <td className="cell-nm">{c.name}</td>
                  <td className="cell-price">{c.handled}</td>
                  <td className="cell-dim">{c.period}</td>
                  <td className="cell-price">{c.amount}</td>
                  <td><Badge label={c.status} cls={cBadge[c.status]}/></td>
                  <td><div className="act-grp"><button className="ab ab-view">View</button><button className="ab ab-edit">Edit</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
