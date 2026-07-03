import { useState, useEffect } from 'react';
import API from '../../../services/api';
import { assetUrl } from '../../../services/api';
import { IcoSearch, Modal } from './shared';

/* ── Star renderer ───────────────────────────────────── */
const Stars = ({ rating }) => (
  <span className="rv-stars" title={`${rating} / 5`}>
    {[1, 2, 3, 4, 5].map(n => (
      <span key={n} className={n <= rating ? 'star filled' : 'star empty'}>★</span>
    ))}
  </span>
);

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [previewImg, setPreviewImg] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await API.get('/reviews/all');
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ── Filtering ─────────────────────────────────────── */
  const filtered = reviews.filter(r => {
    // Rating filter
    if (filter !== 'all') {
      const f = parseInt(filter, 10);
      if (r.rating !== f) return false;
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      return [
        r.userName,
        r.productName,
        r.orderNumber,
        r.comment,
        String(r.orderId),
      ].some(v => v?.toLowerCase().includes(q));
    }
    return true;
  });

  /* ── Stats ─────────────────────────────────────────── */
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';
  const fiveStar = reviews.filter(r => r.rating === 5).length;
  const withImages = reviews.filter(r => r.imageUrls && r.imageUrls.length > 0).length;

  const resolveImgUrl = (url) => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return assetUrl(url);
  };

  return (
    <div className="view">
      {/* Header */}
      <div className="ph">
        <div>
          <h1 className="ph-title">
            Customer Reviews <span className="ph-badge">{totalReviews} total</span>
          </h1>
          <p className="ph-sub">View and manage all customer product reviews.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="rv-stats-grid">
        <div className="rv-stat-card">
          <div className="rv-stat-icon">📝</div>
          <div>
            <div className="rv-stat-val">{totalReviews}</div>
            <div className="rv-stat-lbl">Total Reviews</div>
          </div>
        </div>
        <div className="rv-stat-card">
          <div className="rv-stat-icon">⭐</div>
          <div>
            <div className="rv-stat-val">{avgRating}</div>
            <div className="rv-stat-lbl">Average Rating</div>
          </div>
        </div>
        <div className="rv-stat-card">
          <div className="rv-stat-icon">🌟</div>
          <div>
            <div className="rv-stat-val">{fiveStar}</div>
            <div className="rv-stat-lbl">5-Star Reviews</div>
          </div>
        </div>
        <div className="rv-stat-card">
          <div className="rv-stat-icon">📷</div>
          <div>
            <div className="rv-stat-val">{withImages}</div>
            <div className="rv-stat-lbl">With Photos</div>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="filter-pills">
        {['all', '5', '4', '3', '2', '1'].map(val => (
          <button
            key={val}
            className={`fp${filter === val ? ' active' : ''}`}
            onClick={() => setFilter(val)}
          >
            {val === 'all' ? 'All Reviews' : `${val} ★`}
          </button>
        ))}
      </div>

      {/* Search Toolbar */}
      <div className="toolbar">
        <div className="tb-search">
          <IcoSearch w={13} />
          <input
            className="tb-inp"
            placeholder="Search by customer, product, order, or comment…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="tb-count">{filtered.length} review{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="admin-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="rv-empty">Loading reviews…</div>
        ) : filtered.length === 0 ? (
          <div className="rv-empty">No reviews found</div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl" style={{ minWidth: 1000 }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Order</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Photos</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(rv => (
                  <tr key={rv.id}>
                    {/* Product — image + name */}
                    <td>
                      <div className="rv-prod-cell">
                        <div className="rv-prod-thumb">
                          {rv.productImage ? (
                            <img
                              src={resolveImgUrl(rv.productImage)}
                              alt={rv.productName}
                              className="rv-prod-img"
                            />
                          ) : (
                            <span className="rv-prod-placeholder">📦</span>
                          )}
                        </div>
                        <div>
                          <div className="cell-nm">{rv.productName}</div>
                          {rv.color && <div className="cell-sub">Color: {rv.color}</div>}
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td>
                      <div className="av-cell">
                        <div className="av">{rv.userName?.[0]?.toUpperCase() || '?'}</div>
                        <span className="cell-nm">{rv.userName}</span>
                      </div>
                    </td>

                    {/* Order */}
                    <td className="cell-id">{rv.orderNumber}</td>

                    {/* Rating */}
                    <td>
                      <Stars rating={rv.rating} />
                    </td>

                    {/* Comment */}
                    <td>
                      <div className="rv-comment">
                        {rv.comment.length > 120
                          ? rv.comment.substring(0, 120) + '…'
                          : rv.comment}
                      </div>
                    </td>

                    {/* Review images */}
                    <td>
                      {rv.imageUrls && rv.imageUrls.length > 0 ? (
                        <div className="rv-imgs">
                          {rv.imageUrls.map((url, idx) => (
                            <img
                              key={idx}
                              src={resolveImgUrl(url)}
                              alt={`Review photo ${idx + 1}`}
                              className="rv-img-thumb"
                              onClick={() => setPreviewImg(resolveImgUrl(url))}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="cell-dim">—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="cell-dim">
                      {new Date(rv.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      <Modal
        open={!!previewImg}
        onClose={() => setPreviewImg(null)}
        title="Review Photo"
        compact
      >
        <div style={{ padding: '16px', textAlign: 'center' }}>
          {previewImg && (
            <img
              src={previewImg}
              alt="Review"
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                borderRadius: '10px',
                objectFit: 'contain'
              }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
