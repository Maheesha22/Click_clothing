import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Trousers.css";
import WhatsAppButton from "../Components/whatsappbtn";

// ── Color Utility ────────────────────────────────────────────────────────────────
// Maps common color names (as stored in DB) to hex values for swatches
const COLOR_MAP = {
  black: "#111111",
  white: "#ffffff",
  "off-white": "#f5f5f0",
  grey: "#808080",
  gray: "#808080",
  charcoal: "#444444",
  navy: "#1a3a5c",
  blue: "#1a56db",
  beige: "#f5f5dc",
  brown: "#8b4513",
  olive: "#3d4a2e",
  red: "#dc3545",
  green: "#28a745",
  yellow: "#ffc107",
  orange: "#e67e22",
  pink: "#e91e8c",
  purple: "#6f42c1",
  cream: "#fffdd0",
  camel: "#c19a6b",
  khaki: "#c3b091",
  maroon: "#800000",
  teal: "#008080",
  coral: "#ff6b6b",
  indigo: "#4b0082",
  silver: "#c0c0c0",
  gold: "#c8982a",
  "light grey": "#bbbbbb",
  "light gray": "#bbbbbb",
  "dark grey": "#555555",
  "dark gray": "#555555",
  "jet black": "#111111",
  "sky blue": "#87ceeb",
  "royal blue": "#4169e1",
  "forest green": "#228b22",
  "burgundy": "#800020",
  "rust": "#b7410e",
};

/**
 * Parses the DB `color` field (comma-separated color names) into an array of
 * { name, hex } objects.  Falls back to using the raw string as a hex code if
 * it already starts with "#".
 */
const parseColors = (colorString) => {
  if (!colorString) return [];
  return colorString
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean)
    .map((name) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      hex: name.startsWith("#") ? name : COLOR_MAP[name] || "#cccccc",
    }));
};

/**
 * Parses the DB `size` field (comma-separated sizes) into an array of
 * strings / numbers.
 */
const parseSizes = (sizeString) => {
  if (!sizeString) return [];
  return sizeString
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (isNaN(s) ? s : Number(s)));
};

