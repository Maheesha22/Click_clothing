import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';
import './ProductReviews.css';

/* ── helpers ─────────────────────────────────────────────────────────────── */
const StarDisplay = ({ rating, size = 14 }) => (
  <div className="pr-stars">
    {[1, 2, 3, 4, 5].map(i => (
      <svg
        key={i}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={i <= rating ? '#c8982a' : 'none'}
        stroke="#c8982a"
        strokeWidth="2"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const RatingBar = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="pr-bar-row">
      <span className="pr-bar-label">{star}★</span>
      <div className="pr-bar-track">
        <div className="pr-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="pr-bar-count">{count}</span>
    </div>
  );
};

/* ── Main Component ───────────────────────────────────────────────────────── */
const ProductReviews = ({ productId, selectedColor, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterColor, setFilterColor] = useState(selectedColor || '');

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError('');
    const params = filterColor ? `?color=${encodeURIComponent(filterColor)}` : '';
    axios
      .get(`${API_BASE_URL}/reviews/product/${productId}${params}`)
      .then(res => {
        if (res.data.success) setReviews(res.data.data || []);
      })
      .catch(() => setError('Failed to load reviews.'))
      .finally(() => setLoading(false));
  }, [productId, filterColor]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const total = reviews.length;
  const avgRating = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  const starCounts = [5, 4, 3, 2, 1].map(s => ({
    star: s,
    count: reviews.filter(r => r.rating === s).length,
  }));
  const allReviewColors = [...new Set(reviews.map(r => r.color).filter(Boolean))];

  return (
    <div className="pr-modal-overlay" onClick={onClose}>
      <div className="pr-modal-container" onClick={e => e.stopPropagation()}>
        <button className="pr-modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="pr-modal-header">
          <h2 className="pr-modal-title">Customer Reviews</h2>

          <div className="pr-summary-row">
            <div className="pr-summary-left">
              <span className="pr-big-score">{avgRating.toFixed(1)}</span>
              <StarDisplay rating={Math.round(avgRating)} size={22} />
              <span className="pr-total-label">{total} review{total !== 1 ? 's' : ''}</span>
            </div>
            <div className="pr-summary-right">
              {starCounts.map(({ star, count }) => (
                <RatingBar key={star} star={star} count={count} total={total} />
              ))}
            </div>
          </div>

          {allReviewColors.length > 1 && (
            <div className="pr-color-filters">
              <button
                className={`pr-color-chip ${!filterColor ? 'active' : ''}`}
                onClick={() => setFilterColor('')}
              >
                All Colors
              </button>
              {allReviewColors.map(c => (
                <button
                  key={c}
                  className={`pr-color-chip ${filterColor === c ? 'active' : ''}`}
                  onClick={() => setFilterColor(c === filterColor ? '' : c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pr-reviews-body">
          {loading ? (
            <div className="pr-loading">Loading reviews…</div>
          ) : error ? (
            <div className="pr-error">{error}</div>
          ) : reviews.length === 0 ? (
            <div className="pr-empty">
              <span>📝</span>
              <p>No reviews yet{filterColor ? ` for "${filterColor}"` : ''}.</p>
            </div>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="pr-review-item">
                <div className="pr-review-top">
                  <div className="pr-reviewer-info">
                    <div className="pr-reviewer-avatar">
                      {(review.userName || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="pr-reviewer-name">{review.userName || 'Customer'}</span>
                      {review.color && <span className="pr-color-tag">{review.color}</span>}
                    </div>
                  </div>
                  <div className="pr-review-meta">
                    <StarDisplay rating={review.rating} size={13} />
                    <span className="pr-review-date">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
                <p className="pr-review-comment">{review.comment}</p>
                {review.imageUrls && review.imageUrls.length > 0 && (
                  <div className="pr-review-images">
                    {review.imageUrls.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={url}
                          alt={`Review photo ${idx + 1}`}
                          className="pr-review-img"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      </a>
                    ))}
                  </div>
                )}
                <div className="pr-verified-badge">✓ Verified Purchase</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
