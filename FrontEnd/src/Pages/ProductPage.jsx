import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import NavBar from "../components/navsidebar";
import WhatsAppButton from "../components/whatsappbtn";
import SizeChart from "../components/SizeChart";
import SmartSizeRecommendation from "../Components/SmartSizeRecommendation";
import CompareButton from "../Components/CompareButton";
import cartService from "../services/cartService";
import {
  getWishlistDB,
  addToWishlistDB,
  removeFromWishlistByProductDB,
  getGuestWishlist,
  addToGuestWishlist,
  removeFromGuestWishlist,
} from "../services/wishlistService";
import {
  addToRecentlyViewedDB,
  addToGuestRecentlyViewed,
} from "../services/recentlyViewedService";
import API, { apiUrl } from "../services/api";
import ProductReviews from "../Components/ProductReviews";
import "./ProductPage.css";

// ---------- Helper: Convert any color name to a consistent hex code ----------
const stringToHexColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  // Get a full 6-digit hex value (e.g., #a1b2c3)
  let color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - color.length) + color;
};

// ---------- Helper: Reviews mock (can be replaced with API call) ----------
const getReviews = (productId) => {
  return [
    { id: 1, name: "Customer", rating: 4, text: "Good product.", date: "Mar 2025", verified: true },
    { id: 2, name: "Buyer", rating: 5, text: "Excellent quality!", date: "Apr 2025", verified: true },
  ];
};

// Categories that use numeric (waist/inseam) sizing instead of S/M/L lettering.
// Matched as a case-insensitive substring against the fetched category name,
// so it still catches variants like "Cargo Pants", "Denim Jeans", "Formal Trousers", etc.
const BOTTOMS_CATEGORY_KEYWORDS = ["pant", "trouser", "short", "denim", "jean"];

const isBottomsCategory = (categoryName) => {
  if (!categoryName) return false;
  const lower = categoryName.toLowerCase();
  return BOTTOMS_CATEGORY_KEYWORDS.some((keyword) => lower.includes(keyword));
};

// Capitalizes only the first letter of a string, leaving the rest as-is
// e.g. "tshirts" -> "Tshirts", "men accessories" -> "Men accessories"
const capitalizeFirst = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Default letter sizes used for non-bottoms categories (shirts, tees, etc.)
const DEFAULT_SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL", "XXXL"];

// Sorts a list of size strings numerically when possible (e.g. "28","30","32"),
// falling back to alphabetical sort for anything non-numeric.
const sortSizes = (sizes) => {
  return [...sizes].sort((a, b) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return String(a).localeCompare(String(b));
  });
};

// ---------- Star Rating Component ----------
const StarRating = ({ rating, size = 14 }) => (
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

// ---------- Color Swatches Component ----------
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
      />
    ))}
  </div>
);

