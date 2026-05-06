import { useState, useEffect } from 'react';
import {
  PER_PAGE,
  IcoPlus, IcoSearch,
  Badge, StockBar, MiniStats, Modal,
} from './shared';

/* ════════════════════════════════════════
   API BASE
════════════════════════════════════════ */
const API = 'http://localhost:3000/api/products';

/* ════════════════════════════════════════
   MAIN PRODUCTS COMPONENT
════════════════════════════════════════ */
export default function Products({ toast }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catF, setCatF] = useState('');
  const [stF, setStF] = useState('');
  const [page, setPage] = useState(1);
  const [delId, setDelId] = useState(null);

  /* ── fetch products on mount ── */
  useEffect(() => { 
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      console.log('Products fetched:', data);
      if (data.success) {
        setProducts(data.data);
      } else {
        toast('⚠️', 'Could not load products.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      toast('⚠️', 'Server not reachable.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API}/categories/all`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Category fetch error:', err);
    }
  };

  /* ── filter products ── */
  const filtered = products.filter(p => {
    const matchSearch = !search || (p.product_name || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = !catF || p.category?.id === parseInt(catF) || p.category?.name === catF;
    const matchStatus = !stF || (stF === 'Active' ? p.available : !p.available);
    return matchSearch && matchCat && matchStatus;
  });

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, pages);
  const currentProducts = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  /* ── delete product ── */
  const confirmDelete = async () => {
    try {
      const res = await fetch(`${API}/${delId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchProducts();
        toast('🗑️', 'Product deleted successfully.');
      } else {
        toast('❌', data.message || 'Delete failed.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast('❌', 'Network error.');
    }
    setDelId(null);
  };

  /* ── stats ── */
  const stats = {
    total: products.length,
    active: products.filter(p => p.available).length,
    low: products.filter(p => p.quantity > 0 && p.quantity <= 10).length,
    out: products.filter(p => p.quantity === 0).length,
  };

  /* ── price formatter ── */
  const formatPrice = price => `RS ${parseFloat(price || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

  return (
    <div className="view">
      {/* Header */}
      <div className="ph">
        <div>
          <h1 className="ph-title">Products</h1>
          <p className="ph-sub">Manage your product catalogue</p>
        </div>
      </div>

      {/* Stats Cards */}
      <MiniStats items={[
        ['📦', stats.total, 'Total Products'],
        ['✅', stats.active, 'Active'],
        ['⚠️', stats.low, 'Low Stock'],
        ['🚫', stats.out, 'Out of Stock'],
      ]} />

      {/* Filters */}
      <div className="toolbar">
        <div className="tb-search">
          <IcoSearch w={13} />
          <input
            className="tb-inp"
            placeholder="Search product name…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select 
          className="tb-sel" 
          value={catF} 
          onChange={e => { setCatF(e.target.value); setPage(1); }}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select 
          className="tb-sel" 
          value={stF} 
          onChange={e => { setStF(e.target.value); setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <span className="tb-count">{filtered.length} products</span>
      </div>

      {/* Products Table */}
      <div className="admin-card" style={{ overflow: 'hidden' }}>
        <div className="tbl-wrap">
          <table className="tbl" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="empty-cell">Loading products...</td>
                </tr>
              ) : currentProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-cell">
                    {products.length === 0 ? 'No products in database.' : 'No products match your filters.'}
                  </td>
                </tr>
              ) : (
                currentProducts.map(product => (
                  <tr key={product.id}>
                    <td>#{product.id}</td>
                    <td>
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.product_name} 
                          className="prod-img" 
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      ) : (
                        <div className="prod-thumb-ico" style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '8px' }}>
                          📦
                        </div>
                      )}
                    </td>
                    <td>
                      <div>
                        <div className="cell-nm">{product.product_name}</div>
                        {product.variant_summary && (
                          <div className="cell-sub" style={{ fontSize: '10px', color: '#64748b' }} title={product.variant_summary}>
                            {product.variant_count} variant(s)
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="cat-pill">
                        {product.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="cell-price">{formatPrice(product.price)}</td>
                    <td>
                      <StockBar stock={product.quantity || 0} />
                      {product.variant_count > 0 && (
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                          {product.variant_count} size(s)
                        </div>
                      )}
                    </td>
                    <td>
                      <Badge 
                        label={product.available ? 'Active' : 'Inactive'} 
                        cls={product.available ? 'b-active' : 'b-inactive'} 
                      />
                    </td>
                    <td>
                      <button 
                        className="ab ab-del" 
                        onClick={() => setDelId(product.id)}
                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="tbl-foot">
            <span className="tbl-info">
              Showing {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="pg-btns">
              <button className="pg-btn" onClick={() => setPage(p => p - 1)} disabled={currentPage <= 1}>
                ← Prev
              </button>
              {Array.from({ length: Math.min(pages, 5) }, (_, i) => (
                <button 
                  key={i} 
                  className={`pg-btn ${currentPage === i + 1 ? 'active' : ''}`} 
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button className="pg-btn" onClick={() => setPage(p => p + 1)} disabled={currentPage >= pages}>
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal 
        open={!!delId} 
        onClose={() => setDelId(null)} 
        compact
        footer={
          <>
            <button className="btn-secondary" onClick={() => setDelId(null)}>Cancel</button>
            <button className="btn-danger" onClick={confirmDelete}>Yes, Delete</button>
          </>
        }
      >
        <div className="m-body del-body">
          <div className="del-icon">🗑️</div>
          <div className="del-title">Delete Product?</div>
          <div className="del-sub">This action cannot be undone.</div>
        </div>
      </Modal>
    </div>
  );
}
