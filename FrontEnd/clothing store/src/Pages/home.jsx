// Home.jsx – Clean version, uses only categoryDataController for New Arrivals & Best Sellers
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/whatsappbtn";
import NavBar from "../components/navsidebar";
import "./Home.css";
import { useNavigate, useLocation } from "react-router-dom";
import cartService from "../services/cartService";

// ── Slideshow Data ─────────────────────────────────────────────
const SLIDES = [
  { img: "/splash1.jpg", tag: "New Collection 2026", title: "Style That Speaks\nFor You", sub: "Discover the latest trends curated for every occasion." },
  { img: "/splash2.jpg", tag: "Men's Fashion", title: "Elegance In\nEvery Detail", sub: "Premium men's wear for the modern lifestyle." },
  { img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1400&q=85", tag: "Top Sales", title: "Fashion Made\nFor You", sub: "Explore outfits designed to keep you stylish and comfortable." },
  { img: "splash4.jpg", tag: "Men's Collection", title: "Own The Look,\nOwn The Moment", sub: "Fashion that helps you stand out effortlessly." },
];

// ── Helper: transform backend product to frontend format ──────
const transformProduct = (backendProduct) => {
  const variants = backendProduct.variants || [];
  const uniqueColors = [...new Set(variants.map(v => v.color))];
  const uniqueSizes = [...new Set(variants.map(v => v.size))];
  const colorImages = {};
  uniqueColors.forEach(color => {
    const variant = variants.find(v => v.color === color);
    if (variant?.imageUrl) colorImages[color] = variant.imageUrl;
  });
  const firstImage = variants[0]?.imageUrl || '/trousers/default.jpeg';

  return {
    id: backendProduct.productId,
    name: backendProduct.productName,
    price: parseFloat(backendProduct.price).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    colors: uniqueColors,
    colorImages: colorImages,
    defaultImage: firstImage,
    img: firstImage,
    description: backendProduct.description || 'Premium quality product',
    sizes: uniqueSizes,
    category: backendProduct.categoryName,
    totalSold: backendProduct.totalSold || 0
  };
};

// ── Product Popup Modal ───────────────────────────────────────
function ProductPopup({ product, onClose }) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(
    product.colorImages?.[product.colors?.[0]] || product.defaultImage || product.img
  );

  if (!product) return null;

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setCurrentImage(product.colorImages?.[color] || product.defaultImage || product.img);
  };

  const handleAddToCart = async () => {
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
        price: parseFloat(product.price.replace(/,/g, "")),
        imageUrl: currentImage,
        color: selectedColor,
        size: selectedSize,
        quantity: quantity
      };

      const response = await cartService.addToCart(cartData);
      if (response.success) {
        alert("Product added to cart successfully!");
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        onClose();
      } else {
        alert("Failed to add product to cart: " + response.message);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("An error occurred. Please try again.");
    }
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
            {product.colors?.length > 0 && (
              <div className="home-popup-colors">
                <label>Color</label>
                <div className="home-popup-color-swatches">
                  {product.colors.map((color, idx) => (
                    <button
                      key={idx}
                      className={`home-popup-swatch ${selectedColor === color ? "active" : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                      aria-label={`Color ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}
            {product.sizes?.length > 0 && (
              <div className="home-popup-sizes">
                <label>Size</label>
                <div className="home-popup-size-buttons">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`home-popup-size ${selectedSize === size ? "active" : ""}`}
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
              ADD TO CART — Rs.{" "}
              {(parseFloat(product.price.replace(/,/g, "")) * quantity).toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Slideshow ─────────────────────────────────────────────────
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <button className="home-slide-arrow right" onClick={next}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
      </button>
      <div className="home-slide-dots">
        {SLIDES.map((_, i) => (
          <button key={i} className={`home-dot ${i === current ? "active" : ""}`} onClick={() => setCurrent(i)} />
        ))}
      </div>
    </div>
  );
}

// ── Product Grid (unchanged) ──────────────────────────────────
function ProductGrid({ items, onProductClick, maxItems = null, showColorSwatches = true }) {
  const [selectedColors, setSelectedColors] = useState({});
  const [productImages, setProductImages] = useState({});

  useEffect(() => {
    const imgs = {}, cols = {};
    items.forEach((item) => {
      imgs[item.id] = item.colorImages?.[item.colors?.[0]] || item.defaultImage || item.img;
      cols[item.id] = item.colors?.[0] || null;
    });
    setProductImages(imgs);
    setSelectedColors(cols);
  }, [items]);

  const handleColorChange = (itemId, color, e) => {
    e.stopPropagation();
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    setSelectedColors((prev) => ({ ...prev, [itemId]: color }));
    setProductImages((prev) => ({
      ...prev,
      [itemId]: item.colorImages?.[color] || item.defaultImage || item.img,
    }));
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

// ── You May Also Like (backend only, no fallback) ─────────────
function YouMayAlsoLike({ onProductClick, excludeProductId = null }) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/you-may-also-like');
        const data = await response.json();
        if (data.success && data.data && Array.isArray(data.data)) {
          let filteredData = data.data;
          if (excludeProductId) filteredData = filteredData.filter(p => p.id !== excludeProductId);
          setSuggestions(filteredData.slice(0, 4));
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching You May Also Like:', error);
        setSuggestions([]);
      }
    };
    fetchRecommendations();
  }, [excludeProductId]);

  return (
    <div className="home-section home-you-may-like-section">
      <div className="home-section-header">
        <h2 className="home-section-title">YOU MAY ALSO LIKE</h2>
      </div>
      <ProductGrid items={suggestions} onProductClick={onProductClick} maxItems={4} showColorSwatches={true} />
    </div>
  );
}

// ── Home Page (fully cleaned) ─────────────────────────────────
export default function Home() {
  const [activeTab, setActiveTab] = useState("New Arrivals");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [youMayAlsoLikeKey, setYouMayAlsoLikeKey] = useState(0);
  const [latestProducts, setLatestProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingBest, setLoadingBest] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to hash if present
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location]);

  // Fetch New Arrivals (latest 4 products) – uses categoryDataController
  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/category-data/latest-products');
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setLatestProducts(data.data.map(transformProduct));
        } else {
          setLatestProducts([]);
        }
      } catch (error) {
        console.error('Error fetching latest products:', error);
        setLatestProducts([]);
      } finally {
        setLoadingLatest(false);
      }
    };
    fetchLatestProducts();
  }, []);

  // Fetch Best Sellers (top 4 from order history) – uses categoryDataController
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/category-data/best-sellers');
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setBestSellers(data.data.map(transformProduct));
        } else {
          setBestSellers([]);
        }
      } catch (error) {
        console.error('Error fetching best sellers:', error);
        setBestSellers([]);
      } finally {
        setLoadingBest(false);
      }
    };
    fetchBestSellers();
  }, []);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setYouMayAlsoLikeKey((prev) => prev + 1);
  };

  const handleClosePopup = () => setSelectedProduct(null);

  const whatsappContext = selectedProduct
    ? { productName: selectedProduct.name, category: selectedProduct.category, price: selectedProduct.price, page: "home" }
    : { page: "home" };

  const currentProductId = selectedProduct?.id || null;

  return (
    <div className="home-page">
      <Header onProductClick={handleProductClick} />
      <main className="home-main">
        <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="home-content-area">
          <div className="home-right">
            <div className="home-slideshow-area">
              <Slideshow />
            </div>

            {/* NEW ARRIVALS – from categoryDataController */}
            <div className="home-section" id="new-arrivals">
              <div className="home-section-header">
                <h2 className="home-section-title">NEW ARRIVALS</h2>
              </div>
              {loadingLatest ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading latest products...</div>
              ) : (
                <ProductGrid items={latestProducts} onProductClick={handleProductClick} maxItems={4} />
              )}
            </div>

            {/* BEST SELLERS – from categoryDataController */}
            <div className="home-section" id="best-sellers">
              <div className="home-section-header">
                <h2 className="home-section-title">BEST SELLERS</h2>
              </div>
              {loadingBest ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading best sellers...</div>
              ) : (
                <ProductGrid items={bestSellers} onProductClick={handleProductClick} maxItems={4} />
              )}
            </div>

            <YouMayAlsoLike
              key={youMayAlsoLikeKey}
              onProductClick={handleProductClick}
              excludeProductId={currentProductId}
            />
          </div>
        </div>
      </main>

      {/* SHOPPING BY CATEGORY GRID – unchanged */}
      <div className="home-shop-category">
        <p className="home-shop-category-label">Shopping By Category</p>
        <div className="home-cat-top-row">
          <div className="home-cat-card home-cat-mens" onClick={() => navigate("/category")}>
            <img src="/mens.jpg" alt="Mens" className="home-cat-img" />
            <div className="home-cat-overlay" />
            <div className="home-cat-label-wrap">
              <span className="home-cat-text home-cat-text-white">MENS</span>
            </div>
          </div>
          <div className="home-cat-card home-cat-gifts" onClick={() => navigate("/category")}>
            <img src="/mens_cover_page.jpg" alt="Mens Wear" className="home-cat-img" />
            <div className="home-cat-overlay" />
            <div className="home-cat-label-wrap">
              <span className="home-cat-text home-cat-text-white">Mens_Wear</span>
            </div>
          </div>
        </div>
        <div className="home-cat-bottom-row" onClick={() => navigate("/category/10")}>
          <div className="home-cat-bottom-img-wrap">
            <img src="/perfum.jpg" alt="Men Accessories 1" className="home-cat-img" />
          </div>
          <div className="home-cat-bottom-img-wrap">
            <img src="/acc1.jpg" alt="Men Accessories 2" className="home-cat-img" />
          </div>
          <div className="home-cat-bottom-img-wrap">
            <img src="/caps.jpg" alt="Men Accessories 3" className="home-cat-img" />
          </div>
          <div className="home-cat-bottom-overlay" />
          <div className="home-cat-bottom-label">
            <span className="home-cat-text home-cat-text-dark">MEN'S</span>
            <span className="home-cat-text home-cat-text-accent">ACCESSORIES</span>
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppButton context={whatsappContext} />
      {selectedProduct && <ProductPopup product={selectedProduct} onClose={handleClosePopup} />}
    </div>
  );
}
