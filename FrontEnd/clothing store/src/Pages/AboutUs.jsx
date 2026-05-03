import React from "react";
import Header from "../Components/header";
import Footer from "../Components/footer";
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <>
      <Header />
      <div className="about-container">
        {/* Hero Banner */}
        <div className="about-hero">
          <img
            className="about-hero-img"
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format"
            alt="Fashionable woman shopping online - Click Clothing Super Mall"
            onError={(e) => {
              e.target.src = "https://placehold.co/1400x600/2a2f36/ffffff?text=Click+Clothing+Super+Mall";
            }}
          />
          <div className="about-hero-overlay">
            <h1 className="about-hero-title">About Click Clothing Super Mall</h1>
            <div className="hero-sub">Where Style Meets Affordability</div>
          </div>
        </div>

        {/* Who We Are section */}
        <section className="about-section">
          <div className="about-card">
            <h2 className="about-title">Who We Are</h2>
            <hr className="about-divider" />
            <div className="about-text">
              <p>
                Welcome to <strong>Click Clothing Super Mall</strong>, your one-stop destination for trendy and affordable fashion.
              </p>
              <p>
                We offer stylish clothing for men, women, and kids — from casual everyday essentials to statement pieces.
              </p>
              <p>
                Our goal is to make fashion easy and accessible for everyone, bridging the gap between quality and affordability.
              </p>
            </div>
          </div>
        </section>

        {/* Our Highlights */}
        <section className="about-section">
          <div className="about-card">
            <h2 className="about-title">Our Highlights</h2>
            <hr className="about-divider" />
            <div className="highlights-grid">
              <div className="highlight-item">
                <h3 className="highlight-title">Quality Products</h3>
                <p className="highlight-desc">High-quality, comfortable, and stylish clothing made to last.</p>
              </div>
              <div className="highlight-item">
                <h3 className="highlight-title">Affordable Prices</h3>
                <p className="highlight-desc">Fashionable outfits at affordable prices for everyone.</p>
              </div>
              <div className="highlight-item">
                <h3 className="highlight-title">Latest Trends</h3>
                <p className="highlight-desc">Stay up-to-date with the newest fashion trends & seasonal drops.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission */}
        <section className="about-section">
          <div className="mission-card">
            <h2 className="about-title">Our Mission</h2>
            <hr className="about-divider" />
            <p className="about-text mission-text">
              Our mission is to provide a great selection of stylish clothing and make shopping
              easy and enjoyable so that every customer can express their unique style
              with confidence. We believe fashion should empower, not overwhelm.
            </p>
          </div>
        </section>

        {/* Team Image */}
        <div className="about-team-wrap">
          <img
            className="about-team-img"
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?q=80&w=2070&auto=format"
            alt="Click Clothing Super Mall Retail Store"
            onError={(e) => {
              e.target.src = "https://placehold.co/1400x500/1e2836/ffffff?text=Our+Retail+Store";
            }}
          />
        </div>

        {/* Brand stats */}
        <div className="brand-strip">
          <div className="stat-item">
            <div className="stat-number">15K+</div>
            <div className="stat-label">Happy Customers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Styles Available</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Support</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">⭐ 4.9</div>
            <div className="stat-label">Rating</div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutUs;
