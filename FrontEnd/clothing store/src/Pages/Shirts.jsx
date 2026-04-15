import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Shirts.css";

// ── Shirt Products Data ──────────────────────────────────────────
const SHIRTS_DATA = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
    name: "Oxford Button-Down Shirt",
    price: "Rs 2,895.00",
    colors: ["#ffffff", "#1a1a2e", "#4a7c59"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    available: [true, true, true, true, false],
    inStock: true,
    installment: "965",
    payzInstallment: "724",
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
    name: "Slim Fit Formal Shirt – White",
    price: "Rs 3,490.00",
    colors: ["#ffffff", "#d4c5a9"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    available: [true, true, true, false, false],
    inStock: true,
    installment: "1,163",
    payzInstallment: "873",
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=80",
    name: "Linen Summer Shirt – Sky Blue",
    price: "Rs 3,290.00",
    colors: ["#87ceeb", "#ffffff", "#f5f5dc"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    available: [false, true, true, true, false],
    inStock: true,
    installment: "1,097",
    payzInstallment: "823",
  },
  {
    id: 4,
    img: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600&q=80",
    name: "Plaid Flannel Shirt – Navy",
    price: "Rs 3,490.00",
    colors: ["#1a237e", "#8b0000", "#2e7d32"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    available: [true, true, false, true, true],
    inStock: false,
    installment: "1,163",
    payzInstallment: "873",
  },
  {
    id: 5,
    img: "https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=600&q=80",
    name: "Classic Denim Shirt",
    price: "Rs 3,990.00",
    colors: ["#5b7fa6", "#1a1a2e"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    available: [true, true, true, true, false],
    inStock: true,
    installment: "1,330",
    payzInstallment: "998",
  },
  {
    id: 6,
    img: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80",
    name: "Casual Polo Shirt – Olive",
    price: "Rs 2,490.00",
    colors: ["#556b2f", "#1a1a2e", "#ffffff"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    available: [false, true, true, true, false],
    inStock: true,
    installment: "830",
    payzInstallment: "623",
  },
  {
    id: 7,
    img: "https://images.unsplash.com/photo-1630329374405-28f8a96fbc74?w=600&q=80",
    name: "Mandarin Collar Shirt – Black",
    price: "Rs 3,190.00",
    colors: ["#1a1a1a", "#ffffff"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    available: [true, true, true, false, false],
    inStock: true,
    installment: "1,063",
    payzInstallment: "798",
  },
  {
    id: 8,
    img: "https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=600&q=80",
    name: "Hawaiian Print Shirt",
    price: "Rs 2,990.00",
    colors: ["#ff6b35", "#2e8b57", "#4169e1"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    available: [true, false, true, true, false],
    inStock: false,
    installment: "997",
    payzInstallment: "748",
  },
];

// ── ProductCard ──────────────────────────────────────────────────
function ProductCard({ product }) {
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);

  return (
    <div className="shirts-product-card">
      {/* Stock badge */}
      <div className={`shirts-stock-badge ${product.inStock ? "in-stock" : "out-of-stock"}`}>
        {product.inStock ? "In Stock" : "Out of Stock"}
      </div>

      {/* Card actions overlay */}
      <div className="shirts-card-actions">
        <button className="shirts-card-action-btn" title="Add to Wishlist">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <button className="shirts-card-action-btn" title="Quick View">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>

      {/* Product image */}
      <div className="shirts-img-wrap">
        <img src={product.img} alt={product.name} className="shirts-product-img" />
      </div>

      {/* Product info */}
      <div className="shirts-product-info">
        <h3 className="shirts-product-name">{product.name}</h3>

        <div className="shirts-price-row">
          <span className="shirts-price">{product.price}</span>
          <button className="shirts-edit-price">Edit price</button>
        </div>

        <div className="shirts-payment-options">
          <span className="shirts-pay-text">or pay in 3 x </span>
          <span className="shirts-pay-amount">Rs {product.installment}</span>
          <span className="shirts-pay-text"> with </span>
          <span className="shirts-pay-badge koko">KOKO</span>
        </div>
        <div className="shirts-payment-options">
          <span className="shirts-pay-text">3 x Rs {product.installment} or 3% Cashback with </span>
          <span className="shirts-pay-badge mintpay">mintpay</span>
        </div>
        <div className="shirts-payment-options">
          <span className="shirts-pay-text">up to 4 x Rs {product.payzInstallment} with </span>
          <span className="shirts-pay-badge payz">PayZ</span>
        </div>

        {/* Colors */}
        <div className="shirts-colors-section">
          <span className="shirts-label">COLORS</span>
          <div className="shirts-colors">
            {product.colors.map((color, i) => (
              <button
                key={i}
                className={`shirts-color-dot ${selectedColor === i ? "selected" : ""}`}
                style={{ background: color, border: color === "#ffffff" ? "1px solid #ccc" : "none" }}
                onClick={() => setSelectedColor(i)}
              />
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div className="shirts-sizes">
          {product.sizes.map((size, i) => (
            <button
              key={size}
              className={`shirts-size-btn ${product.available[i] ? "available" : "unavailable"} ${selectedSize === size ? "selected" : ""}`}
              onClick={() => product.available[i] && setSelectedSize(size)}
              disabled={!product.available[i]}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Availability */}
        <div className={`shirts-availability ${product.inStock ? "available" : "unavailable"}`}>
          <span className="shirts-availability-dot" />
          {product.inStock ? "Available" : "Out of Stock"}
        </div>
      </div>
    </div>
  );
}

// ── Shirts Page ──────────────────────────────────────────────────
export default function Shirts() {
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [priceMin, setPriceMin] = useState("0");
  const [priceMax, setPriceMax] = useState("10000");
  const [filterInStock, setFilterInStock] = useState(true);
  const [filterOutOfStock, setFilterOutOfStock] = useState(true);
  const [perPage, setPerPage] = useState("10");
  const [sortBy, setSortBy] = useState("Date, new to old");
  const [sortOpen, setSortOpen] = useState(false);
  const [perPageOpen, setPerPageOpen] = useState(false);

  const SIZES = ["S", "M", "L", "XL", "XXL"];
  const SORT_OPTIONS = ["Date, new to old", "Date, old to new", "Price, low to high", "Price, high to low"];
  const PER_PAGE_OPTIONS = ["10", "20", "30", "50"];

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Filter products
  const filteredProducts = SHIRTS_DATA.filter((p) => {
    const priceNum = parseInt(p.price.replace(/[^0-9]/g, ""));
    const withinPrice = priceNum >= parseInt(priceMin || 0) && priceNum <= parseInt(priceMax || 99999);
    const stockOk = (filterInStock && p.inStock) || (filterOutOfStock && !p.inStock);
    const sizeOk = selectedSizes.length === 0 || p.sizes.some((s, i) => selectedSizes.includes(s) && p.available[i]);
    return withinPrice && stockOk && sizeOk;
  });

  return (
    <div className="shirts-page">
      <Header />

      <div className="shirts-layout">
        {/* ── LEFT SIDEBAR ── */}
        <aside className="shirts-sidebar">
          <p className="shirts-sidebar-title">FILTERS</p>

          {/* Size filter */}
          <div className="shirts-filter-section">
            <p className="shirts-filter-label">SIZE</p>
            <div className="shirts-size-filter-grid">
              {SIZES.map((size) => (
                <button
                  key={size}
                  className={`shirts-size-filter-btn ${selectedSizes.includes(size) ? "active" : ""}`}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div className="shirts-filter-section">
            <p className="shirts-filter-label">PRICE RANGE (RS)</p>
            <div className="shirts-price-inputs">
              <div className="shirts-price-row-input">
                <span className="shirts-price-label-sm">Min</span>
                <input
                  type="number"
                  className="shirts-price-input"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                />
              </div>
              <div className="shirts-price-row-input">
                <span className="shirts-price-label-sm">Max</span>
                <input
                  type="number"
                  className="shirts-price-input"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                />
              </div>
            </div>
            <button className="shirts-apply-btn">Apply</button>
          </div>

          {/* Availability */}
          <div className="shirts-filter-section">
            <p className="shirts-filter-label">AVAILABILITY</p>
            <label className="shirts-checkbox-label">
              <input
                type="checkbox"
                checked={filterInStock}
                onChange={(e) => setFilterInStock(e.target.checked)}
              />
              <span>In Stock</span>
            </label>
            <label className="shirts-checkbox-label">
              <input
                type="checkbox"
                checked={filterOutOfStock}
                onChange={(e) => setFilterOutOfStock(e.target.checked)}
              />
              <span>Out of Stock</span>
            </label>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="shirts-main">
          {/* Breadcrumb */}
          <div className="shirts-breadcrumb">
            <span className="shirts-breadcrumb-link">Home</span>
            <span className="shirts-breadcrumb-sep">›</span>
            <span className="shirts-breadcrumb-link">Men</span>
            <span className="shirts-breadcrumb-sep">›</span>
            <span className="shirts-breadcrumb-current">Shirts</span>
          </div>

          {/* Page title + toolbar */}
          <div className="shirts-toolbar">
            <h1 className="shirts-page-title">
              Shirts<span className="shirts-title-accent">.</span>
            </h1>

            <div className="shirts-toolbar-right">
              <span className="shirts-count">{filteredProducts.length} products found</span>

              {/* Per page */}
              <div className="shirts-select-wrap">
                <span className="shirts-select-label">PER PAGE</span>
                <div className="shirts-custom-select" onClick={() => { setPerPageOpen(!perPageOpen); setSortOpen(false); }}>
                  <span>{perPage}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                  {perPageOpen && (
                    <div className="shirts-select-dropdown">
                      {PER_PAGE_OPTIONS.map((opt) => (
                        <div key={opt} className="shirts-select-option" onClick={() => { setPerPage(opt); setPerPageOpen(false); }}>
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sort by */}
              <div className="shirts-select-wrap">
                <span className="shirts-select-label">SORT BY</span>
                <div className="shirts-custom-select shirts-sort-select" onClick={() => { setSortOpen(!sortOpen); setPerPageOpen(false); }}>
                  <span>{sortBy}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                  {sortOpen && (
                    <div className="shirts-select-dropdown">
                      {SORT_OPTIONS.map((opt) => (
                        <div key={opt} className="shirts-select-option" onClick={() => { setSortBy(opt); setSortOpen(false); }}>
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <p className="shirts-products-found">{filteredProducts.length} products found</p>

          {/* Product grid */}
          <div className="shirts-product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}