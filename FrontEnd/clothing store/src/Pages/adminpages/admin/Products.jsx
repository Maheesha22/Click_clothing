import { useState, useRef, useEffect } from 'react';
import {
  CAT_CLS, PER_PAGE,
  IcoPlus, IcoSearch,
  Badge, StockBar, MiniStats, Modal,
} from './shared';

/* ════════════════════════════════════════
   CLICK CLOTHING — CATEGORIES & MAPS
════════════════════════════════════════ */
const CLOTHING_CATS = ['Sarong','Trousers','Shorts','T-shirts','Accessories'];
const ACC_SUBS      = ['Cap','Perfume','Deodorant'];
const CAT_ICON = {
  Sarong      : '',
  Trousers    : '',
  Shorts      : '',
  'T-shirts'  : '',
  Accessories : '',
};
const MY_CAT_CLS = {
  ...CAT_CLS,
  Sarong      : 'cp-sarong',
  Trousers    : 'cp-trousers',
  Shorts      : 'cp-shorts',
  'T-shirts'  : 'cp-tshirts',
  Accessories : 'cp-accessories',
};

/* ════════════════════════════════════════
   API BASE
════════════════════════════════════════ */
const API = 'http://localhost:3000/api/products';

/* ════════════════════════════════════════
   IMAGE UPLOAD BOX
   FIX: Uploads to YOUR backend (/api/products/upload-image)
        which then sends to Cloudinary using server-side credentials.
        Never upload directly from the browser to Cloudinary with an
        unsigned preset — it requires creating a preset in the dashboard
        and exposes your cloud name publicly.
════════════════════════════════════════ */
function ImageUploadBox({ imageUrl, onUpload, uploading, setUploading }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error,    setError]    = useState('');

  const uploadFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024)    { setError('Image must be under 5 MB.');    return; }
    setError('');
    setUploading(true);
    try {
      // ✅ FIX: Send to your own backend endpoint, NOT directly to Cloudinary.
      //    Your backend (multer + cloudinary config) handles the actual upload
      //    using credentials stored safely in the .env file.
      const fd = new FormData();
      fd.append('image', file);   // field name must match upload.single('image') in routes

      const res  = await fetch(`${API}/upload-image`, { method: 'POST', body: fd });
      const data = await res.json();

      if (res.ok && data.success && data.image_url) {
        onUpload(data.image_url);
      } else {
        setError(data.message || 'Upload failed — check your backend Cloudinary config.');
      }
    } catch {
      setError('Network error during upload. Is the backend running?');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="f-full">
      <label className="f-lbl">Product Image</label>
      <div
        className={`img-upload-box${dragOver?' drag-over':''}${imageUrl?' has-img':''}`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver ={e => { e.preventDefault(); setDragOver(true);  }}
        onDragLeave={() => setDragOver(false)}
        onDrop     ={e => { e.preventDefault(); setDragOver(false); uploadFile(e.dataTransfer.files[0]); }}
      >
        <input ref={inputRef} type="file" accept="image/*" style={{display:'none'}}
               onChange={e => uploadFile(e.target.files[0])} />

        {uploading ? (
          <div className="img-state"><div className="img-spinner"/><span>Uploading…</span></div>
        ) : imageUrl ? (
          <div className="img-preview-wrap">
            <img src={imageUrl} alt="Product" className="img-preview"/>
            <div className="img-overlay">🔄 Click to replace</div>
          </div>
        ) : (
          <div className="img-state">
            <div style={{fontSize:32}}>☁️</div>
            <div style={{fontSize:13}}><strong>Click to upload</strong> or drag & drop</div>
            <div style={{fontSize:11,color:'#94a3b8'}}>PNG, JPG, WEBP — max 5 MB</div>
          </div>
        )}
      </div>
      {error     && <div className="img-error">{error}</div>}
      {imageUrl && !uploading && (
        <div className="img-url-badge">
          ✅ Uploaded &nbsp;
          <a href={imageUrl} target="_blank" rel="noreferrer" className="img-url-link">View ↗</a>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   PRODUCTS PAGE
════════════════════════════════════════ */
export default function Products({ toast }) {
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [catF,      setCatF]      = useState('');
  const [stF,       setStF]       = useState('');
  const [page,      setPage]      = useState(1);
  const [modal,     setModal]     = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [delId,     setDelId]     = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);

  const blank = {
    product_name:'', category:'', price:'', quantity:'',
    status:'Active', product_description:'', image_url:'',
    color:'', size:'', acc_type:'',
  };
  const [form, setForm] = useState(blank);

  /* ── fetch on mount ── */
  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res  = await fetch(API);
      const data = await res.json();
      if (data.success) setProducts(data.data);
      else toast('⚠️','Could not load products.');
    } catch { toast('⚠️','Server not reachable.'); }
    finally  { setLoading(false); }
  };

  /* ── filter + paginate ── */
  const filtered = products.filter(p =>
    (!search || (p.product_name||'').toLowerCase().includes(search.toLowerCase())) &&
    (!catF   || p.category === catF) &&
    (!stF    || (stF === 'Active' ? p.available : !p.available))
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const sp    = Math.min(page, pages);
  const slice = filtered.slice((sp-1)*PER_PAGE, sp*PER_PAGE);

  /* ── modal helpers ── */
  const openAdd  = () => { setForm(blank); setEditId(null); setModal(true); };
  const openEdit = p  => {
    setForm({
      product_name        : p.product_name        || '',
      category            : p.category            || '',
      price               : p.price               || '',
      quantity            : p.quantity             ?? '',
      status              : p.available ? 'Active' : 'Inactive',
      product_description : p.product_description || '',
      image_url           : p.image_url           || '',
      color               : p.color               || '',
      size                : p.size                || '',
      acc_type            : p.acc_type            || '',
    });
    setEditId(p.id);
    setModal(true);
  };
  const closeM = () => { setModal(false); setEditId(null); };

  /* ── save ── */
  const save = async () => {
    if (!form.product_name || !form.category || form.price === '' || form.quantity === '') {
      toast('⚠️','Please fill all required fields.'); return;
    }
    setSaving(true);
    const payload = {
      product_name        : form.product_name,
      category            : form.category,
      price               : parseFloat(form.price),
      quantity            : parseInt(form.quantity, 10),
      available           : form.status === 'Active',
      product_description : form.product_description,
      image_url           : form.image_url,
      color               : form.color,
      size                : form.size,
    };
    try {
      const url    = editId ? `${API}/${editId}` : API;
      const method = editId ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      const data   = await res.json();
      if (data.success) {
        await fetchProducts();
        toast('✅', editId ? 'Product updated!' : 'Product added!');
        closeM();
      } else toast('❌', data.message || 'Save failed.');
    } catch { toast('❌','Network error.'); }
    finally  { setSaving(false); }
  };

  /* ── delete ── */
  const confirmDel = async () => {
    try {
      const res  = await fetch(`${API}/${delId}`, { method:'DELETE' });
      const data = await res.json();
      if (data.success) { await fetchProducts(); toast('🗑️','Product deleted.'); }
      else toast('❌', data.message || 'Delete failed.');
    } catch { toast('❌','Network error.'); }
    setDelId(null);
  };

  const ms = {
    total  : products.length,
    active : products.filter(p => p.available).length,
    low    : products.filter(p => p.quantity > 0 && p.quantity <= 10).length,
    out    : products.filter(p => p.quantity === 0).length,
  };

  /* ── price formatter ── */
  const fmtPrice = v => `RS ${parseFloat(v||0).toLocaleString('en-LK',{minimumFractionDigits:2})}`;

  return (
    <div className="view">

      {/* inline styles for new UI pieces */}
      <style>{`
        .img-upload-box{border:2px dashed #cbd5e1;border-radius:10px;padding:24px 16px;cursor:pointer;text-align:center;transition:border-color .2s,background .2s;background:#f8fafc;min-height:140px;display:flex;align-items:center;justify-content:center;}
        .img-upload-box:hover,.img-upload-box.drag-over{border-color:#6366f1;background:#eef2ff;}
        .img-upload-box.has-img{padding:0;overflow:hidden;}
        .img-state{display:flex;flex-direction:column;align-items:center;gap:6px;color:#64748b;}
        .img-preview-wrap{position:relative;width:100%;}
        .img-preview{width:100%;max-height:180px;object-fit:cover;display:block;border-radius:8px;}
        .img-overlay{position:absolute;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;opacity:0;transition:opacity .2s;border-radius:8px;}
        .img-upload-box:hover .img-overlay{opacity:1;}
        .img-spinner{width:28px;height:28px;border:3px solid #e2e8f0;border-top-color:#6366f1;border-radius:50%;animation:spin .7s linear infinite;margin-bottom:4px;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .img-error{color:#ef4444;font-size:12px;margin-top:4px;}
        .img-url-badge{font-size:12px;color:#16a34a;margin-top:6px;}
        .img-url-link{color:#6366f1;text-decoration:underline;}
        .prod-img{width:38px;height:38px;object-fit:cover;border-radius:6px;}
        .prod-thumb-ico{width:38px;height:38px;border-radius:6px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;font-size:20px;}
        .cp-sarong{background:#fef9c3;color:#854d0e;}
        .cp-trousers{background:#dbeafe;color:#1d4ed8;}
        .cp-shorts{background:#d1fae5;color:#065f46;}
        .cp-tshirts{background:#fce7f3;color:#9d174d;}
      `}</style>

      <div className="ph">
        <div><h1 className="ph-title">Products</h1><p className="ph-sub">Manage your clothing catalogue.</p></div>
        <button className="btn-primary" onClick={openAdd}><IcoPlus/> Add New Product</button>
      </div>

      <MiniStats items={[
        ['📦', ms.total,  'Total Products'],
        ['✅', ms.active, 'Active'],
        ['⚠️', ms.low,   'Low Stock'],
        ['🚫', ms.out,   'Out of Stock'],
      ]}/>

      <div className="toolbar">
        <div className="tb-search">
          <IcoSearch w={13}/>
          <input className="tb-inp" placeholder="Search product name…" value={search}
                 onChange={e=>{ setSearch(e.target.value); setPage(1); }}/>
        </div>
        <select className="tb-sel" value={catF} onChange={e=>{ setCatF(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          {CLOTHING_CATS.map(c=><option key={c}>{c}</option>)}
        </select>
        <select className="tb-sel" value={stF} onChange={e=>{ setStF(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option>Active</option><option>Inactive</option>
        </select>
        <span className="tb-count">{filtered.length} products</span>
      </div>

      <div className="admin_card" style={{overflow:'hidden'}}>
        <div className="tbl-wrap">
          <table className="tbl" style={{minWidth:900}}>
            <thead><tr>
              <th>Product</th><th>Category</th>
              <th>Price (RS)</th><th>Stock</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {loading
                ? <tr><td colSpan={6} className="empty-cell">Loading products…</td></tr>
                : slice.length === 0
                  ? <tr><td colSpan={6} className="empty-cell">No products found.</td></tr>
                  : slice.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="prod-cell">
                          {p.image_url
                            ? <img src={p.image_url} alt={p.product_name} className="prod-img"/>
                            : <div className="prod-thumb-ico">{CAT_ICON[p.category]||'📦'}</div>
                          }
                          <div>
                            <div className="cell-nm">{p.product_name}</div>
                            <div className="cell-sub">#{p.id}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`cat-pill ${MY_CAT_CLS[p.category]||''}`}>{p.category}</span></td>
                      <td className="cell-price">{fmtPrice(p.price)}</td>
                      <td><StockBar stock={p.quantity||0}/></td>
                      <td><Badge label={p.available?'Active':'Inactive'} cls={p.available?'b-active':'b-inactive'}/></td>
                      <td><div className="act-grp">
                        <button className="ab ab-edit" onClick={()=>openEdit(p)}>✏️ Edit</button>
                        <button className="ab ab-del"  onClick={()=>setDelId(p.id)}>🗑️</button>
                      </div></td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <div className="tbl-foot">
          <span className="tbl-info">
            Showing {filtered.length===0?0:(sp-1)*PER_PAGE+1}–{Math.min(sp*PER_PAGE,filtered.length)} of {filtered.length}
          </span>
          <div className="pg-btns">
            <button className="pg-btn" onClick={()=>setPage(p=>p-1)} disabled={sp<=1}>← Prev</button>
            {Array.from({length:Math.min(pages,5)},(_,i)=>(
              <button key={i} className={`pg-btn${sp===i+1?' active':''}`} onClick={()=>setPage(i+1)}>{i+1}</button>
            ))}
            <button className="pg-btn" onClick={()=>setPage(p=>p+1)} disabled={sp>=pages}>Next →</button>
          </div>
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      <Modal open={modal} onClose={closeM} title={editId?'Edit Product':'Add New Product'}
        footer={<>
          <button className="btn-secondary" onClick={closeM} disabled={saving||uploading}>Cancel</button>
          <button className="btn-primary"   onClick={save}   disabled={saving||uploading}>
            {saving?'Saving…':'Save Product'}
          </button>
        </>}>
        <div className="m-body">
          <div className="f-grid">

            <ImageUploadBox
              imageUrl={form.image_url}
              onUpload={url=>setForm(f=>({...f,image_url:url}))}
              uploading={uploading}
              setUploading={setUploading}
            />

            <div className="f-full">
              <label className="f-lbl">Product Name *</label>
              <input className="f-inp" placeholder="e.g. Classic Batik Sarong"
                     value={form.product_name} onChange={e=>setForm(f=>({...f,product_name:e.target.value}))}/>
            </div>

            <div>
              <label className="f-lbl">Category *</label>
              <select className="f-sel" value={form.category}
                      onChange={e=>setForm(f=>({...f,category:e.target.value,acc_type:''}))}>
                <option value="">Select…</option>
                {CLOTHING_CATS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>

            {form.category === 'Accessories' && (
              <div>
                <label className="f-lbl">Accessory Type</label>
                <select className="f-sel" value={form.acc_type}
                        onChange={e=>setForm(f=>({...f,acc_type:e.target.value}))}>
                  <option value="">Select type…</option>
                  {ACC_SUBS.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="f-lbl">Price (RS) *</label>
              <input className="f-inp" type="number" min="0" step="0.01" placeholder="0.00"
                     value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))}/>
            </div>

            <div>
              <label className="f-lbl">Stock Qty *</label>
              <input className="f-inp" type="number" min="0" placeholder="0"
                     value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:e.target.value}))}/>
            </div>

            <div>
              <label className="f-lbl">Size</label>
              <input className="f-inp" placeholder="S, M, L, XL or Free Size"
                     value={form.size} onChange={e=>setForm(f=>({...f,size:e.target.value}))}/>
            </div>

            <div>
              <label className="f-lbl">Color</label>
              <input className="f-inp" placeholder="e.g. Blue, Red, Multicolor"
                     value={form.color} onChange={e=>setForm(f=>({...f,color:e.target.value}))}/>
            </div>

            <div>
              <label className="f-lbl">Status</label>
              <select className="f-sel" value={form.status}
                      onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                <option>Active</option><option>Inactive</option>
              </select>
            </div>

            <div className="f-full">
              <label className="f-lbl">Description</label>
              <textarea className="f-ta" placeholder="Brief product description…"
                        value={form.product_description}
                        onChange={e=>setForm(f=>({...f,product_description:e.target.value}))}/>
            </div>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm ── */}
      <Modal open={!!delId} onClose={()=>setDelId(null)} compact
        footer={<>
          <button className="btn-secondary" onClick={()=>setDelId(null)}>Cancel</button>
          <button className="btn-danger"    onClick={confirmDel}>Yes, Delete</button>
        </>}>
        <div className="m-body del-body">
          <div className="del-icon">🗑️</div>
          <div className="del-title">Delete Product?</div>
          <div className="del-sub">This action cannot be undone.</div>
        </div>
      </Modal>
    </div>
  );
}
