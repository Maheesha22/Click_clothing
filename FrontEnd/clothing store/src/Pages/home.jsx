import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Home.css";

/* ---------------- MEN DROPDOWN ---------------- */

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

/* ---------------- TABS ---------------- */

const NAV_TABS = [
  { label: "New Arrivals" },
  { label: "Best Sellers" },
  { label: "Men", menu: MEN_MENU },
  { label: "Gifts" },
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

/* ---------------- SLIDESHOW ---------------- */

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
];

/* ---------------- PRODUCTS ---------------- */

const NEW_ARRIVALS = [
  { id: 1, img: "https://images.unsplash.com/photo-1594938298603-c8148c4b4a0c?w=400&q=80", name: "Crop Top", price: "$29.99", tag: "New" },
  { id: 2, img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80", name: "Wide Leg Jeans", price: "$54.99", tag: "New" },
];

const BEST_SELLERS = [
  { id: 1, img: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80", name: "Classic Trench", price: "$89.99", tag: "Hot" },
  { id: 2, img: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80", name: "Sneaker Set", price: "$119.99", tag: "Hot" },
];

/* ---------------- CATEGORY SLIDES ---------------- */

const CATEGORY_SLIDES = [
  {
    img: "/mens.jpg",
    label: "MEN'S COLLECTION",
    route: "/mens",
  },
  {
    img: "/gift.jpg",
    label: "GIFTS",
    route: "/gifts",
  },
  {
    img: "/men-accessories.jpg",
    label: "MEN'S ACCESSORIES",
    route: "/mens-accessories",
  },
];

/* ---------------- MAIN SLIDESHOW ---------------- */

function Slideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((p) => (p + 1) % SLIDES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="home-slideshow">
      {SLIDES.map((s, i) => (
        <div key={i} className={`home-slide ${i === current ? "active" : ""}`}>
          <img src={s.img} alt={s.tag} className="home-slide-img" />
        </div>
      ))}
    </div>
  );
}

/* ---------------- PRODUCT ROW ---------------- */

function ProductRow({ items }) {
  const rowRef = useRef(null);

  const scroll = (dir) => {
    rowRef.current.scrollBy({ left: dir * 400, behavior: "smooth" });
  };

  return (
    <div className="home-row-wrapper">

      <button className="home-row-arrow left" onClick={() => scroll(-1)}>‹</button>

      <div className="home-products-row" ref={rowRef}>
        {items.map((item) => (
          <div className="home-product-card" key={item.id}>
            <img src={item.img} alt={item.name} className="home-product-img" />
            <div className="home-product-info">
              <div className="home-product-name">{item.name}</div>
              <div className="home-product-price">{item.price}</div>
            </div>
          </div>
        ))}
      </div>

      <button className="home-row-arrow right" onClick={() => scroll(1)}>›</button>

    </div>
  );
}

/* ---------------- CATEGORY SLIDESHOW ---------------- */

function CategorySlideshow() {

  const [current, setCurrent] = useState(0);

  useEffect(() => {

    const timer = setInterval(() => {
      setCurrent((p) => (p + 1) % CATEGORY_SLIDES.length);
    }, 4000);

    return () => clearInterval(timer);

  }, []);

  const prev = () =>
    setCurrent((p) => (p - 1 + CATEGORY_SLIDES.length) % CATEGORY_SLIDES.length);

  const next = () =>
    setCurrent((p) => (p + 1) % CATEGORY_SLIDES.length);

  return (
    <div className="home-category-slider">

      {CATEGORY_SLIDES.map((slide, i) => (
        <div
          key={i}
          className={`home-category-slide ${i === current ? "active" : ""}`}
          onClick={() => (window.location.href = slide.route)}
        >
          <img src={slide.img} alt={slide.label} />

          <div className="home-category-overlay">
            <h2>{slide.label}</h2>
          </div>
        </div>
      ))}

      <button className="home-category-arrow left" onClick={prev}>‹</button>
      <button className="home-category-arrow right" onClick={next}>›</button>

    </div>
  );
}

/* ---------------- HOME PAGE ---------------- */

export default function Home() {

  const [activeTab, setActiveTab] = useState("New Arrivals");

  return (
    <div className="home-page">

      <Header />

      <main className="home-main">

        <div className="home-tab-bar">
          {NAV_TABS.map((tab) => (
            <button
              key={tab.label}
              className={`home-tab-btn ${activeTab === tab.label ? "home-tab-active" : ""}`}
              onClick={() => setActiveTab(tab.label)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="home-content-area">

          <aside className="home-sidebar">
            {SIDEBAR_LINKS.map((link, i) => (
              <button key={i} className="home-sidebar-btn">{link}</button>
            ))}
          </aside>

          <div className="home-right">

            <Slideshow />

            <div className="home-section">
              <h2>New Arrivals</h2>
              <ProductRow items={NEW_ARRIVALS} />
            </div>

            <div className="home-section">
              <h2>Best Sellers</h2>
              <ProductRow items={BEST_SELLERS} />
            </div>

          </div>

        </div>

        {/* CATEGORY SLIDESHOW */}
        <CategorySlideshow />

      </main>

      <Footer />

    </div>
  );
}