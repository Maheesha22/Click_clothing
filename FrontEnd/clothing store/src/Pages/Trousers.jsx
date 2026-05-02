import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Trousers.css";
import { useNavigate } from "react-router-dom";


// ── Product Data ────────────────────────────────────────────────
const ALL_PRODUCTS = [
  {
    id:1, name:"Tito Men's Chino Pant", basePrice:2295, sizes:[28,30,32,34,36], inStock:true,
    colors:["#f5f5f0","#111111","#1a3a5c"],
    colorImages:{
      "#f5f5f0":"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=82",
      "#111111":"https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=82",
      "#1a3a5c":"https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=82",
    },
    img:"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=82"
  },
  {
    id:2, name:"Moose Chino Pant – Brick", basePrice:3490, sizes:[30,32,34,36], inStock:true,
    colors:["#8b3a2a","#111111"],
    colorImages:{
      "#8b3a2a":"https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=600&q=82",
      "#111111":"https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=82",
    },
    img:"https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=600&q=82"
  },
  {
    id:3, name:"Moose Chino Pant – Clay", basePrice:3490, sizes:[28,30,32], inStock:true,
    colors:["#c4a882","#f5f5f0"],
    colorImages:{
      "#c4a882":"https://images.unsplash.com/photo-1594938298603-c8148c4b4a0c?w=600&q=82",
      "#f5f5f0":"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=82",
    },
    img:"https://images.unsplash.com/photo-1594938298603-c8148c4b4a0c?w=600&q=82"
  },
  {
    id:4, name:"Moose Chino – Steel Blue", basePrice:3490, sizes:[32,34,36,38], inStock:false,
    colors:["#4a6fa5","#f5f5f0","#111111"],
    colorImages:{
      "#4a6fa5":"https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=82",
      "#f5f5f0":"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=82",
      "#111111":"https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=82",
    },
    img:"https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=82"
  },
  {
    id:5, name:"Classic Slim Fit Trouser", basePrice:2890, sizes:[28,30,32,34,36,38], inStock:true,
    colors:["#111111","#f5f5f0","#1a3a5c"],
    colorImages:{
      "#111111":"https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=82",
      "#f5f5f0":"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=82",
      "#1a3a5c":"https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=82",
    },
    img:"https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=82"
  },
  {
    id:6, name:"Urban Cargo Trouser", basePrice:3190, sizes:[30,32,34], inStock:true,
    colors:["#3d4a2e","#111111"],
    colorImages:{
      "#3d4a2e":"https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=82",
      "#111111":"https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=82",
    },
    img:"https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=82"
  },
  {
    id:7, name:"Linen Blend Straight Trouser", basePrice:2650, sizes:[28,30,32,34], inStock:true,
    colors:["#d4c5a9","#f5f5f0","#111111"],
    colorImages:{
      "#d4c5a9":"https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=600&q=82",
      "#f5f5f0":"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=82",
      "#111111":"https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=82",
    },
    img:"https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=600&q=82"
  },
  {
    id:8, name:"Formal Tapered Trouser – Navy", basePrice:3990, sizes:[30,32,34,36,38,40], inStock:false,
    colors:["#1a3a5c","#111111"],
    colorImages:{
      "#1a3a5c":"https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=82",
      "#111111":"https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=82",
    },
    img:"https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=82"
  },
  {
    id:9, name:"Stretch Slim Trouser – Black", basePrice:3100, sizes:[30,32,34,36], inStock:true,
    colors:["#111111","#444444"],
    colorImages:{
      "#111111":"https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=82",
      "#444444":"https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=82",
    },
    img:"https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=82"
  },
  {
    id:10, name:"Relaxed Fit Chino – Olive", basePrice:2450, sizes:[28,30,32,34,36], inStock:true,
    colors:["#6b7a3e","#f5f5f0"],
    colorImages:{
      "#6b7a3e":"https://images.unsplash.com/photo-1604644401890-0bd678c83788?w=600&q=82",
      "#f5f5f0":"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=82",
    },
    img:"https://images.unsplash.com/photo-1604644401890-0bd678c83788?w=600&q=82"
  },
  {
    id:11, name:"Premium Wool Blend Trouser", basePrice:5490, sizes:[32,34,36,38], inStock:true,
    colors:["#888888","#111111","#1a3a5c"],
    colorImages:{
      "#888888":"https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=82",
      "#111111":"https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=82",
      "#1a3a5c":"https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=82",
    },
    img:"https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=82"
  },
  {
    id:12, name:"Cropped Chino – Sand", basePrice:2190, sizes:[28,30,32], inStock:false,
    colors:["#c4a882","#f5f5f0"],
    colorImages:{
      "#c4a882":"https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=82",
      "#f5f5f0":"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=82",
    },
    img:"https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=82"
  },
  {
    id:13, name:"Wide Leg Trouser – Charcoal", basePrice:3750, sizes:[30,32,34,36,38], inStock:true,
    colors:["#444444","#111111"],
    colorImages:{
      "#444444":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=82",
      "#111111":"https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=82",
    },
    img:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=82"
  },
  {
    id:14, name:"Slim Fit Chino – Camel", basePrice:2895, sizes:[28,30,32,34], inStock:true,
    colors:["#c4a060","#f5f5f0","#111111"],
    colorImages:{
      "#c4a060":"https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=82",
      "#f5f5f0":"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=82",
      "#111111":"https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=82",
    },
    img:"https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=82"
  },
  {
    id:15, name:"Tailored Trousers – Slate", basePrice:4290, sizes:[32,34,36,38,40], inStock:true,
    colors:["#6e7f8d","#111111"],
    colorImages:{
      "#6e7f8d":"https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=82",
      "#111111":"https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=82",
    },
    img:"https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=82"
  },
  {
    id:16, name:"Jogger Style Trouser", basePrice:2100, sizes:[28,30,32,34,36], inStock:true,
    colors:["#111111","#f5f5f0","#1a3a5c"],
    colorImages:{
      "#111111":"https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=600&q=82",
      "#f5f5f0":"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=82",
      "#1a3a5c":"https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=82",
    },
    img:"https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=600&q=82"
  },
  {
    id:17, name:"Pintuck Trouser – Ecru", basePrice:3350, sizes:[28,30,32,34,36,38], inStock:false,
    colors:["#ece8dc","#d4c5a9"],
    colorImages:{
      "#ece8dc":"https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=82",
      "#d4c5a9":"https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=600&q=82",
    },
    img:"https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=82"
  },
  {
    id:18, name:"Performance Stretch Trouser", basePrice:3690, sizes:[30,32,34,36], inStock:true,
    colors:["#111111","#1a3a5c","#444444"],
    colorImages:{
      "#111111":"https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&q=82",
      "#1a3a5c":"https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=82",
      "#444444":"https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=82",
    },
    img:"https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&q=82"
  },
  {
    id:19, name:"Corduroy Trouser – Burgundy", basePrice:4100, sizes:[32,34,36,38], inStock:true,
    colors:["#6b2737","#111111"],
    colorImages:{
      "#6b2737":"https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=600&q=82",
      "#111111":"https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=82",
    },
    img:"https://images.unsplash.com/photo-1548883354-94bcfe321cbb?w=600&q=82"
  },
  {
    id:20, name:"Chino Shorts – Khaki", basePrice:1890, sizes:[30,32,34,36], inStock:true,
    colors:["#b5a47a","#f5f5f0","#111111"],
    colorImages:{
      "#b5a47a":"https://images.unsplash.com/photo-1547496502-affa22d38842?w=600&q=82",
      "#f5f5f0":"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=82",
      "#111111":"https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=82",
    },
    img:"https://images.unsplash.com/photo-1547496502-affa22d38842?w=600&q=82"
  },
];