// ---------- Product Card Component ----------
const ProductCard = ({ product, onToggleWishlist, isWished, onOpenModal, reviewMeta = {}, isHighlighted, onOpenSmartSize }) => {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "#ffffff");
  const images = product.colorImages?.[selectedColor] || [product.img];
  const currentImage = images[0];
  const averageRating = reviewMeta.averageRating || 0;
  const reviewCount = reviewMeta.count || 0;

  return (
    <div
      id={`product-card-${product.id}`}
      className={`sh-product-card ${isHighlighted ? "highlighted" : ""}`}
      onClick={() => onOpenModal(product)}
      style={isHighlighted ? { border: "2px solid #c8982a", boxShadow: "0 0 0 2px rgba(200, 152, 42, 0.15)" } : undefined}
    >
      <div className="sh-card-image">
        <img src={currentImage} alt={product.name} loading="lazy" />
        <button
          className={`sh-wishlist-btn ${isWished ? "active" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
          aria-label="Wishlist"
        >
          {isWished ? "❤️" : "🤍"}
        </button>
        {!product.inStock && <span className="sh-stock-badge out">Out of Stock</span>}
      </div>
      <div className="sh-card-body">
        <h3 className="sh-product-name">{product.name}</h3>
        <div className="sh-card-rating">
          <StarRating rating={Math.round(averageRating)} size={12} />
          <span>({reviewCount})</span>
        </div>
        <p className="sh-product-price">Rs {product.basePrice?.toLocaleString()}.00</p>
        <div className="sh-color-section">
          <span className="sh-color-label">Colors:</span>
          <ColorSwatches
            colors={product.colors}
            selectedColor={selectedColor}
            onSelect={(c) => setSelectedColor(c)}
          />
        </div>
        <div className="sh-size-row">
          {product.sizes?.slice(0, 4).map((size) => (
            <span key={size} className="sh-size-badge">{size}</span>
          ))}
          {product.sizes?.length > 4 && (
            <span className="sh-size-more">+{product.sizes.length - 4}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="sh-add-to-cart" disabled={!product.inStock}>Add to Cart</button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenSmartSize(product);
            }}
            style={{
              border: '1px solid #111',
              background: '#fff',
              color: '#111',
              borderRadius: '12px',
              padding: '0.7rem 0.9rem',
              cursor: 'pointer',
              fontWeight: 600,
              minWidth: '110px',
            }}
          >
            🧠 Smart Size
          </button>
          <CompareButton product={product} />
        </div>
      </div>
    </div>
  );
};


// ---------- Product Modal (merged: SizeChart + Smart Size + Compare + simplified badges + escape behaviour) ----------
const ProductModal = ({ product, onClose, onToggleWishlist, isWished }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedColor, setSelectedColor]       = useState(product.colors?.[0] || "#ffffff");
  const [selectedSize, setSelectedSize]         = useState(null);
  const [quantity, setQuantity]                 = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [sizeError, setSizeError]               = useState(false);
  const [showSmartSize, setShowSmartSize]       = useState(false);
  const [showSizeChart, setShowSizeChart]       = useState(false);
  const [reviewSort, setReviewSort]             = useState('newest');
  const [reviews, setReviews]                   = useState([]);
  const [reviewsLoading, setReviewsLoading]     = useState(true);

  const images       = product.colorImages?.[selectedColor] || [product.img];
  const currentImage = images[activeImageIndex] || images[0];
  const colorName    = product.colorNames?.[selectedColor] || selectedColor;

  const colorHexToName = Object.entries(product.colorNames || {}).reduce((acc, [hex, name]) => {
    acc[hex] = name;
    return acc;
  }, {});
  const selectedColorName = colorHexToName[selectedColor] || colorName;
  const variantDetails    =
    product.variantDetails?.[selectedColorName] ||
    product.variants?.filter((v) => v.color === selectedColorName) ||
    [];

  // Fetch reviews for this product
  useEffect(() => {
    setReviewsLoading(true);
    API.get(`/reviews/product/${product.id}`)
      .then(res => { 
        if (res.data.success) {
          const allReviews = res.data.data || [];
          setReviews(allReviews);
        }
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [product.id]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
    : 0;

  const sortedReviews = [...reviews].sort((a, b) => {
    if (reviewSort === 'highest') return b.rating - a.rating;
    if (reviewSort === 'lowest') return a.rating - b.rating;
    return new Date(b.createdAt) - new Date(a.createdAt); // newest
  });

  // Derive this product's own size options from its variants, instead of a
  // hardcoded letter list — so numeric bottoms sizes (28, 30, 32...) render
  // correctly here too, not just in the sidebar filter.
  const productSizeOptions = useMemo(() => {
    const sizesFromVariants = [...new Set((product.variants || []).map((v) => v.size).filter(Boolean))];
    if (sizesFromVariants.length === 0) return DEFAULT_SIZE_OPTIONS;
    const allNumeric = sizesFromVariants.every((s) => !isNaN(parseFloat(s)));
    return allNumeric ? sortSizes(sizesFromVariants) : sizesFromVariants;
  }, [product]);

  // Escape key: close SizeChart first, then ProductModal
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key !== "Escape") return;
      if (showSizeChart) {
        setShowSizeChart(false);
      } else {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "auto";
    };
  }, [onClose, showSizeChart]);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleAddToCart = async () => {
    if (!selectedSize) { setSizeError(true); return; }
    setSizeError(false);

    const userData = sessionStorage.getItem("user");
    if (!userData) {
      showToast("Please login to add items to cart", "warning");
      return;
    }
    const user   = JSON.parse(userData);
    const userId = user.id;

    try {
      const cartData = {
        userId,
        productId: product.id,
        name:      product.name,
        price:     product.basePrice,
        imageUrl:  currentImage,
        color:     selectedColorName,
        size:      selectedSize,
        quantity,
      };
      const response = await cartService.addToCart(cartData);
      if (response.success) {
        showToast("Product added to cart successfully!", "success");
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      } else {
        showToast("Failed to add product to cart: " + response.message, "error");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast("An error occurred. Please try again.", "error");
    }
  };

  const handleBuyNow = () => {
    if (!selectedSize) { setSizeError(true); return; }
    setSizeError(false);

    const buyNowItem = {
      id:       product.id,
      name:     product.name,
      price:    product.basePrice,
      imageUrl: currentImage,
      color:    selectedColor,
      size:     selectedSize,
      qty:      quantity,
    };

    const userData = sessionStorage.getItem("user");
    if (!userData) {
      sessionStorage.setItem(
        "pendingBuyNow",
        JSON.stringify({ selectedItems: [buyNowItem], subtotal: buyNowItem.price * quantity })
      );
      navigate("/login");
      return;
    }

    navigate("/checkout", {
      state: { selectedItems: [buyNowItem], subtotal: buyNowItem.price * quantity },
    });
  };

  return (
    <>
      {/* Product Modal */}
      <div className="sh-modal-overlay" onClick={onClose}>
        <div className="sh-modal-container" onClick={(e) => e.stopPropagation()}>
          <button className="sh-modal-close" onClick={onClose}>✕</button>
          <div className="sh-modal-grid">

            {/* Left Gallery */}
            <div className="sh-modal-gallery">
              <div className="sh-modal-thumbnails">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`sh-thumb-btn ${activeImageIndex === idx ? "active" : ""}`}
                    onClick={() => setActiveImageIndex(idx)}
                  >
                    <img src={img} alt={`view ${idx + 1}`} onError={(e) => (e.target.src = "/placeholder.jpg")} />
                  </button>
                ))}
              </div>
              <div className="sh-modal-main-image">
                <img src={currentImage} alt={product.name} onError={(e) => (e.target.src = "/placeholder.jpg")} />
                <button
                  className={`sh-modal-wishlist-float ${isWished ? "active" : ""}`}
                  onClick={() => onToggleWishlist(product.id)}
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

            {/* Right Details */}
            <div className="sh-modal-details">
              <h2 className="sh-modal-title">{product.name}</h2>
              {/* <p className="sh-modal-sku">{product.sku}</p> */}

              <div className="sh-modal-price-block">
                <span className="sh-modal-price">
                  Rs {product.basePrice?.toLocaleString()}.00 <small>LKR</small>
                </span>
                {/* {product.basePrice >= 3000 && (
                  <span className="sh-modal-installment">
                    or 3 × Rs {Math.round(product.basePrice / 3).toLocaleString()}.00 with <strong>Koko</strong>
                  </span>
                )} */}
              </div>


              {/* Size section with SizeChart + Smart Size buttons */}
              <div className="sh-modal-section">
                <div className="sh-modal-section-header">
                  <label className="sh-modal-label">
                    SIZE <span className="sh-selected-val">{selectedSize || "—"}</span>
                  </label>
                  <div className="sh-size-chart-row">
                    <button
                      className="sh-size-chart-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSizeChart(true);
                      }}
                    >
                      📏 SIZE CHART
                    </button>
                    <button
                      className="sh-size-recommend-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/smart-size/${product.id}`, { state: { product } });
                      }}
                    >
                      🧠 SMART SIZE
                    </button>
                  </div>
                </div>

                <div className="sh-modal-size-grid">
                  {productSizeOptions.map((size) => {
                    const variantInfo = variantDetails.find((v) => v.size === size);
                    const avail       = variantInfo && variantInfo.quantity > 0;
                    return (
                      <button
                        key={size}
                        className={`sh-modal-size-btn ${!avail ? "unavailable" : ""} ${selectedSize === size ? "selected" : ""}`}
                        onClick={() => { if (avail) { setSelectedSize(size); setSizeError(false); } }}
                        disabled={!avail}
                        title={variantInfo ? `${variantInfo.quantity} in stock` : "Not available"}
                      >
                        {size}
                        {variantInfo && <span className="sh-size-stock">{variantInfo.quantity}</span>}
                      </button>
                    );
                  })}
                </div>
                {sizeError && <p className="sh-size-error">Please select a size.</p>}
              </div>

              {/* Color */}
              <div className="sh-modal-section">
                <label className="sh-modal-label">
                  COLOR <span className="sh-selected-val">{colorName.toUpperCase()}</span>
                </label>
                <div className="sh-modal-color-row">
                  {product.colors?.map((color) => (
                    <button
                      key={color}
                      className={`sh-modal-color-thumb ${selectedColor === color ? "active" : ""}`}
                      onClick={() => {
                        setSelectedColor(color);
                        setActiveImageIndex(0);
                        setSelectedSize(null);
                      }}
                      title={product.colorNames?.[color]}
                    >
                      <img
                        src={(product.colorImages?.[color] || [product.img])[0]}
                        alt={product.colorNames?.[color]}
                        onError={(e) => (e.target.src = "/placeholder.jpg")}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Variant Details Display */}
              {variantDetails.length > 0 && (
                <div className="sh-variant-details-display">
                  <h4>Available Variants ({selectedColorName}):</h4>
                  <div className="sh-variant-list">
                    {variantDetails.map((variant, idx) => (
                      <div key={idx} className="sh-variant-item">
                        <span className="sh-variant-size">{variant.size}</span>
                        <span className="sh-variant-stock">Stock: {variant.quantity}</span>
                        {variant.imageUrl && (
                          <img
                            src={variant.imageUrl}
                            alt={`${selectedColorName} ${variant.size}`}
                            className="sh-variant-thumb"
                            onError={(e) => (e.target.src = "/placeholder.jpg")}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="sh-modal-actions">
                <div className="sh-quantity-control">
                  <button className="sh-qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <span className="sh-qty-display">{quantity}</span>
                  <button className="sh-qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
                <button className="sh-modal-cart-btn" onClick={handleAddToCart} disabled={!product.inStock}>
                  ADD TO CART
                </button>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <CompareButton product={product} />
                </div>
              </div>
              <button className="sh-modal-buy-now-btn" onClick={handleBuyNow} disabled={!product.inStock}>
                BUY IT NOW
              </button>

              {/* Simplified info badges: only low-stock warning */}
              {product.inStock && product.stockCount <= 5 && (
                <div className="sh-modal-info-badges">
                  <div className="sh-info-badge warning">
                    <span>⏰</span> Only {product.stockCount} left!
                  </div>
                </div>
              )}

              {/* Product Details */}
              <div className="sh-modal-product-info">
                <ul>
                  <li><strong>Material:</strong> {product.material}</li>
                  <li><strong>Composition:</strong> {product.composition}</li>
                </ul>
                <p className="sh-model-info">{product.modelInfo}</p>
                <p className="sh-color-disclaimer">
                  Colors may vary slightly due to lighting or display settings.
                </p>
              </div>

              <div className="sh-modal-stock-indicator">
                <span className={product.inStock ? "sh-in-stock" : "sh-out-stock"}>
                  {product.inStock ? "✓ In Stock" : "✕ Out of Stock"}
                </span>
              </div>

              {/* ── Inline Reviews ── */}
              <div className="sh-inline-reviews">
                <div className="sh-inline-reviews-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h4 className="sh-inline-reviews-title" style={{ margin: 0 }}>Customer Reviews</h4>
                    {reviews.length > 0 && (
                      <div className="sh-inline-reviews-avg">
                        <StarRating rating={Math.round(avgRating)} size={13} />
                        <span>{avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                  
                  {reviews.length > 0 && (
                    <div className="sh-review-sort">
                      <select 
                        value={reviewSort} 
                        onChange={(e) => setReviewSort(e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: '1px solid #e5e5e5',
                          background: '#f9f9f9',
                          fontSize: '13px',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="newest">Sort by: Newest</option>
                        <option value="highest">Sort by: Highest Rating</option>
                        <option value="lowest">Sort by: Lowest Rating</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="sh-inline-reviews-body">
                  {reviewsLoading ? (
                    <p className="sh-reviews-msg">Loading reviews…</p>
                  ) : reviews.length === 0 ? (
                    <p className="sh-reviews-msg">No reviews yet for this product.</p>
                  ) : (
                    <>
                      {sortedReviews.slice(0, 15).map(rv => (
                        <div key={rv.id} className="sh-inline-review-item">
                          <div className="sh-inline-review-top">
                            <div className="sh-inline-review-left">
                              <span className="sh-inline-name">{rv.userName || 'Customer'}</span>
                            </div>
                            <div className="sh-inline-review-right">
                              <StarRating rating={rv.rating} size={12} />
                            </div>
                          </div>
                          <p className="sh-inline-comment">{rv.comment}</p>
                          {rv.imageUrls && rv.imageUrls.length > 0 && (
                            <div className="sh-inline-review-imgs">
                              {rv.imageUrls.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                  <img src={url} alt={`Review ${i + 1}`} className="sh-inline-review-img"
                                    onError={e => { e.target.style.display = 'none'; }} />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {reviews.length > 15 && (
                        <p className="sh-reviews-msg" style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>
                          Showing 15 of {reviews.length} reviews
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* SizeChart panel */}
      <SizeChart open={showSizeChart} onClose={() => setShowSizeChart(false)} />

      {/* Modern custom toast overlay */}
      <div className={`custom-toast ${toast.show ? "show" : ""} custom-toast-${toast.type}`}>
        <span className="custom-toast-icon">
          {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "⚠️"}
        </span>
        <span className="custom-toast-message">{toast.message}</span>
      </div>

      <style>{`
        .custom-toast {
          position: fixed;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(17, 17, 17, 0.95);
          color: #ffffff;
          padding: 12px 24px;
          border-radius: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          z-index: 99999;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          opacity: 0;
          pointer-events: none;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          font-size: 0.9rem;
        }
        .custom-toast.show {
          top: 40px;
          opacity: 1;
          pointer-events: auto;
        }
        .custom-toast-success { border-left: 4px solid #28a745; }
        .custom-toast-error { border-left: 4px solid #dc3545; }
        .custom-toast-warning { border-left: 4px solid #f39c12; }
      `}</style>
    </>
  );
};

// ---------- MAIN PRODUCT PAGE COMPONENT ----------
// Combines: DB+guest wishlist logic, category listing, single-product-by-ID fetch,
// Smart Size / Compare integrations, highlight+scroll-to-product from search params,
// and a size filter that switches between S/M/L letters and numeric bottoms sizes
// (28, 30, 32...) depending on the category.
const ProductPage = () => {
  const { category, productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]                     = useState([]);
  const [categoryName, setCategoryName]             = useState("");
  const [loading, setLoading]                       = useState(true);
  const [maxPrice, setMaxPrice]                     = useState(5000);
  const [wishlist, setWishlist]                     = useState([]);
  const [searchTerm, setSearchTerm]                 = useState("");
  const [sortBy, setSortBy]                         = useState("default");
  const [selectedProduct, setSelectedProduct]       = useState(null);
  const [visibleCount, setVisibleCount]             = useState(6);
  const [selectedSizeFilter, setSelectedSizeFilter] = useState(null);
  const [productReviewsMeta, setProductReviewsMeta] = useState({});
  const [highlightedProductId, setHighlightedProductId] = useState(null);
  const pendingProductId = location.state?.selectedProductId || searchParams.get("productId");

  // Resolve current user from sessionStorage
  const storedUser = JSON.parse(sessionStorage.getItem('user') || 'null');
  const isLoggedIn = !!(storedUser?.email);

  // Whether this category uses numeric (admin-added) sizes instead of S/M/L.
  const isBottoms = isBottomsCategory(categoryName);

  // Size options offered in the sidebar filter: for pants/denims/shorts these
  // are pulled live from the sizes admin has actually added to the DB for the
  // products in this category; for everything else it's the fixed letter set.
  const availableFilterSizes = useMemo(() => {
    if (!isBottoms) return DEFAULT_SIZE_OPTIONS;
    const uniqueSizes = [...new Set(products.flatMap((p) => p.sizes || []))];
    return sortSizes(uniqueSizes);
  }, [products, isBottoms]);

  // If the currently selected size filter no longer exists in the available
  // set (e.g. after switching categories), clear it so it can't silently
  // filter out every product behind a value that's no longer shown.
  useEffect(() => {
    if (selectedSizeFilter && !availableFilterSizes.includes(selectedSizeFilter)) {
      setSelectedSizeFilter(null);
    }
  }, [availableFilterSizes]);

  const openSmartSize = (product) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate(`/smart-size/${product?.id || ''}`, { state: { product } });
  };

  // Load wishlist (DB if logged in, else guest sessionStorage)
  useEffect(() => {
    if (isLoggedIn) {
      getWishlistDB(storedUser.id)
        .then(res => {
          const ids = res.data.map(item => Number(item.productId));
          setWishlist(ids);
        })
        .catch(() => {
          setWishlist([]);
        });
    } else {
      const guestItems = getGuestWishlist();
      setWishlist(guestItems.map(item => Number(item.productId)));
    }
  }, [category, storedUser?.id]);

  // Transform API response to match ProductCard expectations
  const transformProduct = (apiProduct) => {
    const variants = apiProduct.variants || [];
    const sizes    = [...new Set(variants.map(v => v.size).filter(s => s))];
    const colors   = [...new Set(variants.map(v => v.color).filter(c => c))];

    // Hardcoded map for common colors (optional – you can keep or remove)
    const colorHexMap = {
      red: "#FF0000", blue: "#0000FF", black: "#000000",
      white: "#FFFFFF", green: "#00FF00", yellow: "#FFFF00",
      gray: "#808080", navy: "#000080", brown: "#8B4513",
      pink: "#FFC0CB", orange: "#FFA500", purple: "#800080",
      beige: "#F5F5DC", khaki: "#F0E68C", maroon: "#800000",
    };

    // Generate hex for each color name using the deterministic function
    const colorArray = colors.map((c) => {
      const lowerName = c.toLowerCase();
      // Use hardcoded hex if available, otherwise generate from the name
      return colorHexMap[lowerName] || stringToHexColor(c);
    });

    const imagesByColor = {};
    colors.forEach((color) => {
      const colorVariants = variants.filter(v => v.color === color);
      const colorImages   = colorVariants
        .map(v => v.imageUrl)
        .filter((img, idx, arr) => img && arr.indexOf(img) === idx);
      imagesByColor[color] = colorImages.length > 0 ? colorImages : ["/placeholder.jpg"];
    });

    const firstImage    = variants.find(v => v.imageUrl)?.imageUrl || "/placeholder.jpg";
    const totalQuantity = variants.reduce((sum, v) => sum + (v.quantity || 0), 0);

    const colorImagesMap = {};
    colorArray.forEach((hex, idx) => {
      colorImagesMap[hex] = imagesByColor[colors[idx]] || [firstImage];
    });

    return {
      id:          apiProduct.id,
      name:        apiProduct.name,
      description: apiProduct.description,
      categoryId:  apiProduct.categoryId ?? apiProduct.category?.id ?? null,
      img:         firstImage,
      basePrice:   parseFloat(apiProduct.price),
      price:       parseFloat(apiProduct.price),
      sizes,
      colors:      colorArray,
      colorNames:  Object.fromEntries(colorArray.map((hex, i) => [hex, colors[i]])),
      colorImages: colorImagesMap,
      inStock:     totalQuantity > 0,
      stockCount:  totalQuantity,
      sku:         `SKU-${apiProduct.id}`,
      material:    apiProduct.description || "Premium Quality",
      composition: "100% Cotton",
      modelInfo:   `Available in ${sizes.length} sizes and ${colors.length} colors`,
      freeShippingThreshold: 2000,
      variants,
      variantDetails: Object.fromEntries(
        colors.map((color) => [
          color,
          variants
            .filter(v => v.color === color)
            .map(v => ({ size: v.size, quantity: v.quantity, imageUrl: v.imageUrl })),
        ])
      ),
    };
  };

  // Fetch products for a category, or load a single product by ID
  useEffect(() => {
    setLoading(true);

    if (productId) {
      fetch(apiUrl(`/products/${productId}`))
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            const singleProduct = transformProduct(data.data);
            setProducts([singleProduct]);
            setCategoryName(data.data.category?.name || "Product");
            setSelectedProduct(singleProduct);
          } else {
            console.error("API error:", data.message);
            setProducts([]);
            setSelectedProduct(null);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching product:", err);
          setLoading(false);
          setProducts([]);
          setSelectedProduct(null);
        });
      return;
    }

    const categoryId = parseInt(category, 10);
    if (isNaN(categoryId)) {
      console.error("Invalid category ID");
      setLoading(false);
      return;
    }

    fetch(apiUrl(`/products/category/${categoryId}`))
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProducts(data.data.map(transformProduct));
          if (data.category) setCategoryName(data.category.name);
        } else {
          console.error("API error:", data.message);
          setProducts([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
        setProducts([]);
      });
  }, [category, productId]);

  // Highlight + scroll to a product referenced via navigation state or ?productId=
  useEffect(() => {
    if (!products.length || !pendingProductId) return;

    const targetProduct = products.find((product) => String(product.id) === String(pendingProductId));
    if (targetProduct) {
      setHighlightedProductId(String(pendingProductId));
      const timer = window.setTimeout(() => {
        const element = document.getElementById(`product-card-${pendingProductId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 250);

      if (searchParams.get("productId")) {
        searchParams.delete("productId");
        setSearchParams(searchParams, { replace: true });
      }

      return () => window.clearTimeout(timer);
    }
  }, [products, pendingProductId, searchParams, setSearchParams]);

  // Toggle wishlist – uses DB for logged-in users, guest service for non-logged-in
  const toggleWishlist = async (productId) => {
    const isWished = wishlist.includes(productId);
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Optimistic UI update
    setWishlist(prev =>
      isWished ? prev.filter(id => id !== productId) : [...prev, productId]
    );

    if (isLoggedIn) {
      try {
        if (isWished) {
          await removeFromWishlistByProductDB(storedUser.id, String(productId));
        } else {
          await addToWishlistDB({
            userId: storedUser.id,
            productId: String(productId),
            productName: product.name,
            price: product.price,
            imageUrl: product.img,
          });
        }
      } catch (err) {
        // Revert optimistic update on failure
        setWishlist(prev =>
          isWished ? [...prev, productId] : prev.filter(id => id !== productId)
        );
        console.error('Wishlist error:', err);
      }
    } else {
      // Guest: use sessionStorage via guest service
      if (isWished) {
        removeFromGuestWishlist(String(productId));
      } else {
        addToGuestWishlist({
          productId: String(productId),
          productName: product.name,
          price: product.price,
          imageUrl: product.img,
        });
      }
    }
  };

  // Track product view - called when product modal is opened
  const trackProductView = async (product) => {
    setSelectedProduct(product);

    if (isLoggedIn && storedUser?.id) {
      try {
        const trackingData = {
          userId: storedUser.id,
          productId: String(product.id),
        };
        await addToRecentlyViewedDB(trackingData);
      } catch (err) {
        console.error('Error tracking recently viewed (DB):', err.response?.data || err.message);
      }
    } else {
      // Guest: use sessionStorage
      try {
        const guestData = {
          productId: String(product.id),
          productName: product.name,
          price: product.price,
          imageUrl: product.img,
          description: product.description,
          categoryId: product.categoryId || product.category?.id || null,
        };
        addToGuestRecentlyViewed(guestData);
      } catch (err) {
        console.error('Error tracking recently viewed (guest):', err);
      }
    }
  };

  // Filtering & Sorting
  let filtered = [...products];
  if (searchTerm) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }
  if (maxPrice) {
    filtered = filtered.filter(p => p.basePrice <= maxPrice);
  }
  if (selectedSizeFilter) {
    filtered = filtered.filter(p => p.sizes?.includes(selectedSizeFilter));
  }
  if (sortBy === "low-high") filtered.sort((a, b) => a.basePrice - b.basePrice);
  else if (sortBy === "high-low") filtered.sort((a, b) => b.basePrice - a.basePrice);

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  // Category name with only its first letter capitalized (e.g. "tshirts" -> "Tshirts")
  const heroTitle = capitalizeFirst(categoryName) || "Products";

  useEffect(() => {
    const visibleProductIds = filtered.slice(0, visibleCount).map((product) => product.id);
    const productIdsToLoad = visibleProductIds.filter((id) => !productReviewsMeta[id]);

    if (productIdsToLoad.length === 0) return;

    const fetchMetaForProducts = async () => {
      try {
        const results = await Promise.all(
          productIdsToLoad.map(async (id) => {
            try {
              const response = await API.get(`/reviews/product/${id}`);
              const reviews = response.data.success ? response.data.data || [] : [];
              const averageRating = reviews.length > 0
                ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length
                : 0;
              return { id, averageRating, count: reviews.length };
            } catch (error) {
              console.error(`Failed to fetch review metadata for product ${id}:`, error);
              return { id, averageRating: 0, count: 0 };
            }
          })
        );

        setProductReviewsMeta((prev) => {
          const next = { ...prev };
          results.forEach(({ id, averageRating, count }) => {
            next[id] = { averageRating, count };
          });
          return next;
        });
      } catch (error) {
        console.error('Error loading product review metadata:', error);
      }
    };

    fetchMetaForProducts();
  }, [filtered, visibleCount, productReviewsMeta]);

  if (loading) {
    return (
      <div className="sh-page">
        <Header /><NavBar />
        <div className="sh-container" style={{ textAlign: "center", padding: "4rem" }}>
          Loading products...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="sh-page">
      <Header />
      <NavBar />
      <section className="sh-hero">
        <h1>{heroTitle}<br /><span>Premium Quality</span></h1>
      </section>
      <div className="sh-container">
        <aside className="sh-filters">
          <h3>Filters</h3>
          {/* <div className="sh-filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sh-search-input"
            />
          </div> */}
          <div className="sh-filter-group">
            <label>Max Price: Rs. {maxPrice.toLocaleString()}</label>
            <input
              type="range" min="0" max="10000" step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="sh-price-slider"
            />
          </div>
          <div className="sh-filter-group">
            <label>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sh-sort-select"
            >
              <option value="default">Default</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
          </div>
          {availableFilterSizes.length > 0 && (
            <div className="sh-filter-group">
              <label>Size</label>
              <div className="sh-size-filters">
                {availableFilterSizes.map((size) => (
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
          )}
        </aside>

        <main className="sh-products-main">
          <div className="sh-products-header">
            <h2>All {heroTitle}</h2>
            <span>{filtered.length} items found</span>
          </div>
          {filtered.length === 0 ? (
            <div className="sh-no-results">No products found.</div>
          ) : (
            <>
              <div className="sh-products-grid">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWished={wishlist.includes(product.id)}
                    onToggleWishlist={toggleWishlist}
                    onOpenModal={trackProductView}
                    reviewMeta={productReviewsMeta[product.id] || { averageRating: 0, count: 0 }}
                    isHighlighted={String(product.id) === highlightedProductId}
                    onOpenSmartSize={(product) => {
                      trackProductView(product);
                      openSmartSize(product);
                    }}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="sh-load-more">
                  <button
                    className="sh-load-btn"
                    onClick={() => setVisibleCount((p) => p + 6)}
                  >
                    Load More ({filtered.length - visibleCount} remaining)
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

      <WhatsAppButton
        context={{
          productName: selectedProduct?.name,
          category: categoryName,
          price: selectedProduct?.basePrice,
          page: category || "product",
        }}
      />
    </div>
  );
};

export default ProductPage;