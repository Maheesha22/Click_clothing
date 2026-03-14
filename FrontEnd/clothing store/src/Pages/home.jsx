import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Home.css";

// ── Men's Dropdown Menu Data ────────────────────────────────────
const MEN_MENU = [
  { label: "Sarong" },
  { label: "Trousers" },
  { label: "Shirts" },
  { label: "T-Shirts" },
  { label: "Shorts" },
  {
    label: "Accessories",
    sub: ["Caps", "Perfume", "Deodorant"],
  },
];

// ── Tab & Sidebar Data ──────────────────────────────────────────
const NAV_TABS = [
  { label: "New Arrivals" },
  { label: "Best Sellers" },
  { label: "Men", menu: MEN_MENU },
  { label:"Gifts" },
  { label: "Men Accessories" },
  { label: "Recently Viewed" },
  { label: "Search History" },
];

const SIDEBAR_LINKS = [
  "categories",
  "New Arrivals",
  "Best Sellers",
  "Men",
  "Accessories",
  "Gifts",
];



// ── Slideshow Data ──────────────────────────────────────────────
const SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1400&q=85",
    tag: "New Collection 2026",
    title: "Style That Speaks\nFor You",
    sub: "Discover the latest trends curated for every occasion.",
  },
  {
    img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=85",
    tag: "Women's Fashion",
    title: "Elegance In\nEvery Detail",
    sub: "Premium women's wear for the modern lifestyle.",
  },
  {
    img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1400&q=85",
    tag: "Top Sales",
    title: "Up To 40% Off\nThis Season",
    sub: "Shop the best deals before they're gone.",
  },
  {
    img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&q=85",
    tag: "Men's Collection",
    title: "Dress Sharp,\nLive Bold",
    sub: "Effortless style for every man's wardrobe.",
  },
];