// ── Seed Reviews ────────────────────────────────────────────────
const SEED_REVIEWS = {
  1: [
    { id:1, name:"Ashan P.", date:"Mar 2025", rating:5, text:"Fits perfectly and the fabric quality is superb. The chino cut is modern without being too slim. Will definitely buy again.", verified:true },
    { id:2, name:"Dilnoza R.", date:"Feb 2025", rating:4, text:"Great trouser for everyday wear. The color is exactly as shown. Sizing runs slightly large, so I ordered one size down.", verified:true },
    { id:3, name:"Kamal S.", date:"Jan 2025", rating:5, text:"Very comfortable and well-stitched. Wore it to a work presentation and got several compliments!", verified:false },
  ],
  2: [
    { id:1, name:"Nuwan F.", date:"Apr 2025", rating:4, text:"The brick color is absolutely gorgeous in person. Material feels premium and holds its shape well after washing.", verified:true },
    { id:2, name:"Imasha T.", date:"Mar 2025", rating:5, text:"Exactly what I was looking for! The fit is spot on for my body type and the color doesn't fade.", verified:true },
  ],
  3: [
    { id:1, name:"Sachith M.", date:"Mar 2025", rating:3, text:"Nice color but the fit around the waist is a bit snug. Might need to size up if you're between sizes.", verified:true },
    { id:2, name:"Ravi K.", date:"Feb 2025", rating:4, text:"Good quality chino. Clay color is subtle and earthy, pairs well with most tops.", verified:false },
  ],
  4: [
    { id:1, name:"Priya A.", date:"Jan 2025", rating:5, text:"Stunning steel blue! I was worried about the shade but it's perfect. Too bad it went out of stock.", verified:true },
  ],
  5: [
    { id:1, name:"Tharaka B.", date:"Apr 2025", rating:5, text:"Classic slim fit done right. The trouser drapes well and the construction is solid. Highly recommend.", verified:true },
    { id:2, name:"Lalani W.", date:"Mar 2025", rating:4, text:"Good everyday trouser. Black version is especially versatile. Would love more color options.", verified:true },
    { id:3, name:"Hassan M.", date:"Feb 2025", rating:5, text:"Bought this for a wedding and got so many compliments. Excellent value for the price.", verified:true },
  ],
};

