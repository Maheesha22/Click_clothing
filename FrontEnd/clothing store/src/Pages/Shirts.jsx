import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Shirts.css";
import { useNavigate } from "react-router-dom";


// ── Product Data ────────────────────────────────────────────────
const ALL_PRODUCTS = [
  { id:1,  name:"Classic Oxford Shirt – White",       basePrice:2495, sizes:["S","M","L","XL","XXL"],        inStock:true,  colors:["#ffffff","#d4c5a9","#1a3a5c"], img:"https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=82",
    colorImgs:["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=82","https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=82","https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=82"] },
  { id:2,  name:"Slim Fit Formal Shirt – Sky Blue",   basePrice:2890, sizes:["S","M","L","XL"],              inStock:true,  colors:["#87ceeb","#ffffff","#c4e0f3"], img:"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=82",
    colorImgs:["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=82","https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=82","https://images.unsplash.com/photo-1512327536842-5aa37d1ba3e3?w=600&q=82"] },
  { id:3,  name:"Linen Relaxed Shirt – Ecru",         basePrice:3290, sizes:["M","L","XL","XXL"],            inStock:true,  colors:["#ece8dc","#d4c5a9","#c4a882"], img:"https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=82",
    colorImgs:["https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=82","https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=82","https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=600&q=82"] },
  { id:4,  name:"Plaid Flannel Shirt – Forest",       basePrice:3490, sizes:["S","M","L","XL","XXL"],        inStock:false, colors:["#2e5e3e","#6b3a2a","#1a3a5c"], img:"https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600&q=82",
    colorImgs:["https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600&q=82","https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=600&q=82","https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=82"] },
  { id:5,  name:"Classic Denim Shirt – Indigo",       basePrice:3990, sizes:["S","M","L","XL","XXL","XXXL"], inStock:true,  colors:["#3b5998","#1a1a2e","#5b7fa6"], img:"https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=600&q=82",
    colorImgs:["https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=600&q=82","https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=82","https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=82"] },
  { id:6,  name:"Casual Polo Shirt – Olive",          basePrice:2190, sizes:["S","M","L","XL"],              inStock:true,  colors:["#6b7a3e","#1a1a1a","#8b3a2a"], img:"https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&q=82",
    colorImgs:["https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&q=82","https://images.unsplash.com/photo-1630329374405-28f8a96fbc74?w=600&q=82","https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=82"] },
  { id:7,  name:"Mandarin Collar Shirt – Black",      basePrice:3190, sizes:["M","L","XL","XXL"],            inStock:true,  colors:["#111111","#333333","#555555"], img:"https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=82",
    colorImgs:["https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=82","https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=82","https://images.unsplash.com/photo-1630329374405-28f8a96fbc74?w=600&q=82"] },
  { id:8,  name:"Hawaiian Print Shirt – Coral",       basePrice:2890, sizes:["S","M","L","XL","XXL"],        inStock:false, colors:["#e8836a","#2e8b57","#4169e1"], img:"https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=600&q=82",
    colorImgs:["https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=600&q=82","https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=82","https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&q=82"] },
  { id:9,  name:"Slim Fit Dress Shirt – Charcoal",    basePrice:3590, sizes:["S","M","L","XL"],              inStock:true,  colors:["#444444","#111111","#666666"], img:"https://images.unsplash.com/photo-1630329374405-28f8a96fbc74?w=600&q=82",
    colorImgs:["https://images.unsplash.com/photo-1630329374405-28f8a96fbc74?w=600&q=82","https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=82","https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=82"] },
  { id:10, name:"Relaxed Linen Shirt – Sage",         basePrice:2650, sizes:["M","L","XL","XXL"],            inStock:true,  colors:["#8fad8a","#f5f5f0","#d4c5a9"], img:"https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=82",
    colorImgs:["https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=82","https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=82","https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=82"] },
  { id:11, name:"Premium Twill Shirt – Navy",         basePrice:4490, sizes:["S","M","L","XL","XXL","XXXL"], inStock:true,  colors:["#1a3a5c","#111111","#2c4a7c"], img:"https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=82",
    colorImgs:["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=82","https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=82","https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=600&q=82"] },
  { id:12, name:"Oversized Oxford Shirt – Blush",     basePrice:2990, sizes:["S","M","L"],                   inStock:false, colors:["#e8c5c5","#f5f0eb","#d4a5a5"], img:"https://images.unsplash.com/photo-1512327536842-5aa37d1ba3e3?w=600&q=82",
    colorImgs:["https://images.unsplash.com/photo-1512327536842-5aa37d1ba3e3?w=600&q=82","https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=82","https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=82"] },
  { id:13, name:"Wide Collar Shirt – Cream",          basePrice:3150, sizes:["M","L","XL","XXL","XXXL"],     inStock:true,  colors:["#fffaed","#f5f5f0","#c4a882"], img:"https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=82",
    colorImgs:["https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=82","https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=82","https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=600&q=82"] },
  { id:14, name:"Slim Fit Check Shirt – Burgundy",    basePrice:2895, sizes:["S","M","L","XL"],              inStock:true,  colors:["#6b2737","#1a3a5c","#111111"], img:"https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=82",
    colorImgs:["https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=82","https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=82","https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=82"] },
  { id:15, name:"Tailored Poplin Shirt – White",      basePrice:3890, sizes:["S","M","L","XL","XXL"],        inStock:true,  colors:["#ffffff","#f5f5f0","#e8e0d4"], img:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=82",
    colorImgs:["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=82","https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=82","https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=82"] },
  { id:16, name:"Utility Shirt – Khaki",              basePrice:2750, sizes:["M","L","XL","XXL"],            inStock:true,  colors:["#b5a47a","#8a7a5a","#6b6040"], img:"https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=600&q=82",
    colorImgs:["https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=600&q=82","https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=82","https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=600&q=82"] },
  { id:17, name:"Camp Collar Shirt – Ecru",           basePrice:3350, sizes:["S","M","L","XL","XXL","XXXL"], inStock:false, colors:["#ece8dc","#d4c5a9","#c4b89a"], img:"https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=82",
    colorImgs:["https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=82","https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=82","https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=82"] },
  { id:18, name:"Performance Stretch Shirt – Black",  basePrice:3690, sizes:["S","M","L","XL","XXL"],        inStock:true,  colors:["#111111","#1a3a5c","#444444"], img:"https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=82",
    colorImgs:["https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=82","https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=82","https://images.unsplash.com/photo-1630329374405-28f8a96fbc74?w=600&q=82"] },
  { id:19, name:"Corduroy Overshirt – Rust",          basePrice:4100, sizes:["M","L","XL","XXL"],            inStock:true,  colors:["#8b3a2a","#6b2737","#111111"], img:"https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=82",
    colorImgs:["https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=82","https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=82","https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=82"] },
  { id:20, name:"Short Sleeve Linen Shirt – Aqua",    basePrice:2490, sizes:["S","M","L","XL","XXL"],        inStock:true,  colors:["#5fb3b3","#87ceeb","#f5f5f0"], img:"https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=82",
    colorImgs:["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=82","https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=82","https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=82"] },
];