// ── Product Data ────────────────────────────────────────────────────────────────
// color and size fields now mirror the DB schema (comma-separated strings).
// colorImages is kept for multi-image support; falls back to `img` if absent.
const ALL_PRODUCTS = [
  {
    id: 1,
    name: "Slim Fit Casual Trouser",
    product_description: "A sleek slim fit trouser crafted for everyday comfort. Tailored with a modern silhouette that pairs effortlessly with any outfit.",
    price: 4500,
    size: "28,30,32,34,36",
    available: true,
    color: "Black,Grey",
    colorImages: {
      black: [
        "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=80",
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80",
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80",
      ],
      grey: [
        "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80",
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
      ],
    },
    image_url: "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=80",
    category: "Trousers",
    sku: "#SFC-28-BLK",
    material: "Cotton Blend",
    composition: "60% Cotton, 35% Polyester, 5% Spandex",
    modelInfo: 'Model Height 5\'11", wearing size 32',
    stockCount: 4,
    freeShippingThreshold: 8000,
  },
  {
    id: 2,
    name: "Classic Beige Trouser",
    product_description: "Timeless beige trousers in a relaxed fit. Perfect for smart-casual occasions with a premium linen blend fabric.",
    price: 5200,
    size: "30,32,34,38",
    available: true,
    color: "Beige,Brown",
    colorImages: {
      beige: [
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80",
      ],
      brown: [
        "https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=600&q=80",
      ],
    },
    image_url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
    category: "Trousers",
    sku: "#CBT-30-BEI",
    material: "Linen Blend",
    composition: "55% Linen, 40% Cotton, 5% Elastane",
    modelInfo: 'Model Height 6\'0", wearing size 32',
    stockCount: 8,
    freeShippingThreshold: 8000,
  },
  {
    id: 3,
    name: "Navy Blue Casual Trouser",
    product_description: "A deep navy casual trouser with a comfortable twill cotton construction. Versatile enough for the office or weekend.",
    price: 4800,
    size: "32,34,36",
    available: false,
    color: "Navy",
    colorImages: {
      navy: [
        "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=80",
      ],
    },
    image_url: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=80",
    category: "Trousers",
    sku: "#NBC-32-NAV",
    material: "Twill Cotton",
    composition: "98% Cotton, 2% Spandex",
    modelInfo: 'Model Height 5\'10", wearing size 32',
    stockCount: 0,
    freeShippingThreshold: 8000,
  },
  {
    id: 4,
    name: "Grey Comfort Trouser",
    product_description: "Ultra-soft jersey knit trouser with an elasticated waist for all-day comfort without sacrificing style.",
    price: 4000,
    size: "28,30,32,34,36",
    available: true,
    color: "Grey,Black",
    colorImages: {
      grey: [
        "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80",
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80",
      ],
      black: [
        "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=80",
      ],
    },
    image_url: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80",
    category: "Trousers",
    sku: "#GCT-28-GRY",
    material: "Jersey Knit",
    composition: "70% Cotton, 25% Polyester, 5% Elastane",
    modelInfo: 'Model Height 5\'11", wearing size 32',
    stockCount: 12,
    freeShippingThreshold: 8000,
  },
  {
    id: 5,
    name: "Tito Men's Chino Pant",
    product_description: "Classic chino pants with a clean finish. A wardrobe staple available in versatile neutral shades.",
    price: 2295,
    size: "28,30,32,34,36",
    available: true,
    color: "Off-White,Black,Navy",
    colorImages: {
      "off-white": [
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
      ],
      black: [
        "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80",
      ],
      navy: [
        "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=80",
      ],
    },
    image_url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
    category: "Trousers",
    sku: "#TMC-28-WHT",
    material: "Chino Cotton",
    composition: "98% Cotton, 2% Spandex",
    modelInfo: 'Model Height 5\'10", wearing size 32',
    stockCount: 6,
    freeShippingThreshold: 8000,
  },
  {
    id: 6,
    name: "Urban Cargo Trouser",
    product_description: "Street-ready cargo trouser with utility pockets and a relaxed silhouette. Built for the modern urbanite.",
    price: 3190,
    size: "30,32,34",
    available: true,
    color: "Olive,Black",
    colorImages: {
      olive: [
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80",
      ],
      black: [
        "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=80",
      ],
    },
    image_url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80",
    category: "Trousers",
    sku: "#UCT-30-OLV",
    material: "Ripstop Nylon",
    composition: "65% Nylon, 30% Cotton, 5% Spandex",
    modelInfo: 'Model Height 5\'11", wearing size 32',
    stockCount: 3,
    freeShippingThreshold: 8000,
  },
  {
    id: 7,
    name: "Stretch Slim Trouser – Black",
    product_description: "A precision-cut stretch denim trouser that moves with you. Ideal from morning meetings to evening outings.",
    price: 3100,
    size: "30,32,34,36",
    available: true,
    color: "Jet Black,Charcoal",
    colorImages: {
      "jet black": [
        "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=80",
        "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80",
      ],
      charcoal: [
        "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80",
      ],
    },
    image_url: "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=80",
    category: "Trousers",
    sku: "#SST-30-BLK",
    material: "Stretch Denim",
    composition: "68% Cotton, 28% Polyester, 4% Elastane",
    modelInfo: 'Model Height 6\'0", wearing size 32',
    stockCount: 9,
    freeShippingThreshold: 8000,
  },
  {
    id: 8,
    name: "Premium Wool Blend Trouser",
    product_description: "A sophisticated wool-blend trouser with a refined drape. The epitome of tailored elegance for the discerning gentleman.",
    price: 5490,
    size: "32,34,36,38",
    available: true,
    color: "Light Grey,Black,Navy",
    colorImages: {
      "light grey": [
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80",
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
      ],
      black: [
        "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80",
      ],
      navy: [
        "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=80",
      ],
    },
    image_url: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80",
    category: "Trousers",
    sku: "#PWB-32-GRY",
    material: "Wool Blend",
    composition: "50% Wool, 45% Polyester, 5% Elastane",
    modelInfo: 'Model Height 6\'0", wearing size 34',
    stockCount: 5,
    freeShippingThreshold: 8000,
  },
];

