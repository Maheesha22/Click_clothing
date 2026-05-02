import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrderHistory = ({ orders, isLoggedIn }) => {
  const navigate = useNavigate();

  // Guest view — not logged in
  if (!isLoggedIn) {
    return (
      <div className="orders-section">
        <h2 className="section-title">Order History</h2>
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#fff',
          border: '1px solid #ede9e4',
          borderRadius: '2px'
        }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '26px',
            color: '#999',
            marginBottom: '14px'
          }}>
            You're not signed in
          </p>
          <p style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: '13px',
            color: '#bbb',
            letterSpacing: '0.3px',
            marginBottom: '28px'
          }}>
            Please login to view your order history.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '12px',
              fontWeight: '500',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: '#fff',
              background: '#111',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '1px',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Logged-in view
  return (
    <div className="orders-section">
      <h2 className="section-title">Order History</h2>
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-item">
            <div className="order-header">
              <span className="order-id">{order.id}</span>
              <span className={`order-status status-${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
            <div className="order-details">
              <span className="order-date">{order.date}</span>
              <span className="order-items">{order.items} items</span>
              <span className="order-total">${order.total.toFixed(2)}</span>
            </div>
            <div className="order-actions">
              <button className="view-details-btn">View Details</button>
              <button className="track-btn">Track Order</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
