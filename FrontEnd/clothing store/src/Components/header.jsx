import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [cartCount] = useState(0);
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (stored) {
      try {
        setLoggedInUser(JSON.parse(stored));
      } catch {
        setLoggedInUser(null);
      }
    }
  }, []);

  const handleUserIconClick = () => {
    if (loggedInUser) {
      navigate('/user');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="header">
      <div className="header-container">

        {/* Logo */}
        <div className="logo">
          <img
            src="/assets/logo.png"
            alt="CLiCK Logo"
            className="logo-img"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <span className="logo-text logo-fallback">CLiCK</span>
        </div>

        {/* Navigation */}
        <nav className="nav">
          <Link to="/" className="nav-link active">Home</Link>
          <Link to="/category" className="nav-link">Category</Link>
          <Link to="/Contactus" className="nav-link">Contact Us</Link>
          <Link to="/about" className="nav-link">About us</Link>
        </nav>

        {/* Icons */}
        <div className="header-icons">

          {/* User Icon → /user if logged in, /login if not */}
          <button
            className="icon-btn"
            aria-label="Account"
            onClick={handleUserIconClick}
            title={loggedInUser ? `Logged in as ${loggedInUser.firstName || loggedInUser.email}` : 'Login'}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke={loggedInUser ? '#c8a97e' : 'currentColor'} strokeWidth="1.8">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </button>

          {/* Heart / Wishlist Icon */}
          <button
            className="icon-btn"
            aria-label="Wishlist"
            onClick={() => navigate('/user/wishlist')}
            title="Wishlist"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Cart Icon */}
          <button className="icon-btn" aria-label="Cart" onClick={() => navigate('/cart')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>

            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </button>

        </div>
      </div>
    </header>
  );
};

export default Header;
