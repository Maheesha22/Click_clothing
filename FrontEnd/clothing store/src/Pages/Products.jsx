import { useState } from 'react';
import {
  INIT_PRODUCTS, CAT_CLS, CAT_E, PER_PAGE,
  IcoPlus, IcoSearch,
  Badge, StockBar, MiniStats, Modal,
} from './shared';

export default function Products({ toast }) {
  const [products, setProducts] = useState(INIT_PRODUCTS);
  const [search, setSearch]     = useState('');
  const [catF, setCatF]         = useState('');
  const [stF, setStF]           = useState('');
  const [page, setPage]         = useState(1);
  const [modal, setModal]       = useState(false);
  const [editId, setEditId]     = useState(null);
  const [delId, setDelId]       = useState(null);
  const blankForm = { name:'', cat:'', sku:'', price:'', stock:'', status:'Active', desc:'' };
  const [form, setForm]         = useState(blankForm);

  const filtered = products.filter(p =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())) &&
    (!catF || p.cat === catF) &&
    (!stF  || p.status === stF)
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const sp    = Math.min(page, pages);
  const slice = filtered.slice((sp - 1) * PER_PAGE, sp * PER_PAGE);

  const openAdd  = () => { setForm(blankForm); setEditId(null); setModal(true); };
  const openEdit = p  => { setForm({ name:p.name, cat:p.cat, sku:p.sku, price:p.price, stock:p.stock, status:p.status, desc:p.desc||'' }); setEditId(p.id); setModal(true); };
  const closeM   = () => { setModal(false); setEditId(null); };

  const save = () => {
    const { name, cat, price, stock } = form;
    if (!name || !cat || price === '' || stock === '') { toast('⚠️', 'Please fill all required fields.'); return; }
    if (editId) {
      setProducts(ps => ps.map(p => p.id === editId ? { ...p, ...form, price:parseFloat(price), stock:parseInt(stock,10) } : p));
      toast('✅', 'Product updated!');
    } else {
      const nid = `PRD-${String(products.length + 1).padStart(3,'0')}`;
      setProducts(ps => [...ps, { id:nid, e:CAT_E[form.cat]||'📦', ...form, price:parseFloat(price), stock:parseInt(stock,10), sku:form.sku||`SKU-${Math.floor(Math.random()*9000+1000)}` }]);
      toast('✅', 'New product added!');
    }
    closeM();
  };

  const confirmDel = () => { setProducts(ps => ps.filter(p => p.id !== delId)); setDelId(null); toast('🗑️','Product deleted.'); };

  const ms = { total:products.length, active:products.filter(p=>p.status==='Active').length, low:products.filter(p=>p.stock>0&&p.stock<=10).length, out:products.filter(p=>p.stock===0).length };

  return (
    <div className="view">
      <div className="ph">
        <div><h1 className="ph-title">Products</h1><p className="ph-sub">Manage your full clothing catalogue.</p></div>
        <button className="btn-primary" onClick={openAdd}><IcoPlus/> Add Product</button>
      </div>

      <MiniStats items={[['📦',ms.total,'Total Products'],['✅',ms.active,'Active'],['⚠️',ms.low,'Low Stock'],['🚫',ms.out,'Out of Stock']]}/>

      <div className="toolbar">
        <div className="tb-search"><IcoSearch w={13}/><input className="tb-inp" placeholder="Search name or SKU…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></div>
        <select className="tb-sel" value={catF} onChange={e=>{setCatF(e.target.value);setPage(1);}}>
          <option value="">All Categories</option>
          {['Tops','Bottoms','Outerwear','Dresses','Footwear','Accessories'].map(c=><option key={c}>{c}</option>)}
        </select>
        <select className="tb-sel" value={stF} onChange={e=>{setStF(e.target.value);setPage(1);}}>
          <option value="">All Status</option><option>Active</option><option>Inactive</option>
        </select>
        <span className="tb-count">{filtered.length} products</span>
      </div>

      <div className="card" style={{overflow:'hidden'}}>
        <div className="tbl-wrap">
          <table className="tbl" style={{minWidth:920}}>
            <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {slice.length === 0
                ? <tr><td colSpan={7} className="empty-cell">No products found.</td></tr>
                : slice.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="prod-cell">
                        <div className="prod-thumb">{p.e}</div>
                        <div><div className="cell-nm">{p.name}</div><div className="cell-sub">{p.id}</div></div>
                      </div>
                    </td>
                    <td className="cell-dim">{p.sku}</td>
                    <td><span className={`cat-pill ${CAT_CLS[p.cat]||''}`}>{p.cat}</span></td>
                    <td className="cell-price">${parseFloat(p.price).toFixed(2)}</td>
                    <td><StockBar stock={p.stock}/></td>
                    <td><Badge label={p.status} cls={p.status==='Active'?'b-active':'b-inactive'}/></td>
                    <td><div className="act-grp">
                      <button className="ab ab-edit" onClick={()=>openEdit(p)}>✏️ Edit</button>
                      <button className="ab ab-del"  onClick={()=>setDelId(p.id)}>🗑️</button>
                    </div></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="tbl-foot">
          <span className="tbl-info">Showing {filtered.length===0?0:(sp-1)*PER_PAGE+1}–{Math.min(sp*PER_PAGE,filtered.length)} of {filtered.length}</span>
          <div className="pg-btns">
            <button className="pg-btn" onClick={()=>setPage(p=>p-1)} disabled={sp<=1}>← Prev</button>
            {Array.from({length:Math.min(pages,5)},(_,i)=>(
              <button key={i} className={`pg-btn${sp===i+1?' active':''}`} onClick={()=>setPage(i+1)}>{i+1}</button>
            ))}
            <button className="pg-btn" onClick={()=>setPage(p=>p+1)} disabled={sp>=pages}>Next →</button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal open={modal} onClose={closeM} title={editId ? 'Edit Product' : 'Add New Product'}
        footer={<><button className="btn-secondary" onClick={closeM}>Cancel</button><button className="btn-primary" onClick={save}>Save Product</button></>}>
        <div className="m-body">
          <div className="f-grid">
            <div className="f-full"><label className="f-lbl">Product Name *</label><input className="f-inp" placeholder="e.g. Classic White T-Shirt" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
            <div>
              <label className="f-lbl">Category *</label>
              <select className="f-sel" value={form.cat} onChange={e=>setForm(f=>({...f,cat:e.target.value}))}>
                <option value="">Select…</option>
                {['Tops','Bottoms','Outerwear','Dresses','Footwear','Accessories'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="f-lbl">SKU</label><input className="f-inp" placeholder="SKU-0000" value={form.sku} onChange={e=>setForm(f=>({...f,sku:e.target.value}))}/></div>
            <div><label className="f-lbl">Price ($) *</label><input className="f-inp" type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))}/></div>
            <div><label className="f-lbl">Stock Qty *</label><input className="f-inp" type="number" min="0" placeholder="0" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))}/></div>
            <div>
              <label className="f-lbl">Status</label>
              <select className="f-sel" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                <option>Active</option><option>Inactive</option>
              </select>
            </div>
            <div className="f-full"><label className="f-lbl">Description</label><textarea className="f-ta" placeholder="Brief product description…" value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))}/></div>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!delId} onClose={()=>setDelId(null)} compact
        footer={<><button className="btn-secondary" onClick={()=>setDelId(null)}>Cancel</button><button className="btn-danger" onClick={confirmDel}>Yes, Delete</button></>}>
        <div className="m-body del-body">
          <div className="del-icon">🗑️</div>
          <div className="del-title">Delete Product?</div>
          <div className="del-sub">This action cannot be undone.</div>
        </div>
      </Modal>
    </div>
  );
}