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

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user') || 'null');
    
    if (!storedUser || !storedUser.id) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/orders/user/${storedUser.id}`);
        
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

  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
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
                    <h3 className="order-number">#{order.order_number}</h3>
                    <span className={`order-status ${order.status?.toLowerCase() || 'pending'}`}>
                      {order.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                  <div className="order-info-row">
                    <span className="order-info-item">
                      <span className="order-info-icon">👤</span>
                      {order.firstName || 'Sophia'} {order.lastName || 'Reynolds'}
                    </span>
                    <span className="order-info-separator">•</span>
                    <span className="order-info-item">
                      <span className="order-info-icon">📍</span>
                      {order.address || '14 Elmwood Avenue'}, {order.city || 'Colombo'}, {order.district || 'Western'}
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
                    <span className="order-total-value">Rs.{parseFloat(order.total_bill || 0).toFixed(2)}</span>
                    <span className="order-item-count">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Items Section - Grid layout 2 per row */}
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
                  {visibleItems?.map(item => (
                    <div key={item.id} className="product-card">
                      <div className="product-image">
                        <img 
                          src={item.Product?.image || '/placeholder.png'} 
                          alt={item.Product?.name || 'Product'}
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
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="order-footer">
                <div className="tracking-status">
                  <span className={`tracking-dot ${order.status?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'shipped' ? 'active' : 'pending'}`} />
                  {order.status?.toLowerCase() === 'delivered' ? 'Tracking available' : 'Tracking pending'}
                </div>
                <button className="track-order-btn" onClick={() => handleTrackOrder(order)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  TRACK ORDER
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Track Order Modal */}
      {showTrackModal && selectedOrder && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Track Order</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <p>Order Number: <strong>#{selectedOrder.order_number}</strong></p>
              <p>Status: <strong>{selectedOrder.status?.toUpperCase()}</strong></p>
              {selectedOrder.detail?.barcode && (
                <div className="barcode-section">
                  <label>Tracking Barcode:</label>
                  <div className="barcode-display">
                    <p className="barcode-text">{selectedOrder.detail.barcode}</p>
                  </div>
                  <p className="barcode-instruction">
                    Use this barcode to track your order with the courier service.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
