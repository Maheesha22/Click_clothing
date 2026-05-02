import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/whatsappbtn";
import "./Shirts.css";

// ── Product Data ────────────────────────────────────────────────────────────────
const ALL_PRODUCTS = [
  {
    id: 1,
    name: "Classic Oxford Shirt – White",
    basePrice: 2495,
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    colors: ["#ffffff", "#d4c5a9", "#1a3a5c"],
    colorNames: { "#ffffff": "White", "#d4c5a9": "Beige", "#1a3a5c": "Navy" },
    colorImages: {
      "#ffffff": [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80",
      ],
      "#d4c5a9": [
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80",
      ],
      "#1a3a5c": [
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
    sku: "#COX-001-WHT",
    material: "Oxford Cotton",
    composition: "100% Cotton",
    modelInfo: 'Model Height 5\'11", wearing size M',
    stockCount: 15,
    freeShippingThreshold: 8000,
  },
  {
    id: 2,
    name: "Slim Fit Formal Shirt – Sky Blue",
    basePrice: 2890,
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    colors: ["#87ceeb", "#ffffff", "#c4e0f3"],
    colorNames: { "#87ceeb": "Sky Blue", "#ffffff": "White", "#c4e0f3": "Powder Blue" },
    colorImages: {
      "#87ceeb": [
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
      ],
      "#ffffff": [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
      ],
      "#c4e0f3": [
        "https://images.unsplash.com/photo-1512327536842-5aa37d1ba3e3?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
    sku: "#SFF-002-SBL",
    material: "Cotton Blend",
    composition: "60% Cotton, 40% Polyester",
    modelInfo: 'Model Height 6\'0", wearing size L',
    stockCount: 8,
    freeShippingThreshold: 8000,
  },
  {
    id: 3,
    name: "Linen Relaxed Shirt – Ecru",
    basePrice: 3290,
    sizes: ["M", "L", "XL", "XXL"],
    inStock: true,
    colors: ["#ece8dc", "#d4c5a9", "#c4a882"],
    colorNames: { "#ece8dc": "Ecru", "#d4c5a9": "Beige", "#c4a882": "Sand" },
    colorImages: {
      "#ece8dc": [
        "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=80",
      ],
      "#d4c5a9": [
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80",
      ],
      "#c4a882": [
        "https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=80",
    sku: "#LRS-003-ECR",
    material: "Pure Linen",
    composition: "100% Linen",
    modelInfo: 'Model Height 5\'10", wearing size L',
    stockCount: 12,
    freeShippingThreshold: 8000,
  },
  {
    id: 4,
    name: "Plaid Flannel Shirt – Forest",
    basePrice: 3490,
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: false,
    colors: ["#2e5e3e", "#6b3a2a", "#1a3a5c"],
    colorNames: { "#2e5e3e": "Forest Green", "#6b3a2a": "Rust", "#1a3a5c": "Navy" },
    colorImages: {
      "#2e5e3e": [
        "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600&q=80",
      ],
      "#6b3a2a": [
        "https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=600&q=80",
      ],
      "#1a3a5c": [
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600&q=80",
    sku: "#PFS-004-FOR",
    material: "Cotton Flannel",
    composition: "100% Cotton",
    modelInfo: 'Model Height 5\'11", wearing size M',
    stockCount: 0,
    freeShippingThreshold: 8000,
  },
  {
    id: 5,
    name: "Classic Denim Shirt – Indigo",
    basePrice: 3990,
    sizes: ["S", "M", "L", "XL", "XXL", "XXXL"],
    inStock: true,
    colors: ["#3b5998", "#1a1a2e", "#5b7fa6"],
    colorNames: { "#3b5998": "Indigo", "#1a1a2e": "Dark Navy", "#5b7fa6": "Light Denim" },
    colorImages: {
      "#3b5998": [
        "https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=600&q=80",
      ],
      "#1a1a2e": [
        "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80",
      ],
      "#5b7fa6": [
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=600&q=80",
    sku: "#CDS-005-IND",
    material: "Denim",
    composition: "98% Cotton, 2% Spandex",
    modelInfo: 'Model Height 6\'0", wearing size L',
    stockCount: 7,
    freeShippingThreshold: 8000,
  },
  {
    id: 6,
    name: "Casual Polo Shirt – Olive",
    basePrice: 2190,
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    colors: ["#6b7a3e", "#1a1a1a", "#8b3a2a"],
    colorNames: { "#6b7a3e": "Olive", "#1a1a1a": "Black", "#8b3a2a": "Burgundy" },
    colorImages: {
      "#6b7a3e": [
        "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&q=80",
      ],
      "#1a1a1a": [
        "https://images.unsplash.com/photo-1630329374405-28f8a96fbc74?w=600&q=80",
      ],
      "#8b3a2a": [
        "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&q=80",
    sku: "#CPS-006-OLV",
    material: "Pique Cotton",
    composition: "100% Cotton",
    modelInfo: 'Model Height 5\'10", wearing size M',
    stockCount: 20,
    freeShippingThreshold: 8000,
  },
  {
    id: 7,
    name: "Mandarin Collar Shirt – Black",
    basePrice: 3190,
    sizes: ["M", "L", "XL", "XXL"],
    inStock: true,
    colors: ["#111111", "#333333", "#555555"],
    colorNames: { "#111111": "Black", "#333333": "Charcoal", "#555555": "Grey" },
    colorImages: {
      "#111111": [
        "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80",
      ],
      "#333333": [
        "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80",
      ],
      "#555555": [
        "https://images.unsplash.com/photo-1630329374405-28f8a96fbc74?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80",
    sku: "#MCS-007-BLK",
    material: "Cotton Blend",
    composition: "65% Cotton, 35% Polyester",
    modelInfo: 'Model Height 6\'1", wearing size L',
    stockCount: 5,
    freeShippingThreshold: 8000,
  },
  {
    id: 8,
    name: "Premium Twill Shirt – Navy",
    basePrice: 4490,
    sizes: ["S", "M", "L", "XL", "XXL", "XXXL"],
    inStock: true,
    colors: ["#1a3a5c", "#111111", "#2c4a7c"],
    colorNames: { "#1a3a5c": "Navy", "#111111": "Black", "#2c4a7c": "Royal Blue" },
    colorImages: {
      "#1a3a5c": [
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80",
      ],
      "#111111": [
        "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80",
      ],
      "#2c4a7c": [
        "https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80",
    sku: "#PTS-008-NAV",
    material: "Twill Cotton",
    composition: "100% Cotton",
    modelInfo: 'Model Height 6\'0", wearing size XL',
    stockCount: 4,
    freeShippingThreshold: 8000,
  },
];

const ALL_SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"];

// ── Helper Functions ────────────────────────────────────────────────────────────
const getReviews = (productId) => {
  const defaultReviews = {
    1: [
      { id: 1, name: "Dinesh P.", rating: 5, text: "Excellent quality! Perfect fit.", date: "Mar 2025", verified: true },
      { id: 2, name: "Nuwan K.", rating: 4, text: "Very comfortable fabric.", date: "Feb 2025", verified: true },
    ],
    2: [
      { id: 1, name: "Kasun F.", rating: 5, text: "Love the color and feel.", date: "Apr 2025", verified: true },
    ],
  };
  if (defaultReviews[productId]) return defaultReviews[productId];
  return [{ id: 1, name: "Customer", rating: 4, text: "Nice product. Satisfied with the purchase.", date: "Feb 2025", verified: false }];
};

// ── Star Rating ────────────────────────────────────────────────────────────────
const StarRating = ({ rating, size = 14 }) => {
  return (
    <div className="sh-stars">
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
  <div className="sh-color-row">
    {colors.map((color) => (
      <button
        key={color}
        className={`sh-color-swatch ${selectedColor === color ? "active" : ""}`}
        style={{
          backgroundColor: color,
          border: color === "#ffffff" || color === "#f5f5f0" ? "1.5px solid #ccc" : "none",
        }}
        onClick={() => onSelect(color)}
        aria-label={`Select color ${color}`}
      />
    ))}
  </div>
);

// ── Product Card ───────────────────────────────────────────────────────────────
const ProductCard = ({ product, onToggleWishlist, isWished, onOpenModal }) => {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const images = product.colorImages?.[selectedColor] || [product.img];
  const currentImage = images[0];
  const reviews = getReviews(product.id);
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="sh-product-card" onClick={() => onOpenModal(product)}>
      <div className="sh-card-image">
        <img src={currentImage} alt={product.name} loading="lazy" />
        <button
          className={`sh-wishlist-btn ${isWished ? "active" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
          aria-label="Add to wishlist"
        >
          {isWished ? "❤️" : "🤍"}
        </button>
        {!product.inStock && <span className="sh-stock-badge out">Out of Stock</span>}
      </div>
      <div className="sh-card-body">
        <h3 className="sh-product-name">{product.name}</h3>
        <div className="sh-card-rating">
          <StarRating rating={Math.round(avgRating)} size={12} />
          <span>({reviews.length})</span>
        </div>
        <p className="sh-product-price">Rs {product.basePrice.toLocaleString()}.00</p>
        <div className="sh-color-section">
          <span className="sh-color-label">Colors:</span>
          <ColorSwatches colors={product.colors} selectedColor={selectedColor} onSelect={(c) => { setSelectedColor(c); }} />
        </div>
        <div className="sh-size-row">
          {product.sizes.slice(0, 4).map((size) => (
            <span key={size} className="sh-size-badge">{size}</span>
          ))}
          {product.sizes.length > 4 && <span className="sh-size-more">+{product.sizes.length - 4}</span>}
        </div>
        <button className="sh-add-to-cart" disabled={!product.inStock}>
          {product.inStock ? "Add to Cart" : "Unavailable"}
        </button>
      </div>
    </div>
  );
};

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
    <div className="sh-reviews-modal-overlay" onClick={onClose}>
      <div className="sh-reviews-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="sh-reviews-modal-close" onClick={onClose}>✕</button>
        
        <div className="sh-reviews-header">
          <h2>Customer Reviews</h2>
          <div className="sh-reviews-summary">
            <StarRating rating={Math.round(avgRating)} size={20} />
            <span className="sh-reviews-total">{avgRating.toFixed(1)} out of 5 · {reviews.length} reviews</span>
          </div>
        </div>

        <div className="sh-reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="sh-review-item-full">
              <div className="sh-review-header-full">
                <strong>{review.name}</strong>
                <StarRating rating={review.rating} size={14} />
                {review.verified && <span className="sh-verified-badge">✓ Verified Purchase</span>}
              </div>
              <p className="sh-review-text-full">{review.text}</p>
              <span className="sh-review-date-full">{review.date}</span>
            </div>
          ))}
        </div>

        <button className="sh-write-review-btn">Write a Review</button>
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
      <div className="sh-modal-overlay" onClick={onClose}>
        <div className="sh-modal-container" onClick={(e) => e.stopPropagation()}>
          <button className="sh-modal-close" onClick={onClose} aria-label="Close">✕</button>

          <div className="sh-modal-grid">
            {/* LEFT: Image Gallery */}
            <div className="sh-modal-gallery">
              <div className="sh-modal-thumbnails">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`sh-thumb-btn ${activeImageIndex === idx ? "active" : ""}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={img} alt={`${product.name} view ${idx + 1}`} />
                  </button>
                ))}
              </div>

              <div className="sh-modal-main-image">
                <img src={currentImage} alt={product.name} />
                <button
                  className={`sh-modal-wishlist-float ${isWished ? "active" : ""}`}
                  onClick={() => onToggleWishlist(product.id)}
                  aria-label="Toggle wishlist"
                >
                  {isWished ? "❤️" : "🤍"}
                </button>
                {images.length > 1 && (
                  <div className="sh-image-nav">
                    <button
                      className="sh-img-nav-btn"
                      onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                      disabled={activeImageIndex === 0}
                    >‹</button>
                    <span>{activeImageIndex + 1} / {images.length}</span>
                    <button
                      className="sh-img-nav-btn"
                      onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                      disabled={activeImageIndex === images.length - 1}
                    >›</button>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Product Details */}
            <div className="sh-modal-details">
              <h2 className="sh-modal-title">{product.name}</h2>
              <p className="sh-modal-sku">{product.sku}</p>

              <div className="sh-modal-price-block">
                <span className="sh-modal-price">Rs {product.basePrice.toLocaleString()}.00 <small>LKR</small></span>
                {product.basePrice >= 3000 && (
                  <span className="sh-modal-installment">
                    or 3 × Rs {Math.round(product.basePrice / 3).toLocaleString()}.00 with <strong>Koko</strong>
                  </span>
                )}
              </div>

              {/* Rating with View Reviews Button */}
              <div className="sh-modal-rating-row">
                <div className="sh-rating-info">
                  <StarRating rating={Math.round(avgRating)} size={16} />
                  <span className="sh-modal-rating-count">{avgRating.toFixed(1)} out of 5</span>
                </div>
                <button 
                  className="sh-view-reviews-btn"
                  onClick={() => setShowReviews(true)}
                >
                  View Reviews ({reviews.length})
                </button>
              </div>

              {/* Size Selector */}
              <div className="sh-modal-section">
                <div className="sh-modal-section-header">
                  <label className="sh-modal-label">
                    SIZE <span className="sh-selected-val">{selectedSize || "—"}</span>
                  </label>
                  <button className="sh-size-chart-btn">📏 SIZE CHART</button>
                </div>
                <div className="sh-modal-size-grid">
                  {ALL_SIZES.map((size) => {
                    const avail = product.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        className={`sh-modal-size-btn ${!avail ? "unavailable" : ""} ${selectedSize === size ? "selected" : ""}`}
                        onClick={() => { if (avail) { setSelectedSize(size); setSizeError(false); } }}
                        disabled={!avail}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                {sizeError && <p className="sh-size-error">Please select a size before adding to cart.</p>}
              </div>

              {/* Color Selector */}
              <div className="sh-modal-section">
                <label className="sh-modal-label">
                  COLOR <span className="sh-selected-val">{colorName.toUpperCase()}</span>
                </label>
                <div className="sh-modal-color-row">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      className={`sh-modal-color-thumb ${selectedColor === color ? "active" : ""}`}
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
              <div className="sh-modal-actions">
                <div className="sh-quantity-control">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="sh-qty-btn">−</button>
                  <span className="sh-qty-display">{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)} className="sh-qty-btn">+</button>
                </div>
                <button className="sh-modal-cart-btn" onClick={handleAddToCart} disabled={!product.inStock}>
                  {product.inStock ? "ADD TO CART" : "OUT OF STOCK"}
                </button>
              </div>

              <button className="sh-modal-buy-now-btn" onClick={handleBuyNow} disabled={!product.inStock}>
                BUY IT NOW
              </button>

              {/* Stock & Shipping Info */}
              <div className="sh-modal-info-badges">
                {product.inStock && product.stockCount <= 5 && (
                  <div className="sh-info-badge warning">
                    <span>⏰</span> Only {product.stockCount} left in stock. Order soon.
                  </div>
                )}
                <div className="sh-info-badge">
                  <span>✓</span> Free delivery and shipping above Rs {product.freeShippingThreshold?.toLocaleString()}
                </div>
                <div className="sh-info-badge">
                  <span>✓</span> Secure online payment
                </div>
              </div>

              {/* Product Details */}
              <div className="sh-modal-product-info">
                <ul>
                  <li><strong>Material:</strong> {product.material}</li>
                  <li><strong>Composition:</strong> {product.composition}</li>
                </ul>
                <p className="sh-model-info">{product.modelInfo}</p>
                <p className="sh-color-disclaimer">
                  Please bear in mind that the photo may be slightly different from the actual item in terms of color due to lighting conditions or the display used to view.
                </p>
              </div>

              <div className="sh-modal-stock-indicator">
                <span className={product.inStock ? "sh-in-stock" : "sh-out-stock"}>
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

// ── Main Shirts Page Component ─────────────────────────────────────────────────
const ShirtsPage = () => {
  const [maxPrice, setMaxPrice] = useState(5000);
  const [wishlist, setWishlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [selectedSizeFilter, setSelectedSizeFilter] = useState(null);

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("shirt_wishlist")) || [];
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
    localStorage.setItem("shirt_wishlist", JSON.stringify(updated));
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
    <div className="sh-page">
      <Header />

      <section className="sh-hero">
        <h1>Premium Shirts<br /><span>For Every Occasion</span></h1>
      </section>

      <div className="sh-container">
        <aside className="sh-filters">
          <h3>Filters</h3>

          <div className="sh-filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sh-search-input"
            />
          </div>

          <div className="sh-filter-group">
            <label>Max Price: Rs. {maxPrice.toLocaleString()}</label>
            <input
              type="range"
              min="2000"
              max="5000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="sh-price-slider"
            />
          </div>

          <div className="sh-filter-group">
            <label>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sh-sort-select">
              <option value="default">Default</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
          </div>

          <div className="sh-filter-group">
            <label>Size</label>
            <div className="sh-size-filters">
              {["S", "M", "L", "XL", "XXL", "XXXL"].map((size) => (
                <button
                  key={size}
                  className={`sh-size-filter-btn ${selectedSizeFilter === size ? "active" : ""}`}
                  onClick={() => setSelectedSizeFilter(selectedSizeFilter === size ? null : size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="sh-products-main">
          <div className="sh-products-header">
            <h2>All Shirts</h2>
            <span>{filteredProducts.length} items found</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="sh-no-results">No products found. Try adjusting the filters.</div>
          ) : (
            <>
              <div className="sh-products-grid">
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
                <div className="sh-load-more">
                  <button onClick={() => setVisibleCount((p) => p + 6)} className="sh-load-btn">
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

export default ShirtsPage;
