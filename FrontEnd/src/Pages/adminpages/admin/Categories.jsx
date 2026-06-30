import { useState, useEffect, useCallback, useRef } from 'react';
import { apiUrl, authHeaders } from '../../../services/api';
import { MiniStats, Badge } from './shared';

const CAT_API = apiUrl('/categories');
const PROD_API = apiUrl('/products');
const fmt = v => `RS ${parseFloat(v || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '36px 0' }}>
    <div style={{ width: 30, height: 30, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'cat-spin 0.7s linear infinite' }} />
  </div>
);

const qtyBadge = qty => {
  if (qty === 0) return { bg: '#fee2e2', color: '#991b1b', label: 'Out of Stock' };
  if (qty <= 5) return { bg: '#fef9c3', color: '#854d0e', label: `Low (${qty})` };
  return { bg: '#dcfce7', color: '#166534', label: `${qty}` };
};

const ACCENT_COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f97316', '#ef4444', '#14b8a6', '#eab308', '#ec4899', '#06b6d4'];

function Modal({ open, onClose, title, footer, style, children }) {
  if (!open) return null;
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440, width: '94vw', ...style }}>
        {title && <div className="m-hdr"><span className="m-title">{title}</span></div>}
        <div className="m-body">{children}</div>
        {footer && <div className="m-ftr">{footer}</div>}
      </div>
    </div>
  );
}

function KebabMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
          borderRadius: 8, color: '#94a3b8', fontSize: 18, lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
        title="More options"
      >⋮</button>
      {open && (
        <div style={{
          position: 'absolute', top: '110%', right: 0, background: '#fff',
          border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          minWidth: 140, zIndex: 100, overflow: 'hidden', animation: 'cat-fade 0.15s ease',
        }}>
          <button
            onClick={e => { e.stopPropagation(); setOpen(false); onEdit(e); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >✏️ Rename</button>
          <button
            onClick={e => { e.stopPropagation(); setOpen(false); onDelete(e); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#ef4444', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >🗑️ Delete</button>
        </div>
      )}
    </div>
  );
}

export default function Categories({ toast }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formName, setFormName] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [delTarget, setDelTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewCat, setViewCat] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadProds, setLoadProds] = useState(false);
  const [expandProd, setExpandProd] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(CAT_API);
      const d = await res.json();
      if (d.success) setCategories(d.data);
      else toast('⚠️', d.message || 'Could not load categories');
    } catch { toast('⚠️', 'Backend not reachable on port 3000'); }
    finally { setLoading(false); }
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
      const res = await fetch(editTarget ? `${CAT_API}/${editTarget.id}` : CAT_API, {
        method: editTarget ? 'PUT' : 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name }),
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
      const res = await fetch(`${CAT_API}/${delTarget.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const d = await res.json();
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
      const res = await fetch(`${PROD_API}?categoryId=${cat.id}`);
      const d = await res.json();
      if (d.success) setProducts(d.data);
      else toast('⚠️', d.message || 'Could not load products');
    } catch { toast('⚠️', 'Network error'); }
    finally { setLoadProds(false); }
  };

  const toggleProductVariants = async (prodId) => {
    if (expandProd === prodId) { setExpandProd(null); return; }
    const product = products.find(p => p.id === prodId);
    if (product && product.variantsLoaded) { setExpandProd(prodId); return; }
    try {
      const res = await fetch(`${PROD_API}/${prodId}/variants`);
      const d = await res.json();
      if (d.success) {
        setProducts(prev => prev.map(p => p.id === prodId ? { ...p, variants: d.data, variantsLoaded: true } : p));
        setExpandProd(prodId);
      } else toast('⚠️', d.message || 'Could not load variants');
    } catch { toast('⚠️', 'Network error fetching variants'); }
  };

  return (
    <div className="view">
      <style>{`
        @keyframes cat-spin { to { transform:rotate(360deg); } }
        @keyframes cat-fade { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
        @keyframes cat-scale { from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)} }

        /* ── Grid ── */
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        /* ── Category Card (matches dashboard screenshot) ── */
        .cat-card {
          background: #fff;
          border: 1px solid #e8edf2;
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 0;
          transition: box-shadow 0.2s, transform 0.2s;
          animation: cat-fade 0.25s ease both;
          position: relative;
        }
        .cat-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .cat-card.active { border-color: #1e293b; box-shadow: 0 0 0 2px #1e293b; }

        .cat-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }

        /* circular image/icon thumb */
        .cat-thumb-wrap {
          width: 72px; height: 72px; border-radius: 50%;
          background: #f1f5f9; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; flex-shrink: 0;
          border: 1px solid #e2e8f0;
        }
        .cat-thumb-wrap img { width: 100%; height: 100%; object-fit: cover; }

        .cat-name  { font-size: 17px; font-weight: 700; color: #0f172a; letter-spacing: -0.01em; margin-bottom: 4px; }
        .cat-count { font-size: 13px; color: #64748b; font-weight: 500; }

        /* colored accent line */
        .cat-accent { height: 3px; border-radius: 99px; margin: 14px 0; width: 40px; }

        /* footer row */
        .cat-foot {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 12px; border-top: 1px solid #f1f5f9;
          margin-top: auto;
        }
        .cat-hint {
          font-size: 13px; font-weight: 600; color: #64748b;
          display: flex; align-items: center; gap: 6px;
          transition: color 0.2s;
        }
        .cat-card:hover .cat-hint { color: #0f172a; }
        .cat-hint-arrow { font-size: 14px; transition: transform 0.2s; }
        .cat-card:hover .cat-hint-arrow { transform: translateX(3px); }

        /* Add Category card */
        .cat-add-card {
          background: #fff; border: 2px dashed #cbd5e1; border-radius: 16px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 10px; cursor: pointer; min-height: 200px;
          color: #94a3b8; transition: all 0.2s; text-align: center; padding: 20px;
        }
        .cat-add-card:hover { border-color: #1e293b; color: #1e293b; box-shadow: 0 8px 28px rgba(0,0,0,0.06); transform: translateY(-2px); }
        .cat-add-icon {
          width: 48px; height: 48px; border-radius: 50%; border: 2px dashed currentColor;
          display: flex; align-items: center; justify-content: center; font-size: 22px;
          transition: transform 0.3s;
        }
        .cat-add-card:hover .cat-add-icon { transform: rotate(90deg); }
        .cat-add-label { font-size: 14px; font-weight: 700; }
        .cat-add-sub { font-size: 12px; font-weight: 500; opacity: 0.7; }

        /* ── Product Panel ── */
        .cat-panel { background:#fff; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; margin-bottom:32px; box-shadow:0 8px 30px rgba(0,0,0,0.06); animation:cat-scale .25s ease; }
        .cat-panel-hdr { padding:18px 24px; background:#0f172a; display:flex; align-items:center; justify-content:space-between; }
        .cat-panel-title { font-size:16px; font-weight:700; color:#fff; display:flex; align-items:center; gap:10px; letter-spacing:-0.01em; }
        .cat-panel-badge { font-size:11px; background:rgba(255,255,255,0.15); color:#fff; border-radius:20px; padding:3px 10px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; }
        .cat-panel-close { background:rgba(255,255,255,0.1); border:none; cursor:pointer; color:#fff; font-size:14px; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; transition:background 0.2s; }
        .cat-panel-close:hover { background:rgba(255,255,255,0.25); }

        /* product row */
        .cat-prow { display:flex; align-items:center; gap:16px; padding:16px 24px; border-bottom:1px solid #f1f5f9; cursor:pointer; transition:background .2s; position:relative; }
        .cat-prow:hover { background:#f8fafc; }
        .cat-prow.open { background:#f8fafc; }
        .cat-prow.open::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:#0f172a; }
        .cat-prow:last-of-type { border-bottom:none; }

        .cat-pthumb { width:52px; height:52px; border-radius:10px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; font-size:22px; overflow:hidden; flex-shrink:0; border:1px solid #e2e8f0; }
        .cat-pthumb img { width:100%; height:100%; object-fit:cover; }

        .cat-pinfo { flex:1; min-width:0; }
        .cat-pname { font-size:15px; font-weight:700; color:#0f172a; letter-spacing:-0.01em; }
        .cat-pprice { font-size:14px; color:#0f172a; font-weight:700; margin-top:2px; }
        .cat-pmeta { font-size:12px; color:#64748b; font-weight:500; margin-top:4px; display:flex; align-items:center; gap:6px; }

        .cat-pstock { padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; flex-shrink:0; text-transform:uppercase; letter-spacing:0.05em; }
        .cat-parrow { color:#cbd5e1; font-size:13px; transition:all .25s; width:28px; height:28px; border-radius:50%; background:#f1f5f9; display:flex; align-items:center; justify-content:center; }
        .cat-prow:hover .cat-parrow { color:#0f172a; background:#e2e8f0; }
        .cat-prow.open .cat-parrow { transform:rotate(90deg); background:#0f172a; color:#fff; }

        /* variants */
        .cat-var-wrap { background:#f8fafc; border-bottom:1px solid #e2e8f0; padding:16px 24px 20px 88px; animation:cat-fade .2s ease; }
        .cat-var-title { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.1em; color:#94a3b8; margin-bottom:12px; }
        .cat-cgroup { margin-bottom:14px; }
        .cat-clabel { display:flex; align-items:center; gap:8px; font-size:13px; font-weight:700; color:#0f172a; margin-bottom:8px; }
        .cat-cdot { width:14px; height:14px; border-radius:5px; border:1px solid rgba(0,0,0,0.1); flex-shrink:0; }
        .cat-sizes { display:flex; flex-wrap:wrap; gap:6px; }
        .cat-schip { display:flex; flex-direction:column; align-items:center; background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:6px 10px; min-width:56px; text-align:center; transition:border-color 0.2s; }
        .cat-schip:hover { border-color:#0f172a; }
        .cat-sname { font-size:13px; font-weight:800; color:#0f172a; }
        .cat-sqty { font-size:10px; font-weight:700; border-radius:5px; padding:2px 5px; margin-top:3px; text-transform:uppercase; }

        /* form */
        .cff label { display:block; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.1em; color:rgba(0,0,0,0.5); margin-bottom:8px; }
        .cff input { width:100%; padding:12px 14px; border:1.5px solid #e2e8f0; border-radius:12px; font-size:15px; font-weight:600; outline:none; box-sizing:border-box; transition:border-color 0.2s, box-shadow 0.2s; }
        .cff input:focus { border-color:#0f172a; box-shadow:0 0 0 3px rgba(15,23,42,0.06); }
        .cff-warn { background:#fffbeb; border:1px solid #fde68a; border-radius:10px; padding:12px; font-size:13px; font-weight:600; color:#92400e; margin-top:14px; line-height:1.4; }

        .del-body { text-align:center; padding:12px 0 8px; }
        .del-icon { font-size:44px; margin-bottom:12px; }
        .del-title { font-size:19px; font-weight:800; color:#0f172a; margin-bottom:8px; letter-spacing:-0.02em; }
        .del-sub { font-size:14px; color:#64748b; line-height:1.6; font-weight:500; }

        .cat-empty { text-align:center; padding:48px 20px; color:#94a3b8; }
      `}</style>

      {/* ── Header ── */}
      <div className="ph">
        <div>
          <h1 className="ph-title">Categories</h1>
          <p className="ph-sub">Manage and organize your product categories</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={fetchCategories}>🔄 Refresh</button>
          <button className="btn-primary" onClick={openAdd}>＋ Add Category</button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ marginBottom: 28 }}>
        <MiniStats items={[['📦', categories.length, 'Total Categories']]} />
      </div>

      {/* ── Cards ── */}
      {loading ? <Spinner /> : (
        <div className="cat-grid">
          {categories.map((cat, i) => {
            const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
            const active = viewCat?.id === cat.id;
            // Pick a representative emoji based on name
            const emoji = '👕';
            return (
              <div
                key={cat.id}
                className={`cat-card${active ? ' active' : ''}`}
                style={{ animationDelay: `${i * 0.04}s` }}
                onClick={() => openProducts(cat)}
              >
                {/* top row: thumb + kebab */}
                <div className="cat-card-top">
                  <div className="cat-thumb-wrap">
                    {cat.thumbnailImage ? (
                      <img src={cat.thumbnailImage} alt={cat.name} style={{ objectFit: 'cover' }} />
                    ) : (
                      <span style={{ opacity: 0.35 }}>📦</span>
                    )}
                  </div>
                  <KebabMenu
                    onEdit={e => openEdit(cat, e)}
                    onDelete={e => openDelete(cat, e)}
                  />
                </div>

                {/* name + count */}
                <div className="cat-name">{cat.name}</div>
                <div className="cat-count">{cat.productCount || 0} {cat.productCount === 1 ? 'Product' : 'Products'}</div>

                {/* accent line */}
                <div className="cat-accent" style={{ background: accent }} />

                {/* footer */}
                <div className="cat-foot">
                  <span className="cat-hint">
                    {active ? 'Close Details' : 'View Collection'}
                    <span className="cat-hint-arrow">→</span>
                  </span>
                </div>
              </div>
            );
          })}

          {/* Add card */}
          <div className="cat-add-card" onClick={openAdd}>
            <div className="cat-add-icon">＋</div>
            <div className="cat-add-label">Add Category</div>
            <div className="cat-add-sub">Create a new product category</div>
          </div>
        </div>
      )}

      {/* ── Products Details Panel ── */}
      {viewCat && (
        <div className="cat-panel" style={{ marginTop: 16 }}>
          <div className="cat-panel-hdr">
            <div className="cat-panel-title">
              {viewCat.name} Collection
              <span className="cat-panel-badge">
                {loadProds ? 'Loading…' : `${products.length} Styles`}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="cat-btn" onClick={e => openEdit(viewCat, e)} title="Rename" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', borderRadius: 8, padding: '6px 10px', color: '#fff', fontSize: 14 }}>✏️</button>
              <button className="cat-btn cat-btn-del" onClick={e => openDelete(viewCat, e)} title="Delete" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', borderRadius: 8, padding: '6px 10px', color: '#fff', fontSize: 14 }}>🗑️</button>
              <button className="cat-panel-close" onClick={() => { setViewCat(null); setProducts([]); setExpandProd(null); }}>✕</button>
            </div>
          </div>

          <div>
            {loadProds ? <Spinner /> : products.length === 0 ? (
              <div className="cat-empty">
                <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.25 }}>📭</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>No styles found in "{viewCat.name}"</div>
                <div style={{ fontSize: 13, marginTop: 4, color: '#94a3b8' }}>This collection is currently empty.</div>
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
                <div key={prod.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
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
                        {prod.variant_count > 0 && <span>📦 {prod.variant_count} {prod.variant_count === 1 ? 'variant' : 'variants'}</span>}
                        {prod.variant_count > 0 && prod.color && <><span>·</span><span>🎨 {prod.color}</span></>}
                        {prod.variant_count === 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}>⚠️ No inventory variants</span>}
                      </div>
                    </div>
                    <span className="cat-pstock" style={{ background: sb.bg, color: sb.color }}>{sb.label}</span>
                    <span className="cat-parrow">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </span>
                  </div>

                  {isOpen && (
                    <div className="cat-var-wrap">
                      <div className="cat-var-title">Inventory Breakdown</div>
                      {!prod.variants?.length ? (
                        <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>No units data available.</div>
                      ) : Object.entries(byColor).map(([color, sizes]) => {
                        const el = document.createElement('div');
                        el.style.color = color.toLowerCase();
                        const dotBg = el.style.color ? color.toLowerCase() : '#000';
                        return (
                          <div key={color} className="cat-cgroup">
                            <div className="cat-clabel">
                              <span className="cat-cdot" style={{ background: dotBg }} />
                              {color}
                              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
                                ({sizes.reduce((s, v) => s + (v.quantity || 0), 0)} units)
                              </span>
                            </div>
                            <div className="cat-sizes">
                              {sizes.map(v => {
                                const b = qtyBadge(v.quantity || 0);
                                return (
                                  <div key={v.id} className="cat-schip">
                                    <span className="cat-sname">{v.size}</span>
                                    <span className="cat-sqty" style={{ background: b.bg, color: b.color }}>
                                      {v.quantity === 0 ? 'EMPTY' : v.quantity <= 5 ? 'LOW' : v.quantity}
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
              ? `⚠️ This category has ${delTarget.productCount} product(s). Move or delete them first.`
              : 'This action cannot be undone. The category will be permanently removed.'}
          </div>
        </div>
      </Modal>
    </div>
  );
}
