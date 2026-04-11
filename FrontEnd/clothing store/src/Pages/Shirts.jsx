import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Shirts.css";
import { useNavigate } from "react-router-dom";


// ── Product Data ────────────────────────────────────────────────
const ALL_PRODUCTS = [
  { id:1,  name:"Oxford Button-Down Shirt",        basePrice:2495, sizes:["XS","S","M","L","XL"],        inStock:true,  colors:["#f5f5f0","#4a6fa5","#111111"], img:"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=82" },
  { id:2,  name:"Slim Fit Linen Shirt – White",     basePrice:3190, sizes:["S","M","L","XL","XXL"],       inStock:true,  colors:["#f5f5f0","#d4c5a9"],           img:"https://images.unsplash.com/photo-1603252109612-24fa03d145c8?w=600&q=82" },
  { id:3,  name:"Casual Cuban Collar Shirt",        basePrice:2890, sizes:["S","M","L","XL"],             inStock:true,  colors:["#c4a882","#6b7a3e","#8b3a2a"], img:"https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=600&q=82" },
  { id:4,  name:"Formal Dress Shirt – Navy",        basePrice:3690, sizes:["M","L","XL","XXL"],           inStock:false, colors:["#1a3a5c","#f5f5f0","#111111"], img:"https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=82" },
  { id:5,  name:"Flannel Check Shirt – Red",        basePrice:2650, sizes:["XS","S","M","L","XL","XXL"],  inStock:true,  colors:["#8b3a2a","#111111","#4a6fa5"], img:"https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600&q=82" },
  { id:6,  name:"Denim Shirt – Washed Blue",        basePrice:3390, sizes:["S","M","L","XL"],             inStock:true,  colors:["#4a6fa5","#1a3a5c","#111111"], img:"https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=82" },
  { id:7,  name:"Slim Fit Poplin Shirt – White",    basePrice:2250, sizes:["XS","S","M","L"],             inStock:true,  colors:["#f5f5f0","#111111"],           img:"https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=82" },
  { id:8,  name:"Mandarin Collar Shirt – Black",    basePrice:3990, sizes:["S","M","L","XL","XXL","3XL"], inStock:false, colors:["#111111","#444444"],           img:"https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=82" },
  { id:9,  name:"Relaxed Fit Shirt – Olive",        basePrice:2990, sizes:["M","L","XL","XXL"],           inStock:true,  colors:["#6b7a3e","#c4a882"],           img:"https://images.unsplash.com/photo-1602810316693-3667c854239a?w=600&q=82" },
  { id:10, name:"Batik Print Shirt – Blue",         basePrice:2450, sizes:["XS","S","M","L","XL"],        inStock:true,  colors:["#4a6fa5","#f5f5f0","#1a3a5c"], img:"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=82" },
  { id:11, name:"Premium Silk Blend Shirt",         basePrice:5690, sizes:["S","M","L","XL"],             inStock:true,  colors:["#c8982a","#f5f5f0","#111111"], img:"https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=82" },
  { id:12, name:"Linen Short Sleeve Shirt – Ecru",  basePrice:2190, sizes:["S","M","L"],                  inStock:false, colors:["#ece8dc","#d4c5a9"],           img:"https://images.unsplash.com/photo-1625910513462-d88c8a0e9f47?w=600&q=82" },
  { id:13, name:"Oversized Shirt – Charcoal",       basePrice:3150, sizes:["M","L","XL","XXL","3XL"],     inStock:true,  colors:["#444444","#111111"],           img:"https://images.unsplash.com/photo-1550246140-5119ae4790b8?w=600&q=82" },
  { id:14, name:"Slim Fit Shirt – Camel",           basePrice:2895, sizes:["XS","S","M","L"],             inStock:true,  colors:["#c4a060","#f5f5f0"],           img:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=82" },
  { id:15, name:"Tailored Shirt – Slate Blue",      basePrice:4290, sizes:["S","M","L","XL","XXL"],       inStock:true,  colors:["#6e7f8d","#1a3a5c","#111111"], img:"https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=82" },
  { id:16, name:"Vacation Resort Shirt – Floral",   basePrice:2700, sizes:["S","M","L","XL","XXL"],       inStock:true,  colors:["#c4a882","#6b7a3e","#8b3a2a"], img:"https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=82" },
  { id:17, name:"Pintuck Formal Shirt – Ivory",     basePrice:3350, sizes:["XS","S","M","L","XL","XXL"],  inStock:false, colors:["#ece8dc","#f5f5f0"],           img:"https://images.unsplash.com/photo-1512353087810-25dfcd100962?w=600&q=82" },
  { id:18, name:"Performance Stretch Shirt",        basePrice:3890, sizes:["S","M","L","XL"],             inStock:true,  colors:["#111111","#1a3a5c","#444444"], img:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=82" },
  { id:19, name:"Corduroy Shirt – Burgundy",        basePrice:3600, sizes:["S","M","L","XL","XXL"],       inStock:true,  colors:["#6b2737","#111111"],           img:"https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=82" },
  { id:20, name:"Classic Polo Shirt – White",       basePrice:1990, sizes:["XS","S","M","L","XL","XXL"],  inStock:true,  colors:["#f5f5f0","#111111","#1a3a5c"], img:"https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&q=82" },
];

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const MEN_MENU = [
  { label: "Sarong",    page: "sarong"   },
  { label: "Trousers",  page: "trousers" },
  { label: "Shirts",    page: "shirts"   },
  { label: "T-Shirts"  },
  { label: "Shorts"    },
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
  return (
    <div className="sh-color-row">
      {colors.map((c, i) => (
        <button
          key={i}
          title={c}
          className={`sh-color-swatch ${selColor === c ? "active" : ""}`}
          style={{ background: c, border: c === "#f5f5f0" || c === "#ece8dc" ? "1.5px solid #ccc" : "1.5px solid transparent" }}
          onClick={(e) => { e.stopPropagation(); onSelect(selColor === c ? null : c); }}
        />
      ))}
    </div>
  );
}


// ── Admin: Add Color Panel (inside modal) ────────────────────────
function AddColorPanel({ onAdd, onClose }) {
  const [hex, setHex] = useState("#000000");
  const [manual, setManual] = useState("#000000");

  function sync(val) {
    setHex(val);
    setManual(val);
  }

  function handleManual(val) {
    setManual(val);
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) setHex(val);
  }

  return (
    <div className="sh-addcolor-panel">
      <div className="sh-addcolor-title">Add New Color</div>
      <div className="sh-addcolor-row">
        <input type="color" value={hex} onChange={(e) => sync(e.target.value)} className="sh-color-picker" />
        <input
          type="text"
          value={manual}
          maxLength={7}
          placeholder="#rrggbb"
          onChange={(e) => handleManual(e.target.value)}
          className="sh-color-hex-input"
        />
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
  const [zoom, setZoom]         = useState(1);
  const [selColor, setSelColor] = useState(null);
  const [addingColor, setAddingColor] = useState(false);

  const allColors = [...product.colors, ...extraColors];
  const ZOOM_STEP = 0.25;
  const MAX_ZOOM  = 3;
  const MIN_ZOOM  = 1;

  const handleZoomIn  = (e) => { e.stopPropagation(); setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM)); };
  const handleZoomOut = (e) => { e.stopPropagation(); setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM)); };

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
            <img
              src={product.img}
              alt={product.name}
              style={{ transform: `scale(${zoom})`, transition: "transform .25s ease" }}
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80"; }}
            />
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

          {/* Colors */}
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
                      style={{
                        background: c,
                        border: c === "#f5f5f0" || c === "#ece8dc" ? "2px solid #ccc" : "2px solid transparent"
                      }}
                      onClick={() => setSelColor(selColor === c ? null : c)}
                    />
                    {isExtra && (
                      <button
                        className="sh-modal-swatch-del"
                        title="Remove color"
                        onClick={() => onRemoveColor(i - product.colors.length)}
                      >
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

            {addingColor && (
              <AddColorPanel
                onAdd={onAddColor}
                onClose={() => setAddingColor(false)}
              />
            )}
          </div>

          {/* Sizes */}
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
            <button key={s} className={`sh-sb-sz ${selSize === s ? "active" : ""}`} onClick={() => setSelSize(selSize === s ? null : s)}>{s}</button>
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
  const price = prices[product.id];
  const allColors = [...product.colors, ...extraColors];

  function handleSave() {
    const v = parseInt(editVal);
    if (!isNaN(v) && v >= 0) { onPriceUpdate(product.id, v); setEditing(false); }
  }

  return (
    <div className="sh-pcard" onClick={() => onOpenModal(product)}>
      <div className="sh-imgw">
        <img
          src={product.img}
          alt={product.name}
          loading="lazy"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80"; }}
        />
        <span className={`sh-av-badge ${product.inStock ? "in" : "out"}`}>
          {product.inStock ? "In Stock" : "Out of Stock"}
        </span>
        <div className="sh-hicons">
          <button className={`sh-hico ${wished ? "liked" : ""}`} onClick={(e) => { e.stopPropagation(); setWished(!wished); }}><HeartIcon /></button>
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

        {/* Color swatches */}
        <div className="sh-color-section" onClick={(e) => e.stopPropagation()}>
          <div className="sh-color-lbl">Colors</div>
          <ColorSwatches colors={allColors} selColor={selColor} onSelect={setSelColor} />
        </div>

        {/* Size buttons */}
        <div className="sh-psizes">
          {ALL_SIZES.map((s) => {
            const has = product.sizes.includes(s);
            return (
              <button
                key={s}
                className={`sh-psz ${has ? "avail" : "na"} ${selSize === s && has ? "picked" : ""}`}
                onClick={(e) => { e.stopPropagation(); has && setSelSize(selSize === s ? null : s); }}
              >
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


// ── Main Shirts Page ───────────────────────────────────────────
export default function Shirts() {
  const [activeTab,   setActiveTab]   = useState("Men");
  const [selSize,     setSelSize]     = useState(null);
  const [pMin,        setPMin]        = useState(0);
  const [pMax,        setPMax]        = useState(10000);
  const [appliedMin,  setAppliedMin]  = useState(0);
  const [appliedMax,  setAppliedMax]  = useState(10000);
  const [showIn,      setShowIn]      = useState(true);
  const [showOut,     setShowOut]     = useState(true);
  const [sortMode,    setSortMode]    = useState("new");
  const [perPage,     setPerPage]     = useState(10);
  const [loaded,      setLoaded]      = useState(10);
  const [modalProduct, setModalProduct] = useState(null);

  const [extraColors, setExtraColors] = useState(() => {
    const m = {};
    ALL_PRODUCTS.forEach((p) => (m[p.id] = []));
    return m;
  });

  const [prices, setPrices] = useState(() => {
    const p = {};
    ALL_PRODUCTS.forEach((prod) => (p[prod.id] = prod.basePrice));
    return p;
  });

  function handlePriceUpdate(id, val) {
    setPrices((prev) => ({ ...prev, [id]: val }));
  }

  function handleApply() {
    setAppliedMin(pMin);
    setAppliedMax(pMax);
    setLoaded(perPage);
  }

  function handleAddColor(productId, hex) {
    setExtraColors((prev) => ({ ...prev, [productId]: [...prev[productId], hex] }));
  }

  function handleRemoveColor(productId, extraIdx) {
    setExtraColors((prev) => {
      const updated = [...prev[productId]];
      updated.splice(extraIdx, 1);
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
            <button
              className="sh-lmbtn"
              disabled={allLoaded}
              onClick={() => setLoaded((prev) => prev + perPage)}
            >
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