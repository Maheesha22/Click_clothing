import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from "../Components/header";
import Footer from "../Components/footer";
import './User.css';
import Wishlist from './userpages/Wishlist';
import OrderHistory from './userpages/OrderHistory';
import Cart from './userpages/Cart';
import Settings from './userpages/Settings';

const User = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get user from session — null if not logged in
  const storedUser = JSON.parse(sessionStorage.getItem('user') || 'null');
  const isLoggedIn = !!(storedUser?.email);

  // Display info — show "Guest" if not logged in
  const displayName = isLoggedIn ? `${storedUser.firstName} ${storedUser.lastName}` : 'Guest';
  const displayEmail = isLoggedIn ? storedUser.email : 'Not signed in';

  const initialTab = searchParams.get('tab') || 'wishlist';
  const [activeSection, setActiveSection] = useState(initialTab);

  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Premium Headphones', price: 199.99, quantity: 1, emoji: '🎧' },
    { id: 2, name: 'Smart Watch', price: 299.99, quantity: 2, emoji: '⌚' },
    { id: 3, name: 'Laptop Bag', price: 79.99, quantity: 1, emoji: '💼' }
  ]);

  const [orders] = useState([
    { id: 'ORD-2024001', date: '2024-01-15', items: 3, total: 459.97, status: 'Delivered' },
    { id: 'ORD-2024002', date: '2024-01-20', items: 2, total: 189.98, status: 'Shipped' },
    { id: 'ORD-2024003', date: '2024-01-22', items: 5, total: 799.95, status: 'Delivered' }
  ]);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
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

  const LoginIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );

  const UserIcon = () => (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );

  return (
    <>
      <Header />
      <div className="user-dashboard">
        <aside className="sidebar">
          <div className="user-profile">
            <div className="user-avatar"><UserIcon /></div>
            <h3 className="user-name">{displayName}</h3>
            <p className="user-email">{displayEmail}</p>
          </div>

          <nav className="sidebar-nav">
            {/* Wishlist — available to everyone */}
            <button
              className={`nav-item ${activeSection === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveSection('wishlist')}
            >
              <span className="nav-icon"><WishlistIcon /></span>
              <span className="nav-label">Wishlist</span>
            </button>

            {/* Order History — shows login message for guests */}
            <button
              className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveSection('orders')}
            >
              <span className="nav-icon"><OrderIcon /></span>
              <span className="nav-label">Order History</span>
            </button>

            {/* Cart — navigates to /cart page */}
            <button
              className="nav-item"
              onClick={() => navigate('/cart')}
            >
              <span className="nav-icon"><CartIcon /></span>
              <span className="nav-label">Cart</span>
            </button>

            {/* Settings — logged-in only */}
            <button
              className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => isLoggedIn ? setActiveSection('settings') : navigate('/login')}
            >
              <span className="nav-icon"><SettingsIcon /></span>
              <span className="nav-label">Settings</span>
            </button>

            {/* Logout (logged-in) or Login (guest) */}
            {isLoggedIn ? (
              <button className="nav-item logout" onClick={handleLogout}>
                <span className="nav-icon"><LogoutIcon /></span>
                <span className="nav-label">Logout</span>
              </button>
            ) : (
              <button className="nav-item" onClick={() => navigate('/login')}>
                <span className="nav-icon"><LoginIcon /></span>
                <span className="nav-label">Login</span>
              </button>
            )}
          </nav>
        </aside>

        <main className="main-content">
          {activeSection === 'wishlist' && <Wishlist user={storedUser} />}
          {activeSection === 'orders' && <OrderHistory orders={orders} isLoggedIn={isLoggedIn} />}
          {activeSection === 'cart' && (
            <Cart
              cartItems={cartItems}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
              calculateTotal={calculateTotal}
            />
          )}
          {activeSection === 'settings' && <Settings user={storedUser} />}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default User;
