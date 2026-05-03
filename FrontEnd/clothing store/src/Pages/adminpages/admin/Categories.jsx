import { useState, useEffect } from 'react';
import { IcoPlus, Badge, MiniStats, IcoBox, IcoTag } from './shared';

const IcoShirt = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>;
const IcoTrouser = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 2h6a3 3 0 0 1 3 3v17H14v-6h-4v6H6V5a3 3 0 0 1 3-3z"/></svg>;
const IcoShorts = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 2h12a2 2 0 0 1 2 2v10l-4 4-4-4-4 4-4-4V4a2 2 0 0 1 2-2z"/></svg>;
const IcoTshirt = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22V8M20.38 3.46L16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>;
const IcoWatch = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 13.5 13.5"/><path d="M16.51 7.49l.74-2.85a1 1 0 0 0-1-1.25H7.75a1 1 0 0 0-1 1.25l.74 2.85"/><path d="M7.49 16.51l-.74 2.85a1 1 0 0 0 1 1.25h8.5a1 1 0 0 0 1-1.25l-.74-2.85"/></svg>;

/* ════════════════════════════════════════
   FIXED CATEGORIES FOR CLICK CLOTHING
════════════════════════════════════════ */
const FIXED_CATS = [
  { name: 'Shirts', description: 'Formal & casual shirts' },
  { name: 'Trousers', description: 'Formal & casual trousers' },
  { name: 'Shorts', description: 'Casual & sports shorts' },
  { name: 'T-shirts', description: 'Graphic & plain T-shirts' },
  { name: 'Accessories', description: 'Cap, Perfume, Deodorant' },
];

const ACC_SUBS = ['Cap', 'Perfume', 'Deodorant'];
const API_CATS = 'http://localhost:3000/api/products/categories/all';
const API_PROD = 'http://localhost:3000/api/products';

function formatSizes(sizeStr) {
  if (!sizeStr) return '';
  try {
    const parsed = JSON.parse(sizeStr);
    if (typeof parsed === 'object' && parsed !== null) {
      const parts = Object.entries(parsed).map(([sz, qty]) => `${sz}: ${qty}`);
      return ` · Sizes: ${parts.join(', ')}`;
    }
  } catch (e) {
    // not JSON
  }
  return ` · Size: ${sizeStr}`;
}