// ── Helper Functions ────────────────────────────────────────────────────────────
const getReviews = (productId) => {
  const defaultReviews = {
    1: [
      { id: 1, name: "Ashan P.", rating: 5, text: "Perfect fit and great quality!", date: "Mar 2025", verified: true },
      { id: 2, name: "Roshan K.", rating: 4, text: "Very comfortable, great for daily wear.", date: "Feb 2025", verified: true },
    ],
    2: [
      { id: 1, name: "Nuwan F.", rating: 4, text: "Love the color and fabric.", date: "Apr 2025", verified: true },
    ],
  };
  if (defaultReviews[productId]) return defaultReviews[productId];
  return [{ id: 1, name: "Customer", rating: 4, text: "Nice product. Satisfied with the purchase.", date: "Feb 2025", verified: false }];
};

// ── Star Rating ────────────────────────────────────────────────────────────────
const StarRating = ({ rating, size = 14, interactive = false, onRate }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="tr-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i <= (interactive ? hovered || rating : rating) ? "#c8982a" : "none"}
          stroke="#c8982a"
          strokeWidth="2"
          style={interactive ? { cursor: "pointer" } : {}}
          onMouseEnter={interactive ? () => setHovered(i) : undefined}
          onMouseLeave={interactive ? () => setHovered(0) : undefined}
          onClick={interactive && onRate ? () => onRate(i) : undefined}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
};

// ── Color Swatch Component (DB-driven) ─────────────────────────────────────────
const ColorSwatches = ({ colors, selectedColorName, onSelect }) => (
  <div className="tr-color-row">
    {colors.map(({ name, hex }) => {
      const isLight = hex === "#ffffff" || hex === "#f5f5f0" || hex === "#f5f5dc" || hex === "#fffdd0";
      return (
        <button
          key={name}
          className={`tr-color-swatch ${selectedColorName === name ? "active" : ""}`}
          style={{
            backgroundColor: hex,
            border: isLight ? "1.5px solid #ccc" : "none",
          }}
          onClick={() => onSelect(name)}
          aria-label={`Select color ${name}`}
          title={name}
        />
      );
    })}
  </div>
);

