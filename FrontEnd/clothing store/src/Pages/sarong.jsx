import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Sarong.css";
import { useNavigate } from "react-router-dom";


// ── Product Data ────────────────────────────────────────────────
const ALL_PRODUCTS = [
  { id:1,  name:"Classic Batik Sarong – Navy",       basePrice:1890, sizes:[28,30,32,34,36],    inStock:true,  img:"https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600&q=82" },
  { id:2,  name:"Handwoven Silk Sarong – Ivory",     basePrice:4290, sizes:[30,32,34,36],       inStock:true,  img:"https://images.unsplash.com/photo-1619603364853-41f8b63a8d9f?w=600&q=82" },
  { id:3,  name:"Tropical Print Sarong – Teal",      basePrice:2190, sizes:[28,30,32],          inStock:true,  img:"https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=82" },
  { id:4,  name:"Linen Blend Sarong – Sand",         basePrice:2650, sizes:[32,34,36,38],       inStock:false, img:"https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=82" },
  { id:5,  name:"Ikat Woven Sarong – Burgundy",      basePrice:3490, sizes:[28,30,32,34,36,38], inStock:true,  img:"https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=82" },
  { id:6,  name:"Floral Batik Sarong – Mustard",     basePrice:2290, sizes:[30,32,34],          inStock:true,  img:"https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=82" },
  { id:7,  name:"Checked Sarong – Forest Green",     basePrice:1990, sizes:[28,30,32,34],       inStock:true,  img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=82" },
  { id:8,  name:"Premium Cotton Sarong – Slate",     basePrice:2890, sizes:[30,32,34,36,38,40], inStock:false, img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=82" },
  { id:9,  name:"Batik Sarong – Charcoal",           basePrice:2490, sizes:[30,32,34,36],       inStock:true,  img:"https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=82" },
  { id:10, name:"Geometric Print Sarong – Olive",    basePrice:2150, sizes:[28,30,32,34,36],    inStock:true,  img:"https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600&q=82" },
  { id:11, name:"Luxury Silk Sarong – Cobalt",       basePrice:5890, sizes:[32,34,36,38],       inStock:true,  img:"https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600&q=82" },
  { id:12, name:"Striped Cotton Sarong – Cream",     basePrice:1750, sizes:[28,30,32],          inStock:false, img:"https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=82" },
  { id:13, name:"Paisley Sarong – Terracotta",       basePrice:3250, sizes:[30,32,34,36,38],    inStock:true,  img:"https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&q=82" },
  { id:14, name:"Boho Weave Sarong – Caramel",       basePrice:2795, sizes:[28,30,32,34],       inStock:true,  img:"https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=82" },
  { id:15, name:"Traditional Batik Sarong – Black",  basePrice:3990, sizes:[32,34,36,38,40],    inStock:true,  img:"https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=82" },
  { id:16, name:"Casual Sarong – Khaki",             basePrice:1690, sizes:[28,30,32,34,36],    inStock:true,  img:"https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=82" },
  { id:17, name:"Block Print Sarong – Rust",         basePrice:2950, sizes:[28,30,32,34,36,38], inStock:false, img:"https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600&q=82" },
  { id:18, name:"Performance Sarong – Stone",        basePrice:3190, sizes:[30,32,34,36],       inStock:true,  img:"https://images.unsplash.com/photo-1619603364853-41f8b63a8d9f?w=600&q=82" },
  { id:19, name:"Embroidered Sarong – Teal",         basePrice:4600, sizes:[32,34,36,38],       inStock:true,  img:"https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=82" },
  { id:20, name:"Short Sarong – Cream",              basePrice:1490, sizes:[30,32,34,36],       inStock:true,  img:"https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=82" },
];

const ALL_SIZES = [28, 30, 32, 34, 36, 38, 40];

// ── Men sub-menu ─────────────────────────────────────────────────
const MEN_MENU = [
  { label: "Sarong",    page: "sarong"    },
  { label: "Trousers",  page: "trousers"  },
  { label: "Shirts"     },
  { label: "T-Shirts"   },
  { label: "Shorts"     },
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



// ── Tab Bar ─────────────────────────────────────────────────────
function TabBar({ activeTab, setActiveTab }) {
  return (
    <div className="sr-tab-bar">
      {NAV_TABS.map((tab) => (
        <div className="sr-tab-item" key={tab.label}>
          <button
            className={`sr-tab-btn ${activeTab === tab.label ? "sr-tab-active" : ""}`}
            onClick={() => setActiveTab(tab.label)}
          >
            {tab.label}{tab.menu ? " ▾" : ""}
          </button>

          {tab.menu && (
            <div className="sr-tab-dropdown">
              {tab.menu.map((item) => (
                <div
                  className="sr-tab-dd-item"
                  key={item.label}
                  onClick={() => item.page && navigateTo(item.page)}
                  style={item.page ? { cursor: "pointer" } : {}}
                >
                  {item.label}
                  {item.sub && <span>▶</span>}
                  {item.sub && (
                    <div className="sr-tab-sub-dropdown">
                      {item.sub.map((s) => (
                        <div className="sr-tab-sub-item" key={s}>{s}</div>
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



// ── Filters Sidebar ──────────────────────────────────────────────
function Sidebar({ selSize, setSelSize, pMin, setPMin, pMax, setPMax, showIn, setShowIn, showOut, setShowOut, onApply }) {
  return (
    <aside className="sr-sidebar">
      <div className="sr-sb-brand">Filters</div>

      <div className="sr-sb-sec">
        <div className="sr-sb-lbl">Size</div>
        <div className="sr-sb-sizes">
          {ALL_SIZES.map((s) => (
            <button
              key={s}
              className={`sr-sb-sz ${selSize === s ? "active" : ""}`}
              onClick={() => setSelSize(selSize === s ? null : s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="sr-sb-sec">
        <div className="sr-sb-lbl">Price Range (Rs)</div>
        <div className="sr-pf-fields">
          <div className="sr-pf-row">
            Min <input type="number" value={pMin} min="0" onChange={(e) => setPMin(parseInt(e.target.value) || 0)} />
          </div>
          <div className="sr-pf-row">
            Max <input type="number" value={pMax} min="0" onChange={(e) => setPMax(parseInt(e.target.value) || 10000)} />
          </div>
        </div>
        <button className="sr-apply-btn" onClick={onApply}>Apply</button>
      </div>

      <div className="sr-sb-sec">
        <div className="sr-sb-lbl">Availability</div>
        <div className="sr-av-opts">
          <label className="sr-av-opt">
            <input type="checkbox" checked={showIn} onChange={(e) => setShowIn(e.target.checked)} /> In Stock
          </label>
          <label className="sr-av-opt">
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
    <div className="sr-pemi">
      or pay in 3 x <strong>Rs {e3}</strong> with <span className="sr-koko">KOKO</span><br />
      3 x <strong>Rs {e3}</strong> or 3% Cashback with <span className="sr-mint">mintpay</span><br />
      up to 4 x <strong>Rs {e4}</strong> with <span className="sr-payzy">PayZy</span>
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
    <div className="sr-pcard">
      <div className="sr-imgw">
        <img
          src={product.img}
          alt={product.name}
          loading="lazy"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600&q=80"; }}
        />
        <span className={`sr-av-badge ${product.inStock ? "in" : "out"}`}>
          {product.inStock ? "In Stock" : "Out of Stock"}
        </span>
        <div className="sr-hicons">
          <button className={`sr-hico ${wished ? "liked" : ""}`} onClick={() => setWished(!wished)}>
            <HeartIcon />
          </button>
          <button className="sr-hico"><EyeIcon /></button>
        </div>
        <div className="sr-qadd">QUICK ADD</div>
      </div>

      <div className="sr-pbody">
        <div className="sr-pname">{product.name}</div>
        <div className="sr-pprow">
          <span className="sr-pprice">Rs {price.toLocaleString()}.00</span>
          <button className="sr-pedit-btn" onClick={() => setEditing(!editing)}>Edit price</button>
        </div>
        {editing && (
          <div className="sr-pedit-wrap">
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
        <div className="sr-psizes">
          {ALL_SIZES.map((s) => {
            const has = product.sizes.includes(s);
            return (
              <button
                key={s}
                className={`sr-psz ${!has ? "na" : ""} ${selSize === s && has ? "picked" : ""}`}
                onClick={() => has && setSelSize(selSize === s ? null : s)}
              >
                {s}
              </button>
            );
          })}
        </div>
        <div className="sr-pavrow">
          <div className="sr-pavdot" style={{ background: product.inStock ? "#27ae60" : "#e03b3b" }} />
          <span className="sr-pavtxt" style={{ color: product.inStock ? "#27ae60" : "#e03b3b" }}>
            {product.inStock ? "Available" : "Out of Stock"}
          </span>
        </div>
      </div>
    </div>
  );
}


// ── Main Sarong Page ─────────────────────────────────────────────
export default function Sarong() {
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
    <div className="sr-page">

      <Header />

      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="sr-page-wrap">
        <Sidebar
          selSize={selSize} setSelSize={(s) => { setSelSize(s); setLoaded(perPage); }}
          pMin={pMin} setPMin={setPMin}
          pMax={pMax} setPMax={setPMax}
          showIn={showIn} setShowIn={(v) => { setShowIn(v); setLoaded(perPage); }}
          showOut={showOut} setShowOut={(v) => { setShowOut(v); setLoaded(perPage); }}
          onApply={handleApply}
        />

        <main className="sr-main">
          <div className="sr-bc">
            <a href="#">Home</a><span className="sr-sep">›</span>
            <a href="#">Men</a><span className="sr-sep">›</span>
            <span className="sr-cur">Sarong</span>
          </div>

          <div className="sr-topbar">
            <h1 className="sr-pg-title">Saro<span>ng</span></h1>
            <div className="sr-tb-ctrl">
              <span className="sr-tbl">Per Page</span>
              <select className="sr-tb-sel" value={perPage} onChange={(e) => setPerPage(parseInt(e.target.value))}>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
              </select>
              <span className="sr-tbl">Sort By</span>
              <select className="sr-tb-sel" value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
                <option value="new">Date, new to old</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </div>
          </div>

          <div className="sr-rinfo">{filtered.length} products found</div>

          {filtered.length === 0 ? (
            <div className="sr-empty">No products match your filters.</div>
          ) : (
            <div className="sr-pgrid">
              {visible.map((p) => (
                <ProductCard key={p.id} product={p} prices={prices} onPriceUpdate={handlePriceUpdate} />
              ))}
            </div>
          )}

          <div className="sr-lmwrap">
            <button
              className="sr-lmbtn"
              disabled={allLoaded}
              onClick={() => setLoaded((prev) => prev + perPage)}
            >
              {allLoaded ? "All products loaded" : `Load More (${filtered.length - loaded} remaining)`}
            </button>
          </div>
        </main>
      </div>

      <Footer />

    </div>
  );
}