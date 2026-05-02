import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../Components/header";
import Footer from "../Components/footer";
import './User.css';

const User = () => {
  const navigate = useNavigate();
  const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

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

  const WishlistIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );

  const OrderIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );

  const CartIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );

  const SettingsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );

  const LogoutIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );

  const UserIcon = () => (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );

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

  if (!user.email) {
    navigate('/login');
    return null;
  }

  return (
    <>
      <Header />
      <div className="user-dashboard">
        <aside className="sidebar">
          <div className="user-profile">
            <div className="user-avatar"><UserIcon /></div>
            <h3 className="user-name">{user.firstName} {user.lastName}</h3>
            <p className="user-email">{user.email}</p>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeSection === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveSection('wishlist')}
            >
              <span className="nav-icon"><WishlistIcon /></span>
              <span className="nav-label">Wishlist</span>
              <span className="nav-badge">4</span>
            </button>

            <button
              className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveSection('orders')}
            >
              <span className="nav-icon"><OrderIcon /></span>
              <span className="nav-label">Order History</span>
            </button>

            <button
              className={`nav-item ${activeSection === 'cart' ? 'active' : ''}`}
              onClick={() => setActiveSection('cart')}
            >
              <span className="nav-icon"><CartIcon /></span>
              <span className="nav-label">Cart</span>
              <span className="nav-badge">3</span>
            </button>

            <button className="nav-item">
              <span className="nav-icon"><SettingsIcon /></span>
              <span className="nav-label">Settings</span>
            </button>

            <button className="nav-item logout" onClick={handleLogout}>
              <span className="nav-icon"><LogoutIcon /></span>
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
      <Footer />
    </>
  );
};

export default User;
