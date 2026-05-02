import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./shorts.css";
import WhatsAppButton from "../Components/whatsappbtn";

// ── Product Data ────────────────────────────────────────────────────────────────
const ALL_PRODUCTS = [
  {
    id: 1,
    name: "Classic Denim Shorts – Blue",
    basePrice: 2990,
    sizes: [28, 30, 32, 34, 36],
    inStock: true,
    colors: ["#1a3a5c", "#111111", "#2c4a7c"],
    colorNames: { "#1a3a5c": "Blue", "#111111": "Black", "#2c4a7c": "Dark Blue" },
    colorImages: {
      "#1a3a5c": [
        "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80",
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
      ],
      "#111111": [
        "https://images.unsplash.com/photo-1580266467769-e6a0e9ecf9e6?w=600&q=80",
      ],
      "#2c4a7c": [
        "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80",
    sku: "#CDS-001-BLU",
    material: "Denim",
    composition: "98% Cotton, 2% Spandex",
    modelInfo: 'Model Height 5\'11", wearing size 32',
    stockCount: 12,
    freeShippingThreshold: 8000,
  },
  {
    id: 2,
    name: "Chino Shorts – Khaki",
    basePrice: 2490,
    sizes: [30, 32, 34, 36, 38],
    inStock: true,
    colors: ["#c3b091", "#a8987a", "#8a7a5a"],
    colorNames: { "#c3b091": "Khaki", "#a8987a": "Tan", "#8a7a5a": "Brown" },
    colorImages: {
      "#c3b091": [
        "https://images.unsplash.com/photo-1580266467769-e6a0e9ecf9e6?w=600&q=80",
        "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=600&q=80",
      ],
      "#a8987a": [
        "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80",
      ],
      "#8a7a5a": [
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1580266467769-e6a0e9ecf9e6?w=600&q=80",
    sku: "#CHS-002-KHK",
    material: "Chino Cotton",
    composition: "100% Cotton",
    modelInfo: 'Model Height 6\'0", wearing size 34',
    stockCount: 8,
    freeShippingThreshold: 8000,
  },
  {
    id: 3,
    name: "Sports Shorts – Black",
    basePrice: 1890,
    sizes: [28, 30, 32, 34, 36, 38],
    inStock: true,
    colors: ["#111111", "#333333", "#555555"],
    colorNames: { "#111111": "Black", "#333333": "Dark Grey", "#555555": "Grey" },
    colorImages: {
      "#111111": [
        "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=600&q=80",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
      ],
      "#333333": [
        "https://images.unsplash.com/photo-1565693413579-29622f4b0dee?w=600&q=80",
      ],
      "#555555": [
        "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=600&q=80",
    sku: "#SPO-003-BLK",
    material: "Polyester Blend",
    composition: "90% Polyester, 10% Spandex",
    modelInfo: 'Model Height 5\'10", wearing size 32',
    stockCount: 25,
    freeShippingThreshold: 8000,
  },
  {
    id: 4,
    name: "Linen Casual Shorts – Beige",
    basePrice: 3290,
    sizes: [30, 32, 34, 36],
    inStock: false,
    colors: ["#f5f5dc", "#ece8dc", "#d4c5a9"],
    colorNames: { "#f5f5dc": "Beige", "#ece8dc": "Ecru", "#d4c5a9": "Sand" },
    colorImages: {
      "#f5f5dc": [
        "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80",
      ],
      "#ece8dc": [
        "https://images.unsplash.com/photo-1580266467769-e6a0e9ecf9e6?w=600&q=80",
      ],
      "#d4c5a9": [
        "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80",
    sku: "#LCS-004-BEI",
    material: "Linen",
    composition: "55% Linen, 45% Cotton",
    modelInfo: 'Model Height 5\'11", wearing size 34',
    stockCount: 0,
    freeShippingThreshold: 8000,
  },
  {
    id: 5,
    name: "Cargo Shorts – Olive",
    basePrice: 3590,
    sizes: [30, 32, 34, 36, 38],
    inStock: true,
    colors: ["#6b7a3e", "#5c6e3a", "#4a5e2e"],
    colorNames: { "#6b7a3e": "Olive", "#5c6e3a": "Dark Olive", "#4a5e2e": "Army" },
    colorImages: {
      "#6b7a3e": [
        "https://images.unsplash.com/photo-1565693413579-29622f4b0dee?w=600&q=80",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
      ],
      "#5c6e3a": [
        "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=600&q=80",
      ],
      "#4a5e2e": [
        "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1565693413579-29622f4b0dee?w=600&q=80",
    sku: "#CGO-005-OLV",
    material: "Cotton Blend",
    composition: "80% Cotton, 20% Polyester",
    modelInfo: 'Model Height 6\'0", wearing size 34',
    stockCount: 7,
    freeShippingThreshold: 8000,
  },
  {
    id: 6,
    name: "Swim Shorts – Navy",
    basePrice: 2190,
    sizes: [28, 30, 32, 34, 36],
    inStock: true,
    colors: ["#1a3a5c", "#008080", "#2e8b57"],
    colorNames: { "#1a3a5c": "Navy", "#008080": "Teal", "#2e8b57": "Seafoam" },
    colorImages: {
      "#1a3a5c": [
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
        "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=600&q=80",
      ],
      "#008080": [
        "https://images.unsplash.com/photo-1565693413579-29622f4b0dee?w=600&q=80",
      ],
      "#2e8b57": [
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
    sku: "#SWS-006-NAV",
    material: "Polyester",
    composition: "100% Polyester",
    modelInfo: 'Model Height 5\'10", wearing size 32',
    stockCount: 15,
    freeShippingThreshold: 8000,
  },
  {
    id: 7,
    name: "Denim Shorts – Light Wash",
    basePrice: 2790,
    sizes: [28, 30, 32, 34],
    inStock: true,
    colors: ["#5b7fa6", "#3b5998", "#7fa3c6"],
    colorNames: { "#5b7fa6": "Light Blue", "#3b5998": "Medium Blue", "#7fa3c6": "Faded" },
    colorImages: {
      "#5b7fa6": [
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
        "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=600&q=80",
      ],
      "#3b5998": [
        "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80",
      ],
      "#7fa3c6": [
        "https://images.unsplash.com/photo-1580266467769-e6a0e9ecf9e6?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
    sku: "#DLS-007-LBL",
    material: "Denim",
    composition: "100% Cotton",
    modelInfo: 'Model Height 5\'11", wearing size 32',
    stockCount: 6,
    freeShippingThreshold: 8000,
  },
  {
    id: 8,
    name: "Jogger Shorts – Grey",
    basePrice: 2390,
    sizes: [28, 30, 32, 34, 36, 38],
    inStock: true,
    colors: ["#808080", "#a9a9a9", "#696969"],
    colorNames: { "#808080": "Grey", "#a9a9a9": "Light Grey", "#696969": "Dark Grey" },
    colorImages: {
      "#808080": [
        "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=80",
        "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=600&q=80",
      ],
      "#a9a9a9": [
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
      ],
      "#696969": [
        "https://images.unsplash.com/photo-1565693413579-29622f4b0dee?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=80",
    sku: "#JGS-008-GRY",
    material: "Cotton Blend",
    composition: "60% Cotton, 40% Polyester",
    modelInfo: 'Model Height 5\'10", wearing size 32',
    stockCount: 18,
    freeShippingThreshold: 8000,
  },
];

const ALL_SIZES = [28, 30, 32, 34, 36, 38, 40];

// ── Helper Functions ────────────────────────────────────────────────────────────
const getReviews = (productId) => {
  const defaultReviews = {
    1: [
      { id: 1, name: "Dinesh P.", rating: 5, text: "Perfect fit! Great quality denim.", date: "Mar 2025", verified: true },
      { id: 2, name: "Nuwan K.", rating: 4, text: "Very comfortable for summer wear.", date: "Feb 2025", verified: true },
    ],
    2: [
      { id: 1, name: "Kasun F.", rating: 5, text: "Love the fabric and color.", date: "Apr 2025", verified: true },
    ],
  };
  if (defaultReviews[productId]) return defaultReviews[productId];
  return [{ id: 1, name: "Customer", rating: 4, text: "Nice product. Satisfied with the purchase.", date: "Feb 2025", verified: false }];
};

// ── Star Rating ────────────────────────────────────────────────────────────────
const StarRating = ({ rating, size = 14 }) => {
  return (
    <div className="st-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i <= rating ? "#c8982a" : "none"}
          stroke="#c8982a"
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
};

// ── Color Swatch Component ─────────────────────────────────────────────────────
const ColorSwatches = ({ colors, selectedColor, onSelect }) => (
  <div className="st-color-row">
    {colors.map((color) => (
      <button
        key={color}
        className={`st-color-swatch ${selectedColor === color ? "active" : ""}`}
        style={{
          backgroundColor: color,
          border: color === "#f5f5dc" || color === "#ece8dc" || color === "#ffffff" ? "1.5px solid #ccc" : "none",
        }}
        onClick={() => onSelect(color)}
        aria-label={`Select color ${color}`}
      />
    ))}
  </div>
);

// ── Reviews Modal Component ─────────────────────────────────────────────────────
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
    <div className="st-reviews-modal-overlay" onClick={onClose}>
      <div className="st-reviews-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="st-reviews-modal-close" onClick={onClose}>✕</button>
        
        <div className="st-reviews-header">
          <h2>Customer Reviews</h2>
          <div className="st-reviews-summary">
            <StarRating rating={Math.round(avgRating)} size={20} />
            <span className="st-reviews-total">{avgRating.toFixed(1)} out of 5 · {reviews.length} reviews</span>
          </div>
        </div>

        <div className="st-reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="st-review-item-full">
              <div className="st-review-header-full">
                <strong>{review.name}</strong>
                <StarRating rating={review.rating} size={14} />
                {review.verified && <span className="st-verified-badge">✓ Verified Purchase</span>}
              </div>
              <p className="st-review-text-full">{review.text}</p>
              <span className="st-review-date-full">{review.date}</span>
            </div>
          ))}
        </div>

        <button className="st-write-review-btn">Write a Review</button>
      </div>
    </div>
  );
};

// ── Product Card ───────────────────────────────────────────────────────────────
const ProductCard = ({ product, onToggleWishlist, isWished, onOpenModal }) => {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const images = product.colorImages?.[selectedColor] || [product.img];
  const currentImage = images[0];
  const reviews = getReviews(product.id);
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="st-product-card" onClick={() => onOpenModal(product)}>
      <div className="st-card-image">
        <img src={currentImage} alt={product.name} loading="lazy" />
        <button
          className={`st-wishlist-btn ${isWished ? "active" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
          aria-label="Add to wishlist"
        >
          {isWished ? "❤️" : "🤍"}
        </button>
        {!product.inStock && <span className="st-stock-badge out">Out of Stock</span>}
      </div>
      <div className="st-card-body">
        <h3 className="st-product-name">{product.name}</h3>
        <div className="st-card-rating">
          <StarRating rating={Math.round(avgRating)} size={12} />
          <span>({reviews.length})</span>
        </div>
        <p className="st-product-price">Rs {product.basePrice.toLocaleString()}.00</p>
        <div className="st-color-section">
          <span className="st-color-label">Colors:</span>
          <ColorSwatches colors={product.colors} selectedColor={selectedColor} onSelect={(c) => { setSelectedColor(c); }} />
        </div>
        <div className="st-size-row">
          {product.sizes.slice(0, 4).map((size) => (
            <span key={size} className="st-size-badge">{size}</span>
          ))}
          {product.sizes.length > 4 && <span className="st-size-more">+{product.sizes.length - 4}</span>}
        </div>
        <button className="st-add-to-cart" disabled={!product.inStock}>
          {product.inStock ? "Add to Cart" : "Unavailable"}
        </button>
      </div>
    </div>
  );
};

// ── Product Modal (Detailed View) ──────────────────────────────────────────────
const ProductModal = ({ product, onClose, onToggleWishlist, isWished }) => {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [sizeError, setSizeError] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const images = product.colorImages?.[selectedColor] || [product.img];
  const currentImage = images[activeImageIndex] || images[0];
  const reviews = getReviews(product.id);
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const colorName = product.colorNames?.[selectedColor] || selectedColor;

  const handleColorChange = (color) => {
    setSelectedColor(color);
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
    alert(`Added to cart: ${product.name} | Size: ${selectedSize} | Color: ${colorName} | Qty: ${quantity}`);
  };

  const handleBuyNow = () => {
    if (!selectedSize) { setSizeError(true); return; }
    setSizeError(false);
    alert(`Buying now: ${product.name} | Size: ${selectedSize} | Color: ${colorName} | Qty: ${quantity}`);
  };

  return (
    <>
      <div className="st-modal-overlay" onClick={onClose}>
        <div className="st-modal-container" onClick={(e) => e.stopPropagation()}>
          <button className="st-modal-close" onClick={onClose} aria-label="Close">✕</button>

          <div className="st-modal-grid">
            {/* LEFT: Image Gallery */}
            <div className="st-modal-gallery">
              <div className="st-modal-thumbnails">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`st-thumb-btn ${activeImageIndex === idx ? "active" : ""}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={img} alt={`${product.name} view ${idx + 1}`} />
                  </button>
                ))}
              </div>

              <div className="st-modal-main-image">
                <img src={currentImage} alt={product.name} />
                <button
                  className={`st-modal-wishlist-float ${isWished ? "active" : ""}`}
                  onClick={() => onToggleWishlist(product.id)}
                  aria-label="Toggle wishlist"
                >
                  {isWished ? "❤️" : "🤍"}
                </button>
                {images.length > 1 && (
                  <div className="st-image-nav">
                    <button
                      className="st-img-nav-btn"
                      onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                      disabled={activeImageIndex === 0}
                    >‹</button>
                    <span>{activeImageIndex + 1} / {images.length}</span>
                    <button
                      className="st-img-nav-btn"
                      onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                      disabled={activeImageIndex === images.length - 1}
                    >›</button>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Product Details */}
            <div className="st-modal-details">
              <h2 className="st-modal-title">{product.name}</h2>
              <p className="st-modal-sku">{product.sku}</p>

              <div className="st-modal-price-block">
                <span className="st-modal-price">Rs {product.basePrice.toLocaleString()}.00 <small>LKR</small></span>
                {product.basePrice >= 3000 && (
                  <span className="st-modal-installment">
                    or 3 × Rs {Math.round(product.basePrice / 3).toLocaleString()}.00 with <strong>Koko</strong>
                  </span>
                )}
              </div>

              {/* Rating with View Reviews Button */}
              <div className="st-modal-rating-row">
                <div className="st-rating-info">
                  <StarRating rating={Math.round(avgRating)} size={16} />
                  <span className="st-modal-rating-count">{avgRating.toFixed(1)} out of 5</span>
                </div>
                <button 
                  className="st-view-reviews-btn"
                  onClick={() => setShowReviews(true)}
                >
                  View Reviews ({reviews.length})
                </button>
              </div>

              {/* Size Selector */}
              <div className="st-modal-section">
                <div className="st-modal-section-header">
                  <label className="st-modal-label">
                    SIZE <span className="st-selected-val">{selectedSize || "—"}</span>
                  </label>
                  <button className="st-size-chart-btn">📏 SIZE CHART</button>
                </div>
                <div className="st-modal-size-grid">
                  {ALL_SIZES.map((size) => {
                    const avail = product.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        className={`st-modal-size-btn ${!avail ? "unavailable" : ""} ${selectedSize === size ? "selected" : ""}`}
                        onClick={() => { if (avail) { setSelectedSize(size); setSizeError(false); } }}
                        disabled={!avail}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                {sizeError && <p className="st-size-error">Please select a size before adding to cart.</p>}
              </div>

              {/* Color Selector */}
              <div className="st-modal-section">
                <label className="st-modal-label">
                  COLOR <span className="st-selected-val">{colorName.toUpperCase()}</span>
                </label>
                <div className="st-modal-color-row">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      className={`st-modal-color-thumb ${selectedColor === color ? "active" : ""}`}
                      onClick={() => handleColorChange(color)}
                      title={product.colorNames?.[color] || color}
                    >
                      <img
                        src={(product.colorImages?.[color] || [product.img])[0]}
                        alt={product.colorNames?.[color] || color}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity + Cart */}
              <div className="st-modal-actions">
                <div className="st-quantity-control">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="st-qty-btn">−</button>
                  <span className="st-qty-display">{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)} className="st-qty-btn">+</button>
                </div>
                <button className="st-modal-cart-btn" onClick={handleAddToCart} disabled={!product.inStock}>
                  {product.inStock ? "ADD TO CART" : "OUT OF STOCK"}
                </button>
              </div>

              <button className="st-modal-buy-now-btn" onClick={handleBuyNow} disabled={!product.inStock}>
                BUY IT NOW
              </button>

              {/* Stock & Shipping Info */}
              <div className="st-modal-info-badges">
                {product.inStock && product.stockCount <= 5 && (
                  <div className="st-info-badge warning">
                    <span>⏰</span> Only {product.stockCount} left in stock. Order soon.
                  </div>
                )}
                <div className="st-info-badge">
                  <span>✓</span> Free delivery and shipping above Rs {product.freeShippingThreshold?.toLocaleString()}
                </div>
                <div className="st-info-badge">
                  <span>✓</span> Secure online payment
                </div>
              </div>

              {/* Product Details */}
              <div className="st-modal-product-info">
                <ul>
                  <li><strong>Material:</strong> {product.material}</li>
                  <li><strong>Composition:</strong> {product.composition}</li>
                </ul>
                <p className="st-model-info">{product.modelInfo}</p>
                <p className="st-color-disclaimer">
                  Please bear in mind that the photo may be slightly different from the actual item in terms of color due to lighting conditions or the display used to view.
                </p>
              </div>

              <div className="st-modal-stock-indicator">
                <span className={product.inStock ? "st-in-stock" : "st-out-stock"}>
                  {product.inStock ? "✓ In Stock" : "✕ Out of Stock"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Modal */}
      {showReviews && (
        <ReviewsModal product={product} onClose={() => setShowReviews(false)} />
      )}
    </>
  );
};

// ── Main Shorts Page Component ─────────────────────────────────────────────────
const ShortsPage = () => {
  const [maxPrice, setMaxPrice] = useState(4000);
  const [wishlist, setWishlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [selectedSizeFilter, setSelectedSizeFilter] = useState(null);

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("shorts_wishlist")) || [];
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
    localStorage.setItem("shorts_wishlist", JSON.stringify(updated));
  };

  let filteredProducts = ALL_PRODUCTS.filter((product) => {
    const matchesPrice = product.basePrice <= maxPrice;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSize = selectedSizeFilter ? product.sizes.includes(selectedSizeFilter) : true;
    return matchesPrice && matchesSearch && matchesSize;
  });

  if (sortBy === "low-high") filteredProducts.sort((a, b) => a.basePrice - b.basePrice);
  else if (sortBy === "high-low") filteredProducts.sort((a, b) => b.basePrice - a.basePrice);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <div className="st-page">
      <Header />

      <section className="st-hero">
        <h1>Premium Shorts<br /><span>Summer Essential Collection</span></h1>
      </section>

      <div className="st-container">
        <aside className="st-filters">
          <h3>Filters</h3>

          <div className="st-filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="st-search-input"
            />
          </div>

          <div className="st-filter-group">
            <label>Max Price: Rs. {maxPrice.toLocaleString()}</label>
            <input
              type="range"
              min="1500"
              max="4000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="st-price-slider"
            />
          </div>

          <div className="st-filter-group">
            <label>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="st-sort-select">
              <option value="default">Default</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
          </div>

          <div className="st-filter-group">
            <label>Size</label>
            <div className="st-size-filters">
              {[28, 30, 32, 34, 36, 38, 40].map((size) => (
                <button
                  key={size}
                  className={`st-size-filter-btn ${selectedSizeFilter === size ? "active" : ""}`}
                  onClick={() => setSelectedSizeFilter(selectedSizeFilter === size ? null : size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="st-products-main">
          <div className="st-products-header">
            <h2>All Shorts</h2>
            <span>{filteredProducts.length} items found</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="st-no-results">No products found. Try adjusting the filters.</div>
          ) : (
            <>
              <div className="st-products-grid">
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
                <div className="st-load-more">
                  <button onClick={() => setVisibleCount((p) => p + 6)} className="st-load-btn">
                    Load More ({filteredProducts.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <Footer />

      <WhatsAppButton />

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onToggleWishlist={toggleWishlist}
          isWished={wishlist.includes(selectedProduct.id)}
        />
      )}
    </div>
  );
};

export default ShortsPage;
