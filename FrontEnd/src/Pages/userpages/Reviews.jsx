import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import API from '../../services/api';
import './Reviews.css';

/* ─────────────────────────────── helpers ────────────────────────────────── */
const StarRating = ({ value, onChange, readonly = false }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="rv-stars" aria-label={`Rating: ${value} of 5`}>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          className={`rv-star-btn ${i <= (hover || value) ? 'on' : 'off'}`}
          onClick={() => !readonly && onChange && onChange(i)}
          onMouseEnter={() => !readonly && setHover(i)}
          onMouseLeave={() => !readonly && setHover(0)}
          disabled={readonly}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const ratingLabel = r => ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][r] || '';

const getProductImage = (item) => {
  const variants = item?.Product?.variants || [];
  const exact = variants.find(v =>
    String(v.color || '').toLowerCase() === String(item.color || '').toLowerCase() && v.imageUrl
  );
  const any = variants.find(v => v.imageUrl);
  return exact?.imageUrl || any?.imageUrl || null;
};

/* ──────────────────────────── ProductReviewCard ─────────────────────────── */
const ProductReviewCard = ({ item, orderId, orderNumber, onReviewed, initiallyOpen = false }) => {
  const [open, setOpen] = useState(initiallyOpen);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef();
  const captureInputRef = useRef();

  const productImg = getProductImage(item);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    // Max 5 images
    if (imageFiles.length + files.length > 5) {
      setError('You can upload a maximum of 5 photos.');
      return;
    }

    const newFiles = [...imageFiles, ...files];
    const newPreviews = [...imagePreviews, ...files.map(f => URL.createObjectURL(f))];
    
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };
  
  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    // Reset input values so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (captureInputRef.current) captureInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (rating === 0) return setError('Please select a star rating.');
    if (!comment.trim()) return setError('Please write a comment.');

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('productId', item.productId);
      formData.append('color', item.color || '');
      formData.append('rating', rating);
      formData.append('comment', comment.trim());
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      await API.post('/reviews', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setOpen(false);
      onReviewed(orderId, item.productId);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`rv-product-card ${item.alreadyReviewed ? 'reviewed' : ''}`}>
      <div className="rv-product-row">
        {/* Product image */}
        <div className="rv-product-img-wrap">
          {productImg
            ? <img src={productImg} alt={item.Product?.name} className="rv-product-img" onError={e => { e.target.style.display = 'none'; }} />
            : <div className="rv-product-img-placeholder">📦</div>
          }
        </div>

        {/* Product info */}
        <div className="rv-product-info">
          <span className="rv-product-name">{item.Product?.name || 'Product'}</span>
          <div className="rv-product-meta">
            {item.color && <span className="rv-meta-chip color-chip">{item.color}</span>}
            {item.size && <span className="rv-meta-chip size-chip">{item.size}</span>}
            <span className="rv-meta-chip qty-chip">Qty: {item.quantity}</span>
          </div>
        </div>

        {/* Action */}
        <div className="rv-product-action">
          {item.alreadyReviewed ? (
            <span className="rv-reviewed-badge">✓ Reviewed</span>
          ) : (
            <button
              className={`rv-write-btn ${open ? 'active' : ''}`}
              onClick={() => setOpen(o => !o)}
            >
              {open ? 'Cancel' : 'Write Review'}
            </button>
          )}
        </div>
      </div>

      {/* Inline review form */}
      {open && !item.alreadyReviewed && (
        <form className="rv-inline-form" onSubmit={handleSubmit}>
          <div className="rv-form-section">
            <label className="rv-label">Your Rating</label>
            <StarRating value={rating} onChange={setRating} />
            {rating > 0 && <span className="rv-rating-label">{ratingLabel(rating)}</span>}
          </div>

          <div className="rv-form-section">
            <label className="rv-label" htmlFor={`comment-${item.productId}`}>Your Review</label>
            <div className="rv-textarea-wrapper">
              <textarea
                id={`comment-${item.productId}`}
                className="rv-textarea has-icon"
                placeholder="How was the quality, fit, and delivery? Share your honest experience..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={4}
              />
              <div className="rv-textarea-actions">
                <button 
                  type="button" 
                  className="rv-inline-upload-btn"
                  onClick={() => captureInputRef.current.click()}
                  title="Take a photo"
                >
                  📷
                </button>
                <button 
                  type="button" 
                  className="rv-inline-upload-btn"
                  onClick={() => fileInputRef.current.click()}
                  title="Attach a photo"
                >
                  📎
                </button>
              </div>
            </div>
            
            {imagePreviews.length > 0 && (
              <div className="rv-inline-image-preview-list">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="rv-inline-image-preview-item">
                    <img src={preview} alt={`Preview ${idx + 1}`} className="rv-upload-preview" />
                    <button
                      type="button"
                      className="rv-remove-img-btn"
                      onClick={() => removeImage(idx)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={captureInputRef}
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
          </div>

          {error && <div className="rv-error">{error}</div>}

          <div className="rv-form-actions">
            <button type="button" className="rv-cancel-btn" onClick={() => { setOpen(false); setError(''); }}>
              Cancel
            </button>
            <button type="submit" className="rv-submit-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

/* ──────────────────────────── OrderReviewBlock ──────────────────────────── */
const OrderReviewBlock = ({ order, onReviewed, initiallyExpanded = false }) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const allReviewed = order.items?.every(i => i.alreadyReviewed);

  return (
    <div className={`rv-order-block ${allReviewed ? 'all-reviewed' : ''}`}>
      <div className="rv-order-header" onClick={() => setExpanded(o => !o)}>
        <div className="rv-order-header-left">
          <span className="rv-order-number">Order #{order.order_number || order.id}</span>
          <span className="rv-order-date">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span className="rv-order-items-count">{order.items?.length} product{order.items?.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="rv-order-header-right">
          {allReviewed
            ? <span className="rv-all-reviewed-badge">All Reviewed ✓</span>
            : <span className="rv-pending-badge">{order.items?.filter(i => !i.alreadyReviewed).length} pending</span>
          }
          <span className={`rv-chevron ${expanded ? 'up' : 'down'}`}>›</span>
        </div>
      </div>

      {expanded && (
        <div className="rv-products-list">
          {order.items?.map(item => (
            <ProductReviewCard
              key={`${order.id}-${item.productId}`}
              item={item}
              orderId={order.id}
              orderNumber={order.order_number}
              onReviewed={onReviewed}
              initiallyOpen={initiallyExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ──────────────────────────── SubmittedReview ───────────────────────────── */
const SubmittedReview = ({ review }) => {
  const variants = review.product?.variants || [];
  const colorVariant = variants.find(v =>
    String(v.color || '').toLowerCase() === String(review.color || '').toLowerCase() && v.imageUrl
  );
  const anyVariant = variants.find(v => v.imageUrl);
  const productImg = colorVariant?.imageUrl || anyVariant?.imageUrl || null;

  return (
    <div className="rv-submitted-card">
      <div className="rv-submitted-top">
        {productImg && (
          <img src={productImg} alt={review.product?.name} className="rv-submitted-product-img" onError={e => { e.target.style.display = 'none'; }} />
        )}
        <div className="rv-submitted-info">
          <span className="rv-submitted-product-name">{review.product?.name || 'Product'}</span>
          <span className="rv-submitted-order">Order #{review.order?.order_number || review.orderId}</span>
          {review.color && <span className="rv-meta-chip color-chip">{review.color}</span>}
          <StarRating value={review.rating} readonly />
          <span className="rv-submitted-rating-label">{ratingLabel(review.rating)}</span>
          <span className="rv-submitted-date">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>
      <p className="rv-submitted-comment">"{review.comment}"</p>
      {review.imageUrls && review.imageUrls.length > 0 && (
        <div className="rv-submitted-img-wrap">
          {review.imageUrls.map((url, idx) => (
            <img key={idx} src={url} alt={`Review ${idx + 1}`} className="rv-submitted-review-img" />
          ))}
        </div>
      )}
    </div>
  );
};

/* ──────────────────────────── Main Component ────────────────────────────── */
const Reviews = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { storedUser, isLoggedIn } = useOutletContext();
  
  const focusedOrderId = location.state?.orderId;

  const [activeTab, setActiveTab] = useState('write');
  const [orders, setOrders] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [reviewsError, setReviewsError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchOrders();
    fetchMyReviews();
  }, [isLoggedIn]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    setOrdersError('');
    try {
      const res = await API.get('/reviews/eligible-orders');
      if (res.data.success) {
        let fetchedOrders = res.data.data;
        if (focusedOrderId) {
          // Sort to put the focused order at the top
          fetchedOrders.sort((a, b) => {
            if (a.id === focusedOrderId) return -1;
            if (b.id === focusedOrderId) return 1;
            return 0;
          });
        }
        setOrders(fetchedOrders);
      }
    } catch (err) {
      setOrdersError('Failed to load orders. Please try again.');
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchMyReviews = async () => {
    setLoadingReviews(true);
    setReviewsError('');
    try {
      const res = await API.get('/reviews/my-reviews');
      if (res.data.success) setMyReviews(res.data.data);
    } catch (err) {
      setReviewsError('Failed to load your reviews.');
    } finally {
      setLoadingReviews(false);
    }
  };

  // Optimistically mark a product as reviewed in the orders list
  const handleReviewed = (orderId, productId) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        items: order.items.map(item =>
          item.productId === productId ? { ...item, alreadyReviewed: true } : item
        )
      };
    }));
    // Refresh submitted reviews tab
    fetchMyReviews();
  };

  if (!isLoggedIn) {
    return (
      <div className="reviews-section">
        <div className="rv-not-logged-in">
          <p>Please log in to write or view your reviews.</p>
          <button className="rv-submit-btn" onClick={() => navigate('/login')}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-section">
      <div className="rv-page-header">
        <h2 className="section-title">My Reviews</h2>
        <p className="review-subtitle">Share your experience with delivered products.</p>
      </div>

      {/* Tab switcher */}
      <div className="rv-tab-bar">
        <button
          className={`rv-tab ${activeTab === 'write' ? 'active' : ''}`}
          onClick={() => setActiveTab('write')}
        >
          Write Reviews
          {orders.length > 0 && (
            <span className="rv-tab-count">
              {orders.reduce((n, o) => n + (o.items?.filter(i => !i.alreadyReviewed).length || 0), 0)}
            </span>
          )}
        </button>
        <button
          className={`rv-tab ${activeTab === 'submitted' ? 'active' : ''}`}
          onClick={() => setActiveTab('submitted')}
        >
          Submitted Reviews
          {myReviews.length > 0 && <span className="rv-tab-count">{myReviews.length}</span>}
        </button>
      </div>

      {/* ── WRITE REVIEWS TAB ── */}
      {activeTab === 'write' && (
        <div className="rv-tab-content">
          {loadingOrders ? (
            <div className="rv-loading">Loading your orders...</div>
          ) : ordersError ? (
            <div className="rv-error-state">{ordersError}</div>
          ) : orders.length === 0 ? (
            <div className="rv-empty-state">
              <div className="rv-empty-icon">🛍️</div>
              <p className="rv-empty-title">No delivered orders yet</p>
              <p className="rv-empty-sub">Once your orders are delivered, you can review each product here.</p>
              <button className="rv-submit-btn" onClick={() => navigate('/')}>Shop Now</button>
            </div>
          ) : (
            <div className="rv-orders-list">
              {focusedOrderId && orders.some(o => o.id === focusedOrderId) ? (
                <>
                  <OrderReviewBlock
                    key={focusedOrderId}
                    order={orders.find(o => o.id === focusedOrderId)}
                    onReviewed={handleReviewed}
                    initiallyExpanded={true}
                  />
                  
                  {orders.length > 1 && (
                    <div className="rv-to-be-reviewed-section">
                      <h3 className="rv-section-heading">To be reviewed</h3>
                      {orders.filter(o => o.id !== focusedOrderId).map(order => (
                        <OrderReviewBlock
                          key={order.id}
                          order={order}
                          onReviewed={handleReviewed}
                          initiallyExpanded={false}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                orders.map(order => (
                  <OrderReviewBlock
                    key={order.id}
                    order={order}
                    onReviewed={handleReviewed}
                    initiallyExpanded={false}
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ── SUBMITTED REVIEWS TAB ── */}
      {activeTab === 'submitted' && (
        <div className="rv-tab-content">
          {loadingReviews ? (
            <div className="rv-loading">Loading your reviews...</div>
          ) : reviewsError ? (
            <div className="rv-error-state">{reviewsError}</div>
          ) : myReviews.length === 0 ? (
            <div className="rv-empty-state">
              <div className="rv-empty-icon">✍️</div>
              <p className="rv-empty-title">No reviews yet</p>
              <p className="rv-empty-sub">Switch to the "Write Reviews" tab to share your thoughts.</p>
            </div>
          ) : (
            <div className="rv-submitted-list">
              {myReviews.map(review => (
                <SubmittedReview key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reviews;