const ALL_SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"];

const MEN_MENU = [
  { label: "Sarong",      page: "sarong"   },
  { label: "Trousers",    page: "trousers" },
  { label: "Shirts",      page: "shirts"   },
  { label: "T-Shirts",    page: "tshirts"  },
  { label: "Shorts",      page: "shorts"   },
  { label: "Accessories", sub: ["Caps", "Perfume", "Deodorant"] },
];

const NAV_TABS = [
  { label: "New Arrivals" },
  { label: "Best Sellers" },
  { label: "Men", menu: MEN_MENU },
  { label: "Gifts" },
  { label: "Men Accessories" },
  { label: "Recently Viewed" },
  { label: "Search History" },
];

function navigateTo(page) {
  window.dispatchEvent(new CustomEvent("navigate", { detail: page }));
}

// ── Icons ───────────────────────────────────────────────────────
const HeartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const ZoomInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);
const ZoomOutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);


// ── Color Swatch Strip (on card) ─────────────────────────────────
function ColorSwatches({ colors, selColor, onSelect }) {
  const LIGHT = new Set(["#f5f5f0","#ece8dc","#ffffff","#fffaed","#f5f0eb","#c4e0f3","#e8c5c5","#d4a5a5"]);
  return (
    <div className="sh-color-row">
      {colors.map((c, i) => (
        <button
          key={i}
          title={c}
          className={`sh-color-swatch ${selColor === c ? "active" : ""}`}
          style={{ background: c, border: LIGHT.has(c) ? "1.5px solid #ccc" : "1.5px solid transparent" }}
          onClick={(e) => { e.stopPropagation(); onSelect(selColor === c ? null : c); }}
        />
      ))}
    </div>
  );
}


