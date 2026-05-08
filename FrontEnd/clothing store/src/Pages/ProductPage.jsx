import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import NavBar from "../components/navsidebar";
import WhatsAppButton from "../components/whatsappbtn";
import cartService from "../services/cartService";
import {
  getWishlistDB,
  addToWishlistDB,
  removeFromWishlistByProductDB,
  getGuestWishlist,
  addToGuestWishlist,
  removeFromGuestWishlist,
} from "../services/wishlistService";
import "./ProductPage.css"; // same styles as Shirts.css

// Helper: reviews mock (can be replaced with API call)
const getReviews = (productId) => {
  // In real app, fetch reviews from backend.
  return [
    { id: 1, name: "Customer", rating: 4, text: "Good product.", date: "Mar 2025", verified: true },
    { id: 2, name: "Buyer", rating: 5, text: "Excellent quality!", date: "Apr 2025", verified: true },
  ];
};

// Star Rating Component (same as in ShirtsPage)
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

// Color Swatches Component (reused)
const ColorSwatches = ({ colors, selectedColor, onSelect }) => (
  <div className="sh-color-row">
    {colors.map((color) => (
      <button
        key={color}
        className={`sh-color-swatch ${selectedColor === color ? "active" : ""}`}
        style={{ backgroundColor: color, border: color === "#ffffff" || color === "#f5f5f0" ? "1.5px solid #ccc" : "none" }}
        onClick={() => onSelect(color)}
      />
    ))}
  </div>
);

// Product Card Component (same as ShirtsPage)
const ProductCard = ({ product, onToggleWishlist, isWished, onOpenModal }) => {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "#ffffff");
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
          aria-label="Wishlist"
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
        <p className="sh-product-price">Rs {product.basePrice?.toLocaleString()}.00</p>
        <div className="sh-color-section">
          <span className="sh-color-label">Colors:</span>
          <ColorSwatches colors={product.colors} selectedColor={selectedColor} onSelect={(c) => setSelectedColor(c)} />
        </div>
        <div className="sh-size-row">
          {product.sizes?.slice(0, 4).map((size) => (
            <span key={size} className="sh-size-badge">{size}</span>
          ))}
          {product.sizes?.length > 4 && <span className="sh-size-more">+{product.sizes.length - 4}</span>}
        </div>
        <button className="sh-add-to-cart" disabled={!product.inStock}>Add to Cart</button>
      </div>
    </div>
  );
};

