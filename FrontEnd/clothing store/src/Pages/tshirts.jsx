
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./tshirts.css";
import WhatsAppButton from "../Components/whatsappbtn";

// ── Product Data ────────────────────────────────────────────────────────────────
const ALL_PRODUCTS = [
  {
    id: 1,
    name: "Classic Crew Neck T-Shirt",
    basePrice: 1800,
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    colors: ["#ffffff", "#111111"],
    colorNames: { "#ffffff": "White", "#111111": "Black" },
    colorImages: {
      "#ffffff": [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
        "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&q=80",
      ],
      "#111111": [
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
        "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    sku: "#CCN-S-WHT",
    material: "Premium Cotton",
    composition: "100% Combed Cotton",
    modelInfo: 'Model Height 5\'11", wearing size M',
    stockCount: 4,
    freeShippingThreshold: 8000,
  },
  {
    id: 2,
    name: "Oversized Graphic Tee",
    basePrice: 2400,
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    colors: ["#d3d3c7", "#1a3a5c"],
    colorNames: { "#d3d3c7": "Stone", "#1a3a5c": "Navy" },
    colorImages: {
      "#d3d3c7": [
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
        "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&q=80",
      ],
      "#1a3a5c": [
        "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
    sku: "#OGT-M-STN",
    material: "Cotton Terry",
    composition: "80% Cotton, 20% Polyester",
    modelInfo: 'Model Height 6\'0", wearing size M',
    stockCount: 8,
    freeShippingThreshold: 8000,
  },
  {
    id: 3,
    name: "Striped Polo T-Shirt",
    basePrice: 2200,
    sizes: ["M", "L", "XL"],
    inStock: false,
    colors: ["#aecbeb"],
    colorNames: { "#aecbeb": "Blue Stripe" },
    colorImages: {
      "#aecbeb": [
        "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&q=80",
    sku: "#SPT-M-BLS",
    material: "Pique Cotton",
    composition: "100% Cotton Pique",
    modelInfo: 'Model Height 5\'10", wearing size M',
    stockCount: 0,
    freeShippingThreshold: 8000,
  },
  {
    id: 4,
    name: "Essential V-Neck Tee",
    basePrice: 1600,
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    colors: ["#808080", "#111111"],
    colorNames: { "#808080": "Grey", "#111111": "Black" },
    colorImages: {
      "#808080": [
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
      ],
      "#111111": [
        "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
    sku: "#EVN-S-GRY",
    material: "Slub Cotton",
    composition: "95% Cotton, 5% Elastane",
    modelInfo: 'Model Height 5\'11", wearing size M',
    stockCount: 14,
    freeShippingThreshold: 8000,
  },
  {
    id: 5,
    name: "Tito Men's Basic Tee",
    basePrice: 1295,
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    colors: ["#ffffff", "#111111", "#1a3a5c"],
    colorNames: { "#ffffff": "White", "#111111": "Black", "#1a3a5c": "Navy" },
    colorImages: {
      "#ffffff": [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
      ],
      "#111111": [
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
      ],
      "#1a3a5c": [
        "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    sku: "#TMB-M-WHT",
    material: "Blended Cotton",
    composition: "60% Cotton, 40% Polyester",
    modelInfo: 'Model Height 5\'10", wearing size M',
    stockCount: 6,
    freeShippingThreshold: 8000,
  },
  {
    id: 6,
    name: "Drop Shoulder Longline Tee",
    basePrice: 2100,
    sizes: ["M", "L", "XL"],
    inStock: true,
    colors: ["#3d4a2e", "#111111"],
    colorNames: { "#3d4a2e": "Olive", "#111111": "Black" },
    colorImages: {
      "#3d4a2e": [
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
      ],
      "#111111": [
        "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
    sku: "#DSL-M-OLV",
    material: "French Terry",
    composition: "70% Cotton, 30% Polyester",
    modelInfo: 'Model Height 5\'11", wearing size M',
    stockCount: 3,
    freeShippingThreshold: 8000,
  },
  {
    id: 7,
    name: "Slim Fit Ribbed T-Shirt",
    basePrice: 1900,
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    colors: ["#111111", "#444444"],
    colorNames: { "#111111": "Jet Black", "#444444": "Charcoal" },
    colorImages: {
      "#111111": [
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
        "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80",
      ],
      "#444444": [
        "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
    sku: "#SFR-S-BLK",
    material: "Ribbed Cotton",
    composition: "95% Cotton, 5% Spandex",
    modelInfo: 'Model Height 6\'0", wearing size M',
    stockCount: 9,
    freeShippingThreshold: 8000,
  },
  {
    id: 8,
    name: "Premium Supima Cotton Tee",
    basePrice: 3200,
    sizes: ["M", "L", "XL", "XXL"],
    inStock: true,
    colors: ["#ffffff", "#808080", "#111111"],
    colorNames: { "#ffffff": "White", "#808080": "Light Grey", "#111111": "Black" },
    colorImages: {
      "#ffffff": [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
        "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&q=80",
      ],
      "#808080": [
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
      ],
      "#111111": [
        "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    sku: "#PSC-M-WHT",
    material: "Supima Cotton",
    composition: "100% Supima Cotton",
    modelInfo: 'Model Height 6\'0", wearing size L',
    stockCount: 5,
    freeShippingThreshold: 8000,
  },
];

const ALL_SIZES = ["S", "M", "L", "XL", "XXL"];

// ── Helper Functions ────────────────────────────────────────────────────────────
const getReviews = (productId) => {
  const defaultReviews = {
    1: [
      { id: 1, name: "Ashan P.", rating: 5, text: "Super soft and great fit, my go-to everyday tee!", date: "Mar 2025", verified: true },
      { id: 2, name: "Roshan K.", rating: 4, text: "Excellent quality cotton, very comfortable.", date: "Feb 2025", verified: true },
    ],
    2: [
      { id: 1, name: "Nuwan F.", rating: 4, text: "Love the oversized fit and the stone color.", date: "Apr 2025", verified: true },
    ],
  };
  if (defaultReviews[productId]) return defaultReviews[productId];
  return [{ id: 1, name: "Customer", rating: 4, text: "Nice tee. Satisfied with the quality.", date: "Feb 2025", verified: false }];
};

// ── Star Rating ────────────────────────────────────────────────────────────────
const StarRating = ({ rating, size = 14, interactive = false, onRate }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="ts-stars">
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

// ── Color Swatch Component ─────────────────────────────────────────────────────
const ColorSwatches = ({ colors, selectedColor, onSelect }) => (
  <div className="ts-color-row">
    {colors.map((color) => (
      <button
        key={color}
        className={`ts-color-swatch ${selectedColor === color ? "active" : ""}`}
        style={{
          backgroundColor: color,
          border:
            color === "#ffffff" || color === "#d3d3c7" || color === "#aecbeb"
              ? "1.5px solid #ccc"
              : "none",
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
    <div className="ts-product-card" onClick={() => onOpenModal(product)}>
      <div className="ts-card-image">
        <img src={currentImage} alt={product.name} loading="lazy" />
        <button
          className={`ts-wishlist-btn ${isWished ? "active" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
          aria-label="Add to wishlist"
        >
          {isWished ? "❤️" : "🤍"}
        </button>
        {!product.inStock && <span className="ts-stock-badge out">Out of Stock</span>}
      </div>
      <div className="ts-card-body">
        <h3 className="ts-product-name">{product.name}</h3>
        <div className="ts-card-rating">
          <StarRating rating={Math.round(avgRating)} size={12} />
          <span>({reviews.length})</span>
        </div>
        <p className="ts-product-price">Rs {product.basePrice.toLocaleString()}.00</p>
        <div className="ts-color-section">
          <span className="ts-color-label">Colors:</span>
          <ColorSwatches colors={product.colors} selectedColor={selectedColor} onSelect={(c) => { setSelectedColor(c); }} />
        </div>
        <div className="ts-size-row">
          {product.sizes.slice(0, 4).map((size) => (
            <span key={size} className="ts-size-badge">{size}</span>
          ))}
          {product.sizes.length > 4 && <span className="ts-size-more">+{product.sizes.length - 4}</span>}
        </div>
        <button className="ts-add-to-cart" disabled={!product.inStock}>
          {product.inStock ? "Add to Cart" : "Unavailable"}
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
    <div className="ts-reviews-modal-overlay" onClick={onClose}>
      <div className="ts-reviews-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="ts-reviews-modal-close" onClick={onClose}>✕</button>

        <div className="ts-reviews-header">
          <h2>Customer Reviews</h2>
          <div className="ts-reviews-summary">
            <StarRating rating={Math.round(avgRating)} size={20} />
            <span className="ts-reviews-total">{avgRating.toFixed(1)} out of 5 · {reviews.length} reviews</span>
          </div>
        </div>

        <div className="ts-reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="ts-review-item-full">
              <div className="ts-review-header-full">
                <strong>{review.name}</strong>
                <StarRating rating={review.rating} size={14} />
                {review.verified && <span className="ts-verified-badge">✓ Verified Purchase</span>}
              </div>
              <p className="ts-review-text-full">{review.text}</p>
              <span className="ts-review-date-full">{review.date}</span>
            </div>
          ))}
        </div>

        <button className="ts-write-review-btn">Write a Review</button>
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
      <div className="ts-modal-overlay" onClick={onClose}>
        <div className="ts-modal-container" onClick={(e) => e.stopPropagation()}>
          <button className="ts-modal-close" onClick={onClose} aria-label="Close">✕</button>

          <div className="ts-modal-grid">
            {/* LEFT: Image Gallery */}
            <div className="ts-modal-gallery">
              {/* Thumbnail Strip */}
              <div className="ts-modal-thumbnails">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`ts-thumb-btn ${activeImageIndex === idx ? "active" : ""}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={img} alt={`${product.name} view ${idx + 1}`} />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="ts-modal-main-image">
                <img src={currentImage} alt={product.name} />
                <button
                  className={`ts-modal-wishlist-float ${isWished ? "active" : ""}`}
                  onClick={() => onToggleWishlist(product.id)}
                  aria-label="Toggle wishlist"
                >
                  {isWished ? "❤️" : "🤍"}
                </button>
                {images.length > 1 && (
                  <div className="ts-image-nav">
                    <button
                      className="ts-img-nav-btn"
                      onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                      disabled={activeImageIndex === 0}
                    >‹</button>
                    <span>{activeImageIndex + 1} / {images.length}</span>
                    <button
                      className="ts-img-nav-btn"
                      onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                      disabled={activeImageIndex === images.length - 1}
                    >›</button>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Product Details */}
            <div className="ts-modal-details">
              <h2 className="ts-modal-title">{product.name}</h2>
              <p className="ts-modal-sku">{product.sku}</p>

              {/* Price */}
              <div className="ts-modal-price-block">
                <span className="ts-modal-price">Rs {product.basePrice.toLocaleString()}.00 <small>LKR</small></span>
                {product.basePrice >= 3000 && (
                  <span className="ts-modal-installment">
                    or 3 × Rs {Math.round(product.basePrice / 3).toLocaleString()}.00 with <strong>Koko</strong>
                  </span>
                )}
              </div>

              {/* Rating row */}
              <div className="ts-modal-rating-row">
                <div className="ts-rating-info">
                  <StarRating rating={Math.round(avgRating)} size={16} />
                  <span className="ts-modal-rating-count">{avgRating.toFixed(1)} out of 5</span>
                </div>
                <button
                  className="ts-view-reviews-btn"
                  onClick={() => setShowReviews(true)}
                >
                  View Reviews ({reviews.length})
                </button>
              </div>

              {/* Size Selector */}
              <div className="ts-modal-section">
                <div className="ts-modal-section-header">
                  <label className="ts-modal-label">
                    SIZE <span className="ts-selected-val">{selectedSize || "—"}</span>
                  </label>
                  <button className="ts-size-chart-btn">📏 SIZE CHART</button>
                </div>
                <div className="ts-modal-size-grid">
                  {ALL_SIZES.map((size) => {
                    const avail = product.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        className={`ts-modal-size-btn ${!avail ? "unavailable" : ""} ${selectedSize === size ? "selected" : ""}`}
                        onClick={() => { if (avail) { setSelectedSize(size); setSizeError(false); } }}
                        disabled={!avail}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                {sizeError && <p className="ts-size-error">Please select a size before adding to cart.</p>}
              </div>

              {/* Color Selector */}
              <div className="ts-modal-section">
                <label className="ts-modal-label">
                  COLOR <span className="ts-selected-val">{colorName.toUpperCase()}</span>
                </label>
                <div className="ts-modal-color-row">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      className={`ts-modal-color-thumb ${selectedColor === color ? "active" : ""}`}
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
              <div className="ts-modal-actions">
                <div className="ts-quantity-control">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="ts-qty-btn">−</button>
                  <span className="ts-qty-display">{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)} className="ts-qty-btn">+</button>
                </div>
                <button className="ts-modal-cart-btn" onClick={handleAddToCart} disabled={!product.inStock}>
                  {product.inStock ? "ADD TO CART" : "OUT OF STOCK"}
                </button>
              </div>

              <button className="ts-modal-buy-now-btn" onClick={handleBuyNow} disabled={!product.inStock}>
                BUY IT NOW
              </button>

              {/* Stock & Shipping Info */}
              <div className="ts-modal-info-badges">
                {product.inStock && product.stockCount <= 5 && (
                  <div className="ts-info-badge warning">
                    <span>⏰</span> Only {product.stockCount} left in stock. Order soon.
                  </div>
                )}
                <div className="ts-info-badge">
                  <span>✓</span> Free delivery and shipping above Rs {product.freeShippingThreshold?.toLocaleString()}
                </div>
                <div className="ts-info-badge">
                  <span>✓</span> Secure online payment
                </div>
              </div>

              {/* Product Details */}
              <div className="ts-modal-product-info">
                <ul>
                  <li><strong>Material:</strong> {product.material}</li>
                  <li><strong>Composition:</strong> {product.composition}</li>
                </ul>
                <p className="ts-model-info">{product.modelInfo}</p>
                <p className="ts-color-disclaimer">
                  Please bear in mind that the photo may be slightly different from the actual item in terms of color due to lighting conditions or the display used to view.
                </p>
              </div>

              {/* Stock indicator */}
              <div className="ts-modal-stock-indicator">
                <span className={product.inStock ? "ts-in-stock" : "ts-out-stock"}>
                  {product.inStock ? "✓ In Stock" : "✕ Out of Stock"}
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

// ── Main T-Shirts Page Component ───────────────────────────────────────────────
const TShirtsPage = () => {
  const [maxPrice, setMaxPrice] = useState(3500);
  const [wishlist, setWishlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [selectedSizeFilter, setSelectedSizeFilter] = useState(null);

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("tshirt_wishlist")) || [];
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
    localStorage.setItem("tshirt_wishlist", JSON.stringify(updated));
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
    <div className="ts-page">
      <Header />

      <section className="ts-hero">
        <h1>Premium T-Shirts<br /><span>Everyday Comfort, Effortless Style</span></h1>
      </section>

      <div className="ts-container">
        <aside className="ts-filters">
          <h3>Filters</h3>

          <div className="ts-filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ts-search-input"
            />
          </div>

          <div className="ts-filter-group">
            <label>Max Price: Rs. {maxPrice.toLocaleString()}</label>
            <input
              type="range"
              min="1000"
              max="3500"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="ts-price-slider"
            />
          </div>

          <div className="ts-filter-group">
            <label>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="ts-sort-select">
              <option value="default">Default</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
          </div>

          <div className="ts-filter-group">
            <label>Size</label>
            <div className="ts-size-filters">
              {["S", "M", "L", "XL", "XXL"].map((size) => (
                <button
                  key={size}
                  className={`ts-size-filter-btn ${selectedSizeFilter === size ? "active" : ""}`}
                  onClick={() => setSelectedSizeFilter(selectedSizeFilter === size ? null : size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="ts-products-main">
          <div className="ts-products-header">
            <h2>All T-Shirts</h2>
            <span>{filteredProducts.length} items found</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="ts-no-results">No products found. Try adjusting the filters.</div>
          ) : (
            <>
              <div className="ts-products-grid">
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
                <div className="ts-load-more">
                  <button onClick={() => setVisibleCount((p) => p + 6)} className="ts-load-btn">
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

export default TShirtsPage;