// ── Admin: Add Color Panel ───────────────────────────────────────
function AddColorPanel({ onAdd, onClose }) {
  const [hex, setHex] = useState("#000000");
  const [manual, setManual] = useState("#000000");

  function sync(val) { setHex(val); setManual(val); }
  function handleManual(val) {
    setManual(val);
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) setHex(val);
  }

  return (
    <div className="sh-addcolor-panel">
      <div className="sh-addcolor-title">Add New Color</div>
      <div className="sh-addcolor-row">
        <input type="color" value={hex} onChange={(e) => sync(e.target.value)} className="sh-color-picker" />
        <input type="text" value={manual} maxLength={7} placeholder="#rrggbb"
          onChange={(e) => handleManual(e.target.value)} className="sh-color-hex-input" />
        <div className="sh-color-preview" style={{ background: hex }} />
      </div>
      <div className="sh-addcolor-btns">
        <button className="sh-addcolor-confirm" onClick={() => { onAdd(hex); onClose(); }}>Add Color</button>
        <button className="sh-addcolor-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}


// ── Product Modal ────────────────────────────────────────────────
function ProductModal({ product, price, extraColors, onAddColor, onRemoveColor, onClose }) {
  const [zoom, setZoom]             = useState(1);
  const [selColor, setSelColor]     = useState(null);
  const [addingColor, setAddingColor] = useState(false);

  // ── ADDED: track which image is currently displayed ──────────
  const [displayImg, setDisplayImg] = useState(product.img);

  const allColors = [...product.colors, ...extraColors];
  const ZOOM_STEP = 0.25, MAX_ZOOM = 3, MIN_ZOOM = 1;
  const LIGHT = new Set(["#f5f5f0","#ece8dc","#ffffff","#fffaed","#f5f0eb","#c4e0f3","#e8c5c5","#d4a5a5"]);

  const handleZoomIn  = (e) => { e.stopPropagation(); setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM)); };
  const handleZoomOut = (e) => { e.stopPropagation(); setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM)); };

  // ── ADDED: when color is selected, swap image and reset zoom ──
  function handleColorSelect(color, colorIndex) {
    const isDeselecting = selColor === color;
    setSelColor(isDeselecting ? null : color);
    setZoom(1);
    if (isDeselecting) {
      setDisplayImg(product.img);
    } else {
      const mapped = product.colorImgs && product.colorImgs[colorIndex];
      setDisplayImg(mapped || product.img);
    }
  }

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="sh-modal-overlay" onClick={onClose}>
      <div className="sh-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="sh-modal-close" onClick={onClose}><CloseIcon /></button>

        {/* Image pane */}
        <div className="sh-modal-imgpane">
          <div className="sh-modal-imgscroll">
            {/* CHANGED: src now uses displayImg instead of product.img */}
            <img src={displayImg} alt={product.name}
              style={{ transform: `scale(${zoom})`, transition: "transform .25s ease" }}
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80"; }} />
          </div>
          <div className="sh-modal-zoom">
            <button onClick={handleZoomOut} disabled={zoom <= MIN_ZOOM} title="Zoom out"><ZoomOutIcon /></button>
            <span className="sh-modal-zoomlvl">{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn}  disabled={zoom >= MAX_ZOOM} title="Zoom in"><ZoomInIcon /></button>
          </div>
        </div>

        {/* Info pane */}
        <div className="sh-modal-info">
          <span className={`sh-modal-badge ${product.inStock ? "in" : "out"}`}>
            {product.inStock ? "In Stock" : "Out of Stock"}
          </span>
          <h2 className="sh-modal-name">{product.name}</h2>
          <div className="sh-modal-price">Rs {price.toLocaleString()}.00</div>

          <div>
            <div className="sh-modal-sizelbl">Available Colors</div>
            <div className="sh-modal-colors-wrap">
              {allColors.map((c, i) => {
                const isExtra = i >= product.colors.length;
                return (
                  <div key={i} className="sh-modal-swatch-wrap">
                    <button
                      title={c}
                      className={`sh-modal-swatch ${selColor === c ? "active" : ""}`}
                      style={{ background: c, border: LIGHT.has(c) ? "2px solid #ccc" : "2px solid transparent" }}
                      // CHANGED: calls handleColorSelect instead of inline setSelColor
                      onClick={() => handleColorSelect(c, i)}
                    />
                    {isExtra && (
                      <button className="sh-modal-swatch-del" title="Remove color"
                        onClick={() => onRemoveColor(i - product.colors.length)}>
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                );
              })}
              {!addingColor && (
                <button className="sh-modal-addcolor-btn" title="Add new color" onClick={() => setAddingColor(true)}>
                  <PlusIcon />
                </button>
              )}
            </div>
            {addingColor && <AddColorPanel onAdd={onAddColor} onClose={() => setAddingColor(false)} />}
          </div>

          <div>
            <div className="sh-modal-sizelbl">Available Sizes</div>
            <div className="sh-modal-sizes">
              {ALL_SIZES.map((s) => {
                const has = product.sizes.includes(s);
                return <span key={s} className={`sh-modal-sz ${has ? "avail" : "na"}`}>{s}</span>;
              })}
            </div>
          </div>

          <div className="sh-modal-emi">
            or pay in 3 x <strong>Rs {Math.round(price / 3).toLocaleString()}</strong> with <span className="sh-koko">KOKO</span><br />
            3 x <strong>Rs {Math.round(price / 3).toLocaleString()}</strong> or 3% Cashback with <span className="sh-mint">mintpay</span><br />
            up to 4 x <strong>Rs {Math.round(price / 4).toLocaleString()}</strong> with <span className="sh-payzy">PayZy</span>
          </div>

          <button className="sh-modal-atc" disabled={!product.inStock}>
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ── Tab Bar ─────────────────────────────────────────────────────
function TabBar({ activeTab, setActiveTab }) {
  return (
    <div className="sh-tab-bar">
      {NAV_TABS.map((tab) => (
        <div className="sh-tab-item" key={tab.label}>
          <button
            className={`sh-tab-btn ${activeTab === tab.label ? "sh-tab-active" : ""}`}
            onClick={() => setActiveTab(tab.label)}
          >
            {tab.label}{tab.menu ? " ▾" : ""}
          </button>
          {tab.menu && (
            <div className="sh-tab-dropdown">
              {tab.menu.map((item) => (
                <div
                  className="sh-tab-dd-item"
                  key={item.label}
                  onClick={() => item.page && navigateTo(item.page)}
                  style={item.page ? { cursor: "pointer" } : {}}
                >
                  {item.label}
                  {item.sub && <span>▶</span>}
                  {item.sub && (
                    <div className="sh-tab-sub-dropdown">
                      {item.sub.map((s) => (
                        <div className="sh-tab-sub-item" key={s}>{s}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


// ── Sidebar ─────────────────────────────────────────────────────
function Sidebar({ selSize, setSelSize, pMin, setPMin, pMax, setPMax, showIn, setShowIn, showOut, setShowOut, onApply }) {
  return (
    <aside className="sh-sidebar">
      <div className="sh-sb-brand">Filters</div>
      <div className="sh-sb-sec">
        <div className="sh-sb-lbl">Size</div>
        <div className="sh-sb-sizes">
          {ALL_SIZES.map((s) => (
            <button key={s} className={`sh-sb-sz ${selSize === s ? "active" : ""}`}
              onClick={() => setSelSize(selSize === s ? null : s)}>{s}</button>
          ))}
        </div>
      </div>
      <div className="sh-sb-sec">
        <div className="sh-sb-lbl">Price Range (Rs)</div>
        <div className="sh-pf-fields">
          <div className="sh-pf-row">Min <input type="number" value={pMin} min="0" onChange={(e) => setPMin(parseInt(e.target.value) || 0)} /></div>
          <div className="sh-pf-row">Max <input type="number" value={pMax} min="0" onChange={(e) => setPMax(parseInt(e.target.value) || 10000)} /></div>
        </div>
        <button className="sh-apply-btn" onClick={onApply}>Apply</button>
      </div>
      <div className="sh-sb-sec">
        <div className="sh-sb-lbl">Availability</div>
        <div className="sh-av-opts">
          <label className="sh-av-opt"><input type="checkbox" checked={showIn}  onChange={(e) => setShowIn(e.target.checked)}  /> In Stock</label>
          <label className="sh-av-opt"><input type="checkbox" checked={showOut} onChange={(e) => setShowOut(e.target.checked)} /> Out of Stock</label>
        </div>
      </div>
    </aside>
  );
}


// ── EMI helper ──────────────────────────────────────────────────
function EmiRow({ price }) {
  const e3 = Math.round(price / 3).toLocaleString();
  const e4 = Math.round(price / 4).toLocaleString();
  return (
    <div className="sh-pemi">
      or pay in 3 x <strong>Rs {e3}</strong> with <span className="sh-koko">KOKO</span><br />
      3 x <strong>Rs {e3}</strong> or 3% Cashback with <span className="sh-mint">mintpay</span><br />
      up to 4 x <strong>Rs {e4}</strong> with <span className="sh-payzy">PayZy</span>
    </div>
  );
}


// ── Product Card ─────────────────────────────────────────────────
function ProductCard({ product, prices, extraColors, onPriceUpdate, onOpenModal }) {
  const [selSize,  setSelSize]  = useState(null);
  const [selColor, setSelColor] = useState(null);
  const [wished,   setWished]   = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [editVal,  setEditVal]  = useState(prices[product.id]);

  // ── ADDED: track card-level displayed image ──────────────────
  const [cardImg, setCardImg] = useState(product.img);

  const price = prices[product.id];
  const allColors = [...product.colors, ...extraColors];

  function handleSave() {
    const v = parseInt(editVal);
    if (!isNaN(v) && v >= 0) { onPriceUpdate(product.id, v); setEditing(false); }
  }

  // ── ADDED: swap card image when a color swatch is clicked ─────
  function handleCardColorSelect(color, colorIndex) {
    const isDeselecting = selColor === color;
    setSelColor(isDeselecting ? null : color);
    if (isDeselecting) {
      setCardImg(product.img);
    } else {
      const mapped = product.colorImgs && product.colorImgs[colorIndex];
      setCardImg(mapped || product.img);
    }
  }

  return (
    <div className="sh-pcard" onClick={() => onOpenModal(product)}>
      <div className="sh-imgw">
        {/* CHANGED: src now uses cardImg instead of product.img */}
        <img src={cardImg} alt={product.name} loading="lazy"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80"; }} />
        <span className={`sh-av-badge ${product.inStock ? "in" : "out"}`}>
          {product.inStock ? "In Stock" : "Out of Stock"}
        </span>
        <div className="sh-hicons">
          <button className={`sh-hico ${wished ? "liked" : ""}`}
            onClick={(e) => { e.stopPropagation(); setWished(!wished); }}><HeartIcon /></button>
          <button className="sh-hico" onClick={(e) => e.stopPropagation()}><EyeIcon /></button>
        </div>
        <div className="sh-qadd" onClick={(e) => e.stopPropagation()}>QUICK ADD</div>
      </div>

      <div className="sh-pbody">
        <div className="sh-pname">{product.name}</div>
        <div className="sh-pprow">
          <span className="sh-pprice">Rs {price.toLocaleString()}.00</span>
          <button className="sh-pedit-btn" onClick={(e) => { e.stopPropagation(); setEditing(!editing); }}>Edit price</button>
        </div>
        {editing && (
          <div className="sh-pedit-wrap" onClick={(e) => e.stopPropagation()}>
            <input type="number" value={editVal} min="0" onChange={(e) => setEditVal(e.target.value)} />
            <button onClick={handleSave}>Save</button>
          </div>
        )}
        <EmiRow price={price} />

        <div className="sh-color-section" onClick={(e) => e.stopPropagation()}>
          <div className="sh-color-lbl">Colors</div>
          {/* CHANGED: uses updated ColorSwatches with index-aware onSelect */}
          <ColorSwatchesWithIndex
            colors={allColors}
            selColor={selColor}
            onSelect={handleCardColorSelect}
          />
        </div>

        <div className="sh-psizes">
          {ALL_SIZES.map((s) => {
            const has = product.sizes.includes(s);
            return (
              <button key={s}
                className={`sh-psz ${has ? "avail" : "na"} ${selSize === s && has ? "picked" : ""}`}
                onClick={(e) => { e.stopPropagation(); has && setSelSize(selSize === s ? null : s); }}>
                {s}
              </button>
            );
          })}
        </div>

        <div className="sh-pavrow">
          <div className="sh-pavdot" style={{ background: product.inStock ? "#27ae60" : "#e03b3b" }} />
          <span className="sh-pavtxt" style={{ color: product.inStock ? "#27ae60" : "#e03b3b" }}>
            {product.inStock ? "Available" : "Out of Stock"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── ADDED: index-aware color swatch for cards ────────────────────
// Passes both color value AND its index to onSelect so the card
// knows which colorImgs slot to use. Original ColorSwatches is
// kept unchanged above for any other usage.
function ColorSwatchesWithIndex({ colors, selColor, onSelect }) {
  const LIGHT = new Set(["#f5f5f0","#ece8dc","#ffffff","#fffaed","#f5f0eb","#c4e0f3","#e8c5c5","#d4a5a5"]);
  return (
    <div className="sh-color-row">
      {colors.map((c, i) => (
        <button
          key={i}
          title={c}
          className={`sh-color-swatch ${selColor === c ? "active" : ""}`}
          style={{ background: c, border: LIGHT.has(c) ? "1.5px solid #ccc" : "1.5px solid transparent" }}
          onClick={(e) => { e.stopPropagation(); onSelect(c, i); }}
        />
      ))}
    </div>
  );
}


// ── Main Shirts Page ─────────────────────────────────────────────
export default function Shirts() {
  const [activeTab,    setActiveTab]    = useState("Men");
  const [selSize,      setSelSize]      = useState(null);
  const [pMin,         setPMin]         = useState(0);
  const [pMax,         setPMax]         = useState(10000);
  const [appliedMin,   setAppliedMin]   = useState(0);
  const [appliedMax,   setAppliedMax]   = useState(10000);
  const [showIn,       setShowIn]       = useState(true);
  const [showOut,      setShowOut]      = useState(true);
  const [sortMode,     setSortMode]     = useState("new");
  const [perPage,      setPerPage]      = useState(10);
  const [loaded,       setLoaded]       = useState(10);
  const [modalProduct, setModalProduct] = useState(null);

  const [extraColors, setExtraColors] = useState(() => {
    const m = {}; ALL_PRODUCTS.forEach((p) => (m[p.id] = [])); return m;
  });
  const [prices, setPrices] = useState(() => {
    const p = {}; ALL_PRODUCTS.forEach((prod) => (p[prod.id] = prod.basePrice)); return p;
  });

  function handlePriceUpdate(id, val) { setPrices((prev) => ({ ...prev, [id]: val })); }
  function handleApply() { setAppliedMin(pMin); setAppliedMax(pMax); setLoaded(perPage); }
  function handleAddColor(productId, hex) {
    setExtraColors((prev) => ({ ...prev, [productId]: [...prev[productId], hex] }));
  }
  function handleRemoveColor(productId, extraIdx) {
    setExtraColors((prev) => {
      const updated = [...prev[productId]]; updated.splice(extraIdx, 1);
      return { ...prev, [productId]: updated };
    });
  }

  const filtered = ALL_PRODUCTS.filter((p) => {
    if (selSize && !p.sizes.includes(selSize)) return false;
    const pr = prices[p.id];
    if (pr < appliedMin || pr > appliedMax) return false;
    if (!showIn  && p.inStock)  return false;
    if (!showOut && !p.inStock) return false;
    return true;
  }).sort((a, b) => {
    if (sortMode === "low")  return prices[a.id] - prices[b.id];
    if (sortMode === "high") return prices[b.id] - prices[a.id];
    return 0;
  });

  const visible   = filtered.slice(0, loaded);
  const allLoaded = loaded >= filtered.length;

  useEffect(() => { setLoaded(perPage); }, [selSize, appliedMin, appliedMax, showIn, showOut, sortMode, perPage]);

  return (
    <div className="sh-page">
      <Header />
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="sh-page-wrap">
        <Sidebar
          selSize={selSize} setSelSize={(s) => { setSelSize(s); setLoaded(perPage); }}
          pMin={pMin} setPMin={setPMin}
          pMax={pMax} setPMax={setPMax}
          showIn={showIn}   setShowIn={(v)  => { setShowIn(v);  setLoaded(perPage); }}
          showOut={showOut} setShowOut={(v) => { setShowOut(v); setLoaded(perPage); }}
          onApply={handleApply}
        />

        <main className="sh-main">
          <div className="sh-bc">
            <a href="#">Home</a><span className="sh-sep">›</span>
            <a href="#">Men</a><span className="sh-sep">›</span>
            <span className="sh-cur">Shirts</span>
          </div>

          <div className="sh-topbar">
            <h1 className="sh-pg-title">Shi<span>rts</span></h1>
            <div className="sh-tb-ctrl">
              <span className="sh-tbl">Per Page</span>
              <select className="sh-tb-sel" value={perPage} onChange={(e) => setPerPage(parseInt(e.target.value))}>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
              </select>
              <span className="sh-tbl">Sort By</span>
              <select className="sh-tb-sel" value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
                <option value="new">Date, new to old</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </div>
          </div>

          <div className="sh-rinfo">{filtered.length} products found</div>

          {filtered.length === 0 ? (
            <div className="sh-empty">No products match your filters.</div>
          ) : (
            <div className="sh-pgrid">
              {visible.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  prices={prices}
                  extraColors={extraColors[p.id]}
                  onPriceUpdate={handlePriceUpdate}
                  onOpenModal={setModalProduct}
                />
              ))}
            </div>
          )}

          <div className="sh-lmwrap">
            <button className="sh-lmbtn" disabled={allLoaded}
              onClick={() => setLoaded((prev) => prev + perPage)}>
              {allLoaded ? "All products loaded" : `Load More (${filtered.length - loaded} remaining)`}
            </button>
          </div>
        </main>
      </div>

      <Footer />

      {modalProduct && (
        <ProductModal
          product={modalProduct}
          price={prices[modalProduct.id]}
          extraColors={extraColors[modalProduct.id]}
          onAddColor={(hex) => handleAddColor(modalProduct.id, hex)}
          onRemoveColor={(idx) => handleRemoveColor(modalProduct.id, idx)}
          onClose={() => setModalProduct(null)}
        />
      )}
    </div>
  );
}