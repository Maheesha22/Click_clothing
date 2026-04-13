import React, { useState } from 'react';
import './User.css';

const User = () => {
  const [activeSection, setActiveSection] = useState('wishlist');
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Premium Headphones', price: 199.99, quantity: 1, emoji: '🎧' },
    { id: 2, name: 'Smart Watch', price: 299.99, quantity: 2, emoji: '⌚' },
    { id: 3, name: 'Laptop Bag', price: 79.99, quantity: 1, emoji: '💼' }
  ]);

  const [wishlistItems] = useState([
    { id: 1, name: 'Wireless Keyboard', price: 89.99, emoji: '⌨️' },
    { id: 2, name: 'Gaming Mouse', price: 59.99, emoji: '🖱️' },
    { id: 3, name: 'USB-C Hub', price: 49.99, emoji: '🔌' },
    { id: 4, name: 'Webcam HD', price: 129.99, emoji: '📷' }
  ]);

  const [orders] = useState([
    { id: 'ORD-2024001', date: '2024-01-15', items: 3, total: 459.97, status: 'Delivered' },
    { id: 'ORD-2024002', date: '2024-01-20', items: 2, total: 189.98, status: 'Shipped' },
    { id: 'ORD-2024003', date: '2024-01-22', items: 5, total: 799.95, status: 'Delivered' }
  ]);

  
  const updateQuantity = (id, change) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 15.00 : 0;
    return { subtotal, shipping, total: subtotal + shipping };
  };

  const renderWishlist = () => (
    <div className="wishlist-section">
      <h2 className="section-title">My Wishlist</h2>
      <div className="wishlist-grid">
        {wishlistItems.map(item => (
          <div key={item.id} className="wishlist-item">
            <div className="item-emoji">{item.emoji}</div>
            <h3 className="item-name">{item.name}</h3>
            <p className="item-price">${item.price.toFixed(2)}</p>
            <div className="item-actions">
              <button className="add-to-cart-btn">Add to Cart</button>
              <button className="remove-btn">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOrderHistory = () => (
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
              <span className="order-date">📅 {order.date}</span>
              <span className="order-items">📦 {order.items} items</span>
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

  const renderCart = () => {
    const { subtotal, shipping, total } = calculateTotal();
    
    return (
      <div className="cart-section">
        <h2 className="section-title">Shopping Cart</h2>
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.length === 0 ? (
              <p className="empty-cart">Your cart is empty</p>
            ) : (
              cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">{item.emoji}</div>
                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p className="cart-item-price">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, -1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                  </div>
                  <div className="cart-item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button 
                    className="remove-item-btn" 
                    onClick={() => removeFromCart(item.id)}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
          {cartItems.length > 0 && (
            <div className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-line">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button className="checkout-btn">Proceed to Checkout</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="user-dashboard">
      <aside className="sidebar">
        <div className="user-profile">
          <div className="user-avatar">👤</div>
          <h3 className="user-name">John Doe</h3>
          <p className="user-email">john.doe@example.com</p>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeSection === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveSection('wishlist')}
          >
            <span className="nav-icon">❤️</span>
            <span className="nav-label">Wishlist</span>
            <span className="nav-badge">4</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveSection('orders')}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-label">Order History</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'cart' ? 'active' : ''}`}
            onClick={() => setActiveSection('cart')}
          >
            <span className="nav-icon">🛒</span>
            <span className="nav-label">Cart</span>
            <span className="nav-badge">3</span>
          </button>
          
          <button className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Settings</span>
          </button>
          
          <button className="nav-item logout">
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </nav>
      </aside>
      
      <main className="main-content">
        {activeSection === 'wishlist' && renderWishlist()}
        {activeSection === 'orders' && renderOrderHistory()}
        {activeSection === 'cart' && renderCart()}
      </main>
    </div>
  );
};

export default User;
