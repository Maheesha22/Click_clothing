import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Shirts.css";

const ALL_PRODUCTS = [
  { id:1,  name:"Oxford Button-Down – White",    basePrice:2890, sizes:["S","M","L","XL"],       inStock:true,  img:"https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=82" },
  { id:2,  name:"Linen Casual Shirt – Sky",       basePrice:3190, sizes:["M","L","XL","XXL"],     inStock:true,  img:"https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=82" },
  { id:3,  name:"Slim Fit Formal – Navy",         basePrice:3490, sizes:["S","M","L"],            inStock:false, img:"https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600&q=82" },
  { id:4,  name:"Flannel Check Shirt – Red",      basePrice:2650, sizes:["M","L","XL"],           inStock:true,  img:"https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=82" },
  { id:5,  name:"Hawaiian Print Shirt",           basePrice:2190, sizes:["S","M","L","XL","XXL"], inStock:true,  img:"https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=600&q=82" },
  { id:6,  name:"Mandarin Collar Shirt – Black",  basePrice:3750, sizes:["M","L","XL"],           inStock:true,  img:"https://images.unsplash.com/photo-1594938298603-c8148c4b4a0c?w=600&q=82" },
  { id:7,  name:"Denim Shirt – Medium Wash",      basePrice:3290, sizes:["S","M","L","XL"],       inStock:false, img:"https://images.unsplash.com/photo-1542060748-10c28b62716f?w=600&q=82" },
  { id:8,  name:"Poplin Shirt – Powder Blue",     basePrice:2450, sizes:["M","L","XL","XXL"],     inStock:true,  img:"https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=82" },
  { id:9,  name:"Chambray Shirt – Indigo",        basePrice:2990, sizes:["S","M","L"],            inStock:true,  img:"https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=82" },
  { id:10, name:"Twill Shirt – Olive Green",      basePrice:3100, sizes:["M","L","XL"],           inStock:true,  img:"https://images.unsplash.com/photo-1604644401890-0bd678c83788?w=600&q=82" },
  { id:11, name:"Slim Formal Shirt – White",      basePrice:3890, sizes:["S","M","L","XL","XXL"], inStock:true,  img:"https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=600&q=82" },
  { id:12, name:"Resort Shirt – Coral Print",     basePrice:2800, sizes:["M","L","XL"],           inStock:false, img:"https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=82" },
  { id:13, name:"Striped Button-Down – Blue",     basePrice:2590, sizes:["S","M","L","XL"],       inStock:true,  img:"https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=82" },
  { id:14, name:"Premium Cotton Shirt – Sage",    basePrice:4190, sizes:["M","L","XL","XXL"],     inStock:true,  img:"https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=82" },
  { id:15, name:"Camp Collar Shirt – Ecru",       basePrice:3350, sizes:["S","M","L","XL"],       inStock:true,  img:"https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=82" },
  { id:16, name:"Banded Collar Shirt – Slate",    basePrice:2950, sizes:["M","L","XL"],           inStock:true,  img:"https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=600&q=82" },
  { id:17, name:"Textured Weave Shirt – Tan",     basePrice:3690, sizes:["S","M","L","XL","XXL"], inStock:false, img:"https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=82" },
  { id:18, name:"Relaxed Linen Shirt – Cream",    basePrice:3090, sizes:["M","L","XL"],           inStock:true,  img:"https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=82" },
  { id:19, name:"Dobby Texture Shirt – Burgundy", basePrice:4290, sizes:["S","M","L"],            inStock:true,  img:"https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=82" },
  { id:20, name:"Oversized Casual Shirt – Sand",  basePrice:2290, sizes:["M","L","XL","XXL"],     inStock:true,  img:"https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&q=82" },
];

const ALL_SIZES = ["S","M","L","XL","XXL"];

