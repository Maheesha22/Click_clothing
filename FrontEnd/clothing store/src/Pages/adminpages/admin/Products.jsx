import { useState, useEffect } from 'react';
import {
  PER_PAGE,
  IcoPlus, IcoSearch,
  Badge, StockBar, MiniStats, Modal,
} from './shared';

const API = 'http://localhost:3000/api/products';
const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40'];

export default function Products({ toast, initialData, clearInitialData }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catF, setCatF] = useState('');
  const [stF, setStF] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [delId, setDelId] = useState(null);

  // New Effect for Restock from Dashboard
  useEffect(() => {
    if (initialData) {
      // Find the product to get its categoryId if possible
      const existingProduct = products.find(p => p.id === initialData.productId);
      
      setFormData({
        product_name: initialData.productName || '',
        categoryId: initialData.categoryId || (existingProduct ? existingProduct.categoryId : ''),
        price: existingProduct ? existingProduct.price : '',
        description: existingProduct ? (existingProduct.description || existingProduct.product_description) : '',
      });

      setColors([
        {
          id: Date.now(),
          name: initialData.color || '',
          image_url: initialData.imageUrl || '',
          sizes: [{ size: initialData.size || '', quantity: 0 }] 
        }
      ]);
      
      setModal(true);
      clearInitialData(); // Clear so it doesn't re-open on every render
    }
  }, [initialData, products, clearInitialData]);

  // Expandable row state
  const [expandedRow, setExpandedRow] = useState(null);
  const [variantsCache, setVariantsCache] = useState({});
  const [variantsLoading, setVariantsLoading] = useState(false);

  const toggleRow = async (productId) => {
    if (expandedRow === productId) {
      setExpandedRow(null);
      return;
    }
    setExpandedRow(productId);
    if (variantsCache[productId]) return; // already fetched
    setVariantsLoading(true);
    try {
      const res = await fetch(`${API}/${productId}`);
      const data = await res.json();
      if (data.success) {
        setVariantsCache(prev => ({ ...prev, [productId]: data.data.variants || [] }));
      } else {
        toast('⚠️', 'Could not load variants');
      }
    } catch {
      toast('⚠️', 'Network error');
    } finally {
      setVariantsLoading(false);
    }
  };

  // Product basic info
  const [formData, setFormData] = useState({
    product_name: '',
    categoryId: '',
    price: '',
    description: '',
  });

  // Dynamic colors: each = { id, name, image_url, sizes: [{ size, quantity }] }
  const [colors, setColors] = useState([]);

  // ----- Color helpers -----
  const addColor = () => {
    setColors([...colors, { id: Date.now(), name: '', image_url: '', sizes: [{ size: '', quantity: 0 }] }]);
  };
  const updateColor = (colorId, field, value) => {
    setColors(colors.map(c => c.id === colorId ? { ...c, [field]: value } : c));
  };
  const removeColor = (colorId) => {
    setColors(colors.filter(c => c.id !== colorId));
  };

  // ----- Size helpers inside a color -----
  const addSize = (colorId) => {
    setColors(colors.map(c =>
      c.id === colorId ? { ...c, sizes: [...c.sizes, { size: '', quantity: 0 }] } : c
    ));
  };
  const updateSize = (colorId, idx, field, value) => {
    setColors(colors.map(c =>
      c.id === colorId
        ? { ...c, sizes: c.sizes.map((s, i) => i === idx ? { ...s, [field]: value } : s) }
        : c
    ));
  };
  const removeSize = (colorId, idx) => {
    setColors(colors.map(c =>
      c.id === colorId ? { ...c, sizes: c.sizes.filter((_, i) => i !== idx) } : c
    ));
  };

  // ----- Image upload per color (uses existing Cloudinary endpoint) -----
  const uploadColorImage = async (colorId, file) => {
    if (!file || !file.type.startsWith('image/')) return toast('⚠️', 'Please select an image');
    if (file.size > 5 * 1024 * 1024) return toast('⚠️', 'Max 5MB');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API}/upload-image`, { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.success) {
        updateColor(colorId, 'image_url', data.image_url);
        toast('✅', 'Image uploaded');
      } else {
        toast('❌', data.message || 'Upload failed');
      }
    } catch (err) {
      toast('❌', 'Network error');
    } finally {
      setUploading(false);
    }
  };

  // ----- Data fetching -----
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      if (data.success) setProducts(data.data);
      else toast('⚠️', 'Could not load products');
    } catch {
      toast('⚠️', 'Server not reachable');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API}/categories/all`);
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (err) { console.error(err); }
  };

  // ----- Modal control -----
  const openAddModal = () => {
    setFormData({ product_name: '', categoryId: '', price: '', description: '' });
    setColors([]);
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setFormData({ product_name: '', categoryId: '', price: '', description: '' });
    setColors([]);
  };

  // ----- Save product: builds variants array and sends to backend -----
  const saveProduct = async () => {
    if (!formData.product_name || !formData.categoryId || !formData.price) {
      toast('⚠️', 'Fill product name, category, and price');
      return;
    }

    const variants = [];
    for (const color of colors) {
      if (!color.name.trim()) continue;
      for (const sizeObj of color.sizes) {
        if (!sizeObj.size || sizeObj.quantity <= 0) continue;
        variants.push({
          color: color.name,
          size: sizeObj.size,
          quantity: parseInt(sizeObj.quantity, 10),
          image_url: color.image_url || null,
        });
      }
    }

    if (variants.length === 0) {
      toast('⚠️', 'Add at least one color with a valid size & quantity');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        product_name: formData.product_name,
        description: formData.description,
        categoryId: parseInt(formData.categoryId),
        price: parseFloat(formData.price),
        variants,
      };

      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        await fetchProducts();
        setVariantsCache({});
        toast('✅', 'Product added!');
        closeModal();
      } else {
        toast('❌', data.message || 'Save failed');
      }
    } catch (err) {
      console.error(err);
      toast('❌', 'Network error');
    } finally {
      setSaving(false);
    }
  };

  // ----- Delete product -----
  const confirmDelete = async () => {
    try {
      const res = await fetch(`${API}/${delId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchProducts();
        setVariantsCache(prev => { const next = { ...prev }; delete next[delId]; return next; });
        if (expandedRow === delId) setExpandedRow(null);
        toast('🗑️', 'Product deleted');
      } else toast('❌', data.message);
    } catch {
      toast('❌', 'Network error');
    }
    setDelId(null);
  };

  // ----- Filter & pagination -----
  const filtered = products.filter(p => {
    const matchSearch = !search || (p.product_name || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = !catF || p.category?.id === parseInt(catF) || p.category?.name === catF;
    const matchStatus = !stF || (stF === 'Active' ? p.available : !p.available);
    return matchSearch && matchCat && matchStatus;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, pages);
  const currentProducts = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const stats = {
    total: products.length,
    active: products.filter(p => p.available).length,
    low: products.filter(p => p.quantity > 0 && p.quantity <= 10).length,
    out: products.filter(p => p.quantity === 0).length,
  };
  const formatPrice = price => `RS ${parseFloat(price || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

  return (
    <div className="view">
      <style>{`
        .variant-expand-row td {
          padding: 0 !important;
          background: #f8fafc;
          border-bottom: 2px solid #e2e8f0;
        }
        .variant-expand-inner {
          padding: 16px 24px;
          animation: fadeSlide 0.2s ease;
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .variant-title {
          font-size: 13px; font-weight: 600; color: #475569;
          margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .variant-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .variant-table th {
          background: #e2e8f0; padding: 6px 12px; text-align: left;
          font-weight: 600; color: #374151;
        }
        .variant-table td { padding: 7px 12px; border-bottom: 1px solid #e2e8f0; color: #374151; }
        .variant-table tr:last-child td { border-bottom: none; }
        .variant-table tr:hover td { background: #f1f5f9; }
        .size-badge {
          display: inline-block; background: #dbeafe; color: #1d4ed8;
          border-radius: 4px; padding: 2px 8px; font-weight: 600; font-size: 12px;
        }
        .qty-badge {
          display: inline-block; background: #dcfce7; color: #166534;
          border-radius: 4px; padding: 2px 8px; font-weight: 600; font-size: 12px;
        }
        .qty-badge.low { background: #fef9c3; color: #854d0e; }
        .qty-badge.out { background: #fee2e2; color: #991b1b; }
        .clickable-row { cursor: pointer; }
        .clickable-row:hover td { background: #f0f9ff !important; }
        .expand-arrow { display: inline-block; transition: transform 0.2s; font-size: 10px; margin-left: 4px; }
        .expand-arrow.open { transform: rotate(90deg); }
        .no-variants-msg { color: #94a3b8; font-size: 13px; padding: 8px 0; }
        .variant-img { width: 36px; height: 36px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0; }
        .img-upload-box-small {
          width: 60px; height: 60px;
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: #f8fafc;
          overflow: hidden;
        }
        .color-block {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          background: #fff;
        }
        .size-row {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-top: 8px;
        }
        .size-select, .size-qty {
          padding: 6px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
        }
        .size-select { width: 100px; }
        .size-qty { width: 80px; }
        .btn-icon { background: #ef4444; color: white; border: none; border-radius: 6px; padding: 4px 10px; cursor: pointer; }
        .btn-add-size { background: #3b82f6; color: white; border: none; border-radius: 6px; padding: 4px 12px; margin-top: 8px; cursor: pointer; }
        .product-image { width: 50px; height: 50px; object-fit: cover; border-radius: 8px; }
        .no-image { width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: #f1f5f9; border-radius: 8px; font-size: 24px; }
      `}</style>

      <div className="ph">
        <div><h1 className="ph-title">Products</h1><p className="ph-sub">Manage your catalogue</p></div>
        <button className="btn-primary" onClick={openAddModal}><IcoPlus /> Add New Product</button>
      </div>

      <MiniStats items={[
        ['📦', stats.total, 'Total Products'],
        ['✅', stats.active, 'Active'],
        ['⚠️', stats.low, 'Low Stock'],
        ['🚫', stats.out, 'Out of Stock'],
      ]} />

      <div className="toolbar">
        <div className="tb-search"><IcoSearch w={13} /><input className="tb-inp" placeholder="Search…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
        <select className="tb-sel" value={catF} onChange={e => { setCatF(e.target.value); setPage(1); }}><option value="">All Categories</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select className="tb-sel" value={stF} onChange={e => { setStF(e.target.value); setPage(1); }}><option value="">All Status</option><option>Active</option><option>Inactive</option></select>
        <span className="tb-count">{filtered.length} products</span>
      </div>

      <div className="admin-card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>ID</th><th>Image</th><th>Product Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Colors</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9">Loading…</td></tr>
              ) : currentProducts.length === 0 ? (
                <tr><td colSpan="9">No products found</td></tr>
              ) : (
                currentProducts.flatMap(p => {
                  const isExpanded = expandedRow === p.id;
                  const variants = variantsCache[p.id] || [];
                  return [
                    <tr key={p.id} className="clickable-row" onClick={() => toggleRow(p.id)}>
                      <td>#{p.id}</td>
                      <td onClick={e => e.stopPropagation()}>{p.image_url ? <img src={p.image_url} className="product-image" alt="" /> : <div className="no-image">📦</div>}</td>
                      <td>
                        <strong>{p.product_name}</strong>
                        <span className={`expand-arrow${isExpanded ? ' open' : ''}`}>▶</span>
                        <br/><small>{p.product_description?.slice(0,50)}</small>
                      </td>
                      <td><span className="cat-pill">{p.category?.name || 'Uncategorized'}</span></td>
                      <td className="cell-price">{formatPrice(p.price)}</td>
                      <td><StockBar stock={p.quantity || 0} /></td>
                      <td>{p.color || '—'}</td>
                      <td><Badge label={p.available ? 'Active' : 'Inactive'} cls={p.available ? 'b-active' : 'b-inactive'} /></td>
                      <td onClick={e => e.stopPropagation()}><button className="ab ab-del" onClick={() => setDelId(p.id)}>🗑️</button></td>
                    </tr>,
                    isExpanded && (
                      <tr key={`${p.id}-variants`} className="variant-expand-row">
                        <td colSpan="9">
                          <div className="variant-expand-inner">
                            <div className="variant-title">📋 Product Variants — {p.product_name}</div>
                            {variantsLoading && !variantsCache[p.id] ? (
                              <div className="no-variants-msg">Loading variants…</div>
                            ) : variants.length === 0 ? (
                              <div className="no-variants-msg">No variants found for this product.</div>
                            ) : (
                              <table className="variant-table">
                                <thead>
                                  <tr>
                                    <th>Image</th>
                                    <th>Color</th>
                                    <th>Size</th>
                                    <th>Quantity</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {variants.map((v, i) => {
                                    const qty = v.quantity || 0;
                                    const qtyClass = qty === 0 ? 'out' : qty <= 5 ? 'low' : '';
                                    return (
                                      <tr key={v.id || i}>
                                        <td>
                                          {v.imageUrl
                                            ? <img src={v.imageUrl} className="variant-img" alt={v.color} />
                                            : <div style={{ width:36, height:36, background:'#f1f5f9', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🎨</div>
                                          }
                                        </td>
                                        <td>
                                          <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                                            <span style={{
                                              display:'inline-block', width:14, height:14, borderRadius:'50%',
                                              background: v.color?.toLowerCase() || '#cbd5e1',
                                              border:'1px solid #cbd5e1', flexShrink:0
                                            }} />
                                            {v.color || '—'}
                                          </span>
                                        </td>
                                        <td><span className="size-badge">{v.size || '—'}</span></td>
                                        <td><span className={`qty-badge ${qtyClass}`}>{qty} {qty === 0 ? '(Out of Stock)' : qty <= 5 ? '(Low)' : ''}</span></td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </td>
                      </tr>
                    ),
                  ].filter(Boolean);
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="tbl-foot">
            <span>Showing {Math.min(currentPage * PER_PAGE, filtered.length)} of {filtered.length}</span>
            <div className="pg-btns">
              <button disabled={currentPage <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
              {Array.from({ length: Math.min(pages, 5) }, (_, i) => (
                <button key={i} className={currentPage === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
              <button disabled={currentPage >= pages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <Modal open={modal} onClose={closeModal} title="Add New Product"
        footer={
          <>
            <button className="btn-secondary" onClick={closeModal} disabled={saving || uploading}>Cancel</button>
            <button className="btn-primary" onClick={saveProduct} disabled={saving || uploading}>{saving ? 'Saving...' : 'Save Product'}</button>
          </>
        }>
        <div className="m-body">
          <div className="f-grid">
            <div className="f-full"><label className="f-lbl">Product Name *</label><input className="f-inp" value={formData.product_name} onChange={e => setFormData({...formData, product_name: e.target.value})} /></div>
            <div><label className="f-lbl">Category *</label><select className="f-sel" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}><option value="">Select</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="f-lbl">Price (RS) *</label><input className="f-inp" type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
            <div className="f-full"><label className="f-lbl">Description</label><textarea className="f-ta" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
          </div>

          <div className="f-full" style={{ marginTop: '20px' }}>
            <label className="f-lbl">Colors, Images & Sizes</label>
            {colors.map(color => (
              <div key={color.id} className="color-block">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                  <input className="f-inp" placeholder="Color name (e.g., Red)" value={color.name} onChange={e => updateColor(color.id, 'name', e.target.value)} style={{ flex: 2 }} />
                  <div className="img-upload-box-small" onClick={() => !uploading && document.getElementById(`colorImg-${color.id}`)?.click()}>
                    <input id={`colorImg-${color.id}`} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadColorImage(color.id, e.target.files[0])} />
                    {color.image_url ? <img src={color.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span>📷</span>}
                  </div>
                  <button type="button" className="btn-icon" onClick={() => removeColor(color.id)}>Remove</button>
                </div>
                <label>Sizes & Quantities:</label>
                {color.sizes.map((sizeObj, idx) => {
                  const selectedCategory = categories.find(c => c.id === parseInt(formData.categoryId));
                  const catName = (selectedCategory?.name || '').toLowerCase();
                  const isTop = ['armcuts', 'hoodie', 'long sleeves', 'shirts', 't shirts'].includes(catName);
                  const sizesToShow = isTop ? ['S', 'M', 'L', 'XL', 'XXL'] : ALL_SIZES;

                  return (
                    <div key={idx} className="size-row">
                      <select className="size-select" value={sizeObj.size} onChange={e => updateSize(color.id, idx, 'size', e.target.value)}>
                        <option value="">Select size</option>
                        {sizesToShow.map(s => <option key={s}>{s}</option>)}
                      </select>
                      <input className="size-qty" type="number" min="0" placeholder="Qty" value={sizeObj.quantity || ''} onChange={e => updateSize(color.id, idx, 'quantity', parseInt(e.target.value) || 0)} />
                      <button type="button" className="btn-icon" onClick={() => removeSize(color.id, idx)}>✕</button>
                    </div>
                  );
                })}
                <button type="button" className="btn-add-size" onClick={() => addSize(color.id)}>+ Add Size</button>
              </div>
            ))}
            <button type="button" className="btn-secondary" style={{ marginTop: '8px' }} onClick={addColor}>+ Add Another Color</button>
            {colors.length === 0 && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Add one or more colors, each with an optional image and at least one size+quantity.</div>}
          </div>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal open={!!delId} onClose={() => setDelId(null)} compact footer={<><button className="btn-secondary" onClick={() => setDelId(null)}>Cancel</button><button className="btn-danger" onClick={confirmDelete}>Delete</button></>}>
        <div className="del-body"><div className="del-icon">🗑️</div><div className="del-title">Delete Product?</div><div className="del-sub">This action cannot be undone.</div></div>
      </Modal>
    </div>
  );
}
