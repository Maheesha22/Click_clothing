import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Home.css";
import { useNavigate } from "react-router-dom";

// ── Men sub-menu — ALL navigable items have page keys ────────────
const MEN_MENU = [
  { label: "Trousers",      page: "trousers" },
  { label: "Shirts",        page: "shirts"   },
  { label: "Formal Shirts", page: "formal-shirts"},
  { label: "T Shirts",      page: "tshirts"  },
  { label: "Shorts",        page: "shorts"   },
  { label: "Accessories", sub: ["Caps", "Perfume", "Deodorant"] },
];

// ── Top nav tabs ────────────────────────────────────────────────
const NAV_TABS = [
  { label: "New Arrivals" },
  { label: "Best Sellers" },
  { label: "Men", menu: MEN_MENU },
  { label: "Gifts" },
  { label: "Men Accessories" },
  { label: "Recently Viewed" },
  { label: "Search History" },
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

// ── Product Data — enhanced with multiple images per color ────────
const NEW_ARRIVALS = [
  { 
    id: 1, 
    name: "Crop Top",       
    price: "2,999.00", 
    colors: ["#111", "#f5f5dc", "#1a237e"],
    colorImages: {
      "#111": "/trousers/1.jpeg",
      "#f5f5dc": "/trousers/1-beige.jpg",
      "#1a237e": "/trousers/1-blue.jpg"
    },
    defaultImage: "/trousers/1.jpeg",
    description: "A stylish crop top made from premium cotton blend. Perfect for casual outings and summer days. Features a relaxed fit and breathable fabric.",
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "Tops"
  },
  { 
    id: 2, 
    name: "Wide Leg Jeans", 
    price: "5,499.00", 
    colors: ["#1a237e", "#f5f5dc", "#111"],
    colorImages: {
      "#1a237e": "/trousers/8.jpeg",
      "#f5f5dc": "/trousers/8-beige.jpg",
      "#111": "/trousers/8-black.jpg"
    },
    defaultImage: "/trousers/8.jpeg",
    description: "High-waisted wide leg jeans with a vintage wash. Made from durable denim with a comfortable stretch. Elevate your everyday look.",
    sizes: ["26", "28", "30", "32", "34"],
    category: "Bottoms"
  },
  { 
    id: 3, 
    name: "Casual Jacket",   
    price: "7,499.00", 
    colors: ["#b5651d", "#111", "#f5f5dc"],
    colorImages: {
      "#b5651d": "/trousers/3.jpeg",
      "#111": "/trousers/3-black.jpg",
      "#f5f5dc": "/trousers/3-beige.jpg"
    },
    defaultImage: "/trousers/3.jpeg",
    description: "Lightweight casual jacket with multiple pockets. Perfect for layering during transitional weather. Modern silhouette with classic details.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    category: "Outerwear"
  },
  { 
    id: 4, 
    name: "Striped Shirt",  
    price: "3,999.00", 
    colors: ["#e8c9a0", "#111", "#c2a87d"],
    colorImages: {
      "#e8c9a0": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80",
      "#111": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80",
      "#c2a87d": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80"
    },
    defaultImage: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80",
    description: "Classic striped button-down shirt. Soft cotton fabric with a relaxed fit. Versatile piece that works for both casual and semi-formal occasions.",
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "Shirts"
  },
];

const BEST_SELLERS = [
  { 
    id: 5, 
    name: "Classic Trench", 
    price: "8,999.00", 
    colors: ["#111", "#b5651d", "#f5f5dc"],
    colorImages: {
      "#111": "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80",
      "#b5651d": "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80",
      "#f5f5dc": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80"
    },
    defaultImage: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80",
    description: "Timeless trench coat in water-resistant fabric. Double-breasted design with belt. A wardrobe essential for rainy days and elevated style.",
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "Outerwear"
  },
  { 
    id: 6, 
    name: "Sneaker Set",    
    price: "11,999.00", 
    colors: ["#fff", "#111", "#e53935"],
    colorImages: {
      "#fff": "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80",
      "#111": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
      "#e53935": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80"
    },
    defaultImage: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80",
    description: "Premium leather sneakers with cushioned sole. Classic design that pairs with everything. Includes extra set of laces in contrasting color.",
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    category: "Footwear"
  },
  { 
    id: 7, 
    name: "Boho Dress",     
    price: "5,999.00", 
    colors: ["#f5f5dc", "#9c6b4e", "#111", "#e8c9a0"],
    colorImages: {
      "#f5f5dc": "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80",
      "#9c6b4e": "https://images.unsplash.com/photo-1515372039744-b9f0c4d4a9a8?w=400&q=80",
      "#111": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80",
      "#e8c9a0": "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80"
    },
    defaultImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80",
    description: "Flowing boho dress with embroidered details. Perfect for beach vacations and summer festivals. Lightweight and breathable fabric.",
    sizes: ["XS", "S", "M", "L"],
    category: "Dresses"
  },
  { 
    id: 8, 
    name: "Denim Jacket",   
    price: "7,999.00", 
    colors: ["#1a237e", "#111", "#f5f5dc", "#4a6741"],
    colorImages: {
      "#1a237e": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80",
      "#111": "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=400&q=80",
      "#f5f5dc": "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&q=80",
      "#4a6741": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&q=80"
    },
    defaultImage: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80",
    description: "Classic denim jacket with button closure. Medium wash with slight distressing. A timeless layering piece for any wardrobe.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    category: "Outerwear"
  },
];

// Combine all products for "You May Also Like" suggestions
const ALL_PRODUCTS = [...NEW_ARRIVALS, ...BEST_SELLERS];

// Function to get random suggested products (excluding a specific product if needed)
const getSuggestedProducts = (excludeProductId = null, count = 4) => {
  let availableProducts = [...ALL_PRODUCTS];
  if (excludeProductId) {
    availableProducts = availableProducts.filter(p => p.id !== excludeProductId);
  }
  const shuffled = [...availableProducts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// ── Product Popup Modal Component ──────────────────────────────
function ProductPopup({ product, onClose }) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(product.colorImages?.[product.colors?.[0]] || product.defaultImage || product.img);

  if (!product) return null;

  const handleColorChange = (color) => {
    setSelectedColor(color);
    const newImage = product.colorImages?.[color] || product.defaultImage || product.img;
    setCurrentImage(newImage);
  };

  const handleAddToCart = () => {
    alert(`Added ${quantity} x ${product.name} (${selectedColor} color, Size ${selectedSize}) to cart`);
    onClose();
  };

  return (
    <div className="home-popup-overlay" onClick={onClose}>
      <div className="home-popup-container" onClick={(e) => e.stopPropagation()}>
        <button className="home-popup-close" onClick={onClose}>×</button>
        
        <div className="home-popup-grid">
          <div className="home-popup-image">
            <img src={currentImage} alt={product.name} />
          </div>
          
          <div className="home-popup-details">
            <h2 className="home-popup-title">{product.name.toUpperCase()}</h2>
            <p className="home-popup-category">{product.category}</p>
            <div className="home-popup-price">Rs. {product.price}</div>
            
            <p className="home-popup-description">{product.description}</p>
            
            {product.colors && product.colors.length > 0 && (
              <div className="home-popup-colors">
                <label>Color</label>
                <div className="home-popup-color-swatches">
                  {product.colors.map((color, idx) => (
                    <button
                      key={idx}
                      className={`home-popup-swatch ${selectedColor === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                      aria-label={`Color ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {product.sizes && product.sizes.length > 0 && (
              <div className="home-popup-sizes">
                <label>Size</label>
                <div className="home-popup-size-buttons">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`home-popup-size ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="home-popup-quantity">
              <label>Quantity</label>
              <div className="home-popup-quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>
            
            <button className="home-popup-add-to-cart" onClick={handleAddToCart}>
              ADD TO CART — Rs. {(parseFloat(product.price.replace(/,/g, '')) * quantity).toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Slideshow ───────────────────────────────────────────────────
function Slideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % SLIDES.length), 4500);
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
          <button key={i} className={`home-dot ${i === current ? "active" : ""}`} onClick={() => setCurrent(i)} />
        ))}
      </div>
    </div>
  );
}

// ── Product Grid (flexible item count, with click handler and color change) ──────────
function ProductGrid({ items, onProductClick, maxItems = null, showColorSwatches = true }) {
  const [selectedColors, setSelectedColors] = useState({});
  const [productImages, setProductImages] = useState({});

  useEffect(() => {
    const initialImages = {};
    const initialColors = {};
    items.forEach(item => {
      initialImages[item.id] = item.colorImages?.[item.colors?.[0]] || item.defaultImage || item.img;
      initialColors[item.id] = item.colors?.[0] || null;
    });
    setProductImages(initialImages);
    setSelectedColors(initialColors);
  }, [items]);

  const handleColorChange = (itemId, color, e) => {
    e.stopPropagation();
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    setSelectedColors(prev => ({ ...prev, [itemId]: color }));
    const newImage = item.colorImages?.[color] || item.defaultImage || item.img;
    setProductImages(prev => ({ ...prev, [itemId]: newImage }));
  };

  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  return (
    <div className="home-products-grid">
      {displayItems.map((item) => (
        <div 
          className="home-product-card" 
          key={item.id}
          onClick={() => onProductClick({ ...item, img: productImages[item.id] })}
        >
          <div className="home-product-img-wrap">
            <img 
              src={productImages[item.id] || item.defaultImage || item.img} 
              alt={item.name} 
              className="home-product-img" 
            />
          </div>
          <div className="home-product-info">
            <div className="home-product-name">{item.name.toUpperCase()}</div>
            <div className="home-product-price">Rs. {item.price}</div>
            {showColorSwatches && item.colors && (
              <div className="home-product-swatches" onClick={(e) => e.stopPropagation()}>
                {item.colors.map((c, i) => (
                  <button
                    key={i}
                    className={`home-swatch${selectedColors[item.id] === c ? " active" : ""}`}
                    style={{ background: c }}
                    onClick={(e) => handleColorChange(item.id, c, e)}
                    aria-label={c}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Tab Bar ─────────────────────────────────────────────────────
function HomeTabBar({ activeTab, setActiveTab, navigate }) {
  return (
    <div className="home-tab-bar">
      {NAV_TABS.map((tab) => (
        <div className="home-tab-item" key={tab.label}>
          <button
            className={`home-tab-btn ${activeTab === tab.label ? "home-tab-active" : ""}`}
            onClick={() => setActiveTab(tab.label)}
          >
            {tab.label}{tab.menu ? " ▾" : ""}
          </button>

          {tab.menu && (
            <div className="home-dropdown">
              {tab.menu.map((item) => (
                <div
                  className={`home-dropdown-item${item.page ? " home-dropdown-nav" : ""}`}
                  key={item.label}
                  onClick={() => item.page && navigate(`/${item.page}`)}
                >
                  {item.label}
                  {item.sub && <span className="home-dropdown-arrow">▶</span>}
                  {item.sub && (
                    <div className="home-sub-dropdown">
                      {item.sub.map((subItem) => (
                        <div className="home-sub-item" key={subItem}>{subItem}</div>
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
  );
}

// ── WhatsApp Floating Button ────────────────────────────────────
function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/94XXXXXXXXX"
      target="_blank"
      rel="noopener noreferrer"
      className="home-whatsapp-btn"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.003 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.363.627 4.608 1.723 6.555L2.667 29.333l6.96-1.693A13.27 13.27 0 0 0 16.003 29.333C23.363 29.333 29.333 23.36 29.333 16S23.363 2.667 16.003 2.667zm0 2.4c5.96 0 10.93 4.973 10.93 10.933S21.963 26.933 16.003 26.933a10.9 10.9 0 0 1-5.547-1.52l-.4-.24-4.12 1.001.987-3.947-.267-.413a10.886 10.886 0 0 1-1.586-5.814c0-5.96 4.97-10.933 10.933-10.933zm-3.44 4.8c-.2 0-.533.08-.8.373-.267.293-1.04 1.013-1.04 2.48s1.067 2.88 1.213 3.08c.147.2 2.08 3.187 5.04 4.347 2.493.96 3 .76 3.547.72.547-.04 1.76-.72 2.013-1.413.253-.693.253-1.293.173-1.413-.08-.12-.293-.2-.613-.36-.32-.16-1.787-.88-2.067-.987-.28-.107-.48-.16-.693.16-.213.32-.827 1-.987 1.2-.16.2-.32.213-.627.053-.307-.16-1.28-.467-2.44-1.493-.907-.8-1.52-1.787-1.68-2.093-.16-.307-.013-.467.12-.613.12-.133.307-.347.453-.52.147-.173.2-.293.293-.493.093-.2.053-.387-.013-.547-.067-.16-.667-1.64-.92-2.24-.24-.587-.48-.507-.667-.52-.173-.013-.373-.013-.573-.013z"/>
      </svg>
    </a>
  );
}

// ── You May Also Like Component ─────────────────────────────────
function YouMayAlsoLike({ onProductClick, excludeProductId = null }) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    setSuggestions(getSuggestedProducts(excludeProductId, 4));
  }, [excludeProductId]);

  return (
    <div className="home-section home-you-may-like-section">
      <div className="home-section-header">
        <h2 className="home-section-title">YOU MAY ALSO LIKE</h2>
        <div className="home-section-controls">
          <button className="home-see-all">VIEW ALL</button>
          <button className="home-nav-arrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button className="home-nav-arrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>
      <ProductGrid 
        items={suggestions} 
        onProductClick={onProductClick} 
        maxItems={4}
        showColorSwatches={true}
      />
    </div>
  );
}

// ── Home Page ───────────────────────────────────────────────────
export default function Home() {
  const [activeTab, setActiveTab] = useState("New Arrivals");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [youMayAlsoLikeKey, setYouMayAlsoLikeKey] = useState(0);
  const navigate = useNavigate();

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setYouMayAlsoLikeKey(prev => prev + 1);
  };

  const handleClosePopup = () => {
    setSelectedProduct(null);
  };

  const getProductsForTab = () => {
    switch (activeTab) {
      case "New Arrivals":
        return NEW_ARRIVALS;
      case "Best Sellers":
        return BEST_SELLERS;
      default:
        return NEW_ARRIVALS;
    }
  };

  const currentProducts = getProductsForTab();
  const currentProductId = selectedProduct?.id || null;

  return (
    <div className="home-page">
      <Header />

      <main className="home-main">
        <HomeTabBar activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} />

        <div className="home-content-area">
          <div className="home-right">
            <div className="home-slideshow-area">
              <Slideshow />
            </div>

            {/* New Arrivals / Best Sellers Section */}
            <div className="home-section">
              <div className="home-section-header">
                <h2 className="home-section-title">{activeTab.toUpperCase()}</h2>
                <div className="home-section-controls">
                  <button className="home-see-all">EXPLORE ALL</button>
                  <button className="home-nav-arrow">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                  </button>
                  <button className="home-nav-arrow">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                </div>
              </div>
              <ProductGrid 
                items={currentProducts} 
                onProductClick={handleProductClick} 
                maxItems={4}
              />
            </div>

            {/* You May Also Like Section */}
            <YouMayAlsoLike 
              key={youMayAlsoLikeKey}
              onProductClick={handleProductClick}
              excludeProductId={currentProductId}
            />
          </div>
        </div>
      </main>

      <div className="home-shop-category">
        <p className="home-shop-category-label">Shopping By Category</p>

        <div className="home-cat-top-row">
          <div className="home-cat-card home-cat-mens" onClick={() => navigate("/sarong")}>
            <img src="/mens.jpg" alt="Mens" className="home-cat-img" />
            <div className="home-cat-overlay" />
            <div className="home-cat-label-wrap">
              <span className="home-cat-text home-cat-text-white">MENS</span>
            </div>
          </div>
          <div className="home-cat-card home-cat-gifts" onClick={() => navigate("/gifts")}>
            <img
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=85"
              alt="Gifts"
              className="home-cat-img"
            />
            <div className="home-cat-overlay" />
            <div className="home-cat-label-wrap">
              <span className="home-cat-text home-cat-text-white">GIFTS</span>
            </div>
          </div>
        </div>

        <div className="home-cat-bottom-row" onClick={() => navigate("/mens-accessories")}>
          <div className="home-cat-bottom-img-wrap">
            <img src="/men-accessories.jpg" alt="Men Accessories 1" className="home-cat-img" />
          </div>
          <div className="home-cat-bottom-img-wrap">
            <img src="/acc1.jpg" alt="Men Accessories 2" className="home-cat-img" />
          </div>
          <div className="home-cat-bottom-img-wrap">
            <img src="/menacc2.jpg" alt="Men Accessories 3" className="home-cat-img" />
          </div>
          <div className="home-cat-bottom-overlay" />
          <div className="home-cat-bottom-label">
            <span className="home-cat-text home-cat-text-dark">MEN'S</span>
            <span className="home-cat-text home-cat-text-accent">ACCESSORIES</span>
          </div>
        </div>
      </div>

      <Footer />

      <WhatsAppButton />

      {selectedProduct && (
        <ProductPopup product={selectedProduct} onClose={handleClosePopup} />
      )}
    </div>
  );
}
