import { useState } from 'react';

export default function Settings({ toast }) {
  const [notifs, setNotifs] = useState({ orders:true, stock:true, payments:false, reports:true, signups:false });
  const toggle = k => setNotifs(n => ({ ...n, [k]:!n[k] }));
  return (
    <div className="view">
      <div className="ph"><div><h1 className="ph-title">Settings</h1><p className="ph-sub">Configure your store preferences.</p></div></div>
      <div className="settings-grid">
        <div className="card" style={{padding:22}}>
          <div className="c-title" style={{marginBottom:18}}>🏪 Store Information</div>
          <div className="settings-fields">
            {[['Store Name','Click Clothing Store'],['Contact Email','admin@clickclothing.com'],['Phone','+1 (555) 000-0000']].map(([lbl,val])=>(
              <div key={lbl}><label className="f-lbl">{lbl}</label><input className="f-inp" defaultValue={val}/></div>
            ))}
            <div><label className="f-lbl">Currency</label>
              <select className="f-sel"><option>USD ($)</option><option>EUR (€)</option><option>GBP (£)</option><option>LKR (Rs)</option></select>
            </div>
            <button className="btn-primary" style={{alignSelf:'flex-start',marginTop:4}} onClick={()=>toast('✅','Store settings saved!')}>Save Changes</button>
          </div>
        </div>
        <div className="card" style={{padding:22}}>
          <div className="c-title" style={{marginBottom:18}}>🔔 Notifications</div>
          <div className="notif-list">
            {[
              {k:'orders',   lbl:'New Order Alerts',  desc:'Notify for every new order'},
              {k:'stock',    lbl:'Low Stock Alerts',  desc:'Alert when below threshold'},
              {k:'payments', lbl:'Payment Failures',  desc:'Alert on failed transactions'},
              {k:'reports',  lbl:'Weekly Reports',    desc:'Auto email every Monday'},
              {k:'signups',  lbl:'Customer Sign-ups', desc:'Notify on new registrations'},
            ].map(({k,lbl,desc})=>(
              <div key={k} className="setting-row">
                <div><div className="setting-lbl">{lbl}</div><div className="setting-desc">{desc}</div></div>
                <label className="toggle">
                  <input type="checkbox" checked={notifs[k]} onChange={()=>toggle(k)}/>
                  <span className="slider"/>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