// Generate placeholder reviews for products without specific ones
function getReviews(productId) {
  if (SEED_REVIEWS[productId]) return SEED_REVIEWS[productId];
  const names = ["Chamara N.","Sanduni P.","Rohan V.","Malsha T.","Isuru K.","Dinuka R.","Sewwandi F."];
  const texts = [
    "Really happy with this purchase. The fit is great and material feels durable.",
    "Ordered based on reviews and wasn't disappointed. Would recommend to friends.",
    "Good quality for the price. Shipping was fast and packaging was neat.",
    "Fits true to size. Very comfortable for long days at the office.",
    "Nice product overall. Minor wish: more color variety, but what's available is solid.",
  ];
  const count = (productId % 3) + 1;
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: names[(productId + i) % names.length],
    date: ["Apr 2025","Mar 2025","Feb 2025"][i % 3],
    rating: [5,4,4,5,3][(productId + i) % 5],
    text: texts[(productId + i) % texts.length],
    verified: i % 2 === 0,
  }));
}

const ALL_SIZES = [28, 30, 32, 34, 36, 38, 40];

const MEN_MENU = [
  { label: "Sarong",    page: "sarong"   },
  { label: "Trousers",  page: "trousers" },
  { label: "Shirts" , page: "shirts"   },
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
const StarIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#c8982a" : "none"} stroke="#c8982a" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const EditIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);


// ── Star Rating Display ─────────────────────────────────────────
function StarRating({ rating, size = 14 }) {
  return (
    <div className="tr-stars">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= rating ? "#c8982a" : "none"}
          stroke="#c8982a" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

// ── Interactive Star Picker ─────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="tr-star-picker">
      {[1,2,3,4,5].map(i => (
        <button
          key={i}
          type="button"
          className="tr-star-pick-btn"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24"
            fill={i <= (hovered || value) ? "#c8982a" : "none"}
            stroke="#c8982a" strokeWidth="2"
            style={{ transition: "fill .15s" }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      ))}
      <span className="tr-star-label">{["","Poor","Fair","Good","Very Good","Excellent"][hovered || value]}</span>
    </div>
  );
}


// ── Color Swatch Strip (on card) ─────────────────────────────────
function ColorSwatches({ colors, selColor, onSelect }) {
  return (
    <div className="tr-color-row">
      {colors.map((c, i) => (
        <button
          key={i}
          title={c}
          className={`tr-color-swatch ${selColor === c ? "active" : ""}`}
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

  function sync(val) { setHex(val); setManual(val); }
  function handleManual(val) {
    setManual(val);
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) setHex(val);
  }

  return (
    <div className="tr-addcolor-panel">
      <div className="tr-addcolor-title">Add New Color</div>
      <div className="tr-addcolor-row">
        <input type="color" value={hex} onChange={(e) => sync(e.target.value)} className="tr-color-picker" />
        <input type="text" value={manual} maxLength={7} placeholder="#rrggbb"
          onChange={(e) => handleManual(e.target.value)} className="tr-color-hex-input" />
        <div className="tr-color-preview" style={{ background: hex }} />
      </div>
      <div className="tr-addcolor-btns">
        <button className="tr-addcolor-confirm" onClick={() => { onAdd(hex); onClose(); }}>Add Color</button>
        <button className="tr-addcolor-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}


// ── Reviews Section ─────────────────────────────────────────────
function ReviewsSection({ productId, productName }) {
  const [reviews, setReviews] = useState(() => getReviews(productId));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", rating: 0, text: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;
  const ratingCounts = [5,4,3,2,1].map(n => ({ n, count: reviews.filter(r => r.rating === n).length }));

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.rating) e.rating = "Please select a rating";
    if (form.text.trim().length < 10) e.text = "Review must be at least 10 characters";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const newReview = {
      id: Date.now(),
      name: form.name.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      rating: form.rating,
      text: form.text.trim(),
      verified: false,
      isNew: true,
    };
    setReviews(prev => [newReview, ...prev]);
    setForm({ name: "", rating: 0, text: "" });
    setErrors({});
    setShowForm(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  }

  return (
    <div className="tr-reviews-section">
      <div className="tr-reviews-header">
        <div className="tr-reviews-title-row">
          <h3 className="tr-reviews-title">Customer Reviews</h3>
          {!showForm && (
            <button className="tr-write-review-btn" onClick={() => setShowForm(true)}>
              <EditIcon /> Write a Review
            </button>
          )}
        </div>

        {/* Summary bar */}
        <div className="tr-reviews-summary">
          <div className="tr-reviews-avg-block">
            <span className="tr-reviews-avg-num">{avgRating.toFixed(1)}</span>
            <StarRating rating={Math.round(avgRating)} size={16} />
            <span className="tr-reviews-count">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="tr-reviews-bars">
            {ratingCounts.map(({ n, count }) => (
              <div className="tr-rev-bar-row" key={n}>
                <span className="tr-rev-bar-lbl">{n}★</span>
                <div className="tr-rev-bar-track">
                  <div className="tr-rev-bar-fill" style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }} />
                </div>
                <span className="tr-rev-bar-n">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success toast */}
      {submitted && (
        <div className="tr-review-toast">
          <CheckIcon /> Your review has been posted. Thank you!
        </div>
      )}

      {/* Write Review Form */}
      {showForm && (
        <div className="tr-review-form">
          <div className="tr-review-form-title">Share Your Experience</div>
          <div className="tr-form-field">
            <label className="tr-form-lbl">Your Name</label>
            <input
              type="text"
              className={`tr-form-input ${errors.name ? "err" : ""}`}
              placeholder="e.g. Ashan P."
              value={form.name}
              onChange={e => { setForm(p => ({...p, name: e.target.value})); setErrors(p => ({...p, name:""})); }}
            />
            {errors.name && <span className="tr-form-err">{errors.name}</span>}
          </div>
          <div className="tr-form-field">
            <label className="tr-form-lbl">Rating</label>
            <StarPicker value={form.rating} onChange={v => { setForm(p => ({...p, rating: v})); setErrors(p => ({...p, rating:""})); }} />
            {errors.rating && <span className="tr-form-err">{errors.rating}</span>}
          </div>
          <div className="tr-form-field">
            <label className="tr-form-lbl">Your Review</label>
            <textarea
              className={`tr-form-textarea ${errors.text ? "err" : ""}`}
              placeholder="Tell others about the fit, quality, and your overall experience..."
              rows={3}
              value={form.text}
              onChange={e => { setForm(p => ({...p, text: e.target.value})); setErrors(p => ({...p, text:""})); }}
            />
            {errors.text && <span className="tr-form-err">{errors.text}</span>}
          </div>
          <div className="tr-form-actions">
            <button className="tr-form-submit" onClick={handleSubmit}>Post Review</button>
            <button className="tr-form-cancel" onClick={() => { setShowForm(false); setErrors({}); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Review list */}
      <div className="tr-reviews-list">
        {reviews.length === 0 ? (
          <div className="tr-no-reviews">No reviews yet. Be the first to share your experience!</div>
        ) : (
          reviews.map(r => (
            <div className={`tr-review-card ${r.isNew ? "tr-review-new" : ""}`} key={r.id}>
              <div className="tr-review-top">
                <div className="tr-review-avatar">{r.name.charAt(0)}</div>
                <div className="tr-review-meta">
                  <div className="tr-review-name-row">
                    <span className="tr-review-name">{r.name}</span>
                    {r.verified && (
                      <span className="tr-verified-badge"><CheckIcon /> Verified Purchase</span>
                    )}
                    {r.isNew && <span className="tr-new-badge">Just Posted</span>}
                  </div>
                  <div className="tr-review-date-row">
                    <StarRating rating={r.rating} size={12} />
                    <span className="tr-review-date">{r.date}</span>
                  </div>
                </div>
              </div>
              <p className="tr-review-text">{r.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Add to Cart Helper Function ─────────────────────────────────────────
// Custom hook for cart functionality
function useCart() {
  const navigate = useNavigate();
  
  const addToCartAndRedirect = (product, selectedColor, selectedSize, price) => {
    // Get color name from hex value
    const getColorName = (hex) => {
      const colorMap = {
        "#f5f5f0": "White",
        "#111111": "Black",
        "#1a3a5c": "Navy",
        "#8b3a2a": "Brick",
        "#c4a882": "Sand",
        "#4a6fa5": "Steel Blue",
        "#3d4a2e": "Olive",
        "#d4c5a9": "Sand",
        "#444444": "Gray",
        "#6b7a3e": "Olive",
        "#888888": "Gray",
        "#c4a060": "Camel",
        "#6e7f8d": "Slate",
        "#ece8dc": "White",
        "#6b2737": "Burgundy",
        "#b5a47a": "Khaki",
        "#c0736a": "Sand",
      };
      return colorMap[hex] || "Custom";
    };

    // Create cart item object matching Cart.jsx structure
    const cartItem = {
      id: Date.now(), // Use timestamp for unique ID
      name: product.name,
      size: selectedSize ? parseInt(selectedSize) : 32,
      sizeLabel: selectedSize ? selectedSize.toString() : "32",
      price: price,
      qty: 1,
      color: selectedColor || product.colors[0],
      colorName: selectedColor ? getColorName(selectedColor) : getColorName(product.colors[0]),
    };

    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if same product (same name, size, color) exists
    const existingItemIndex = existingCart.findIndex(
      item => item.name === cartItem.name && 
              item.sizeLabel === cartItem.sizeLabel && 
              item.colorName === cartItem.colorName
    );
    
    if (existingItemIndex > -1) {
      // Increment quantity if exists
      existingCart[existingItemIndex].qty += 1;
    } else {
      // Add new item
      existingCart.push(cartItem);
    }
    
    // Save back to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Dispatch custom event for cart update
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: existingCart }));
    
    // Redirect to cart page
    navigate('/cart');
  };
  
  return { addToCartAndRedirect };
}

// ── Product Modal (Modified with Add to Cart) ────────────────────────────────────────────────
function ProductModal({ product, price, extraColors, onAddColor, onRemoveColor, onClose }) {
  const [zoom, setZoom]         = useState(1);
  const [selColor, setSelColor] = useState(null);
  const [selSize, setSelSize]   = useState(null);
  const [addingColor, setAddingColor] = useState(false);
  const [imgKey, setImgKey]     = useState(0);
  const { addToCartAndRedirect } = useCart();

  const allColors = [...product.colors, ...extraColors];
  const ZOOM_STEP = 0.25, MAX_ZOOM = 3, MIN_ZOOM = 1;

  // Resolve current image based on selected color
  const currentImg = (() => {
    if (selColor && product.colorImages && product.colorImages[selColor]) {
      return product.colorImages[selColor];
    }
    return product.img;
  })();

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (!selSize) {
      alert("Please select a size");
      return;
    }
    if (!selColor && allColors.length > 0) {
      alert("Please select a color");
      return;
    }
    
    // Use selected color or first available
    const finalColor = selColor || allColors[0];
    addToCartAndRedirect(product, finalColor, selSize, price);
  };

  function handleColorSelect(color) {
    const next = selColor === color ? null : color;
    setSelColor(next);
    setZoom(1);
    setImgKey(k => k + 1);
  }

  const handleZoomIn  = (e) => { e.stopPropagation(); setZoom(z => Math.min(z + ZOOM_STEP, MAX_ZOOM)); };
  const handleZoomOut = (e) => { e.stopPropagation(); setZoom(z => Math.max(z - ZOOM_STEP, MIN_ZOOM)); };

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="tr-modal-overlay" onClick={onClose}>
      <div className="tr-modal-box" onClick={(e) => e.stopPropagation()}>

        <button className="tr-modal-close" onClick={onClose}><CloseIcon /></button>

        {/* Left: Image pane */}
        <div className="tr-modal-imgpane">
          <div className="tr-modal-imgscroll">
            <img
              key={imgKey}
              src={currentImg}
              alt={product.name}
              className="tr-modal-img-fade"
              style={{ transform: `scale(${zoom})`, transition: "transform .25s ease" }}
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&q=80"; }}
            />
          </div>

          {/* Color indicator strip under image */}
          {selColor && (
            <div className="tr-modal-color-indicator" style={{ background: selColor }}>
              <span className="tr-modal-color-label">
                {selColor === "#f5f5f0" || selColor === "#ece8dc" ? "Light / Off-White" : `Selected Color`}
              </span>
            </div>
          )}

          <div className="tr-modal-zoom">
            <button onClick={handleZoomOut} disabled={zoom <= MIN_ZOOM} title="Zoom out"><ZoomOutIcon /></button>
            <span className="tr-modal-zoomlvl">{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn}  disabled={zoom >= MAX_ZOOM} title="Zoom in"><ZoomInIcon /></button>
          </div>
        </div>

        {/* Right: Info + Reviews scrollable pane */}
        <div className="tr-modal-right">
          <div className="tr-modal-info">
            <span className={`tr-modal-badge ${product.inStock ? "in" : "out"}`}>
              {product.inStock ? "In Stock" : "Out of Stock"}
            </span>

            <h2 className="tr-modal-name">{product.name}</h2>
            <div className="tr-modal-price">Rs {price.toLocaleString()}.00</div>

            {/* Colors */}
            <div>
              <div className="tr-modal-sizelbl">
                Available Colors
                {selColor && <span className="tr-modal-color-hint"> — click to see different shade</span>}
              </div>
              <div className="tr-modal-colors-wrap">
                {allColors.map((c, i) => {
                  const isExtra = i >= product.colors.length;
                  return (
                    <div key={i} className="tr-modal-swatch-wrap">
                      <button
                        title={c}
                        className={`tr-modal-swatch ${selColor === c ? "active" : ""}`}
                        style={{
                          background: c,
                          border: c === "#f5f5f0" || c === "#ece8dc" ? "2px solid #ccc" : "2px solid transparent"
                        }}
                        onClick={() => handleColorSelect(c)}
                      />
                      {isExtra && (
                        <button className="tr-modal-swatch-del" title="Remove color"
                          onClick={() => onRemoveColor(i - product.colors.length)}>
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  );
                })}
                {!addingColor && (
                  <button className="tr-modal-addcolor-btn" title="Add new color" onClick={() => setAddingColor(true)}>
                    <PlusIcon />
                  </button>
                )}
              </div>
              {addingColor && (
                <AddColorPanel onAdd={onAddColor} onClose={() => setAddingColor(false)} />
              )}
            </div>

            {/* Sizes - Made interactive */}
            <div>
              <div className="tr-modal-sizelbl">
                Available Sizes
                {selSize && <span className="tr-modal-color-hint"> — selected {selSize}</span>}
              </div>
              <div className="tr-modal-sizes">
                {ALL_SIZES.map((s) => {
                  const has = product.sizes.includes(s);
                  return (
                    <button
                      key={s}
                      className={`tr-modal-sz ${has ? "avail" : "na"} ${selSize === s ? "selected" : ""}`}
                      onClick={() => has && setSelSize(s)}
                      disabled={!has}
                      style={{
                        cursor: has ? "pointer" : "not-allowed",
                        background: selSize === s ? "#1a1a1a" : "transparent",
                        color: selSize === s ? "white" : (has ? "inherit" : "#ccc"),
                        border: selSize === s ? "1px solid #1a1a1a" : "1px solid #ddd"
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="tr-modal-emi">
              or pay in 3 x <strong>Rs {Math.round(price / 3).toLocaleString()}</strong> with <span className="tr-koko">KOKO</span><br />
              3 x <strong>Rs {Math.round(price / 3).toLocaleString()}</strong> or 3% Cashback with <span className="tr-mint">mintpay</span><br />
              up to 4 x <strong>Rs {Math.round(price / 4).toLocaleString()}</strong> with <span className="tr-payzy">PayZy</span>
            </div>

            {/* Modified Add to Cart button */}
            <button 
              className="tr-modal-atc" 
              disabled={!product.inStock}
              onClick={handleAddToCart}
            >
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>

          {/* Reviews */}
          <ReviewsSection productId={product.id} productName={product.name} />
        </div>
      </div>
    </div>
  );
}


// ── Tab Bar ─────────────────────────────────────────────────────
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
                <div className="tr-tab-dd-item" key={item.label}
                  onClick={() => item.page && navigateTo(item.page)}
                  style={item.page ? { cursor: "pointer" } : {}}>
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
            <button key={s} className={`tr-sb-sz ${selSize === s ? "active" : ""}`}
              onClick={() => setSelSize(selSize === s ? null : s)}>{s}</button>
          ))}
        </div>
      </div>
      <div className="tr-sb-sec">
        <div className="tr-sb-lbl">Price Range (Rs)</div>
        <div className="tr-pf-fields">
          <div className="tr-pf-row">Min <input type="number" value={pMin} min="0" onChange={(e) => setPMin(parseInt(e.target.value) || 0)} /></div>
          <div className="tr-pf-row">Max <input type="number" value={pMax} min="0" onChange={(e) => setPMax(parseInt(e.target.value) || 10000)} /></div>
        </div>
        <button className="tr-apply-btn" onClick={onApply}>Apply</button>
      </div>
      <div className="tr-sb-sec">
        <div className="tr-sb-lbl">Availability</div>
        <div className="tr-av-opts">
          <label className="tr-av-opt"><input type="checkbox" checked={showIn}  onChange={(e) => setShowIn(e.target.checked)}  /> In Stock</label>
          <label className="tr-av-opt"><input type="checkbox" checked={showOut} onChange={(e) => setShowOut(e.target.checked)} /> Out of Stock</label>
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

  const reviewCount = getReviews(product.id).length;
  const avgRating = (() => {
    const r = getReviews(product.id);
    return r.length ? (r.reduce((s, x) => s + x.rating, 0) / r.length) : 0;
  })();

  return (
    <div className="tr-pcard" onClick={() => onOpenModal(product)}>
      <div className="tr-imgw">
        <img src={product.img} alt={product.name} loading="lazy"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=80"; }} />
        <span className={`tr-av-badge ${product.inStock ? "in" : "out"}`}>
          {product.inStock ? "In Stock" : "Out of Stock"}
        </span>
        <div className="tr-hicons">
          <button className={`tr-hico ${wished ? "liked" : ""}`}
            onClick={(e) => { e.stopPropagation(); setWished(!wished); }}><HeartIcon /></button>
          <button className="tr-hico" onClick={(e) => e.stopPropagation()}><EyeIcon /></button>
        </div>
        <div className="tr-qadd" onClick={(e) => e.stopPropagation()}>QUICK ADD</div>
      </div>

      <div className="tr-pbody">
        <div className="tr-pname">{product.name}</div>

        {/* Mini rating on card */}
        <div className="tr-card-rating" onClick={(e) => e.stopPropagation()}>
          <StarRating rating={Math.round(avgRating)} size={11} />
          <span className="tr-card-rating-txt">({reviewCount})</span>
        </div>

        <div className="tr-pprow">
          <span className="tr-pprice">Rs {price.toLocaleString()}.00</span>
          <button className="tr-pedit-btn" onClick={(e) => { e.stopPropagation(); setEditing(!editing); }}>Edit price</button>
        </div>
        {editing && (
          <div className="tr-pedit-wrap" onClick={(e) => e.stopPropagation()}>
            <input type="number" value={editVal} min="0" onChange={(e) => setEditVal(e.target.value)} />
            <button onClick={handleSave}>Save</button>
          </div>
        )}
        <EmiRow price={price} />

        <div className="tr-color-section" onClick={(e) => e.stopPropagation()}>
          <div className="tr-color-lbl">Colors</div>
          <ColorSwatches colors={allColors} selColor={selColor} onSelect={setSelColor} />
        </div>

        <div className="tr-psizes">
          {ALL_SIZES.map((s) => {
            const has = product.sizes.includes(s);
            return (
              <button key={s}
                className={`tr-psz ${has ? "avail" : "na"} ${selSize === s && has ? "picked" : ""}`}
                onClick={(e) => { e.stopPropagation(); has && setSelSize(selSize === s ? null : s); }}>
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
  const [activeTab,    setActiveTab]   = useState("Men");
  const [selSize,      setSelSize]     = useState(null);
  const [pMin,         setPMin]        = useState(0);
  const [pMax,         setPMax]        = useState(10000);
  const [appliedMin,   setAppliedMin]  = useState(0);
  const [appliedMax,   setAppliedMax]  = useState(10000);
  const [showIn,       setShowIn]      = useState(true);
  const [showOut,      setShowOut]     = useState(true);
  const [sortMode,     setSortMode]    = useState("new");
  const [perPage,      setPerPage]     = useState(10);
  const [loaded,       setLoaded]      = useState(10);
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
    <div className="tr-page">
      <Header />
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="tr-page-wrap">
        <Sidebar
          selSize={selSize} setSelSize={(s) => { setSelSize(s); setLoaded(perPage); }}
          pMin={pMin} setPMin={setPMin}
          pMax={pMax} setPMax={setPMax}
          showIn={showIn}   setShowIn={(v)  => { setShowIn(v);  setLoaded(perPage); }}
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

          <div className="tr-lmwrap">
            <button className="tr-lmbtn" disabled={allLoaded}
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