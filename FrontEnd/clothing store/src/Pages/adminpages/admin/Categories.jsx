/**
 * Categories.jsx  — Click Clothing Admin
 * ─────────────────────────────────────────────────────────────
 * Fully database-driven. No hardcoded categories.
 *
 * Features:
 *  ✅ Load categories from  GET /api/categories
 *  ✅ Add new category       POST /api/categories
 *  ✅ Rename category        PUT  /api/categories/:id
 *  ✅ Delete category        DELETE /api/categories/:id (blocked if has products)
 *  ✅ Click category card → products  GET /api/categories/:id/products
 *  ✅ Click product row → Color → Size → Quantity variants inline
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import { MiniStats, Badge } from './shared';

const API_BASE = 'http://localhost:3000/api';
const CAT_API = `${API_BASE}/categories`;
const PROD_API = `${API_BASE}/products`;
const fmt = v => `RS ${parseFloat(v || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

const Spinner = () => (
  <div style={{ display:'flex', justifyContent:'center', padding:'36px 0' }}>
    <div style={{ width:30,height:30,borderRadius:'50%',border:'3px solid #e2e8f0',borderTopColor:'#6366f1',animation:'cat-spin 0.7s linear infinite' }} />
  </div>
);

const qtyBadge = qty => {
  if (qty === 0) return { bg:'#fee2e2', color:'#991b1b', label:'Out of Stock' };
  if (qty <= 5)  return { bg:'#fef9c3', color:'#854d0e', label:`Low (${qty})` };
  return              { bg:'#dcfce7', color:'#166534', label:`${qty}` };
};

function Modal({ open, onClose, title, footer, style, children }) {
  if (!open) return null;
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:440, width:'94vw', ...style }}>
        {title && <div className="m-hdr"><span className="m-title">{title}</span></div>}
        <div className="m-body">{children}</div>
        {footer && <div className="m-ftr">{footer}</div>}
      </div>
    </div>
  );
}

const PALETTES = [
  { bg:'#eff6ff', border:'#bfdbfe', dot:'#3b82f6' },
  { bg:'#f0fdf4', border:'#bbf7d0', dot:'#22c55e' },
  { bg:'#fdf4ff', border:'#e9d5ff', dot:'#a855f7' },
  { bg:'#fff7ed', border:'#fed7aa', dot:'#f97316' },
  { bg:'#fef2f2', border:'#fecaca', dot:'#ef4444' },
  { bg:'#f0fdfa', border:'#99f6e4', dot:'#14b8a6' },
];

export default function Categories({ toast }) {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [formModal,  setFormModal]  = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formName,   setFormName]   = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [delTarget,  setDelTarget]  = useState(null);
  const [deleting,   setDeleting]   = useState(false);
  const [viewCat,    setViewCat]    = useState(null);
  const [products,   setProducts]   = useState([]);
  const [loadProds,  setLoadProds]  = useState(false);
  const [expandProd, setExpandProd] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(CAT_API);
      const d   = await res.json();
      if (d.success) setCategories(d.data);
      else toast('⚠️', d.message || 'Could not load categories');
    } catch { toast('⚠️', 'Backend not reachable on port 3000'); }
    finally   { setLoading(false); }
  }, [toast]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openAdd = () => { setEditTarget(null); setFormName(''); setFormModal(true); };
  const openEdit = (cat, e) => { e.stopPropagation(); setEditTarget(cat); setFormName(cat.name); setFormModal(true); };
  const openDelete = (cat, e) => { e.stopPropagation(); setDelTarget(cat); };

  const saveCategory = async () => {
    const name = formName.trim();
    if (!name) return toast('⚠️', 'Category name cannot be empty');
    setFormSaving(true);
    try {
      const res  = await fetch(editTarget ? `${CAT_API}/${editTarget.id}` : CAT_API, {
        method:  editTarget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name }),
      });
      const d = await res.json();
      if (d.success) {
        toast('✅', editTarget ? 'Category renamed' : 'Category created');
        setFormModal(false);
        fetchCategories();
      } else toast('❌', d.message || 'Save failed');
    } catch { toast('❌', 'Network error'); }
    finally { setFormSaving(false); }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${CAT_API}/${delTarget.id}`, { method:'DELETE' });
      const d   = await res.json();
      if (d.success) {
        toast('🗑️', 'Category deleted');
        if (viewCat?.id === delTarget.id) { setViewCat(null); setProducts([]); }
        setDelTarget(null);
        fetchCategories();
      } else toast('❌', d.message);
    } catch { toast('❌', 'Network error'); }
    finally { setDeleting(false); }
  };

  const openProducts = async (cat) => {
    if (viewCat?.id === cat.id) { setViewCat(null); setProducts([]); setExpandProd(null); return; }
    setViewCat(cat); setProducts([]); setExpandProd(null); setLoadProds(true);
    try {
      // Use the required endpoint: GET /api/products?categoryId=ID
      const res = await fetch(`${PROD_API}?categoryId=${cat.id}`);
      const d   = await res.json();
      if (d.success) {
        // Requirements say display product name, price, description
        setProducts(d.data);
      } else toast('⚠️', d.message || 'Could not load products');
    } catch { toast('⚠️', 'Network error'); }
    finally { setLoadProds(false); }
  };

  const toggleProductVariants = async (prodId) => {
    if (expandProd === prodId) {
      setExpandProd(null);
      return;
    }

    // Check if we already have variants for this product
    const product = products.find(p => p.id === prodId);
    if (product && product.variantsLoaded) {
      setExpandProd(prodId);
      return;
    }

    // Fetch variants: GET /api/products/:id/variants
    try {
      const res = await fetch(`${PROD_API}/${prodId}/variants`);
      const d   = await res.json();
      if (d.success) {
        setProducts(prev => prev.map(p => 
          p.id === prodId ? { ...p, variants: d.data, variantsLoaded: true } : p
        ));
        setExpandProd(prodId);
      } else {
        toast('⚠️', d.message || 'Could not load variants');
      }
    } catch {
      toast('⚠️', 'Network error fetching variants');
    }
  };

  return (
    <div className="view">
      <style>{`
        @keyframes cat-spin { to { transform:rotate(360deg); } }
        @keyframes cat-fade { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        @keyframes cat-scale { from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)} }

        .cat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:24px; margin-bottom:40px; }
        
        .cat-card {
          border-radius:24px; border:1px solid rgba(0,0,0,0.06); padding:24px; cursor:pointer;
          transition:all .4s cubic-bezier(0.4, 0, 0.2, 1);
          animation:cat-fade .3s ease both;
          position:relative; overflow:hidden;
          display:flex; flex-direction:column;
          min-height:180px; justify-content:space-between;
          background:#fff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }
        .cat-card:hover { transform:translateY(-6px); box-shadow:0 20px 40px rgba(0,0,0,0.08); border-color:rgba(0,0,0,0.1); }
        .cat-card.active { box-shadow:0 0 0 2px #000; border-color:transparent; }

        .cat-card-top { display:flex; justify-content:space-between; align-items:flex-start; z-index:1; }
        
        .cat-card-btns { display:flex;gap:8px;opacity:0;transition:all .2s; transform: translateY(4px); }
        .cat-card:hover .cat-card-btns { opacity:1; transform: translateY(0); }
        
        .cat-btn { 
          width:36px;height:36px;border-radius:12px;border:none;
          background:rgba(255,255,255,0.8);backdrop-filter:blur(8px);
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;font-size:16px;box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          transition: all 0.2s;
        }
        .cat-btn:hover { transform: scale(1.1); background:#fff; box-shadow:0 4px 15px rgba(0,0,0,0.1); }
        .cat-btn-del:hover { background:#fee2e2; color:#ef4444; }

        .cat-name { font-size:20px;font-weight:900;color:#000;letter-spacing:-.03em; line-height:1.2; z-index:1; }
        .cat-count { font-size:12px; font-weight:700; color:rgba(0,0,0,0.4); text-transform:uppercase; letter-spacing:0.05em; margin-top:4px; }

        .cat-foot  { display:flex;align-items:center;justify-content:space-between;padding-top:16px;border-top:1px solid rgba(0,0,0,0.05); z-index:1; }
        .cat-hint  { font-size:11px;font-weight:800;color:#000; text-transform:uppercase; letter-spacing:0.04em; opacity:0.4; transition:opacity 0.2s; }
        .cat-card:hover .cat-hint { opacity:1; }

        .cat-add-card {
          border-radius:24px;border:2px dashed rgba(0,0,0,0.1);padding:24px;cursor:pointer;
          display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;
          min-height:180px;transition:all .4s;color:rgba(0,0,0,0.3);background:rgba(0,0,0,0.01);
          text-align:center;
        }
        .cat-add-card:hover { border-color:#000;background:#000;color:#fff;transform:translateY(-6px);box-shadow:0 20px 40px rgba(0,0,0,0.1); }
        .cat-add-card span:first-child { font-size:36px; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .cat-add-card:hover span:first-child { transform: scale(1.2) rotate(90deg); }

        /* ── Product panel ── */
        .cat-panel { background:#fff;border:1px solid rgba(0,0,0,0.1);border-radius:24px;overflow:hidden;margin-bottom:32px;box-shadow:0 12px 40px rgba(0,0,0,0.06);animation:cat-scale .3s cubic-bezier(.175,.885,.32,1.1); }
        .cat-panel-hdr { padding:20px 24px;background:#fcfcfc;border-bottom:1px solid rgba(0,0,0,0.1);display:flex;align-items:center;justify-content:space-between; }
        .cat-panel-title { font-size:18px;font-weight:900;color:#000;display:flex;align-items:center;gap:12px; letter-spacing:-.03em; }
        .cat-panel-badge { font-size:12px;background:#000;color:#fff;border-radius:20px;padding:4px 12px;font-weight:800; text-transform:uppercase; letter-spacing:0.04em; }
        .cat-panel-close { background:#f1f5f9;border:none;cursor:pointer;color:#000;font-size:14px;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center; transition:all 0.2s; }
        .cat-panel-close:hover { background:#000;color:#fff; transform:rotate(90deg); }

        /* product row - Refined for Professional Look */
        .cat-prow { 
          display:flex; align-items:center; gap:20px; padding:20px 24px; 
          border-bottom:1px solid rgba(0,0,0,0.05); cursor:pointer; 
          transition:all .3s cubic-bezier(0.4, 0, 0.2, 1); 
          position:relative; background: #fff;
        }
        .cat-prow:hover { background:#f9fafb; }
        .cat-prow.open { background:#fff; }
        .cat-prow.open::before { 
          content:''; position:absolute; left:0; top:0; bottom:0; width:4px; 
          background:#000; transition: all 0.3s;
        }
        .cat-prow:last-of-type { border-bottom:none; }

        .cat-pthumb { 
          width:64px; height:64px; border-radius:12px; background:#f3f4f6; 
          display:flex; align-items:center; justify-content:center; 
          font-size:24px; overflow:hidden; flex-shrink:0; 
          border:1px solid rgba(0,0,0,0.05);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .cat-pthumb img { width:100%; height:100%; object-fit:cover; transition: transform 0.5s ease; }
        .cat-prow:hover .cat-pthumb img { transform: scale(1.1); }
        
        .cat-pinfo { flex:1; min-width:0; display: flex; flex-direction: column; gap: 2px; }
        .cat-pname { font-size:16px; font-weight:700; color:#111827; letter-spacing:-0.01em; }
        .cat-pprice { font-size:15px; color:#111827; font-weight:800; letter-spacing: -0.02em; }
        .cat-pmeta { font-size:12px; color:#6b7280; font-weight:500; margin-top:6px; display: flex; align-items: center; gap: 8px; }
        
        .cat-pstock { 
          padding:6px 14px; border-radius:10px; font-size:11px; font-weight:800; 
          flex-shrink:0; text-transform:uppercase; letter-spacing:0.06em;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.03);
        }
        .cat-parrow { 
          color:#d1d5db; font-size:14px; transition:all .3s ease; 
          background: #f9fafb; width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .cat-prow:hover .cat-parrow { color:#000; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateX(4px); }
        .cat-prow.open .cat-parrow { transform:rotate(90deg); color:#fff; background: #000; }

        /* variants */
        .cat-var-wrap { background:#fcfcfc;border-bottom:1px solid rgba(0,0,0,0.1);padding:20px 24px 24px 98px;animation:cat-fade .3s ease; }
        .cat-var-title { font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:rgba(0,0,0,0.3);margin-bottom:16px; }
        .cat-cgroup { margin-bottom:18px; }
        .cat-clabel { display:flex;align-items:center;gap:10px;font-size:13px;font-weight:800;color:#000;margin-bottom:10px; }
        .cat-cdot   { width:16px;height:16px;border-radius:6px;border:1px solid rgba(0,0,0,0.1);flex-shrink:0; }
        .cat-sizes  { display:flex;flex-wrap:wrap;gap:8px; }
        .cat-schip  { display:flex;flex-direction:column;align-items:center;background:#fff;border:1px solid rgba(0,0,0,0.06);border-radius:12px;padding:8px 12px;min-width:64px;text-align:center; transition:all 0.2s; }
        .cat-schip:hover { border-color:#000; transform:scale(1.05); }
        .cat-sname  { font-size:13px;font-weight:900;color:#000; }
        .cat-sqty   { font-size:10px;font-weight:800;border-radius:6px;padding:2px 6px;margin-top:4px; text-transform:uppercase; }

        /* form */
        .cff label { display:block;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:rgba(0,0,0,0.5);margin-bottom:8px; }
        .cff input { width:100%;padding:14px 16px;border:1.5px solid rgba(0,0,0,0.08);border-radius:14px;font-size:15px;font-weight:600;outline:none;box-sizing:border-box; transition:all 0.2s; }
        .cff input:focus { border-color:#000; box-shadow:0 0 0 4px rgba(0,0,0,0.04); }
        .cff-warn  { background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:14px;font-size:13px;font-weight:600;color:#92400e;margin-top:16px; line-height:1.4; }

        .del-body { text-align:center;padding:12px 0 8px; }
        .del-icon  { font-size:48px;margin-bottom:12px; }
        .del-title { font-size:20px;font-weight:900;color:#000;margin-bottom:8px; letter-spacing:-.03em; }
        .del-sub   { font-size:14px;color:rgba(0,0,0,0.5);line-height:1.6; font-weight:500; }

        .cat-empty { text-align:center;padding:60px 20px;color:#94a3b8; }
      `}</style>

      {/* ── Header ── */}
      <div className="ph">
        <div>
          <h1 className="ph-title" style={{ fontSize:32, letterSpacing:'-0.04em' }}>Catalog</h1>
          <p className="ph-sub" style={{ fontWeight:600 }}>Manage your collections and inventory variants with precision.</p>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <button className="btn-secondary" onClick={fetchCategories} style={{ borderRadius:14, padding:'10px 20px', fontWeight:700 }}>🔄 Refresh</button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ marginBottom:32 }}>
        <MiniStats items={[
          ['📦', categories.length, 'Total Collections'],
        ]} />
      </div>

      {/* ── Cards ── */}
      {loading ? <Spinner /> : (
        <div className="cat-grid">
          {categories.map((cat, i) => {
            const pal = PALETTES[i % PALETTES.length];
            const active = viewCat?.id === cat.id;
            return (
              <div
                key={cat.id}
                className={`cat-card${active ? ' active' : ''}`}
                style={{ 
                  background: `linear-gradient(135deg, ${pal.bg} 0%, #fff 100%)`, 
                  animationDelay:`${i*0.04}s`,
                }}
                onClick={() => openProducts(cat)}
              >
                <div className="cat-card-top">
                  <div>
                    <div className="cat-name">{cat.name}</div>
                    <div className="cat-count">{cat.productCount || 0} Products</div>
                  </div>
                  <div className="cat-card-btns" style={{ opacity: 1, transform: 'none' }}>
                    <button className="cat-btn" onClick={e => openEdit(cat, e)} title="Rename">✏️</button>
                    <button className="cat-btn cat-btn-del" onClick={e => openDelete(cat, e)} title="Delete">🗑️</button>
                  </div>
                </div>

                <div className="cat-foot">
                  <span className="cat-hint">{active ? 'Close Details' : 'View Collection'}</span>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:pal.dot, opacity: active ? 1 : 0.3 }} />
                </div>
              </div>
            );
          })}

          {/* Add Category Card */}
          <div className="cat-add-card" onClick={openAdd}>
            <span>＋</span>
            <span style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add Category</span>
          </div>
        </div>
      )}

      {/* ── Products Details Panel (Inline below grid) ── */}
      {viewCat && (
        <div className="cat-panel" style={{ marginTop: 20 }}>
          <div className="cat-panel-hdr" style={{ background: '#000', color: '#fff' }}>
            <div className="cat-panel-title" style={{ color: '#fff' }}>
              {viewCat.name} Collection
              <span className="cat-panel-badge" style={{ background: '#fff', color: '#000' }}>
                {loadProds ? 'LOADING...' : `${products.length} STYLES`}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="cat-btn" onClick={e => openEdit(viewCat, e)} title="Rename" style={{ background: '#fff', color: '#000' }}>✏️</button>
              <button className="cat-btn cat-btn-del" onClick={e => openDelete(viewCat, e)} title="Delete" style={{ background: '#fff' }}>🗑️</button>
              <button className="cat-panel-close" onClick={() => { setViewCat(null); setProducts([]); setExpandProd(null); }} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>✕</button>
            </div>
          </div>

          <div style={{ maxHeight: 'none', overflowY: 'visible' }}>
            {loadProds ? <Spinner /> : products.length === 0 ? (
              <div className="cat-empty">
                <div style={{ fontSize:40, marginBottom:16, opacity:0.2 }}>📭</div>
                <div style={{ fontWeight:800, fontSize:16, color:'#000', letterSpacing:'-0.02em' }}>No styles found in "{viewCat.name}"</div>
                <div style={{ fontSize:13, marginTop:6, color:'rgba(0,0,0,0.4)', fontWeight:500 }}>This collection is currently empty in the database.</div>
              </div>
            ) : products.map(prod => {
              const isOpen = expandProd === prod.id;
              const sb = qtyBadge(prod.quantity);
              const byColor = (prod.variants || []).reduce((acc, v) => {
                const k = v.color || 'Universal';
                if (!acc[k]) acc[k] = [];
                acc[k].push(v);
                return acc;
              }, {});

              return (
                <div key={prod.id} style={{ borderBottom:'1px solid rgba(0,0,0,0.1)' }}>
                  <div
                    className={`cat-prow${isOpen ? ' open' : ''}`}
                    onClick={() => toggleProductVariants(prod.id)}
                  >
                    <div className="cat-pthumb">
                      {prod.image_url ? <img src={prod.image_url} alt={prod.product_name} /> : '👕'}
                    </div>
                    <div className="cat-pinfo">
                      <div className="cat-pname">{prod.product_name}</div>
                      <div className="cat-pprice">{fmt(prod.price)}</div>
                      <div className="cat-pmeta">
                        {prod.variant_count > 0 && (
                          <span>📦 {prod.variant_count} {prod.variant_count === 1 ? 'variant' : 'variants'}</span>
                        )}
                        {prod.variant_count > 0 && prod.color && (
                          <><span>·</span><span>🎨 {prod.color}</span></>
                        )}
                        {prod.variant_count === 0 && (
                          <span style={{ color: '#ef4444', fontWeight: 600 }}>⚠️ No inventory variants defined</span>
                        )}
                      </div>
                    </div>
                    <span className="cat-pstock" style={{ background:sb.bg, color:sb.color }}>
                      {sb.label}
                    </span>
                    <span className="cat-parrow">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </span>
                  </div>

                  {isOpen && (
                    <div className="cat-var-wrap">
                      <div className="cat-var-title">Inventory Breakdown</div>
                      {!prod.variants?.length ? (
                        <div style={{ color:'rgba(0,0,0,0.3)', fontSize:13, fontWeight:600 }}>No units data available.</div>
                      ) : Object.entries(byColor).map(([color, sizes]) => {
                        const el = document.createElement('div');
                        el.style.color = color.toLowerCase();
                        const dotBg = el.style.color ? color.toLowerCase() : '#000';
                        return (
                          <div key={color} className="cat-cgroup">
                            <div className="cat-clabel">
                              <span className="cat-cdot" style={{ background:dotBg }} />
                              {color}
                              <span style={{ fontSize:11, color:'rgba(0,0,0,0.3)', fontWeight:700 }}>
                                ({sizes.reduce((s,v) => s+(v.quantity||0), 0)} units)
                              </span>
                            </div>
                            <div className="cat-sizes">
                              {sizes.map(v => {
                                const b = qtyBadge(v.quantity || 0);
                                return (
                                  <div key={v.id} className="cat-schip">
                                    <span className="cat-sname">{v.size}</span>
                                    <span className="cat-sqty" style={{ background:b.bg, color:b.color }}>
                                      {v.quantity === 0 ? 'EMPTY' : v.quantity <= 5 ? `LOW` : v.quantity}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <Modal
        open={formModal}
        onClose={() => setFormModal(false)}
        title={editTarget ? `✏️ Rename "${editTarget.name}"` : '＋ Add New Category'}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setFormModal(false)} disabled={formSaving}>Cancel</button>
            <button className="btn-primary" onClick={saveCategory} disabled={formSaving || !formName.trim()}>
              {formSaving ? 'Saving…' : editTarget ? 'Save Changes' : 'Create Category'}
            </button>
          </>
        }
      >
        <div className="cff">
          <label>Category Name *</label>
          <input
            autoFocus
            value={formName}
            onChange={e => setFormName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveCategory()}
            placeholder="e.g. Shirts, Trousers, Accessories…"
          />
          {editTarget && (
            <div className="cff-warn">⚠️ Renaming updates all products assigned to this category.</div>
          )}
        </div>
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal
        open={!!delTarget}
        onClose={() => setDelTarget(null)}
        title="Delete Category"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setDelTarget(null)} disabled={deleting}>Cancel</button>
            <button className="btn-danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Yes, Delete'}
            </button>
          </>
        }
      >
        <div className="del-body">
          <div className="del-icon">🗑️</div>
          <div className="del-title">Delete "{delTarget?.name}"?</div>
          <div className="del-sub">
            {delTarget?.productCount > 0
              ? `⚠️ This category has ${delTarget.productCount} product(s). You must move or delete them first before deleting this category.`
              : 'This action cannot be undone. The category will be permanently removed from the database.'}
          </div>
        </div>
      </Modal>
    </div>
  );
}
