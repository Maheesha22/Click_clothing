import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Footer from "../Components/footer";
import "./checkout.css";
import OrderConfirmationPopup from "./OrderConfirmationPopup";

// ── Constants ─────────────────────────────────────────────────────────────────
const DISTRICTS = [
  "Ampara","Anuradhapura","Badulla","Batticaloa","Colombo","Galle","Gampaha",
  "Hambantota","Jaffna","Kalutara","Kandy","Kegalle","Kilinochchi","Kurunegala",
  "Mannar","Matale","Matara","Monaragala","Mullaitivu","Nuwara Eliya",
  "Polonnaruwa","Puttalam","Ratnapura","Trincomalee","Vavuniya",
];

const PROVINCES = [
  "Central Province","Eastern Province","North Central Province",
  "Northern Province","North Western Province","Sabaragamuwa Province",
  "Southern Province","Uva Province","Western Province",
];

const BANK_DETAILS = [
  { label: "Bank Name",       value: "Bank of Ceylon" },
  { label: "Account Name",    value: "Click Pvt Ltd"  },
  { label: "Account Number",  value: "1234 5678 9012" },
  { label: "Branch",          value: "Colombo 03"     },
];

const SHIPPING = 400;

// ── Icons ──────────────────────────────────────────────────────────────────────
const CartIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5cb85c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────
export default function CheckoutPage() {

  const location = useLocation();
  const { selectedItems = [], subtotal: cartSubtotal = 0 } = location.state || {};

  const totalItemCount = selectedItems.reduce((sum, item) => sum + item.qty, 0);

  const total = cartSubtotal + SHIPPING;
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    email: "", offers: false, ship: false,
    firstName: "", lastName: "", address: "",
    city: "", district: "", province: "", phone: "",
    payment: "cod",
  });

  const [phoneState, setPhoneState] = useState({ error: "", status: "" }); // status: '' | 'error' | 'success'
  const [slipFile,   setSlipFile]   = useState(null);
  const [toast,      setToast]      = useState(false);
   const [showPopup,  setShowPopup]  = useState(false);
  const [orderData,  setOrderData]  = useState(null);

  const phoneRef    = useRef(null);
  const slipInputRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── Phone validation helpers ────────────────────────────────────────────────
  const phoneError   = (msg) => setPhoneState({ error: msg, status: "error" });
  const phoneClear   = ()    => setPhoneState({ error: "",  status: "" });
  const phoneSuccess = ()    => setPhoneState({ error: "",  status: "success" });

  const handlePhoneKeyDown = (e) => {
    const allowed = ["Backspace","Delete","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Tab","Home","End","Enter"];
    if (allowed.includes(e.key)) return;
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      phoneError("Phone number must contain numbers only. Letters and special characters are not allowed.");
    }
  };

  const handlePhonePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData("text");
    const digits = pasted.replace(/[^0-9]/g, "").slice(0, 10);
    const cur = form.phone, s = e.target.selectionStart, en = e.target.selectionEnd;
    const newVal = (cur.slice(0, s) + digits + cur.slice(en)).slice(0, 10);
    set("phone", newVal);
    if (newVal.length === 10) phoneSuccess();
    else phoneClear();
  };

  const handlePhoneInput = (e) => {
    const clean = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
    set("phone", clean);
    if (clean.length === 10) phoneSuccess();
    else phoneClear();
  };

  const handlePhoneBlur = () => {
    const len = form.phone.length;
    if      (len === 0)  phoneClear();
    else if (len < 10)   phoneError(`Phone number must be exactly 10 digits. Please enter ${10 - len} more digit${10 - len > 1 ? "s" : ""}.`);
    else                 phoneSuccess();
  };

  const handlePhoneFocus = () => {
    if (phoneState.status !== "error" && phoneState.status !== "success") phoneClear();
  };

  // ── Slip upload ─────────────────────────────────────────────────────────────
  const handleSlipUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSlipFile(file);
  };

  const removeSlip = (e) => {
    e.stopPropagation();
    setSlipFile(null);
    if (slipInputRef.current) slipInputRef.current.value = "";
  };

  // ── Confirm order ───────────────────────────────────────────────────────────
  const confirmOrder = () => {
    setFormError("");

  if (!form.email || !form.firstName || !form.lastName || !form.address) {
    setFormError("Please fill in all required fields!!!");
    return;
  }

  if (form.phone.length > 0 && form.phone.length < 10) {
    setFormError("Phone number must be exactly 10 digits.");
    phoneError(`Phone number must be exactly 10 digits.`);
    phoneRef.current?.focus();
    return;
  }

  if (form.payment === "bank" && !slipFile) {
    setFormError("Please upload your bank deposit slip before confirming the order.");
    slipInputRef.current?.click();
    return;
  }

  // clear error if everything is OK
  setFormError("");

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const orderDetails = {
      // Product information
      items: selectedItems,
      productName: selectedItems.length === 1 
        ? selectedItems[0].name 
        : `${selectedItems.length} items`,
      quantity: totalItemCount,
      price: total,
      
      // Payment information
      paymentMethod: form.payment === "cod" ? "Cash on Delivery" : "Bank Deposit",
      confirmed: true,
      paidDate: currentDate,
      paidAmount: total,
      
      // Customer information
      customerName: `${form.firstName} ${form.lastName}`,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      district: form.district,
      province: form.province,
      
      // Additional details
      subtotal: cartSubtotal,
      shipping: SHIPPING,
      slip: slipFile,
    };
 
    setOrderData(orderDetails);
    setShowPopup(true);

    setForm({
  email: "",
  offers: false,
  ship: false,
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  district: "",
  province: "",
  phone: "",
  payment: "cod",
});

    setToast(true);
    setTimeout(() => setToast(false), 3500);
  };

  

  // ── Keyboard Enter support ──────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== "Enter") return;
      const active = document.activeElement;

      if (active?.classList.contains("confirm-btn")) { e.preventDefault(); confirmOrder(); return; }
      if (active?.tagName === "INPUT" && ["text","email","tel"].includes(active.type)) { e.preventDefault(); confirmOrder(); return; }
      if (active?.tagName === "SELECT") {
        e.preventDefault();
        const focusable = Array.from(document.querySelectorAll("input[type=text],input[type=email],input[type=tel],select,button.confirm-btn"));
        const idx = focusable.indexOf(active);
        if (idx !== -1 && idx < focusable.length - 1) focusable[idx + 1].focus();
        return;
      }
      if (active?.id === "uploadSlipBox" || active?.closest?.("#uploadSlipBox")) {
        e.preventDefault(); slipInputRef.current?.click(); return;
      }
      if (active?.classList.contains("remove-file")) { e.preventDefault(); setSlipFile(null); return; }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [form, phoneState]);

  // ── Input focus style helpers ───────────────────────────────────────────────
  const focusStyle  = { borderColor: "#c9a882", background: "#fff", boxShadow: "0 0 0 3px rgba(201,168,130,0.12)" };
  const blurStyle   = { borderColor: "transparent", background: "#f5f5f5", boxShadow: "none" };
  const inputEvents = {
    onFocus: (e) => Object.assign(e.target.style, focusStyle),
    onBlur:  (e) => Object.assign(e.target.style, blurStyle),
  };


  return (
    <>
      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <div className="logo">Click</div>
        <button className="cart-btn" aria-label="Cart">
          <CartIcon />
          <span className="cart-badge">{totalItemCount}</span>
        </button>
      </nav>

      {/* ── MAIN GRID ── */}
      <div className="checkout-wrapper">

        {/* ── LEFT PANEL ── */}
        <div className="panel">
          {formError && (
            <div className="form-error">
              {formError}
            </div>
        )}

          {/* Email */}
          <div className="field-full">
            <input type="email" placeholder="E-mail" value={form.email}
              onChange={e => set("email", e.target.value)} {...inputEvents} />
          </div>

          <div className="cb-row">
            <input type="checkbox" id="offers" checked={form.offers}
              onChange={e => set("offers", e.target.checked)} />
            <label className="cb-label" htmlFor="offers">E-mail me with offers and discounts</label>
          </div>

          <div className="divider" />

          {/* Delivery */}
          <div className="section-title">Delivery</div>

          <div className="ship-row">
            <input type="checkbox" id="ship" checked={form.ship}
              onChange={e => set("ship", e.target.checked)} />
            <label htmlFor="ship">Ship</label>
          </div>

          <div className="field-row">
            <input type="text" placeholder="First Name" value={form.firstName}
              onChange={e => set("firstName", e.target.value)} {...inputEvents} />
            <input type="text" placeholder="Last Name" value={form.lastName}
              onChange={e => set("lastName", e.target.value)} {...inputEvents} />
          </div>

          <div className="field-full">
            <input type="text" placeholder="Address" value={form.address}
              onChange={e => set("address", e.target.value)} {...inputEvents} />
          </div>

          <div className="field-full">
            <input type="text" placeholder="City" value={form.city}
              onChange={e => set("city", e.target.value)} {...inputEvents} />
          </div>

          <div className="field-row">
            {/* District */}
            <div className="select-wrap">
              <select value={form.district} required
                onChange={e => set("district", e.target.value)}>
                <option value="" disabled>District</option>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            {/* Province */}
            <div className="select-wrap">
              <select value={form.province} required
                onChange={e => set("province", e.target.value)}>
                <option value="" disabled>Province</option>
                {PROVINCES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Phone */}
          <div className="field-full phone-field-wrap">
            <input
              ref={phoneRef}
              type="tel"
              placeholder="Phone Number"
              value={form.phone}
              maxLength={10}
              autoComplete="off"
              className={phoneState.status === "error" ? "error" : phoneState.status === "success" ? "success" : ""}
              onKeyDown={handlePhoneKeyDown}
              onPaste={handlePhonePaste}
              onInput={handlePhoneInput}
              onBlur={handlePhoneBlur}
              onFocus={handlePhoneFocus}
            />
            {phoneState.error && (
              <div className="phone-error show">
                <AlertIcon />
                <span>{phoneState.error}</span>
              </div>
            )}
          </div>

          <div className="divider" />

          {/* Payment Method */}
          <div className="section-title">Payment Method</div>

          <div className="payment-opts">
            <label className="radio-row">
              <input type="radio" name="payment" value="cod"
                checked={form.payment === "cod"} onChange={() => set("payment", "cod")} />
              <span className="radio-label">Cash on Delivery</span>
            </label>
            <label className="radio-row">
              <input type="radio" name="payment" value="bank"
                checked={form.payment === "bank"} onChange={() => set("payment", "bank")} />
              <span className="radio-label">Bank Deposit</span>
            </label>
          </div>

          {/* Bank Deposit Section */}
          {form.payment === "bank" && (
            <div className="bank-section show">
              <div className="bank-section-title">Account Details</div>
              <div className="bank-details-card">
                {BANK_DETAILS.map(({ label, value }) => (
                  <div className="bank-detail-row" key={label}>
                    <span className="bank-detail-label">{label}</span>
                    <span className="bank-detail-value">{value}</span>
                  </div>
                ))}
              </div>

              {/* Upload Slip */}
              <div
                id="uploadSlipBox"
                className="upload-slip-box"
                tabIndex={0}
                role="button"
                aria-label="Upload payment slip"
                onClick={() => slipInputRef.current?.click()}
                onKeyDown={e => e.key === "Enter" && slipInputRef.current?.click()}
              >
                <input
                  ref={slipInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  style={{ display: "none" }}
                  onChange={handleSlipUpload}
                />
                {slipFile ? (
                  <div className="upload-slip-preview">
                    <CheckIcon />
                    <span>{slipFile.name.length > 28 ? slipFile.name.slice(0, 25) + "..." : slipFile.name}</span>
                    <button
                      className="remove-file"
                      tabIndex={0}
                      onClick={removeSlip}
                      onKeyDown={e => e.key === "Enter" && removeSlip(e)}
                    >✕</button>
                  </div>
                ) : (
                  <div className="upload-slip-content">
                    <UploadIcon />
                    <span>Upload slip here</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <button className="confirm-btn" onClick={confirmOrder}>Confirm Order</button>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="panel">
          {selectedItems.length === 0 ? (
            <p style={{ color: "#9a958d", fontSize: "14px" }}>No items selected.</p>
          ) : (
            selectedItems.map((item) => (
              <div className="order-item" key={item.id}>
                <div className="img-wrap">
                  <div style={{
                    width: 74, height: 90, borderRadius: 8,
                    background: item.color, border: "1px solid #dedad4",
                  }} />
                  {/* ✅ CHANGE 8 — badge shows qty of that specific item */}
                  <span className="img-badge">{item.qty}</span>
                </div>
                <div className="item-info">
                  <div className="item-name">{item.name}</div>
                  <div className="item-size">{item.size}</div>
                  <div className="color-dot" style={{ background: item.color }} />
                </div>
                <div className="item-price">Rs. {(item.price * item.qty).toLocaleString()}.00</div>
              </div>
            ))
          )}

          <div className="divider" />

          {/* ✅ CHANGE 9 — subtotal and total use values passed from cart */}
          <div className="total-row">
            <span className="total-label">Subtotal</span>
            <span className="total-val">Rs. {cartSubtotal.toLocaleString()}.00</span>
          </div>
          <div className="total-row">
            <span className="total-label">Shipping</span>
            <span className="total-val">Rs. {SHIPPING.toLocaleString()}.00</span>
          </div>
          <div className="total-row grand">
            <span className="total-label">Total</span>
            <span className="total-val">Rs. {total.toLocaleString()}.00</span>
          </div>
        </div>
      </div>

       {/*── ORDER CONFIRMATION POPUP ──*/}
      {showPopup && orderData && (
        <OrderConfirmationPopup 
          orderDetails={orderData}
          onClose={() => setShowPopup(false)}
        />
      )} 

      {/* ── TOAST ── */}
      <div className={`toast ${toast ? "show" : ""}`}>
        ✓ Order confirmed! We'll be in touch soon.
      </div>
      <Footer />
    </>
  );
}