// Reviews Modal (same)
const ReviewsModal = ({ product, onClose }) => {
  const reviews = getReviews(product.id);
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
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

// Product Modal (detailed view, same as ShirtsPage)
const ProductModal = ({ product, onClose, onToggleWishlist, isWished }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "#ffffff");
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
  
  // Get variant details for selected color
  const colorHexToName = Object.entries(product.colorNames || {}).reduce((acc, [hex, name]) => {
    acc[hex] = name;
    return acc;
  }, {});
  const selectedColorName = colorHexToName[selectedColor] || colorName;
  const variantDetails = product.variantDetails?.[selectedColorName] || 
    product.variants?.filter(v => v.color === selectedColorName) || [];

  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  const handleAddToCart = async () => {
    if (!selectedSize) { setSizeError(true); return; }
    setSizeError(false);

    const userData = sessionStorage.getItem('user');
    if (!userData) {
      alert("Please login to add items to cart");
      return;
    }
    const user = JSON.parse(userData);
    const userId = user.id;

    try {
      const cartData = {
        userId,
        productId: product.id,
        name: product.name,
        price: product.basePrice,
        imageUrl: currentImage,
        color: selectedColorName,
        size: selectedSize,
        quantity: quantity
      };

      const response = await cartService.addToCart(cartData);
      if (response.success) {
        alert("Product added to cart successfully!");
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        alert("Failed to add product to cart: " + response.message);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleBuyNow = () => {
    if (!selectedSize) { setSizeError(true); return; }
    setSizeError(false);

    const buyNowItem = {
      id: product.id,
      name: product.name,
      price: product.basePrice,
      imageUrl: currentImage,
      color: selectedColor,
      size: selectedSize,
      qty: quantity
    };

    const userData = sessionStorage.getItem('user');
    if (!userData) {
      // Save purchase data to sessionStorage so RedirectHandler can pick it up after login
      sessionStorage.setItem('pendingBuyNow', JSON.stringify({ 
        selectedItems: [buyNowItem], 
        subtotal: buyNowItem.price * quantity 
      }));
      navigate('/login');
      return;
    }

    navigate('/checkout', { 
      state: { 
        selectedItems: [buyNowItem], 
        subtotal: buyNowItem.price * quantity 
      } 
    });
  };

  const ALL_SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"];

  return (
    <>
      <div className="sh-modal-overlay" onClick={onClose}>
        <div className="sh-modal-container" onClick={(e) => e.stopPropagation()}>
          <button className="sh-modal-close" onClick={onClose}>✕</button>
          <div className="sh-modal-grid">
            {/* Left Gallery */}
            <div className="sh-modal-gallery">
              <div className="sh-modal-thumbnails">
                {images.map((img, idx) => (
                  <button key={idx} className={`sh-thumb-btn ${activeImageIndex === idx ? "active" : ""}`} onClick={() => setActiveImageIndex(idx)}>
                    <img src={img} alt={`view ${idx+1}`} onError={(e) => e.target.src = '/placeholder.jpg'} />
                  </button>
                ))}
              </div>
              <div className="sh-modal-main-image">
                <img src={currentImage} alt={product.name} onError={(e) => e.target.src = '/placeholder.jpg'} />
                <button className={`sh-modal-wishlist-float ${isWished ? "active" : ""}`} onClick={() => onToggleWishlist(product.id)}>
                  {isWished ? "❤️" : "🤍"}
                </button>
                {images.length > 1 && (
                  <div className="sh-image-nav">
                    <button className="sh-img-nav-btn" onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)} disabled={activeImageIndex === 0}>‹</button>
                    <span>{activeImageIndex+1} / {images.length}</span>
                    <button className="sh-img-nav-btn" onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)} disabled={activeImageIndex === images.length-1}>›</button>
                  </div>
                )}
              </div>
            </div>
            {/* Right Details */}
            <div className="sh-modal-details">
              <h2 className="sh-modal-title">{product.name}</h2>
              <p className="sh-modal-sku">{product.sku}</p>
              <div className="sh-modal-price-block">
                <span className="sh-modal-price">Rs {product.basePrice?.toLocaleString()}.00 <small>LKR</small></span>
                {product.basePrice >= 3000 && <span className="sh-modal-installment">or 3 × Rs {Math.round(product.basePrice/3).toLocaleString()}.00 with <strong>Koko</strong></span>}
              </div>
              <div className="sh-modal-rating-row">
                <div className="sh-rating-info">
                  <StarRating rating={Math.round(avgRating)} size={16} />
                  <span className="sh-modal-rating-count">{avgRating.toFixed(1)} out of 5</span>
                </div>
                <button className="sh-view-reviews-btn" onClick={() => setShowReviews(true)}>View Reviews ({reviews.length})</button>
              </div>
              {/* Size with Variant Details */}
              <div className="sh-modal-section">
                <div className="sh-modal-section-header">
                  <label className="sh-modal-label">SIZE <span className="sh-selected-val">{selectedSize || "—"}</span></label>
                  <button className="sh-size-chart-btn">📏 SIZE CHART</button>
                </div>
                <div className="sh-modal-size-grid">
                  {ALL_SIZES.map((size) => {
                    const variantInfo = variantDetails.find(v => v.size === size);
                    const avail = variantInfo && variantInfo.quantity > 0;
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
                <label className="sh-modal-label">COLOR <span className="sh-selected-val">{colorName.toUpperCase()}</span></label>
                <div className="sh-modal-color-row">
                  {product.colors?.map((color) => (
                    <button 
                      key={color} 
                      className={`sh-modal-color-thumb ${selectedColor === color ? "active" : ""}`} 
                      onClick={() => { 
                        setSelectedColor(color); 
                        setActiveImageIndex(0);
                        setSelectedSize(null); // Reset size when color changes
                      }} 
                      title={product.colorNames?.[color]}
                    >
                      <img src={(product.colorImages?.[color] || [product.img])[0]} alt={product.colorNames?.[color]} onError={(e) => e.target.src = '/placeholder.jpg'} />
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
                          <img src={variant.imageUrl} alt={`${selectedColorName} ${variant.size}`} className="sh-variant-thumb" onError={(e) => e.target.src = '/placeholder.jpg'} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Actions */}
              <div className="sh-modal-actions">
                <div className="sh-quantity-control">
                  <button className="sh-qty-btn" onClick={() => setQuantity(Math.max(1, quantity-1))}>−</button>
                  <span className="sh-qty-display">{quantity}</span>
                  <button className="sh-qty-btn" onClick={() => setQuantity(quantity+1)}>+</button>
                </div>
                <button className="sh-modal-cart-btn" onClick={handleAddToCart} disabled={!product.inStock}>ADD TO CART</button>
              </div>
              <button className="sh-modal-buy-now-btn" onClick={handleBuyNow} disabled={!product.inStock}>BUY IT NOW</button>
              {/* Info badges */}
              <div className="sh-modal-info-badges">
                {product.inStock && product.stockCount <= 5 && <div className="sh-info-badge warning"><span>⏰</span> Only {product.stockCount} left!</div>}
                <div className="sh-info-badge"><span>✓</span> Free shipping above Rs {product.freeShippingThreshold?.toLocaleString()}</div>
                <div className="sh-info-badge"><span>✓</span> Secure online payment</div>
              </div>
              {/* Product Details */}
              <div className="sh-modal-product-info">
                <ul>
                  <li><strong>Material:</strong> {product.material}</li>
                  <li><strong>Composition:</strong> {product.composition}</li>
                </ul>
                <p className="sh-model-info">{product.modelInfo}</p>
                <p className="sh-color-disclaimer">Colors may vary slightly due to lighting or display settings.</p>
              </div>
              <div className="sh-modal-stock-indicator">
                <span className={product.inStock ? "sh-in-stock" : "sh-out-stock"}>{product.inStock ? "✓ In Stock" : "✕ Out of Stock"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showReviews && <ReviewsModal product={product} onClose={() => setShowReviews(false)} />}
    </>
  );
};

// MAIN PRODUCT PAGE COMPONENT
const ProductPage = () => {
  const { category } = useParams(); // e.g., /category/1 (categoryId)
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [wishlist, setWishlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [selectedSizeFilter, setSelectedSizeFilter] = useState(null);

  // Resolve current user from sessionStorage
  const storedUser = JSON.parse(sessionStorage.getItem('user') || 'null');
  const isLoggedIn = !!(storedUser?.email);

  // Load wishlist (DB or sessionStorage)
  useEffect(() => {
    if (isLoggedIn) {
      getWishlistDB(storedUser.id)
        .then(res => {
          // DB items have productId as string; convert to number for comparison
          const ids = res.data.map(item => Number(item.productId));
          setWishlist(ids);
        })
        .catch(() => {
          // Backend unavailable — fall back silently
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
    
    // Extract unique sizes and colors from variants
    const sizes = [...new Set(variants.map(v => v.size).filter(s => s))];
    const colors = [...new Set(variants.map(v => v.color).filter(c => c))];
    
    const colorHexMap = {
      'red': '#FF0000', 'blue': '#0000FF', 'black': '#000000', 
      'white': '#FFFFFF', 'green': '#00FF00', 'yellow': '#FFFF00',
      'gray': '#808080', 'navy': '#000080', 'brown': '#8B4513',
      'pink': '#FFC0CB', 'orange': '#FFA500', 'purple': '#800080',
      'beige': '#F5F5DC', 'khaki': '#F0E68C', 'maroon': '#800000'
    };
    
    const colorArray = colors.map(c => colorHexMap[c.toLowerCase()] || `#${Math.floor(Math.random()*16777215).toString(16)}`);
    
    // Get all images from variants, grouped by color
    const imagesByColor = {};
    colors.forEach((color) => {
      const colorVariants = variants.filter(v => v.color === color);
      const colorImages = colorVariants
        .map(v => v.imageUrl)
        .filter((img, idx, arr) => img && arr.indexOf(img) === idx); // Remove duplicates
      imagesByColor[color] = colorImages.length > 0 ? colorImages : ['/placeholder.jpg'];
    });
    
    // Get first image overall
    const firstImage = variants.find(v => v.imageUrl)?.imageUrl || '/placeholder.jpg';
    
    // Calculate total quantity
    const totalQuantity = variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
    
    // Create color to hex map
    const colorNameToHex = {};
    colors.forEach((color, idx) => {
      colorNameToHex[colorArray[idx]] = color;
    });
    
    // Create color images map with hex keys
    const colorImagesMap = {};
    colorArray.forEach((hex, idx) => {
      const colorName = colors[idx];
      colorImagesMap[hex] = imagesByColor[colorName] || [firstImage];
    });
    
    return {
      id: apiProduct.id,
      name: apiProduct.name,
      description: apiProduct.description,
      img: firstImage,
      basePrice: parseFloat(apiProduct.price),
      price: parseFloat(apiProduct.price),
      sizes: sizes,
      colors: colorArray,
      colorNames: Object.fromEntries(colorArray.map((hex, i) => [hex, colors[i]])),
      colorImages: colorImagesMap,
      inStock: totalQuantity > 0,
      stockCount: totalQuantity,
      sku: `SKU-${apiProduct.id}`,
      material: apiProduct.description || 'Premium Quality',
      composition: '100% Cotton',
      modelInfo: `Available in ${sizes.length} sizes and ${colors.length} colors`,
      freeShippingThreshold: 2000,
      variants: variants, // Include raw variants for reference
      variantDetails: Object.fromEntries(
        colors.map(color => [
          color,
          variants
            .filter(v => v.color === color)
            .map(v => ({ size: v.size, quantity: v.quantity, imageUrl: v.imageUrl }))
        ])
      )
    };
  };

  // Fetch products for this category by categoryId
  useEffect(() => {
    setLoading(true);
    const categoryId = parseInt(category, 10);
    
    if (isNaN(categoryId)) {
      console.error("Invalid category ID");
      setLoading(false);
      return;
    }
    
    fetch(`http://localhost:3000/api/products/category/${categoryId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const transformedProducts = data.data.map(transformProduct);
          setProducts(transformedProducts);
          if (data.category) {
            setCategoryName(data.category.name);
          }
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
  }, [category]);

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
      // Guest: use sessionStorage
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
  if (sortBy === "low-high") filtered.sort((a,b) => a.basePrice - b.basePrice);
  else if (sortBy === "high-low") filtered.sort((a,b) => b.basePrice - a.basePrice);

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const heroTitle = categoryName || "Products";

  if (loading) return <div className="sh-page"><Header /><NavBar /><div className="sh-container" style={{textAlign:"center", padding:"4rem"}}>Loading products...</div><Footer /></div>;

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
          <div className="sh-filter-group">
            <label>Search</label>
            <input type="text" placeholder="Search by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="sh-search-input" />
          </div>
          <div className="sh-filter-group">
            <label>Max Price: Rs. {maxPrice.toLocaleString()}</label>
            <input type="range" min="0" max="10000" step="100" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="sh-price-slider" />
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
              {["S","M","L","XL","XXL","XXXL"].map(size => (
                <button key={size} className={`sh-size-filter-btn ${selectedSizeFilter === size ? "active" : ""}`} onClick={() => setSelectedSizeFilter(selectedSizeFilter === size ? null : size)}>{size}</button>
              ))}
            </div>
          </div>
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
                {visibleProducts.map(product => (
                  <ProductCard key={product.id} product={product} isWished={wishlist.includes(product.id)} onToggleWishlist={toggleWishlist} onOpenModal={setSelectedProduct} />
                ))}
              </div>
              {hasMore && (
                <div className="sh-load-more">
                  <button className="sh-load-btn" onClick={() => setVisibleCount(p => p + 6)}>Load More ({filtered.length - visibleCount} remaining)</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      <Footer />
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onToggleWishlist={toggleWishlist} isWished={wishlist.includes(selectedProduct.id)} />
      )}
      <WhatsAppButton context={{ page: category || "product" }} />
    </div>
  );
};

export default ProductPage;
