// Home.jsx (updated with Best Sellers section below New Arrivals)
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/whatsappbtn";
import NavBar from "../components/navsidebar";   // unchanged
import "./Home.css";
import { useNavigate } from "react-router-dom";
import cartService from "../services/cartService";

// ── Slideshow Data (unchanged) ─────────────────────────────────
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

// ── Product Data (unchanged) ───────────────────────────────────
const NEW_ARRIVALS = [
  {
    id: 1,
    name: "Crop Top",
    price: "2,999.00",
    colors: ["#111", "#f5f5dc", "#1a237e"],
    colorImages: {
      "#111": "/trousers/1.jpeg",
      "#f5f5dc": "/trousers/1-beige.jpg",
      "#1a237e": "/trousers/1-blue.jpg",
    },
    defaultImage: "/trousers/1.jpeg",
    description: "A stylish crop top made from premium cotton blend. Perfect for casual outings and summer days. Features a relaxed fit and breathable fabric.",
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "Tops",
  },
  {
    id: 2,
    name: "Wide Leg Jeans",
    price: "5,499.00",
    colors: ["#1a237e", "#f5f5dc", "#111"],
    colorImages: {
      "#1a237e": "/trousers/8.jpeg",
      "#f5f5dc": "/trousers/8-beige.jpg",
      "#111": "/trousers/8-black.jpg",
    },
    defaultImage: "/trousers/8.jpeg",
    description: "High-waisted wide leg jeans with a vintage wash. Made from durable denim with a comfortable stretch. Elevate your everyday look.",
    sizes: ["26", "28", "30", "32", "34"],
    category: "Bottoms",
  },
  {
    id: 3,
    name: "Casual Jacket",
    price: "7,499.00",
    colors: ["#b5651d", "#111", "#f5f5dc"],
    colorImages: {
      "#b5651d": "/trousers/3.jpeg",
      "#111": "/trousers/3-black.jpg",
      "#f5f5dc": "/trousers/3-beige.jpg",
    },
    defaultImage: "/trousers/3.jpeg",
    description: "Lightweight casual jacket with multiple pockets. Perfect for layering during transitional weather. Modern silhouette with classic details.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    category: "Outerwear",
  },
  {
    id: 4,
    name: "Striped Shirt",
    price: "3,999.00",
    colors: ["#e8c9a0", "#111", "#c2a87d"],
    colorImages: {
      "#e8c9a0": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80",
      "#111": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80",
      "#c2a87d": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80",
    },
    defaultImage: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80",
    description: "Classic striped button-down shirt. Soft cotton fabric with a relaxed fit. Versatile piece that works for both casual and semi-formal occasions.",
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "Shirts",
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
      "#f5f5dc": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80",
    },
    defaultImage: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80",
    description: "Timeless trench coat in water-resistant fabric. Double-breasted design with belt. A wardrobe essential for rainy days and elevated style.",
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "Outerwear",
  },
  {
    id: 6,
    name: "Sneaker Set",
    price: "11,999.00",
    colors: ["#fff", "#111", "#e53935"],
    colorImages: {
      "#fff": "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80",
      "#111": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
      "#e53935": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80",
    },
    defaultImage: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80",
    description: "Premium leather sneakers with cushioned sole. Classic design that pairs with everything. Includes extra set of laces in contrasting color.",
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    category: "Footwear",
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
      "#e8c9a0": "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80",
    },
    defaultImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80",
    description: "Flowing boho dress with embroidered details. Perfect for beach vacations and summer festivals. Lightweight and breathable fabric.",
    sizes: ["XS", "S", "M", "L"],
    category: "Dresses",
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
      "#4a6741": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&q=80",
    },
    defaultImage: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80",
    description: "Classic denim jacket with button closure. Medium wash with slight distressing. A timeless layering piece for any wardrobe.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    category: "Outerwear",
  },
];

const ALL_PRODUCTS = [...NEW_ARRIVALS, ...BEST_SELLERS];

const getSuggestedProducts = (excludeProductId = null, count = 4) => {
  let available = [...ALL_PRODUCTS];
  if (excludeProductId) available = available.filter((p) => p.id !== excludeProductId);
  return [...available].sort(() => 0.5 - Math.random()).slice(0, count);
};

