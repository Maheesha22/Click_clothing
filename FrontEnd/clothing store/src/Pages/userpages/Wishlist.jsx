import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  getWishlistDB,
  removeFromWishlistDB,
  getGuestWishlist,
  removeFromGuestWishlist
} from '../../services/wishlistService';

const Wishlist = () => {
  const { storedUser, isLoggedIn } = useOutletContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      getWishlistDB(storedUser.id)
        .then(res => { setItems(res.data); setError(''); })
        .catch(err => {
          setError(!err.response
            ? '⚠️ Cannot connect to server. Make sure the backend is running.'
            : '⚠️ Could not load wishlist.');
        })
        .finally(() => setLoading(false));
    } else {
      setItems(getGuestWishlist());
      setLoading(false);
    }
  }, [storedUser?.id]);

  const handleRemove = async (item) => {
    if (isLoggedIn) {
      try {
        await removeFromWishlistDB(item.id);
        setItems(prev => prev.filter(i => i.id !== item.id));
      } catch {
        setError('Failed to remove item. Please try again.');
      }
    } else {
      setItems(removeFromGuestWishlist(item.productId));
    }
  };

  return (
    <div className="wishlist-section">
      <h2 className="section-title">My Wishlist</h2>

      {!isLoggedIn && (
        <div style={{
          background: '#fffdf8', border: '1px solid #ede9e4', borderRadius: '2px',
          padding: '14px 20px', marginBottom: '24px', fontFamily: "'Jost', sans-serif",
          fontSize: '13px', color: '#888', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span>💡 Guest wishlist clears when the browser is closed.</span>
          <a href="/login" style={{
            color: '#111', fontWeight: '500', fontSize: '11px',
            letterSpacing: '1px', textTransform: 'uppercase',
            textDecoration: 'none', borderBottom: '1px solid #111'
          }}>Login to save permanently</a>
        </div>
      )}

      {loading && (
        <p style={{ fontFamily: "'Jost', sans-serif", color: '#888' }}>Loading...</p>
      )}

      {!loading && error && (
        <div style={{
          background: '#fdf8f8', border: '1px solid #f0d5d5', padding: '16px 20px',
          borderRadius: '2px', fontFamily: "'Jost', sans-serif", fontSize: '13px', color: '#b05555'
        }}>{error}</div>
      )}

      {!loading && !error && items.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 20px', background: '#fff',
          border: '1px solid #ede9e4', borderRadius: '2px'
        }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: '#999' }}>
            Your wishlist is empty
          </p>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '13px', color: '#bbb', marginTop: '8px' }}>
            Browse our collection and add items you love ♥
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="wishlist-grid">
          {items.map(item => (
            <div key={item.id ?? item.productId} className="wishlist-item">
              {/* Product image or emoji fallback */}
              {item.imageUrl ? (
                <div className="item-image" style={{
                  width: '100%', aspectRatio: '3/4', overflow: 'hidden',
                  borderRadius: '2px', marginBottom: '12px', background: '#f5f5f0'
                }}>
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div className="item-emoji">{item.emoji || '🛍️'}</div>
              )}
              <h3 className="item-name">{item.productName}</h3>
              <p className="item-price">Rs {Number(item.price).toLocaleString()}.00</p>
              <div className="item-actions">
                <button className="add-to-cart-btn">Add to Cart</button>
                <button className="remove-btn" onClick={() => handleRemove(item)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
