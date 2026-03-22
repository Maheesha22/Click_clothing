import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Trousers.css";
import { useNavigate } from "react-router-dom";



// ── Product Data ────────────────────────────────────────────────
const ALL_PRODUCTS = [
  { id:1,  name:"Tito Men's Chino Pant",        basePrice:2295, sizes:[28,30,32,34,36],    inStock:true,  img:"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=82" },
  { id:2,  name:"Moose Chino Pant – Brick",      basePrice:3490, sizes:[30,32,34,36],       inStock:true,  img:"https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=600&q=82" },
  { id:3,  name:"Moose Chino Pant – Clay",       basePrice:3490, sizes:[28,30,32],          inStock:true,  img:"https://images.unsplash.com/photo-1594938298603-c8148c4b4a0c?w=600&q=82" },
  { id:4,  name:"Moose Chino – Steel Blue",      basePrice:3490, sizes:[32,34,36,38],       inStock:false, img:"https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=82" },
  { id:5,  name:"Classic Slim Fit Trouser",      basePrice:2890, sizes:[28,30,32,34,36,38], inStock:true,  img:"https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=82" },
  { id:6,  name:"Urban Cargo Trouser",           basePrice:3190, sizes:[30,32,34],          inStock:true,  img:"https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=82" },
  { id:7,  name:"Linen Blend Straight Trouser",  basePrice:2650, sizes:[28,30,32,34],       inStock:true,  img:"https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=600&q=82" },
  { id:8,  name:"Formal Tapered Trouser – Navy", basePrice:3990, sizes:[30,32,34,36,38,40], inStock:false, img:"https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=82" },
  { id:9,  name:"Stretch Slim Trouser – Black",  basePrice:3100, sizes:[30,32,34,36],       inStock:true,  img:"https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=82" },
  { id:10, name:"Relaxed Fit Chino – Olive",     basePrice:2450, sizes:[28,30,32,34,36],    inStock:true,  img:"https://images.unsplash.com/photo-1604644401890-0bd678c83788?w=600&q=82" },
  { id:11, name:"Premium Wool Blend Trouser",    basePrice:5490, sizes:[32,34,36,38],       inStock:true,  img:"https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=82" },
  { id:12, name:"Cropped Chino – Sand",          basePrice:2190, sizes:[28,30,32],          inStock:false, img:"https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=82" },
  { id:13, name:"Wide Leg Trouser – Charcoal",   basePrice:3750, sizes:[30,32,34,36,38],    inStock:true,  img:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=82" },
  { id:14, name:"Slim Fit Chino – Camel",        basePrice:2895, sizes:[28,30,32,34],       inStock:true,  img:"https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=82" },
  { id:15, name:"Tailored Trousers – Slate",     basePrice:4290, sizes:[32,34,36,38,40],    inStock:true,  img:"https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=82" },
  { id:16, name:"Jogger Style Trouser",          basePrice:2100, sizes:[28,30,32,34,36],    inStock:true,  img:"https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=600&q=82" },
  { id:17, name:"Pintuck Trouser – Ecru",        basePrice:3350, sizes:[28,30,32,34,36,38], inStock:false, img:"https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=82" },
  { id:18, name:"Performance Stretch Trouser",   basePrice:3690, sizes:[30,32,34,36],       inStock:true,  img:"https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&q=82" },
  { id:19, name:"Corduroy Trouser – Burgundy",   basePrice:4100, sizes:[32,34,36,38],       inStock:true,  img:"https://images.unsplash.com/photo-1617196034779-5e0f1e7f5a0b?w=600&q=82" },
  { id:20, name:"Chino Shorts – Khaki",          basePrice:1890, sizes:[30,32,34,36],       inStock:true,  img:"https://images.unsplash.com/photo-1547496502-affa22d38842?w=600&q=82" },
];


const ALL_SIZES = [28, 30, 32, 34, 36, 38, 40];

// ── CHANGE 1: Added "page" key to Men sub-items that have a page ─
// When a dropdown item has a "page" key, clicking it will call
// navigateTo(item.page) which fires the window "navigate" event
// that App.jsx listens to via useEffect → setPage(item.page)
const MEN_MENU = [
  { label: "Sarong"    },                          // add page: "sarong" later
  { label: "Trousers", page: "trousers" },         // ← NAVIGATES TO TROUSERS PAGE
  { label: "Shirts"    },                          // add page: "shirts" later
  { label: "T-Shirts"  },                          // add page: "tshirts" later
  { label: "Shorts"    },                          // add page: "shorts" later
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

// ── CHANGE 2: Helper that fires the same window event App.jsx uses ─
// App.jsx already has: window.addEventListener("navigate", handler)
// where handler calls setPage(e.detail). So dispatching this event
// from any page will switch the page in App.jsx.
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

// ── Tab Bar ─────────────────────────────────────────────────────
// CHANGE 3: Dropdown items now call navigateTo(item.page) on click
function TabBar({ activeTab, setActiveTab }) {
  return (
    <div className="tr-tab-bar">
      {NAV_TABS.map((tab) => (
        <div className="tr-tab-item" key={tab.label}>
          <button
            className={`tr-tab-btn ${activeTab === tab.label ? "tr-tab-active" : ""}`}
            onClick={() => setActiveTab(tab.label)}
          >
            {tab.label}{tab.menu ? " ▾" : ""}
          </button>

          {tab.menu && (
            <div className="tr-tab-dropdown">
              {tab.menu.map((item) => (
                <div
                  className="tr-tab-dd-item"
                  key={item.label}
                  // CHANGE 3: onClick fires navigateTo only when item.page exists
                  onClick={() => item.page && navigateTo(item.page)}
                  style={item.page ? { cursor: "pointer" } : {}}
                >
                  {item.label}
                  {item.sub && <span>▶</span>}
                  {item.sub && (
                    <div className="tr-tab-sub-dropdown">
                      {item.sub.map((s) => (
                        <div className="tr-tab-sub-item" key={s}>{s}</div>
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
    <aside className="tr-sidebar">
      <div className="tr-sb-brand">Filters</div>

      <div className="tr-sb-sec">
        <div className="tr-sb-lbl">Size</div>
        <div className="tr-sb-sizes">
          {ALL_SIZES.map((s) => (
            <button
              key={s}
              className={`tr-sb-sz ${selSize === s ? "active" : ""}`}
              onClick={() => setSelSize(selSize === s ? null : s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="tr-sb-sec">
        <div className="tr-sb-lbl">Price Range (Rs)</div>
        <div className="tr-pf-fields">
          <div className="tr-pf-row">
            Min <input type="number" value={pMin} min="0" onChange={(e) => setPMin(parseInt(e.target.value) || 0)} />
          </div>
          <div className="tr-pf-row">
            Max <input type="number" value={pMax} min="0" onChange={(e) => setPMax(parseInt(e.target.value) || 10000)} />
          </div>
        </div>
        <button className="tr-apply-btn" onClick={onApply}>Apply</button>
      </div>

      <div className="tr-sb-sec">
        <div className="tr-sb-lbl">Availability</div>
        <div className="tr-av-opts">
          <label className="tr-av-opt">
            <input type="checkbox" checked={showIn} onChange={(e) => setShowIn(e.target.checked)} /> In Stock
          </label>
          <label className="tr-av-opt">
            <input type="checkbox" checked={showOut} onChange={(e) => setShowOut(e.target.checked)} /> Out of Stock
          </label>
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
    <div className="tr-pemi">
      or pay in 3 x <strong>Rs {e3}</strong> with <span className="tr-koko">KOKO</span><br />
      3 x <strong>Rs {e3}</strong> or 3% Cashback with <span className="tr-mint">mintpay</span><br />
      up to 4 x <strong>Rs {e4}</strong> with <span className="tr-payzy">PayZy</span>
    </div>
  );
}

// ── Product Card ─────────────────────────────────────────────────
function ProductCard({ product, prices, onPriceUpdate }) {
  const [selSize, setSelSize] = useState(null);
  const [wished, setWished] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(prices[product.id]);
  const price = prices[product.id];

  function handleSave() {
    const v = parseInt(editVal);
    if (!isNaN(v) && v >= 0) { onPriceUpdate(product.id, v); setEditing(false); }
  }

  return (
    <div className="tr-pcard">
      <div className="tr-imgw">
        <img
          src={product.img}
          alt={product.name}
          loading="lazy"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=80"; }}
        />
        <span className={`tr-av-badge ${product.inStock ? "in" : "out"}`}>
          {product.inStock ? "In Stock" : "Out of Stock"}
        </span>
        <div className="tr-hicons">
          <button className={`tr-hico ${wished ? "liked" : ""}`} onClick={() => setWished(!wished)}>
            <HeartIcon />
          </button>
          <button className="tr-hico"><EyeIcon /></button>
        </div>
        <div className="tr-qadd">QUICK ADD</div>
      </div>

      <div className="tr-pbody">
        <div className="tr-pname">{product.name}</div>
        <div className="tr-pprow">
          <span className="tr-pprice">Rs {price.toLocaleString()}.00</span>
          <button className="tr-pedit-btn" onClick={() => setEditing(!editing)}>Edit price</button>
        </div>
        {editing && (
          <div className="tr-pedit-wrap">
            <input
              type="number"
              value={editVal}
              min="0"
              onChange={(e) => setEditVal(e.target.value)}
            />
            <button onClick={handleSave}>Save</button>
          </div>
        )}
        <EmiRow price={price} />
        <div className="tr-psizes">
          {ALL_SIZES.map((s) => {
            const has = product.sizes.includes(s);
            return (
              <button
                key={s}
                className={`tr-psz ${!has ? "na" : ""} ${selSize === s && has ? "picked" : ""}`}
                onClick={() => has && setSelSize(selSize === s ? null : s)}
              >
                {s}
              </button>
            );
          })}
        </div>
        <div className="tr-pavrow">
          <div className="tr-pavdot" style={{ background: product.inStock ? "#27ae60" : "#e03b3b" }} />
          <span className="tr-pavtxt" style={{ color: product.inStock ? "#27ae60" : "#e03b3b" }}>
            {product.inStock ? "Available" : "Out of Stock"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main Trousers Page ───────────────────────────────────────────
export default function Trousers() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Men");
  const [selSize, setSelSize] = useState(null);
  const [pMin, setPMin] = useState(0);
  const [pMax, setPMax] = useState(10000);
  const [appliedMin, setAppliedMin] = useState(0);
  const [appliedMax, setAppliedMax] = useState(10000);
  const [showIn, setShowIn] = useState(true);
  const [showOut, setShowOut] = useState(true);
  const [sortMode, setSortMode] = useState("new");
  const [perPage, setPerPage] = useState(10);
  const [loaded, setLoaded] = useState(10);
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

  const filtered = ALL_PRODUCTS.filter((p) => {
    if (selSize && !p.sizes.includes(selSize)) return false;
    const pr = prices[p.id];
    if (pr < appliedMin || pr > appliedMax) return false;
    if (!showIn && p.inStock) return false;
    if (!showOut && !p.inStock) return false;
    return true;
  }).sort((a, b) => {
    if (sortMode === "low") return prices[a.id] - prices[b.id];
    if (sortMode === "high") return prices[b.id] - prices[a.id];
    return 0;
  });

  const visible = filtered.slice(0, loaded);
  const allLoaded = loaded >= filtered.length;

  useEffect(() => { setLoaded(perPage); }, [selSize, appliedMin, appliedMax, showIn, showOut, sortMode, perPage]);

  return (
    <div className="tr-page">

      {/* Shared Header — same as Home.jsx */}
      <Header />

      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="tr-page-wrap">
        <Sidebar
          selSize={selSize} setSelSize={(s) => { setSelSize(s); setLoaded(perPage); }}
          pMin={pMin} setPMin={setPMin}
          pMax={pMax} setPMax={setPMax}
          showIn={showIn} setShowIn={(v) => { setShowIn(v); setLoaded(perPage); }}
          showOut={showOut} setShowOut={(v) => { setShowOut(v); setLoaded(perPage); }}
          onApply={handleApply}
        />

        <main className="tr-main">
          <div className="tr-bc">
            <a href="#">Home</a><span className="tr-sep">›</span>
            <a href="#">Men</a><span className="tr-sep">›</span>
            <span className="tr-cur">Trousers</span>
          </div>

          <div className="tr-topbar">
            <h1 className="tr-pg-title">Trou<span>sers</span></h1>
            <div className="tr-tb-ctrl">
              <span className="tr-tbl">Per Page</span>
              <select className="tr-tb-sel" value={perPage} onChange={(e) => setPerPage(parseInt(e.target.value))}>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
              </select>
              <span className="tr-tbl">Sort By</span>
              <select className="tr-tb-sel" value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
                <option value="new">Date, new to old</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </div>
          </div>

          <div className="tr-rinfo">{filtered.length} products found</div>

          {filtered.length === 0 ? (
            <div className="tr-empty">No products match your filters.</div>
          ) : (
            <div className="tr-pgrid">
              {visible.map((p) => (
                <ProductCard key={p.id} product={p} prices={prices} onPriceUpdate={handlePriceUpdate} />
              ))}
            </div>
          )}

          <div className="tr-lmwrap">
            <button
              className="tr-lmbtn"
              disabled={allLoaded}
              onClick={() => setLoaded((prev) => prev + perPage)}
            >
              {allLoaded ? "All products loaded" : `Load More (${filtered.length - loaded} remaining)`}
            </button>
          </div>
        </main>
      </div>

      {/* Shared Footer — same as Home.jsx */}
      <Footer />

    </div>
  );
}