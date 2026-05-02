import React from 'react';

const OrderHistory = ({ orders }) => (
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

export default OrderHistory;
