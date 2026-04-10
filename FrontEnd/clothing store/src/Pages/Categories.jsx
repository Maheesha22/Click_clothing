import { useState } from 'react';
import { INIT_CATEGORIES, IcoPlus, Badge, Modal } from './shared';

export default function Categories({ toast }) {
  const [cats, setCats]   = useState(INIT_CATEGORIES);
  const [modal, setModal] = useState(false);
  const [editIdx, setEI]  = useState(null);
  const [delIdx, setDI]   = useState(null);
  const blank = { name:'', desc:'', status:'Active' };
  const [form, setForm]   = useState(blank);

  const openAdd  = () => { setForm(blank); setEI(null); setModal(true); };
  const openEdit = i  => { const c = cats[i]; setForm({ name: c.name.replace(/^\S+\s/,''), desc:c.desc, status:c.status }); setEI(i); setModal(true); };
  const closeM   = () => { setModal(false); setEI(null); };

  const save = () => {
    if (!form.name.trim()) { toast('⚠️','Category name required.'); return; }
    if (editIdx !== null) {
      setCats(cs => cs.map((c,i) => i === editIdx ? { ...c, desc:form.desc, status:form.status } : c));
      toast('✅','Category updated!');
    } else {
      setCats(cs => [...cs, { name:`🏷️ ${form.name}`, desc:form.desc, count:0, status:form.status }]);
      toast('✅','Category added!');
    }
    closeM();
  };

  const confirmDel = () => { setCats(cs => cs.filter((_,i)=>i!==delIdx)); setDI(null); toast('🗑️','Category deleted.'); };

  return (
    <div className="view">
      <div className="ph">
        <div><h1 className="ph-title">Categories</h1><p className="ph-sub">Organise your product catalogue.</p></div>
        <button className="btn-primary" onClick={openAdd}><IcoPlus/> Add Category</button>
      </div>
      <div className="card" style={{overflow:'hidden'}}>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Category</th><th>Description</th><th>Products</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {cats.map((c,i) => (
                <tr key={i}>
                  <td className="cell-nm">{c.name}</td>
                  <td className="cell-dim">{c.desc}</td>
                  <td className="cell-price">{c.count}</td>
                  <td><Badge label={c.status} cls={c.status==='Active'?'b-active':'b-inactive'}/></td>
                  <td><div className="act-grp">
                    <button className="ab ab-edit" onClick={()=>openEdit(i)}>✏️ Edit</button>
                    <button className="ab ab-del"  onClick={()=>setDI(i)}>🗑️</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={closeM} title={editIdx!==null?'Edit Category':'Add New Category'}
        footer={<><button className="btn-secondary" onClick={closeM}>Cancel</button><button className="btn-primary" onClick={save}>Save Category</button></>}>
        <div className="m-body">
          <div className="f-grid">
            <div className="f-full"><label className="f-lbl">Category Name *</label><input className="f-inp" placeholder="e.g. Activewear" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
            <div className="f-full"><label className="f-lbl">Description</label><textarea className="f-ta" placeholder="Short description…" value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))}/></div>
            <div><label className="f-lbl">Status</label><select className="f-sel" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option>Active</option><option>Inactive</option></select></div>
          </div>
        </div>
      </Modal>

      <Modal open={delIdx!==null} onClose={()=>setDI(null)} compact
        footer={<><button className="btn-secondary" onClick={()=>setDI(null)}>Cancel</button><button className="btn-danger" onClick={confirmDel}>Yes, Delete</button></>}>
        <div className="m-body del-body">
          <div className="del-icon">🗑️</div>
          <div className="del-title">Delete Category?</div>
          <div className="del-sub">This action cannot be undone.</div>
        </div>
      </Modal>
    </div>
  );
}