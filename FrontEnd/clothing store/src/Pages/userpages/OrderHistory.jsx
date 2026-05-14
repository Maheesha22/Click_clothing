import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import './OrderHistory.css';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [viewingImage, setViewingImage] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user') || 'null');

    if (!storedUser || !storedUser.id) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/customer-orders/user/${storedUser.id}`);

        if (response.data.success) {
          setOrders(response.data.data || []);
        } else {
          setError('Failed to fetch orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.response?.data?.message || 'Error fetching orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const storedUser = JSON.parse(sessionStorage.getItem('user') || 'null');
  const isLoggedIn = !!(storedUser?.id);

  const handleTrackOrder = (order) => {
    setSelectedOrder(order);
    setShowTrackModal(true);
  };

  const handleCloseModal = () => {
    setShowTrackModal(false);
    setSelectedOrder(null);
  };

  //see more part
  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleReviewOrder = (order) => {
    navigate('/user/reviews', {
      state: {
        orderId: order.id,
        orderNumber: order.order_number,
        products: order.items || []
      }
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="orders-section">
        <h2 className="section-title">Order History</h2>
        <div className="empty-state">
          <p className="empty-title">You're not signed in</p>
          <p className="empty-subtitle">Please login to view your order history.</p>
          <button className="empty-btn" onClick={() => navigate('/login')}>Login</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="orders-section">
        <h2 className="section-title">Order History</h2>
        <div className="loading-state">Loading your orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-section">
        <h2 className="section-title">Order History</h2>
        <div className="error-state">{error}</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-section">
        <h2 className="section-title">Order History</h2>
        <div className="empty-state">
          <p className="empty-title">No Orders Yet</p>
          <p className="empty-subtitle">You haven't placed any orders yet. Start shopping!</p>
          <button className="empty-btn" onClick={() => navigate('/')}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-section">
      <h2 className="section-title">Order History</h2>

      <div className="orders-list">
        {orders.map(order => {
          const itemCount = order.items?.length || 0;
          const isExpanded = expandedOrders[order.id] || false;
          const visibleItems = isExpanded ? order.items : order.items?.slice(0, 2);
          const hasMoreItems = itemCount > 2;

          return (
            <div key={order.id} className="order-card">
              {/* Order Header */}
              <div className="order-header">
                <div className="order-header-left">
                  <div className="order-top-row">
                    <h3 className="order-number">#{order.order_number || order.id}</h3>
                    <span className={`order-status ${order.status?.toLowerCase() || 'pending'}`}>
                      {order.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                  <div className="order-info-row">
                    <span className="order-info-item">
                      <span className="order-info-icon">👤</span>
                      {order.customer?.firstName || 'N/A'} {order.customer?.lastName || 'N/A'}
                    </span>
                    <span className="order-info-separator">•</span>
                    <span className="order-info-item">
                      <span className="order-info-icon">📍</span>
                      {order.customer?.address || 'N/A'}, {order.customer?.city || 'N/A'}, {order.customer?.district || 'N/A'}
                    </span>
                    <span className="order-info-separator">•</span>
                    <span className="order-info-item">
                      <span className="order-info-icon">🗓</span>
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <div className="order-header-right">
                  <div className="order-total-section">
                    <span className="order-total-label">ORDER TOTAL</span>
                    <span className="order-total-value">
                      Rs.{parseFloat(
                        order.total_bill ||
                        order.items?.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.quantity || 1)), 0) ||
                        0
                      ).toFixed(2)}
                    </span>
                    <span className="order-item-count">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="order-items-section">
                <div className="items-header">
                  <span className="items-label">ITEMS IN THIS ORDER</span>
                  {hasMoreItems && (
                    <button className="show-more-btn" onClick={() => toggleExpand(order.id)}>
                      {isExpanded ? 'Show less ▲' : `+${itemCount - 2} more ▼`}
                    </button>
                  )}
                </div>

                <div className="items-grid-2col">
                  {visibleItems?.map(item => {
                    const exactVariant = item.Product?.variants?.find(
                      v =>
                        String(v.size || '').toLowerCase().trim() === String(item.size || '').toLowerCase().trim() &&
                        String(v.color || '').toLowerCase().trim() === String(item.color || '').toLowerCase().trim() &&
                        v.imageUrl
                    );

                    const colorVariant = item.Product?.variants?.find(
                      v => {
                        if (!v.imageUrl || !v.color || !item.color) return false;
                        const vColor = String(v.color).toLowerCase().trim();
                        const iColor = String(item.color).toLowerCase().trim();
                        return vColor === iColor || vColor.includes(iColor) || iColor.includes(vColor);
                      }
                    );

                    const imageUrl = exactVariant?.imageUrl ||
                      colorVariant?.imageUrl ||
                      item.Product?.variants?.find(v => v.imageUrl)?.imageUrl ||
                      '/placeholder.png';

                    return (
                      <div key={item.id} className="product-card">
                        <div className="product-image">
                          <img
                            src={imageUrl}
                            alt={item.Product?.name || 'Product'}
                            onClick={() => setViewingImage(imageUrl)}
                            style={{ cursor: 'pointer' }}
                            onError={(e) => { e.target.src = '/placeholder.png'; }}
                          />
                          {item.quantity > 1 && <div className="product-qty-badge">×{item.quantity}</div>}
                        </div>
                        <div className="product-details">
                          <h4 className="product-title">{item.Product?.name || 'Product'}</h4>
                          <div className="product-attributes">
                            {item.color && <span className="product-color">{item.color}</span>}
                            {item.size && <span className="product-size">{item.size}</span>}
                          </div>
                          <div className="product-price">Rs.{parseFloat(item.price || 0).toFixed(2)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="order-footer">
                <div className="tracking-status">
                  <span className={`tracking-dot ${order.status?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'shipped' ? 'active' : 'pending'}`} />
                  {order.status?.toLowerCase() === 'delivered' ? 'Tracking available' : 'Tracking pending'}
                </div>
                <div className="footer-actions">
                  {order.status?.toLowerCase() === 'delivered' && (
                    <button className="review-order-btn" onClick={() => handleReviewOrder(order)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                      </svg>
                      WRITE REVIEW
                    </button>
                  )}
                  <button className="track-order-btn" onClick={() => handleTrackOrder(order)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    TRACK ORDER
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Track Order Modal */}
      {showTrackModal && selectedOrder && (
        <div className="modal-overlay track-modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content track-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body track-modal-body">
              <h4 className="track-section-title">DELIVERY PROGRESS</h4>

              <div className="progress-container">
                <div className="progress-line"></div>

                <div className={`progress-step ${['pending', 'confirmed', 'shipped', 'delivered'].includes(selectedOrder.status?.toLowerCase() || 'pending') ? 'completed' : ''}`}>
                  <div className="progress-icon">📋</div>
                  <span className="progress-label">PENDING</span>
                </div>

                <div className={`progress-step ${['confirmed', 'shipped', 'delivered'].includes(selectedOrder.status?.toLowerCase() || 'pending') ? 'completed' : ''}`}>
                  <div className="progress-icon">⚙️</div>
                  <span className="progress-label">CONFIRMED</span>
                </div>

                <div className={`progress-step ${['shipped', 'delivered'].includes(selectedOrder.status?.toLowerCase() || 'pending') ? 'completed' : ''}`}>
                  <div className="progress-icon">🚚</div>
                  <span className="progress-label">SHIPPED</span>
                </div>

                <div className={`progress-step ${['delivered'].includes(selectedOrder.status?.toLowerCase() || 'pending') ? 'completed' : ''}`}>
                  <div className="progress-icon">✅</div>
                  <span className="progress-label">DELIVERED</span>
                </div>
              </div>

              <div className="track-barcode-section">
                <h4 className="track-section-title">TRACKING NUMBER</h4>
                <div className="barcode-box">
                  <div className="barcode-text-display">
                    {selectedOrder.detail?.barcode || selectedOrder.OrderDetail?.barcode || `TRK-PENDING-${selectedOrder.id}`}
                  </div>
                </div>
                <p className="barcode-subtext">
                  📦 Copy your Tracking Number above and visit <a href="https://koombiyodelivery.lk/Track/" target="_blank" rel="noopener noreferrer" className="koombiyo-link">koombiyodelivery.lk</a> for live delivery updates!
                </p>
              </div>
            </div>
            <div className="track-modal-footer">
              <button className="track-close-btn" onClick={handleCloseModal}>CLOSE</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div className="modal-overlay" onClick={() => setViewingImage(null)} style={{ zIndex: 9999 }}>
          <div className="image-viewer-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn image-viewer-close" onClick={() => setViewingImage(null)}>×</button>
            <img src={viewingImage} alt="Expanded view" className="expanded-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