/* ════════════════════════════════════════
   CATEGORIES PAGE
════════════════════════════════════════ */
export default function Categories({ toast }) {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [viewCat, setViewCat] = useState(null);   // category name being viewed
  const [catProds, setCatProds] = useState([]);
  const [loadProds, setLoadProds] = useState(false);

  /* ── fetch categories with product counts from DB ── */
  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_CATS);
      const data = await res.json();
      if (data.success) {
        /* Merge DB counts into fixed category list */
        const dbMap = {};
        data.data.forEach(d => { dbMap[d.name] = d; });

        const merged = FIXED_CATS.map(fc => ({
          ...fc,
          total: dbMap[fc.name]?.total || 0,
          active: dbMap[fc.name]?.active || 0,
          status: 'Active',
        }));
        setCats(merged);
      } else {
        /* fallback: show fixed cats with zero counts */
        setCats(FIXED_CATS.map(fc => ({ ...fc, total: 0, active: 0, status: 'Active' })));
        toast('⚠️', 'Could not load category counts from server.');
      }
    } catch {
      setCats(FIXED_CATS.map(fc => ({ ...fc, total: 0, active: 0, status: 'Active' })));
      toast('⚠️', 'Server not reachable — showing fixed categories.');
    } finally { setLoading(false); }
  };

  /* ── view products in a category ── */
  const openView = async (catName) => {
    setViewCat(catName);
    setModal(true);
    setLoadProds(true);
    setCatProds([]);
    try {
      const res = await fetch(`${API_PROD}?category=${encodeURIComponent(catName)}&limit=100`);
      const data = await res.json();
      if (data.success) setCatProds(data.data);
      else toast('⚠️', 'Could not load products for this category.');
    } catch { toast('⚠️', 'Server not reachable.'); }
    finally { setLoadProds(false); }
  };

  const closeModal = () => { setModal(false); setViewCat(null); setCatProds([]); };

  const totalProducts = cats.reduce((s, c) => s + c.total, 0);
  const totalActive = cats.reduce((s, c) => s + c.active, 0);

  /* ── price formatter ── */
  const fmtPrice = v => `RS ${parseFloat(v || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

  return (
    <div className="view">

      <style>{`
        /* ── Modern Premium Category Cards ── */
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
          perspective: 1000px;
        }
        
        .cat-card {
          background: #f1f5f9;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          padding: 24px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          flex-direction: column;
          gap: 18px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03), inset 0 0 0 1px rgba(255, 255, 255, 0.5);
        }
        
        .cat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%);
          z-index: 0;
          border-radius: 20px;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .cat-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.05);
          border-color: rgba(0, 0, 0, 0.1);
        }
        
        .cat-card:hover::before {
          opacity: 1;
        }
        
        .cat-card > * {
          position: relative;
          z-index: 1;
        }

        .cat-card-top {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .cat-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          color: #000000;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          flex-shrink: 0;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .cat-card:hover .cat-icon-wrap {
          transform: scale(1.1) rotate(5deg);
        }

        .cat-name {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        
        .cat-desc {
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
          line-height: 1.4;
        }

        .cat-counts {
          display: flex;
          gap: 12px;
          background: rgba(255, 255, 255, 0.5);
          padding: 6px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.6);
        }
        
        .cat-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border-radius: 8px;
          padding: 10px 8px;
          flex: 1;
          box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          transition: background 0.3s ease;
        }
        
        .cat-card:hover .cat-stat {
          background: #f8fafc;
        }

        .cat-stat-val {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }
        
        .cat-stat-lbl {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-top: 4px;
        }

        .cat-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 4px;
          padding-top: 16px;
          border-top: 1px dashed rgba(203, 213, 225, 0.6);
        }
        
        .cat-view-btn {
          font-size: 13px;
          color: #6366f1;
          font-weight: 700;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 14px;
          border-radius: 20px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .cat-card:hover .cat-view-btn {
          background: rgba(99, 102, 241, 0.1);
          transform: translateX(4px);
        }

        /* ── Accessories sub badge ── */
        .acc-sub-list { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
        .acc-sub { font-size: 10px; background: rgba(139, 92, 246, 0.15); color: #6d28d9; border-radius: 99px; padding: 4px 10px; font-weight: 700; letter-spacing: 0.02em; border: 1px solid rgba(139, 92, 246, 0.2); }

        /* ── Premium Modal ── */
        .overlay {
          background: rgba(15, 23, 42, 0.4) !important;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          animation: fadeIn 0.3s ease;
        }
        
        .modal {
          border-radius: 24px !important;
          border: 1px solid rgba(255,255,255,0.2) !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
          animation: slideUpBounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.1) !important;
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(20px);
        }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpBounce {
          0% { transform: translateY(40px) scale(0.95); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }

        .m-hdr { padding: 20px 24px !important; border-bottom: 1px solid rgba(226, 232, 240, 0.6) !important; }
        .m-title { font-size: 18px !important; font-weight: 800 !important; letter-spacing: -0.02em; }
        
        .cat-prod-list { max-height: 400px; overflow-y: auto; padding: 0 8px; }
        .cat-prod-row { display: flex; align-items: center; gap: 16px; padding: 14px 12px; border-bottom: 1px solid rgba(241, 245, 249, 0.8); transition: background 0.2s ease; border-radius: 12px; }
        .cat-prod-row:hover { background: #f8fafc; }
        .cat-prod-row:last-child { border-bottom: none; }
        
        .cat-prod-img { width: 48px; height: 48px; object-fit: cover; border-radius: 12px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .cat-prod-img img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; }
        
        .cat-prod-name { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
        .cat-prod-price { font-size: 13px; color: #6366f1; font-weight: 700; }
        .cat-prod-stock { font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 500; background: #f1f5f9; padding: 2px 8px; border-radius: 6px; display: inline-block; }
        
        .cat-prod-actions { margin-left: auto; }
        .empty-cat { text-align: center; padding: 40px 20px; color: #94a3b8; font-size: 15px; font-weight: 500; }
        
        /* Custom Scrollbar for Modal */
        .cat-prod-list::-webkit-scrollbar { width: 6px; }
        .cat-prod-list::-webkit-scrollbar-track { background: transparent; }
        .cat-prod-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .cat-prod-list::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <div className="ph">
        <div><h1 className="ph-title">Categories</h1><p className="ph-sub">Click a category to view its products from the database.</p></div>
        <button className="btn-primary" onClick={fetchCategories} style={{ gap: 6 }}>🔄 Refresh</button>
      </div>

      <MiniStats items={[
        ['🏷️', cats.length, 'Total Categories'],
        ['📦', totalProducts, 'Total Products'],
        ['✅', totalActive, 'Active Products'],
        ['🚫', totalProducts - totalActive, 'Inactive'],
      ]} />

      {loading ? (
        <div className="admin_card" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading categories…</div>
      ) : (
        <div className="cat-grid">
          {cats.map(cat => (
            <div className="cat-card" key={cat.name} onClick={() => openView(cat.name)}>
              <div className="cat-card-top">
                <div>
                  <div className="cat-name">{cat.name}</div>
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
                  <div className="cat-stat-val" style={{ color: '#16a34a' }}>{cat.active}</div>
                  <div className="cat-stat-lbl">Active</div>
                </div>
                <div className="cat-stat">
                  <div className="cat-stat-val" style={{ color: '#ef4444' }}>{cat.total - cat.active}</div>
                  <div className="cat-stat-lbl">Inactive</div>
                </div>
              </div>

              <div className="cat-footer">
                <Badge label={cat.status} cls={cat.status === 'Active' ? 'b-active' : 'b-inactive'} />
                <button className="cat-view-btn">View products →</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── View Products Modal ── */}
      {modal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="m-hdr">
              <span className="m-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {FIXED_CATS.find(c => c.name === viewCat)?.icon} {viewCat} — Products
              </span>
              <button className="m-x" onClick={closeModal}>✕</button>
            </div>
            <div className="m-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
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
                          ? <img src={p.image_url} alt={p.product_name} />
                          : <span style={{ color: '#94a3b8', display: 'flex' }}>{FIXED_CATS.find(c => c.name === viewCat)?.icon || <IcoBox />}</span>
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="cat-prod-name">{p.product_name}</div>
                        <div className="cat-prod-price">{fmtPrice(p.price)}</div>
                        <div className="cat-prod-stock">Stock: {p.quantity || 0}{formatSizes(p.size)}</div>
                      </div>
                      <Badge label={p.available ? 'Active' : 'Inactive'} cls={p.available ? 'b-active' : 'b-inactive'} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="m-ftr">
              <span style={{ color: '#64748b', fontSize: 13 }}>{catProds.length} products in {viewCat}</span>
              <button className="btn-secondary" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