const MEN_MENU = [
  { label: "Sarong",     page: "sarong"   },
  { label: "Trousers",   page: "trousers" },
  { label: "Shirts",     page: "shirts"   },
  { label: "T-Shirts",   page: "tshirts"  },
  { label: "Shorts",     page: "shorts"   },
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

function Sidebar({ selSize, setSelSize, pMin, setPMin, pMax, setPMax, showIn, setShowIn, showOut, setShowOut, onApply }) {
  return (
    <aside className="sh-sidebar">
      <div className="sh-sb-brand">Filters</div>
      <div className="sh-sb-sec">
        <div className="sh-sb-lbl">Size</div>
        <div className="sh-sb-sizes">
          {ALL_SIZES.map((s) => (
            <button
              key={s}
              className={`sh-sb-sz ${selSize === s ? "active" : ""}`}
              onClick={() => setSelSize(selSize === s ? null : s)}
            >
              {s}
            </button>
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
          <label className="sh-av-opt"><input type="checkbox" checked={showIn} onChange={(e) => setShowIn(e.target.checked)} /> In Stock</label>
          <label className="sh-av-opt"><input type="checkbox" checked={showOut} onChange={(e) => setShowOut(e.target.checked)} /> Out of Stock</label>
        </div>
      </div>
    </aside>
  );
}

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
    <div className="sh-pcard">
      <div className="sh-imgw">
        <img src={product.img} alt={product.name} loading="lazy"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80"; }} />
        <span className={`sh-av-badge ${product.inStock ? "in" : "out"}`}>
          {product.inStock ? "In Stock" : "Out of Stock"}
        </span>
        <div className="sh-hicons">
          <button className={`sh-hico ${wished ? "liked" : ""}`} onClick={() => setWished(!wished)}><HeartIcon /></button>
          <button className="sh-hico"><EyeIcon /></button>
        </div>
        <div className="sh-qadd">QUICK ADD</div>
      </div>
      <div className="sh-pbody">
        <div className="sh-pname">{product.name}</div>
        <div className="sh-pprow">
          <span className="sh-pprice">Rs {price.toLocaleString()}.00</span>
          <button className="sh-pedit-btn" onClick={() => setEditing(!editing)}>Edit price</button>
        </div>
        {editing && (
          <div className="sh-pedit-wrap">
            <input type="number" value={editVal} min="0" onChange={(e) => setEditVal(e.target.value)} />
            <button onClick={handleSave}>Save</button>
          </div>
        )}
        <EmiRow price={price} />
        <div className="sh-psizes">
          {ALL_SIZES.map((s) => {
            const has = product.sizes.includes(s);
            return (
              <button key={s}
                className={`sh-psz ${!has ? "na" : ""} ${selSize === s && has ? "picked" : ""}`}
                onClick={() => has && setSelSize(selSize === s ? null : s)}
              >{s}</button>
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

export default function Shirts() {
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

  function handlePriceUpdate(id, val) { setPrices((prev) => ({ ...prev, [id]: val })); }
  function handleApply() { setAppliedMin(pMin); setAppliedMax(pMax); setLoaded(perPage); }

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
    <div className="sh-page">
      <Header />
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="sh-page-wrap">
        <Sidebar
          selSize={selSize} setSelSize={(s) => { setSelSize(s); setLoaded(perPage); }}
          pMin={pMin} setPMin={setPMin} pMax={pMax} setPMax={setPMax}
          showIn={showIn} setShowIn={(v) => { setShowIn(v); setLoaded(perPage); }}
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
                <option value="10">10</option><option value="20">20</option><option value="30">30</option>
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
                <ProductCard key={p.id} product={p} prices={prices} onPriceUpdate={handlePriceUpdate} />
              ))}
            </div>
          )}
          <div className="sh-lmwrap">
            <button className="sh-lmbtn" disabled={allLoaded} onClick={() => setLoaded((prev) => prev + perPage)}>
              {allLoaded ? "All products loaded" : `Load More (${filtered.length - loaded} remaining)`}
            </button>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}