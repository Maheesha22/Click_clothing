import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  getRecentlyViewedDB,
  removeFromRecentlyViewedDB,
  clearAllRecentlyViewedDB,
  getGuestRecentlyViewed,
  removeFromGuestRecentlyViewed,
  clearGuestRecentlyViewed
} from '../../services/recentlyViewedService';
import cartService from '../../services/cartservice';
import './RecentlyViewed.css';

const RecentlyViewed = () => {
  const { storedUser, isLoggedIn } = useOutletContext();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  useEffect(() => {
    if (isLoggedIn) {
      getRecentlyViewedDB(storedUser.id)
        .then(res => { setItems(res.data); setError(''); })
        .catch(err => {
          setError(!err.response
            ? '⚠️ Cannot connect to server. Make sure the backend is running.'
            : '⚠️ Could not load recently viewed products.');
        })
        .finally(() => setLoading(false));
    } else {
      setItems(getGuestRecentlyViewed(20));
      setLoading(false);
    }
  }, [storedUser?.id, isLoggedIn]);

  const handleRemove = async (item) => {
    if (isLoggedIn) {
      try {
        await removeFromRecentlyViewedDB(item.id);
        setItems(prev => prev.filter(i => i.id !== item.id));
        showToast('Removed from recently viewed');
      } catch {
        setError('Failed to remove item. Please try again.');
      }
    } else {
      setItems(removeFromGuestRecentlyViewed(item.productId));
      showToast('Removed from recently viewed');
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all recently viewed products?')) {
      if (isLoggedIn) {
        try {
          await clearAllRecentlyViewedDB(storedUser.id);
          setItems([]);
          showToast('Cleared all recently viewed products');
        } catch {
          setError('Failed to clear items. Please try again.');
        }
      } else {
        setItems(clearGuestRecentlyViewed());
        showToast('Cleared all recently viewed products');
      }
    }
  };

  const handleAddToCart = async (item) => {
    if (!isLoggedIn) {
      showToast("Please login to add items to your cart.", "error");
      return;
    }

    try {
      const cartData = {
        userId: storedUser.id,
        productId: item.productId || item.id,
        name: item.productName,
        price: item.price,
        imageUrl: item.imageUrl,
        color: '',
        size: '',
        quantity: 1
      };

      await cartService.addToCart(cartData);
      showToast(`${item.productName} has been added to your cart!`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      showToast("Failed to add item to cart. Please try again.", "error");
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="recently-viewed-section">
      <div className="recently-viewed-header">
        <h2 className="section-title">Recently Viewed Products</h2>
        {items.length > 0 && (
          <button className="clear-all-btn" onClick={handleClearAll}>
            Clear All
          </button>
        )}
      </div>

      {!isLoggedIn && items.length > 0 && (
        <div style={{
          background: '#fffdf8', border: '1px solid #ede9e4', borderRadius: '2px',
          padding: '14px 20px', marginBottom: '24px', fontFamily: "'Jost', sans-serif",
          fontSize: '13px', color: '#888', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span>💡 Guest history clears when the browser is closed.</span>
          <a href="/login" style={{
            color: '#111', fontWeight: '500', fontSize: '11px',
            letterSpacing: '1px', textTransform: 'uppercase',
            textDecoration: 'none', borderBottom: '1px solid #111'
          }}>Login to save permanently</a>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <p>Loading recently viewed products...</p>
        </div>
      )}

      {error && (
        <div style={{
          background: '#fde6e6', border: '1px solid #f5c2c2', borderRadius: '2px',
          padding: '14px 20px', marginBottom: '24px', color: '#c33', fontSize: '13px'
        }}>
          {error}
        </div>
      )}

      {!loading && items.length === 0 ? (
        <div className="empty-state">
          <p>📭 You haven't viewed any products yet.</p>
          <p style={{ fontSize: '13px', color: '#999', marginTop: '8px' }}>
            Products you view will appear here.
          </p>
          <a href="/shirts" style={{
            display: 'inline-block', marginTop: '16px', padding: '10px 20px',
            background: '#111', color: '#fff', textDecoration: 'none', fontSize: '12px',
            fontWeight: '500', letterSpacing: '0.5px'
          }}>
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="recently-viewed-grid">
          {items.map((item) => (
            <div key={item.id} className="recently-viewed-card">
              <div className="rv-card-image" onClick={() => handleViewProduct(item.productId)}>
                <img 
                  src={item.imageUrl || 'https://via.placeholder.com/200'} 
                  alt={item.productName}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/200'}
                />
                <span className="rv-viewed-badge">Viewed</span>
              </div>
              
              <div className="rv-card-body">
                <h3 
                  className="rv-product-name"
                  onClick={() => handleViewProduct(item.productId)}
                  style={{ cursor: 'pointer' }}
                >
                  {item.productName}
                </h3>
                
                {item.description && (
                  <p className="rv-description">{item.description.substring(0, 50)}...</p>
                )}
                
                <div className="rv-price-row">
                  <span className="rv-price">₹ {parseFloat(item.price).toFixed(2)}</span>
                  <span className="rv-viewed-time">
                    {new Date(item.viewedAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <div className="rv-actions">
                  <button 
                    className="rv-btn rv-view-btn"
                    onClick={() => handleViewProduct(item.productId)}
                  >
                    View Product
                  </button>
                  <button 
                    className="rv-btn rv-cart-btn"
                    onClick={() => handleAddToCart(item)}
                  >
                    Add to Cart
                  </button>
                  <button 
                    className="rv-btn rv-remove-btn"
                    onClick={() => handleRemove(item)}
                    title="Remove from recently viewed"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast.show && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default RecentlyViewed;
