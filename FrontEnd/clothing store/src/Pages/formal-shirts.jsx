
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./formal-shirts.css";
import WhatsAppButton from "../Components/whatsappbtn";

// ── Product Data ────────────────────────────────────────────────────────────────
const ALL_PRODUCTS = [
  {
    id: 1,
    name: "Classic White Formal Shirt",
    basePrice: 3800,
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    colors: ["#ffffff", "#d4e8ff"],
    colorNames: { "#ffffff": "White", "#d4e8ff": "Light Blue" },
    colorImages: {
      "#ffffff": [
        "/Formal_Shirts_ath_diga/1.jpeg",
       "/Formal_Shirts_ath_diga/2.jpeg",
        "/Formal_Shirts_ath_diga/3.jpeg",
      ],
      "#d4e8ff": [
         "/Formal_Shirts_ath_diga/shirt1.jpeg",
        "https://images.unsplash.com/photo-1602810316693-3667c854239a?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1594938298603-c8148c4b5d5a?w=600&q=80",
    sku: "#CWF-S-WHT",
    material: "Premium Cotton",
    composition: "100% Egyptian Cotton",
    modelInfo: 'Model Height 5\'11", wearing size M',
    stockCount: 6,
    freeShippingThreshold: 8000,
  },
  {
    id: 2,
    name: "Slim Fit Oxford Shirt",
    basePrice: 4500,
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    colors: ["#1a3a5c", "#ffffff"],
    colorNames: { "#1a3a5c": "Navy", "#ffffff": "White" },
    colorImages: {
      "#1a3a5c": [
        "https://images.unsplash.com/photo-1602810316693-3667c854239a?w=600&q=80",
        "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80",
      ],
      "#ffffff": [
        "https://images.unsplash.com/photo-1594938298603-c8148c4b5d5a?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1602810316693-3667c854239a?w=600&q=80",
    sku: "#SFO-M-NAV",
    material: "Oxford Weave Cotton",
    composition: "100% Cotton Oxford",
    modelInfo: 'Model Height 6\'0", wearing size M',
    stockCount: 9,
    freeShippingThreshold: 8000,
  },
  {
    id: 3,
    name: "Striped Business Shirt",
    basePrice: 4200,
    sizes: ["M", "L", "XL"],
    inStock: false,
    colors: ["#aecbeb"],
    colorNames: { "#aecbeb": "Blue Stripe" },
    colorImages: {
      "#aecbeb": [
        "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=80",
    sku: "#SBS-M-BLS",
    material: "Poplin Cotton",
    composition: "100% Cotton Poplin",
    modelInfo: 'Model Height 5\'10", wearing size M',
    stockCount: 0,
    freeShippingThreshold: 8000,
  },
  {
    id: 4,
    name: "Regular Fit Dress Shirt",
    basePrice: 3500,
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    colors: ["#111111", "#808080"],
    colorNames: { "#111111": "Black", "#808080": "Charcoal" },
    colorImages: {
      "#111111": [
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80",
        "https://images.unsplash.com/photo-1594938298603-c8148c4b5d5a?w=600&q=80",
      ],
      "#808080": [
        "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80",
    sku: "#RFD-S-BLK",
    material: "Twill Cotton",
    composition: "97% Cotton, 3% Elastane",
    modelInfo: 'Model Height 5\'11", wearing size M',
    stockCount: 14,
    freeShippingThreshold: 8000,
  },
  {
    id: 5,
    name: "Tito Men's Formal Shirt",
    basePrice: 2795,
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
    colors: ["#ffffff", "#111111", "#1a3a5c"],
    colorNames: { "#ffffff": "White", "#111111": "Black", "#1a3a5c": "Navy" },
    colorImages: {
      "#ffffff": [
        "https://images.unsplash.com/photo-1594938298603-c8148c4b5d5a?w=600&q=80",
      ],
      "#111111": [
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80",
      ],
      "#1a3a5c": [
        "https://images.unsplash.com/photo-1602810316693-3667c854239a?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1594938298603-c8148c4b5d5a?w=600&q=80",
    sku: "#TMF-M-WHT",
    material: "Blended Cotton",
    composition: "60% Cotton, 40% Polyester",
    modelInfo: 'Model Height 5\'10", wearing size M',
    stockCount: 7,
    freeShippingThreshold: 8000,
  },
  {
    id: 6,
    name: "Textured Herringbone Shirt",
    basePrice: 4900,
    sizes: ["M", "L", "XL"],
    inStock: true,
    colors: ["#d3d3c7", "#111111"],
    colorNames: { "#d3d3c7": "Stone", "#111111": "Black" },
    colorImages: {
      "#d3d3c7": [
        "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80",
      ],
      "#111111": [
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80",
    sku: "#THB-M-STN",
    material: "Herringbone Weave",
    composition: "100% Cotton Herringbone",
    modelInfo: 'Model Height 5\'11", wearing size M',
    stockCount: 3,
    freeShippingThreshold: 8000,
  },
  {
    id: 7,
    name: "Spread Collar Slim Shirt",
    basePrice: 4100,
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    colors: ["#ffffff", "#aecbeb"],
    colorNames: { "#ffffff": "White", "#aecbeb": "Sky Blue" },
    colorImages: {
      "#ffffff": [
        "https://images.unsplash.com/photo-1594938298603-c8148c4b5d5a?w=600&q=80",
        "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=80",
      ],
      "#aecbeb": [
        "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1594938298603-c8148c4b5d5a?w=600&q=80",
    sku: "#SCS-S-WHT",
    material: "Satin Weave Cotton",
    composition: "100% Combed Cotton",
    modelInfo: 'Model Height 6\'0", wearing size M',
    stockCount: 10,
    freeShippingThreshold: 8000,
  },
  {
    id: 8,
    name: "Premium Non-Iron Dress Shirt",
    basePrice: 5800,
    sizes: ["M", "L", "XL", "XXL"],
    inStock: true,
    colors: ["#ffffff", "#1a3a5c", "#111111"],
    colorNames: { "#ffffff": "White", "#1a3a5c": "Navy", "#111111": "Black" },
    colorImages: {
      "#ffffff": [
        "https://images.unsplash.com/photo-1594938298603-c8148c4b5d5a?w=600&q=80",
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80",
      ],
      "#1a3a5c": [
        "https://images.unsplash.com/photo-1602810316693-3667c854239a?w=600&q=80",
      ],
      "#111111": [
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80",
      ],
    },
    img: "https://images.unsplash.com/photo-1594938298603-c8148c4b5d5a?w=600&q=80",
    sku: "#PNI-M-WHT",
    material: "Non-Iron Cotton",
    composition: "80% Cotton, 20% Polyester",
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
      { id: 1, name: "Kasun P.", rating: 5, text: "Excellent quality, very crisp and professional!", date: "Mar 2025", verified: true },
      { id: 2, name: "Dinesh K.", rating: 4, text: "Great fit and comfortable for long office days.", date: "Feb 2025", verified: true },
    ],
    2: [
      { id: 1, name: "Nuwan S.", rating: 5, text: "Perfect navy shade, the Oxford weave is top notch.", date: "Apr 2025", verified: true },
    ],
  };
  if (defaultReviews[productId]) return defaultReviews[productId];
  return [{ id: 1, name: "Customer", rating: 4, text: "Nice shirt. Satisfied with the quality and fit.", date: "Feb 2025", verified: false }];
};

// ── Star Rating ────────────────────────────────────────────────────────────────
const StarRating = ({ rating, size = 14, interactive = false, onRate }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="fs-stars">
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
  <div className="fs-color-row">
    {colors.map((color) => (
      <button
        key={color}
        className={`fs-color-swatch ${selectedColor === color ? "active" : ""}`}
        style={{
          backgroundColor: color,
          border:
            color === "#ffffff" || color === "#d4e8ff" || color === "#aecbeb" || color === "#d3d3c7"
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
    <div className="fs-product-card" onClick={() => onOpenModal(product)}>
      <div className="fs-card-image">
        <img src={currentImage} alt={product.name} loading="lazy" />
        <button
          className={`fs-wishlist-btn ${isWished ? "active" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
          aria-label="Add to wishlist"
        >
          {isWished ? "❤️" : "🤍"}
        </button>
        {!product.inStock && <span className="fs-stock-badge out">Out of Stock</span>}
      </div>
      <div className="fs-card-body">
        <h3 className="fs-product-name">{product.name}</h3>
        <div className="fs-card-rating">
          <StarRating rating={Math.round(avgRating)} size={12} />
          <span>({reviews.length})</span>
        </div>
        <p className="fs-product-price">Rs {product.basePrice.toLocaleString()}.00</p>
        <div className="fs-color-section">
          <span className="fs-color-label">Colors:</span>
          <ColorSwatches
            colors={product.colors}
            selectedColor={selectedColor}
            onSelect={(c) => { setSelectedColor(c); }}
          />
        </div>
        <div className="fs-size-row">
          {product.sizes.slice(0, 4).map((size) => (
            <span key={size} className="fs-size-badge">{size}</span>
          ))}
          {product.sizes.length > 4 && <span className="fs-size-more">+{product.sizes.length - 4}</span>}
        </div>
        <button className="fs-add-to-cart" disabled={!product.inStock}>
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
    <div className="fs-reviews-modal-overlay" onClick={onClose}>
      <div className="fs-reviews-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="fs-reviews-modal-close" onClick={onClose}>✕</button>

        <div className="fs-reviews-header">
          <h2>Customer Reviews</h2>
          <div className="fs-reviews-summary">
            <StarRating rating={Math.round(avgRating)} size={20} />
            <span className="fs-reviews-total">{avgRating.toFixed(1)} out of 5 · {reviews.length} reviews</span>
          </div>
        </div>

        <div className="fs-reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="fs-review-item-full">
              <div className="fs-review-header-full">
                <strong>{review.name}</strong>
                <StarRating rating={review.rating} size={14} />
                {review.verified && <span className="fs-verified-badge">✓ Verified Purchase</span>}
              </div>
              <p className="fs-review-text-full">{review.text}</p>
              <span className="fs-review-date-full">{review.date}</span>
            </div>
          ))}
        </div>

        <button className="fs-write-review-btn">Write a Review</button>
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
      <div className="fs-modal-overlay" onClick={onClose}>
        <div className="fs-modal-container" onClick={(e) => e.stopPropagation()}>
          <button className="fs-modal-close" onClick={onClose} aria-label="Close">✕</button>

          <div className="fs-modal-grid">
            {/* LEFT: Image Gallery */}
            <div className="fs-modal-gallery">
              <div className="fs-modal-thumbnails">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`fs-thumb-btn ${activeImageIndex === idx ? "active" : ""}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={img} alt={`${product.name} view ${idx + 1}`} />
                  </button>
                ))}
              </div>

              <div className="fs-modal-main-image">
                <img src={currentImage} alt={product.name} />
                <button
                  className={`fs-modal-wishlist-float ${isWished ? "active" : ""}`}
                  onClick={() => onToggleWishlist(product.id)}
                  aria-label="Toggle wishlist"
                >
                  {isWished ? "❤️" : "🤍"}
                </button>
                {images.length > 1 && (
                  <div className="fs-image-nav">
                    <button
                      className="fs-img-nav-btn"
                      onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                      disabled={activeImageIndex === 0}
                    >‹</button>
                    <span>{activeImageIndex + 1} / {images.length}</span>
                    <button
                      className="fs-img-nav-btn"
                      onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                      disabled={activeImageIndex === images.length - 1}
                    >›</button>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Product Details */}
            <div className="fs-modal-details">
              <h2 className="fs-modal-title">{product.name}</h2>
              <p className="fs-modal-sku">{product.sku}</p>

              {/* Price */}
              <div className="fs-modal-price-block">
                <span className="fs-modal-price">Rs {product.basePrice.toLocaleString()}.00 <small>LKR</small></span>
                {product.basePrice >= 3000 && (
                  <span className="fs-modal-installment">
                    or 3 × Rs {Math.round(product.basePrice / 3).toLocaleString()}.00 with <strong>Koko</strong>
                  </span>
                )}
              </div>

              {/* Rating row */}
              <div className="fs-modal-rating-row">
                <div className="fs-rating-info">
                  <StarRating rating={Math.round(avgRating)} size={16} />
                  <span className="fs-modal-rating-count">{avgRating.toFixed(1)} out of 5</span>
                </div>
                <button
                  className="fs-view-reviews-btn"
                  onClick={() => setShowReviews(true)}
                >
                  View Reviews ({reviews.length})
                </button>
              </div>

              {/* Size Selector */}
              <div className="fs-modal-section">
                <div className="fs-modal-section-header">
                  <label className="fs-modal-label">
                    SIZE <span className="fs-selected-val">{selectedSize || "—"}</span>
                  </label>
                  <button className="fs-size-chart-btn">📏 SIZE CHART</button>
                </div>
                <div className="fs-modal-size-grid">
                  {ALL_SIZES.map((size) => {
                    const avail = product.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        className={`fs-modal-size-btn ${!avail ? "unavailable" : ""} ${selectedSize === size ? "selected" : ""}`}
                        onClick={() => { if (avail) { setSelectedSize(size); setSizeError(false); } }}
                        disabled={!avail}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                {sizeError && <p className="fs-size-error">Please select a size before adding to cart.</p>}
              </div>

              {/* Color Selector */}
              <div className="fs-modal-section">
                <label className="fs-modal-label">
                  COLOR <span className="fs-selected-val">{colorName.toUpperCase()}</span>
                </label>
                <div className="fs-modal-color-row">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      className={`fs-modal-color-thumb ${selectedColor === color ? "active" : ""}`}
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
              <div className="fs-modal-actions">
                <div className="fs-quantity-control">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="fs-qty-btn">−</button>
                  <span className="fs-qty-display">{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)} className="fs-qty-btn">+</button>
                </div>
                <button className="fs-modal-cart-btn" onClick={handleAddToCart} disabled={!product.inStock}>
                  {product.inStock ? "ADD TO CART" : "OUT OF STOCK"}
                </button>
              </div>

              <button className="fs-modal-buy-now-btn" onClick={handleBuyNow} disabled={!product.inStock}>
                BUY IT NOW
              </button>

              {/* Stock & Shipping Info */}
              <div className="fs-modal-info-badges">
                {product.inStock && product.stockCount <= 5 && (
                  <div className="fs-info-badge warning">
                    <span>⏰</span> Only {product.stockCount} left in stock. Order soon.
                  </div>
                )}
                <div className="fs-info-badge">
                  <span>✓</span> Free delivery and shipping above Rs {product.freeShippingThreshold?.toLocaleString()}
                </div>
                <div className="fs-info-badge">
                  <span>✓</span> Secure online payment
                </div>
              </div>

              {/* Product Details */}
              <div className="fs-modal-product-info">
                <ul>
                  <li><strong>Material:</strong> {product.material}</li>
                  <li><strong>Composition:</strong> {product.composition}</li>
                </ul>
                <p className="fs-model-info">{product.modelInfo}</p>
                <p className="fs-color-disclaimer">
                  Please bear in mind that the photo may be slightly different from the actual item in terms of color due to lighting conditions or the display used to view.
                </p>
              </div>

              {/* Stock indicator */}
              <div className="fs-modal-stock-indicator">
                <span className={product.inStock ? "fs-in-stock" : "fs-out-stock"}>
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

// ── Main Formal Shirts Page Component ─────────────────────────────────────────
const FormalShirtsPage = () => {
  const [maxPrice, setMaxPrice] = useState(6000);
  const [wishlist, setWishlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [selectedSizeFilter, setSelectedSizeFilter] = useState(null);

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("formalshirt_wishlist")) || [];
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
    localStorage.setItem("formalshirt_wishlist", JSON.stringify(updated));
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
    <div className="fs-page">
      <Header />

      <section className="fs-hero">
        <h1>Formal Shirts<br /><span>Dressed for Every Occasion</span></h1>
      </section>

      <div className="fs-container">
        <aside className="fs-filters">
          <h3>Filters</h3>

          <div className="fs-filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="fs-search-input"
            />
          </div>

          <div className="fs-filter-group">
            <label>Max Price: Rs. {maxPrice.toLocaleString()}</label>
            <input
              type="range"
              min="2000"
              max="6000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="fs-price-slider"
            />
          </div>

          <div className="fs-filter-group">
            <label>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="fs-sort-select">
              <option value="default">Default</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
          </div>

          <div className="fs-filter-group">
            <label>Size</label>
            <div className="fs-size-filters">
              {["S", "M", "L", "XL", "XXL"].map((size) => (
                <button
                  key={size}
                  className={`fs-size-filter-btn ${selectedSizeFilter === size ? "active" : ""}`}
                  onClick={() => setSelectedSizeFilter(selectedSizeFilter === size ? null : size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="fs-products-main">
          <div className="fs-products-header">
            <h2>All Formal Shirts</h2>
            <span>{filteredProducts.length} items found</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="fs-no-results">No products found. Try adjusting the filters.</div>
          ) : (
            <>
              <div className="fs-products-grid">
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
                <div className="fs-load-more">
                  <button onClick={() => setVisibleCount((p) => p + 6)} className="fs-load-btn">
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

export default FormalShirtsPage;