// ── Product Data ────────────────────────────────────────────────
const NEW_ARRIVALS = [
  { id: 1, img: "https://images.unsplash.com/photo-1594938298603-c8148c4b4a0c?w=400&q=80", name: "Crop Top",       price: "$29.99", tag: "New" },
  { id: 2, img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80", name: "Wide Leg Jeans", price: "$54.99", tag: "New" },
  { id: 3, img: "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=400&q=80", name: "Casual Jacket",   price: "$74.99", tag: "New" },
  { id: 4, img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80", name: "Striped Shirt",  price: "$39.99", tag: "New" },
  { id: 5, img: "https://images.unsplash.com/photo-1566206091558-7f218b696731?w=400&q=80", name: "Floral Dress",   price: "$64.99", tag: "New" },
  { id: 6, img: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&q=80", name: "Summer Dress",   price: "$49.99", tag: "New" },
  { id: 7, img: "https://images.unsplash.com/photo-1496217590455-aa63a8350eea?w=400&q=80", name: "Linen Blouse",   price: "$44.99", tag: "New" },
  { id: 8, img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80", name: "Mini Skirt",     price: "$34.99", tag: "New" },
];

const BEST_SELLERS = [
  { id: 1, img: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80", name: "Classic Trench", price: "$89.99",  tag: "Hot" },
  { id: 2, img: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80", name: "Sneaker Set",    price: "$119.99", tag: "Hot" },
  { id: 3, img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80", name: "Boho Dress",     price: "$59.99",  tag: "Hot" },
  { id: 4, img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80", name: "Denim Jacket",   price: "$79.99",  tag: "Hot" },
  { id: 5, img: "https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=400&q=80", name: "Silk Blouse",    price: "$55.99",  tag: "Hot" },
  { id: 6, img: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80", name: "Palazzo Pants",  price: "$48.99",  tag: "Hot" },
  { id: 7, img: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=400&q=80", name: "Wrap Dress",     price: "$67.99",  tag: "Hot" },
  { id: 8, img: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400&q=80", name: "Knit Sweater",   price: "$52.99",  tag: "Hot" },
];

// ── Slideshow Component ─────────────────────────────────────────
function Slideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((p) => (p + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((p) => (p - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent((p) => (p + 1) % SLIDES.length);

  return (
    <div className="home-slideshow">
      {SLIDES.map((s, i) => (
        <div key={i} className={`home-slide ${i === current ? "active" : ""}`}>
          <img src={s.img} alt={s.tag} className="home-slide-img" />
          <div className="home-slide-overlay">
            <p className="home-slide-tag">✦ {s.tag}</p>
            <h2 className="home-slide-title">{s.title}</h2>
            <p className="home-slide-sub">{s.sub}</p>
            <button className="home-slide-btn">Shop Now</button>
          </div>
        </div>
      ))}
      <button className="home-slide-arrow left" onClick={prev}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button className="home-slide-arrow right" onClick={next}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
      <div className="home-slide-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`home-dot ${i === current ? "active" : ""}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Product Row Component ───────────────────────────────────────
function ProductRow({ items }) {
  const rowRef = useRef(null);
  const scroll = (dir) => {
    rowRef.current.scrollBy({ left: dir * 440, behavior: "smooth" });
  };

  return (
    <div className="home-row-wrapper">
      <button className="home-row-arrow left" onClick={() => scroll(-1)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <div className="home-products-row" ref={rowRef}>
        {items.map((item) => (
          <div className="home-product-card" key={item.id}>
            <div className="home-product-img-wrap">
              <img src={item.img} alt={item.name} className="home-product-img" />
              <span className="home-product-badge">{item.tag}</span>
            </div>
            <div className="home-product-info">
              <div className="home-product-name">{item.name}</div>
              <div className="home-product-price">{item.price}</div>
              <div className="home-product-actions">
                <button className="home-btn-cart">Add to Cart</button>
                <button className="home-btn-wish">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="home-row-arrow right" onClick={() => scroll(1)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}

// ── Home Page ───────────────────────────────────────────────────
export default function Home() {
  const [activeTab, setActiveTab] = useState("New Arrivals");

  return (
    <div className="home-page">

      {/* Your existing Header — untouched */}
      <Header />

      <main className="home-main">

        {/* ── TAB BAR ── */}
        <div className="home-tab-bar">
          {NAV_TABS.map((tab) => (
            <div className="home-tab-item" key={tab.label}>
              <button
                className={`home-tab-btn ${activeTab === tab.label ? "home-tab-active" : ""}`}
                onClick={() => setActiveTab(tab.label)}
              >
                {tab.label}{tab.menu ? " ▾" : ""}
              </button>

              {/* First-level dropdown */}
              {tab.menu && (
                <div className="home-dropdown">
                  {tab.menu.map((item) => (
                    <div className="home-dropdown-item" key={item.label}>
                      {item.label}
                      {item.sub && <span className="home-dropdown-arrow">▶</span>}

                      {/* Second-level sub-dropdown */}
                      {item.sub && (
                        <div className="home-sub-dropdown">
                          {item.sub.map((subItem) => (
                            <div className="home-sub-item" key={subItem}>
                              {subItem}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── CONTENT AREA ── */}
        <div className="home-content-area">

          {/* SIDEBAR */}
          <aside className="home-sidebar">
            {SIDEBAR_LINKS.map((link, i) => (
              <button key={i} className="home-sidebar-btn">{link}</button>
            ))}
          </aside>

          {/* RIGHT SIDE */}
          <div className="home-right">

            {/* SLIDESHOW */}
            <div className="home-slideshow-area">
              <Slideshow />
            </div>

            {/* NEW ARRIVALS */}
            <div className="home-section">
              <div className="home-section-header">
                <h2 className="home-section-title">New <span>Arrivals</span></h2>
                <button className="home-see-all">See All →</button>
              </div>
              <ProductRow items={NEW_ARRIVALS} />
            </div>

            <div className="home-divider" />

            {/* BEST SELLERS */}
            <div className="home-section">
              <div className="home-section-header">
                <h2 className="home-section-title">Best <span>Sellers</span></h2>
                <button className="home-see-all">See All →</button>
              </div>
              <ProductRow items={BEST_SELLERS} />
            </div>

          </div>
        </div>
      </main>

      {/* Your existing Footer — untouched */}
      <Footer />

    </div>
  );
}