// ── Product Popup Modal (unchanged) ────────────────────────────
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

// ── Slideshow (unchanged) ──────────────────────────────────────
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

// ── Product Grid (unchanged) ───────────────────────────────────
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

// ── You May Also Like (unchanged) ──────────────────────────────
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
      <ProductGrid items={suggestions} onProductClick={onProductClick} maxItems={4} showColorSwatches={true} />
    </div>
  );
}

// ── Home Page (updated with Best Sellers section) ──────────────
export default function Home() {
  const [activeTab, setActiveTab] = useState("New Arrivals");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [youMayAlsoLikeKey, setYouMayAlsoLikeKey] = useState(0);
  const [latestProducts, setLatestProducts] = useState(NEW_ARRIVALS);
  const [bestSellers, setBestSellers] = useState(BEST_SELLERS);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch latest 4 products from database
  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/category-data/latest-products');
        const data = await response.json();
        
        if (data.success && data.data && Array.isArray(data.data)) {
          const transformedProducts = data.data.map((product) => {
            const variants = product.variants || [];
            const uniqueColors = [...new Set(variants.map(v => v.color))];
            const uniqueSizes = [...new Set(variants.map(v => v.size))];
            const colorImages = {};
            uniqueColors.forEach(color => {
              const variant = variants.find(v => v.color === color);
              if (variant?.imageUrl) {
                colorImages[color] = variant.imageUrl;
              }
            });
            const firstImage = variants[0]?.imageUrl || '/trousers/default.jpeg';
            return {
              id: product.productId,
              name: product.productName,
              price: parseFloat(product.price).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              colors: uniqueColors,
              colorImages: colorImages,
              defaultImage: firstImage,
              img: firstImage,
              description: product.description || 'Premium quality product',
              sizes: uniqueSizes,
              category: product.categoryName,
            };
          });
          setLatestProducts(transformedProducts);
        }
      } catch (error) {
        console.error('Error fetching latest products:', error);
        setLatestProducts(NEW_ARRIVALS);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProducts();
  }, []);

  // Fetch best-selling products from database
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/category-data/best-sellers');
        const data = await response.json();
        
        if (data.success && data.data && Array.isArray(data.data)) {
          const transformedBestSellers = data.data.map((product) => {
            const variants = product.variants || [];
            const uniqueColors = [...new Set(variants.map(v => v.color))];
            const uniqueSizes = [...new Set(variants.map(v => v.size))];
            const colorImages = {};
            uniqueColors.forEach(color => {
              const variant = variants.find(v => v.color === color);
              if (variant?.imageUrl) {
                colorImages[color] = variant.imageUrl;
              }
            });
            const firstImage = variants[0]?.imageUrl || '/trousers/default.jpeg';
            return {
              id: product.productId,
              name: product.productName,
              price: parseFloat(product.price).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              colors: uniqueColors,
              colorImages: colorImages,
              defaultImage: firstImage,
              img: firstImage,
              description: product.description || 'Premium quality product',
              sizes: uniqueSizes,
              category: product.categoryName,
              totalSold: product.totalSold || 0
            };
          });
          setBestSellers(transformedBestSellers);
        }
      } catch (error) {
        console.error('Error fetching best sellers:', error);
        setBestSellers(BEST_SELLERS);
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
    ? {
        productName: selectedProduct.name,
        category: selectedProduct.category,
        price: selectedProduct.price,
        page: "home",
      }
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

            {/* ── NEW ARRIVALS SECTION ── */}
            <div className="home-section">
              <div className="home-section-header">
                <h2 className="home-section-title">NEW ARRIVALS</h2>
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
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <p>Loading latest products...</p>
                </div>
              ) : (
                <ProductGrid items={latestProducts} onProductClick={handleProductClick} maxItems={4} />
              )}
            </div>

            {/* ── NEW BEST SELLERS SECTION (updated with database data) ── */}
            <div className="home-section">
              <div className="home-section-header">
                <h2 className="home-section-title">BEST SELLERS</h2>
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
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <p>Loading best sellers...</p>
                </div>
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
            <img src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=85" alt="Gifts" className="home-cat-img" />
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
      <WhatsAppButton context={whatsappContext} />
      {selectedProduct && <ProductPopup product={selectedProduct} onClose={handleClosePopup} />}
    </div>
  );
}
