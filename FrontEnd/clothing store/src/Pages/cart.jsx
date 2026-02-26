import { useState } from "react";
import "./cart.css";

const ProductSVG = () => (
  <svg viewBox="0 0 82 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="82" height="100" fill="#e8ddd5" />
    <ellipse cx="41" cy="28" rx="15" ry="18" fill="#d4a574" />
    <path d="M26 22 C26 8 56 8 56 22 C56 15 52 11 41 11 C30 11 26 15 26 22Z" fill="#3d2008" />
    <path d="M13 100 C13 64 23 53 41 51 C59 53 69 64 69 100Z" fill="#c0834a" />
    <path d="M18 70 C8 65 5 54 9 45 C16 35 22 51 25 64Z" fill="#c0834a" />
    <path d="M64 70 C74 65 77 54 73 45 C66 35 60 51 57 64Z" fill="#c0834a" />
    <path d="M32 51 C32 45 41 42 41 42 C41 42 50 45 50 51Z" fill="#d4956a" />
  </svg>
);

const initialItems = [
  { id: 1, name: "Long Sleeve", size: 28, price: 2500, qty: 1, color: "#c0736a" },
  { id: 2, name: "Long Sleeve", size: 28, price: 2500, qty: 1, color: "#c0736a" },
];

export default function Cart() {
  const [items, setItems]       = useState(initialItems);
  const [selected, setSelected] = useState(new Set());

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const changeQty = (id, delta) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
        )
        .filter((item) => item.qty > 0)
    );
    if (delta < 0) {
      const item = items.find((i) => i.id === id);
      if (item && item.qty + delta <= 0) {
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const subtotal = items
    .filter((item) => selected.has(item.id))
    .reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="cart-page-wrapper">

      {/* ── Header ── */}
      <header className="cart-header">
        <img src="/logo.jpeg" alt="CLiCK" className="cart-logo-img" />
        <div className="cart-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="#1e1e1e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span className="cart-icon-badge">+</span>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="cart-main">
        <h1 className="cart-page-title">Your Cart</h1>

        <div className="cart-layout">

          {/* ── Cart Items ── */}
          <div className="cart-items-container">

            {/* Column Header */}
            <div className="cart-table-header">
              <span>Product</span>
              <span className="th-center">Price</span>
              <span className="th-center">Quantity</span>
              <span className="th-center">Total</span>
              <span />
            </div>

            {/* Item Rows */}
            {items.map((item) => (
              <div className="cart-row" key={item.id}>

                {/* Select Circle */}
                <div
                  className={`select-circle${selected.has(item.id) ? " selected" : ""}`}
                  onClick={() => toggleSelect(item.id)}
                />

                {/* Product */}
                <div className="product-cell">
                  <div className="product-image">
                    <ProductSVG />
                  </div>
                  <div className="product-meta">
                    <span className="product-name">{item.name}</span>
                    <div className="product-info-row">
                      <span className="product-size">{item.size}</span>
                      <span
                        className="product-color-swatch"
                        style={{ background: item.color }}
                      />
                      <span className="edit-icon">✏️</span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="price-cell">Rs.{item.price.toFixed(2)}</div>

                {/* Quantity */}
                <div className="qty-cell">
                  <div className="qty-control">
                    <button onClick={() => changeQty(item.id, -1)}>−</button>
                    <span className="qty-num">{item.qty}</span>
                    <button onClick={() => changeQty(item.id, 1)}>+</button>
                  </div>
                </div>

                {/* Total */}
                <div className="total-cell">
                  Rs.{(item.price * item.qty).toFixed(2)}
                </div>

                {/* Remove */}
                <div className="remove-cell">
                  <button className="remove-btn" onClick={() => removeItem(item.id)}>✕</button>
                </div>

              </div>
            ))}
          </div>

          {/* ── Order Summary ── */}
          <aside className="order-summary">
            <h2 className="summary-title">Order Summary</h2>
            <div className="summary-divider" />
            <div className="summary-row">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-divider" />
            <p className="shipping-note">Shipping calculated at checkout</p>
            <button className="btn-checkout">Proceed to Checkout</button>
            <button className="btn-continue">Continue Shopping</button>
          </aside>

        </div>
      </main>
    </div>
  );
}