// ── Product Card ───────────────────────────────────────────────────────────────
const ProductCard = ({ product, onToggleWishlist, isWished, onOpenModal }) => {
  const colors = parseColors(product.color);
  const sizes = parseSizes(product.size);

  const [selectedColorName, setSelectedColorName] = useState(
    colors.length > 0 ? colors[0].name : ""
  );

  const getCardImage = () => {
    const key = selectedColorName.toLowerCase();
    if (product.colorImages?.[key]?.[0]) return product.colorImages[key][0];
    return product.image_url;
  };

  const reviews = getReviews(product.id);
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="tr-product-card" onClick={() => onOpenModal(product)}>
      <div className="tr-card-image">
        <img src={getCardImage()} alt={product.name} loading="lazy" />
        <button
          className={`tr-wishlist-btn ${isWished ? "active" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
          aria-label="Add to wishlist"
        >
          {isWished ? "❤️" : "🤍"}
        </button>
        {!product.available && <span className="tr-stock-badge out">Out of Stock</span>}
      </div>
      <div className="tr-card-body">
        <h3 className="tr-product-name">{product.name}</h3>
        <div className="tr-card-rating">
          <StarRating rating={Math.round(avgRating)} size={12} />
          <span>({reviews.length})</span>
        </div>
        <p className="tr-product-price">Rs {Number(product.price).toLocaleString()}.00</p>

        {/* Dynamic Color Swatches from DB */}
        {colors.length > 0 && (
          <div className="tr-color-section">
            <span className="tr-color-label">Colors:</span>
            <ColorSwatches
              colors={colors}
              selectedColorName={selectedColorName}
              onSelect={(name) => {
                setSelectedColorName(name);
              }}
            />
          </div>
        )}

        {/* Dynamic Size Badges from DB */}
        {sizes.length > 0 && (
          <div className="tr-size-row">
            {sizes.slice(0, 4).map((size) => (
              <span key={size} className="tr-size-badge">{size}</span>
            ))}
            {sizes.length > 4 && (
              <span className="tr-size-more">+{sizes.length - 4}</span>
            )}
          </div>
        )}

        <button className="tr-add-to-cart" disabled={!product.available}>
          {product.available ? "Add to Cart" : "Unavailable"}
        </button>
      </div>
    </div>
  );
};

// ── Reviews Modal ──────────────────────────────────────────────────────────────
const ReviewsModal = ({ product, onClose }) => {
  const reviews = getReviews(product.id);
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  return (
    <div className="tr-reviews-modal-overlay" onClick={onClose}>
      <div className="tr-reviews-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="tr-reviews-modal-close" onClick={onClose}>✕</button>
        <div className="tr-reviews-header">
          <h2>Customer Reviews</h2>
          <div className="tr-reviews-summary">
            <StarRating rating={Math.round(avgRating)} size={20} />
            <span className="tr-reviews-total">{avgRating.toFixed(1)} out of 5 · {reviews.length} reviews</span>
          </div>
        </div>
        <div className="tr-reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="tr-review-item-full">
              <div className="tr-review-header-full">
                <strong>{review.name}</strong>
                <StarRating rating={review.rating} size={14} />
                {review.verified && <span className="tr-verified-badge">✓ Verified Purchase</span>}
              </div>
              <p className="tr-review-text-full">{review.text}</p>
              <span className="tr-review-date-full">{review.date}</span>
            </div>
          ))}
        </div>
        <button className="tr-write-review-btn">Write a Review</button>
      </div>
    </div>
  );
};

// ── Product Modal ──────────────────────────────────────────────────────────────
const ProductModal = ({ product, onClose, onToggleWishlist, isWished }) => {
  // Parse colors and sizes from DB fields
  const colors = parseColors(product.color);
  const sizes = parseSizes(product.size);

  const [selectedColorName, setSelectedColorName] = useState(
    colors.length > 0 ? colors[0].name : ""
  );
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [sizeError, setSizeError] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const getImages = () => {
    const key = selectedColorName.toLowerCase();
    if (product.colorImages?.[key]) return product.colorImages[key];
    return [product.image_url];
  };

  const images = getImages();
  const currentImage = images[activeImageIndex] || images[0];

  const reviews = getReviews(product.id);
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const handleColorChange = (name) => {
    setSelectedColorName(name);
    setActiveImageIndex(0);
  };

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  const handleAddToCart = () => {
    if (!selectedSize) { setSizeError(true); return; }
    setSizeError(false);
    alert(`Added to cart: ${product.name} | Size: ${selectedSize} | Color: ${selectedColorName} | Qty: ${quantity}`);
  };

  const handleBuyNow = () => {
    if (!selectedSize) { setSizeError(true); return; }
    setSizeError(false);
    alert(`Buying now: ${product.name} | Size: ${selectedSize} | Color: ${selectedColorName} | Qty: ${quantity}`);
  };

  // Find hex for selected color to show a tinted indicator
  const selectedColorHex = colors.find(c => c.name === selectedColorName)?.hex || "#111111";

  return (
    <>
      <div className="tr-modal-overlay" onClick={onClose}>
        <div className="tr-modal-container" onClick={(e) => e.stopPropagation()}>
          <button className="tr-modal-close" onClick={onClose} aria-label="Close">✕</button>

          <div className="tr-modal-grid">
            {/* LEFT: Image Gallery */}
            <div className="tr-modal-gallery">
              <div className="tr-modal-thumbnails">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`tr-thumb-btn ${activeImageIndex === idx ? "active" : ""}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={img} alt={`${product.name} view ${idx + 1}`} />
                  </button>
                ))}
              </div>
              <div className="tr-modal-main-image">
                <img src={currentImage} alt={product.name} />
                <button
                  className={`tr-modal-wishlist-float ${isWished ? "active" : ""}`}
                  onClick={() => onToggleWishlist(product.id)}
                  aria-label="Toggle wishlist"
                >
                  {isWished ? "❤️" : "🤍"}
                </button>
                {images.length > 1 && (
                  <div className="tr-image-nav">
                    <button
                      className="tr-img-nav-btn"
                      onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                      disabled={activeImageIndex === 0}
                    >‹</button>
                    <span>{activeImageIndex + 1} / {images.length}</span>
                    <button
                      className="tr-img-nav-btn"
                      onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                      disabled={activeImageIndex === images.length - 1}
                    >›</button>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Product Details */}
            <div className="tr-modal-details">
              <h2 className="tr-modal-title">{product.name}</h2>
              <p className="tr-modal-sku">{product.sku || product.category}</p>

              {/* Description */}
              {product.product_description && (
                <p className="tr-modal-description">{product.product_description}</p>
              )}

              {/* Price */}
              <div className="tr-modal-price-block">
                <span className="tr-modal-price">Rs {Number(product.price).toLocaleString()}.00 <small>LKR</small></span>
                {product.price >= 3000 && (
                  <span className="tr-modal-installment">
                    or 3 × Rs {Math.round(product.price / 3).toLocaleString()}.00 with <strong>Koko</strong>
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="tr-modal-rating-row">
                <div className="tr-rating-info">
                  <StarRating rating={Math.round(avgRating)} size={16} />
                  <span className="tr-modal-rating-count">{avgRating.toFixed(1)} out of 5</span>
                </div>
                <button className="tr-view-reviews-btn" onClick={() => setShowReviews(true)}>
                  View Reviews ({reviews.length})
                </button>
              </div>

              {/* ── SIZE SELECTOR (DB-driven) ── */}
              {sizes.length > 0 && (
                <div className="tr-modal-section">
                  <div className="tr-modal-section-header">
                    <label className="tr-modal-label">
                      SIZE <span className="tr-selected-val">{selectedSize || "—"}</span>
                    </label>
                    <button className="tr-size-chart-btn">📏 SIZE CHART</button>
                  </div>
                  <div className="tr-modal-size-grid">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        className={`tr-modal-size-btn ${selectedSize === size ? "selected" : ""}`}
                        onClick={() => { setSelectedSize(size); setSizeError(false); }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {sizeError && <p className="tr-size-error">Please select a size before adding to cart.</p>}
                </div>
              )}

              {/* ── COLOR SELECTOR (DB-driven) ── */}
              {colors.length > 0 && (
                <div className="tr-modal-section">
                  <label className="tr-modal-label">
                    COLOR{" "}
                    <span className="tr-selected-val" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span
                        className="tr-selected-color-dot"
                        style={{ backgroundColor: selectedColorHex }}
                      />
                      {selectedColorName.toUpperCase()}
                    </span>
                  </label>

                  {/* Color pill buttons with swatch dot */}
                  <div className="tr-modal-color-pills">
                    {colors.map(({ name, hex }) => {
                      const isLight = hex === "#ffffff" || hex === "#f5f5f0" || hex === "#f5f5dc" || hex === "#fffdd0";
                      return (
                        <button
                          key={name}
                          className={`tr-modal-color-pill ${selectedColorName === name ? "active" : ""}`}
                          onClick={() => handleColorChange(name)}
                          title={name}
                        >
                          <span
                            className="tr-pill-dot"
                            style={{
                              backgroundColor: hex,
                              border: isLight ? "1px solid #ccc" : "none",
                            }}
                          />
                          <span className="tr-pill-label">{name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Color image thumbnails (if available) */}
                  {colors.some(({ name }) => product.colorImages?.[name.toLowerCase()]) && (
                    <div className="tr-modal-color-row">
                      {colors.map(({ name }) => {
                        const key = name.toLowerCase();
                        const thumb = product.colorImages?.[key]?.[0] || product.image_url;
                        return (
                          <button
                            key={name}
                            className={`tr-modal-color-thumb ${selectedColorName === name ? "active" : ""}`}
                            onClick={() => handleColorChange(name)}
                            title={name}
                          >
                            <img src={thumb} alt={name} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Quantity + Cart */}
              <div className="tr-modal-actions">
                <div className="tr-quantity-control">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="tr-qty-btn">−</button>
                  <span className="tr-qty-display">{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)} className="tr-qty-btn">+</button>
                </div>
                <button className="tr-modal-cart-btn" onClick={handleAddToCart} disabled={!product.available}>
                  {product.available ? "ADD TO CART" : "OUT OF STOCK"}
                </button>
              </div>

              <button className="tr-modal-buy-now-btn" onClick={handleBuyNow} disabled={!product.available}>
                BUY IT NOW
              </button>

              {/* Stock & Shipping */}
              <div className="tr-modal-info-badges">
                {product.available && product.stockCount <= 5 && (
                  <div className="tr-info-badge warning">
                    <span>⏰</span> Only {product.stockCount} left in stock. Order soon.
                  </div>
                )}
                <div className="tr-info-badge">
                  <span>✓</span> Free delivery and shipping above Rs {product.freeShippingThreshold?.toLocaleString()}
                </div>
                <div className="tr-info-badge">
                  <span>✓</span> Secure online payment
                </div>
              </div>

              {/* Product Details */}
              <div className="tr-modal-product-info">
                <ul>
                  {product.material && <li><strong>Material:</strong> {product.material}</li>}
                  {product.composition && <li><strong>Composition:</strong> {product.composition}</li>}
                </ul>
                {product.modelInfo && <p className="tr-model-info">{product.modelInfo}</p>}
                <p className="tr-color-disclaimer">
                  Please bear in mind that the photo may be slightly different from the actual item in terms of color due to lighting conditions or the display used to view.
                </p>
              </div>

              {/* Stock indicator */}
              <div className="tr-modal-stock-indicator">
                <span className={product.available ? "tr-in-stock" : "tr-out-stock"}>
                  {product.available ? "✓ In Stock" : "✕ Out of Stock"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReviews && (
        <ReviewsModal product={product} onClose={() => setShowReviews(false)} />
      )}
    </>
  );
};

// ── Main Trousers Page Component ───────────────────────────────────────────────
const TrousersPage = () => {
  const [maxPrice, setMaxPrice] = useState(6000);
  const [wishlist, setWishlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [selectedSizeFilter, setSelectedSizeFilter] = useState(null);

  // Collect all unique sizes across all products for the filter panel
  const allUniqueSizes = [...new Set(
    ALL_PRODUCTS.flatMap((p) => parseSizes(p.size))
  )].sort((a, b) => Number(a) - Number(b));

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("trouser_wishlist")) || [];
    setWishlist(savedWishlist);
  }, []);

  const toggleWishlist = (productId) => {
    let updated;
    if (wishlist.includes(productId)) {
      updated = wishlist.filter((id) => id !== productId);
    } else {
      updated = [...wishlist, productId];
    }
    setWishlist(updated);
    localStorage.setItem("trouser_wishlist", JSON.stringify(updated));
  };

  let filteredProducts = ALL_PRODUCTS.filter((product) => {
    const matchesPrice = Number(product.price) <= maxPrice;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const productSizes = parseSizes(product.size);
    const matchesSize = selectedSizeFilter ? productSizes.includes(selectedSizeFilter) : true;
    return matchesPrice && matchesSearch && matchesSize;
  });

  if (sortBy === "low-high") filteredProducts.sort((a, b) => a.price - b.price);
  else if (sortBy === "high-low") filteredProducts.sort((a, b) => b.price - a.price);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <div className="tr-page">
      <Header />

      <section className="tr-hero">
        <h1>Premium Trousers<br /><span>For the Modern Gentleman</span></h1>
      </section>

      <div className="tr-container">
        <aside className="tr-filters">
          <h3>Filters</h3>

          <div className="tr-filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="tr-search-input"
            />
          </div>

          <div className="tr-filter-group">
            <label>Max Price: Rs. {maxPrice.toLocaleString()}</label>
            <input
              type="range"
              min="2000"
              max="6000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="tr-price-slider"
            />
          </div>

          <div className="tr-filter-group">
            <label>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="tr-sort-select">
              <option value="default">Default</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
          </div>

          <div className="tr-filter-group">
            <label>Size</label>
            <div className="tr-size-filters">
              {allUniqueSizes.map((size) => (
                <button
                  key={size}
                  className={`tr-size-filter-btn ${selectedSizeFilter === size ? "active" : ""}`}
                  onClick={() => setSelectedSizeFilter(selectedSizeFilter === size ? null : size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="tr-products-main">
          <div className="tr-products-header">
            <h2>All Trousers</h2>
            <span>{filteredProducts.length} items found</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="tr-no-results">No products found. Try adjusting the filters.</div>
          ) : (
            <>
              <div className="tr-products-grid">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWished={wishlist.includes(product.id)}
                    onToggleWishlist={toggleWishlist}
                    onOpenModal={setSelectedProduct}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="tr-load-more">
                  <button onClick={() => setVisibleCount((p) => p + 6)} className="tr-load-btn">
                    Load More ({filteredProducts.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <Footer />

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onToggleWishlist={toggleWishlist}
          isWished={wishlist.includes(selectedProduct.id)}
        />
      )}
      <WhatsAppButton />
    </div>
  );
};

export default TrousersPage;
