import { useState, useEffect } from 'react';
import { IcoPlus, Badge, MiniStats } from './shared';

/* ════════════════════════════════════════
   FIXED CATEGORIES FOR CLICK CLOTHING
════════════════════════════════════════ */
const FIXED_CATS = [
  { name:'Sarong',      icon:'🧣', description:'Traditional & batik sarongs',  color:'#fef9c3', textColor:'#854d0e' },
  { name:'Trousers',    icon:'👖', description:'Formal & casual trousers',     color:'#dbeafe', textColor:'#1d4ed8' },
  { name:'Shorts',      icon:'🩳', description:'Casual & sports shorts',       color:'#d1fae5', textColor:'#065f46' },
  { name:'T-shirts',    icon:'👕', description:'Graphic & plain T-shirts',     color:'#fce7f3', textColor:'#9d174d' },
  { name:'Accessories', icon:'🎩', description:'Cap, Perfume, Deodorant',      color:'#ede9fe', textColor:'#5b21b6' },
];

const ACC_SUBS = ['Cap','Perfume','Deodorant'];
const API_CATS = 'http://localhost:3000/api/products/categories/all';
const API_PROD = 'http://localhost:3000/api/products';

/* ════════════════════════════════════════
   CATEGORIES PAGE
════════════════════════════════════════ */
export default function Categories({ toast }) {
  const [cats,     setCats]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [viewCat,  setViewCat]  = useState(null);   // category name being viewed
  const [catProds, setCatProds] = useState([]);
  const [loadProds,setLoadProds]= useState(false);

  /* ── fetch categories with product counts from DB ── */
  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res  = await fetch(API_CATS);
      const data = await res.json();
      if (data.success) {
        /* Merge DB counts into fixed category list */
        const dbMap = {};
        data.data.forEach(d => { dbMap[d.name] = d; });

        const merged = FIXED_CATS.map(fc => ({
          ...fc,
          total  : dbMap[fc.name]?.total  || 0,
          active : dbMap[fc.name]?.active || 0,
          status : 'Active',
        }));
        setCats(merged);
      } else {
        /* fallback: show fixed cats with zero counts */
        setCats(FIXED_CATS.map(fc => ({ ...fc, total:0, active:0, status:'Active' })));
        toast('⚠️','Could not load category counts from server.');
      }
    } catch {
      setCats(FIXED_CATS.map(fc => ({ ...fc, total:0, active:0, status:'Active' })));
      toast('⚠️','Server not reachable — showing fixed categories.');
    } finally { setLoading(false); }
  };

  /* ── view products in a category ── */
  const openView = async (catName) => {
    setViewCat(catName);
    setModal(true);
    setLoadProds(true);
    setCatProds([]);
    try {
      const res  = await fetch(`${API_PROD}?category=${encodeURIComponent(catName)}&limit=100`);
      const data = await res.json();
      if (data.success) setCatProds(data.data);
      else toast('⚠️','Could not load products for this category.');
    } catch { toast('⚠️','Server not reachable.'); }
    finally  { setLoadProds(false); }
  };

  const closeModal = () => { setModal(false); setViewCat(null); setCatProds([]); };

  const totalProducts = cats.reduce((s,c) => s + c.total,  0);
  const totalActive   = cats.reduce((s,c) => s + c.active, 0);

  /* ── price formatter ── */
  const fmtPrice = v => `RS ${parseFloat(v||0).toLocaleString('en-LK',{minimumFractionDigits:2})}`;

  return (
    <div className="view">

      <style>{`
        /* ── Category Cards ── */
        .cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px;margin-bottom:24px;}
        .cat-card{background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:22px 20px;cursor:pointer;transition:box-shadow .2s,transform .15s;display:flex;flex-direction:column;gap:14px;}
        .cat-card:hover{box-shadow:0 6px 24px rgba(0,0,0,.09);transform:translateY(-2px);}
        .cat-card-top{display:flex;align-items:center;gap:14px;}
        .cat-icon-wrap{width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;}
        .cat-name{font-size:16px;font-weight:700;color:#0f172a;}
        .cat-desc{font-size:12px;color:#64748b;margin-top:2px;}
        .cat-counts{display:flex;gap:16px;}
        .cat-stat{display:flex;flex-direction:column;align-items:center;background:#f8fafc;border-radius:8px;padding:8px 16px;flex:1;}
        .cat-stat-val{font-size:20px;font-weight:700;color:#0f172a;}
        .cat-stat-lbl{font-size:11px;color:#64748b;margin-top:2px;}
        .cat-footer{display:flex;align-items:center;justify-content:space-between;}
        .cat-view-btn{font-size:12px;color:#6366f1;font-weight:600;background:none;border:none;cursor:pointer;padding:0;}
        .cat-view-btn:hover{text-decoration:underline;}

        /* ── Accessories sub badge ── */
        .acc-sub-list{display:flex;gap:6px;flex-wrap:wrap;margin-top:2px;}
        .acc-sub{font-size:10px;background:#ede9fe;color:#5b21b6;border-radius:99px;padding:2px 8px;font-weight:600;}

        /* ── Modal product list ── */
        .cat-prod-list{max-height:400px;overflow-y:auto;}
        .cat-prod-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f1f5f9;}
        .cat-prod-row:last-child{border-bottom:none;}
        .cat-prod-img{width:42px;height:42px;object-fit:cover;border-radius:8px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
        .cat-prod-img img{width:42px;height:42px;object-fit:cover;border-radius:8px;}
        .cat-prod-name{font-size:13px;font-weight:600;color:#0f172a;}
        .cat-prod-price{font-size:12px;color:#6366f1;font-weight:600;margin-top:2px;}
        .cat-prod-stock{font-size:11px;color:#64748b;}
        .cat-prod-actions{margin-left:auto;}
        .empty-cat{text-align:center;padding:32px;color:#94a3b8;font-size:14px;}
      `}</style>

      <div className="ph">
        <div><h1 className="ph-title">Categories</h1><p className="ph-sub">Click a category to view its products from the database.</p></div>
        <button className="btn-primary" onClick={fetchCategories} style={{gap:6}}>🔄 Refresh</button>
      </div>

      <MiniStats items={[
        ['🏷️', cats.length,    'Total Categories'],
        ['📦', totalProducts,  'Total Products'],
        ['✅', totalActive,    'Active Products'],
        ['🚫', totalProducts - totalActive, 'Inactive'],
      ]}/>

      {loading ? (
        <div className="admin_card" style={{padding:40,textAlign:'center',color:'#94a3b8'}}>Loading categories…</div>
      ) : (
        <div className="cat-grid">
          {cats.map(cat => (
            <div className="cat-card" key={cat.name} onClick={() => openView(cat.name)}>
              <div className="cat-card-top">
                <div className="cat-icon-wrap" style={{background:cat.color}}>
                  {cat.icon}
                </div>
                <div>
                  <div className="cat-name" style={{color:cat.textColor}}>{cat.name}</div>
                  <div className="cat-desc">{cat.description}</div>
                  {cat.name === 'Accessories' && (
                    <div className="acc-sub-list">
                      {ACC_SUBS.map(s => <span key={s} className="acc-sub">{s}</span>)}
                    </div>
                  )}
                </div>
              </div>

              <div className="cat-counts">
                <div className="cat-stat">
                  <div className="cat-stat-val">{cat.total}</div>
                  <div className="cat-stat-lbl">Products</div>
                </div>
                <div className="cat-stat">
                  <div className="cat-stat-val" style={{color:'#16a34a'}}>{cat.active}</div>
                  <div className="cat-stat-lbl">Active</div>
                </div>
                <div className="cat-stat">
                  <div className="cat-stat-val" style={{color:'#ef4444'}}>{cat.total - cat.active}</div>
                  <div className="cat-stat-lbl">Inactive</div>
                </div>
              </div>

              <div className="cat-footer">
                <Badge label={cat.status} cls={cat.status==='Active'?'b-active':'b-inactive'}/>
                <button className="cat-view-btn">View products →</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── View Products Modal ── */}
      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal" style={{maxWidth:600}}>
            <div className="m-hdr">
              <span className="m-title">
                {FIXED_CATS.find(c=>c.name===viewCat)?.icon} {viewCat} — Products
              </span>
              <button className="m-x" onClick={closeModal}>✕</button>
            </div>
            <div className="m-body" style={{maxHeight:'70vh',overflowY:'auto'}}>
              {loadProds ? (
                <div className="empty-cat">Loading products…</div>
              ) : catProds.length === 0 ? (
                <div className="empty-cat">No products found in this category.</div>
              ) : (
                <div className="cat-prod-list">
                  {catProds.map(p => (
                    <div className="cat-prod-row" key={p.id}>
                      <div className="cat-prod-img">
                        {p.image_url
                          ? <img src={p.image_url} alt={p.product_name}/>
                          : <span>{FIXED_CATS.find(c=>c.name===viewCat)?.icon||'📦'}</span>
                        }
                      </div>
                      <div style={{flex:1}}>
                        <div className="cat-prod-name">{p.product_name}</div>
                        <div className="cat-prod-price">{fmtPrice(p.price)}</div>
                        <div className="cat-prod-stock">Stock: {p.quantity||0} {p.size?`· Size: ${p.size}`:''}</div>
                      </div>
                      <Badge label={p.available?'Active':'Inactive'} cls={p.available?'b-active':'b-inactive'}/>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="m-ftr">
              <span style={{color:'#64748b',fontSize:13}}>{catProds.length} products in {viewCat}</span>
              <button className="btn-secondary" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
