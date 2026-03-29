import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Shop Column */}
        <div className="footer-col">
          <h4 className="footer-heading">SHOP</h4>
          <ul className="footer-links">
            <li><a href="/new-arrivals">NEW ARRIVALS</a></li>
            <li><a href="/women">WOMEN</a></li>
            <li><a href="/men">MEN</a></li>
            <li><a href="/kids">KIDS</a></li>
            <li><a href="/accessories">ACCESORIES</a></li>
          </ul>
        </div>

        {/* Information Column */}
        <div className="footer-col">
          <h4 className="footer-heading">INFORMATION</h4>
          <ul className="footer-links">
            <li><a href="/shipping">Shipping Policy</a></li>
            <li><a href="/returns">Returns & Exchanges</a></li>
            <li><a href="/terms">Terms & Conditions</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Company Column */}
        <div className="footer-col">
          <h4 className="footer-heading">COMPANY</h4>
          <ul className="footer-links">
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/faqs">FAQs</a></li>
          </ul>

          {/* Social Icons */}
          <div className="footer-socials">
            {/* Facebook */}
            <a href="https://facebook.com" className="social-icon" aria-label="Facebook" target="_blank" rel="noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>

            {/* TikTok */}
            <a href="https://tiktok.com" className="social-icon" aria-label="TikTok" target="_blank" rel="noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
