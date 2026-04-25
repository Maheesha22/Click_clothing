import "./footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-columns">

        <div className="footer-col">
          <h4 className="footer-col-title">SHOP</h4>
          <ul>
            <li>NEW ARRIVALS</li>
            <li>WOMEN</li>
            <li>MEN</li>
            <li>KIDS</li>
            <li>ACCESORIES</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">INFORMATION</h4>
          <ul>
            <li>Shipping Policy</li>
            <li>Returns & Exchanges</li>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div className="footer-col">
          <div className="footer-col-head">
            <h4 className="footer-col-title">COMPANY</h4>
            <div className="footer-socials">

              {/* Facebook */}
              <a href="https://www.facebook.com/profile.php?id=100063535900642&mibextid=wwXIfr&mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="social-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>

              {/* TikTok */}
              <a href="https://www.tiktok.com/@click.supermall" target="_blank" rel="noopener noreferrer" className="social-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a href="https://www.instagram.com/clicksuper_mall?igsh=aXp6anNkM2Y0azRr" target="_blank" rel="noopener noreferrer" className="social-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>

            </div>
          </div>
          <ul>
            <li>About Us</li>
            <li>Contact Us</li>
            <li>FAQs</li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <p className="footer-text">
          © Copyrights 2026. All Rights Reserved &nbsp;|&nbsp; Designed by{" "}
          <span className="footer-brand">Lumina</span> &nbsp;|&nbsp;{" "}
          <span className="footer-brand">CLiCK Clothing</span>
        </p>
      </div>
    </footer>
  );
}
