import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../Components/footer";
import { apiUrl, authHeaders } from "../services/api";
import "./checkout.css";

const DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha",
  "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala",
  "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
];

const PROVINCES = [
  "Central Province", "Eastern Province", "North Central Province",
  "Northern Province", "North Western Province", "Sabaragamuwa Province",
  "Southern Province", "Uva Province", "Western Province",
];

const getShippingCost = (district) => {
  if (!district) return 0;
  return district.toLowerCase() === "colombo" ? 400 : 500;
};

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

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const emptyAddressForm = {
  label: "Home",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  district: "",
  province: "",
  phone: "",
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedItems] = useState(location.state?.selectedItems || []);
  const [cartSubtotal] = useState(location.state?.subtotal || 0);

  const [form, setForm] = useState({
    email: "",
    offers: false,
    payment: "cod",
  });

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressesLoading, setAddressesLoading] = useState(true);

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null); // null = add new
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [addressFormError, setAddressFormError] = useState("");
  const [addressFormLoading, setAddressFormLoading] = useState(false);

  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneState, setPhoneState] = useState({ error: "", status: "" });
  const [addrPhoneState, setAddrPhoneState] = useState({ error: "", status: "" });
  const [slipFile, setSlipFile] = useState(null);
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [bankDetails, setBankDetails] = useState([]);

  const slipInputRef = useRef(null);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || null;
  const shippingCost = getShippingCost(selectedAddress?.district || "");
  const totalItemCount = selectedItems.reduce((sum, item) => sum + (item.qty || 1), 0);
  const total = cartSubtotal + shippingCost;

  const getUserFromSession = () => {
    try {
      const userData = sessionStorage.getItem("user");
      if (userData) return JSON.parse(userData);
    } catch (e) { console.error(e); }
    return null;
  };

  // ── Fetch bank details
  useEffect(() => {
    fetch(apiUrl('/bank-details'))
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          const d = data.data[0];
          setBankDetails([
            { label: "Bank Name", value: d.bankName },
            { label: "Account Name", value: d.accountName },
            { label: "Account Number", value: d.accountNumber },
            { label: "Branch", value: d.branch },
          ]);
        }
      })
      .catch(console.error);
  }, []);

  // ── Pre-fill email from session
  useEffect(() => {
    const user = getUserFromSession();
    if (user) {
      setForm((f) => ({ ...f, email: f.email || user.email || "" }));
    }
  }, []);

  // ── Fetch saved addresses
  useEffect(() => {
    const user = getUserFromSession();
    if (!user) { setAddressesLoading(false); return; }

    fetch(apiUrl(`/user-addresses/user/${user.id}`), {
      headers: authHeaders(),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setAddresses(data.data);
          const def = data.data.find((a) => a.isDefault) || data.data[0];
          setSelectedAddressId(def.id);
        } else {
          // No saved addresses — show the form immediately
          setShowAddressForm(true);
          const u = getUserFromSession();
          setAddressForm((f) => ({
            ...f,
            firstName: u?.firstName || u?.first_name || "",
            lastName: u?.lastName || u?.last_name || "",
          }));
        }
      })
      .catch(console.error)
      .finally(() => setAddressesLoading(false));
  }, []);

  // ── Address form helpers
  const setAF = (k, v) => setAddressForm((f) => ({ ...f, [k]: v }));

  const openAddForm = () => {
    setEditingAddress(null);
    setAddressForm(emptyAddressForm);
    setAddressFormError("");
    setAddrPhoneState({ error: "", status: "" });
    setShowAddressForm(true);
  };

  const openEditForm = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      label: addr.label || "Home",
      firstName: addr.firstName || "",
      lastName: addr.lastName || "",
      address: addr.address || "",
      city: addr.city || "",
      district: addr.district || "",
      province: addr.province || "",
      phone: addr.phone || "",
    });
    setAddressFormError("");
    if (addr.phone && addr.phone.length === 10) {
      setAddrPhoneState({ error: "", status: "success" });
    } else {
      setAddrPhoneState({ error: "", status: "" });
    }
    setShowAddressForm(true);
  };

  const cancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressFormError("");
  };

  const saveAddress = async () => {
    setAddressFormError("");
    const { label, firstName, lastName, address, city, district, province, phone } = addressForm;
    if (!firstName || !lastName || !address || !city || !district || !province || !phone) {
      setAddressFormError("Please fill in all address fields.");
      return;
    }
    if (phone.length !== 10) {
      setAddressFormError("Phone number must be exactly 10 digits.");
      return;
    }

    const user = getUserFromSession();
    if (!user) { setAddressFormError("Please log in first."); return; }

    setAddressFormLoading(true);
    try {
      if (editingAddress) {
        // UPDATE
        const res = await fetch(apiUrl(`/user-addresses/${editingAddress.id}`), {
          method: "PUT",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ label, firstName, lastName, address, city, district, province, phone }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        setAddresses((prev) => prev.map((a) => (a.id === editingAddress.id ? data.data : a)));
        showToast("Address updated successfully!");
      } else {
        // CREATE
        const res = await fetch(apiUrl('/user-addresses'), {
          method: "POST",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ userId: user.id, label, firstName, lastName, address, city, district, province, phone }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        setAddresses((prev) => [...prev, data.data]);
        setSelectedAddressId(data.data.id);
        showToast("New address added!");
      }
      setShowAddressForm(false);
      setEditingAddress(null);
    } catch (err) {
      setAddressFormError(err.message || "Failed to save address.");
    } finally {
      setAddressFormLoading(false);
    }
  };

  const deleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    const user = getUserFromSession();
    try {
      const res = await fetch(apiUrl(`/user-addresses/${id}`), {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      const updated = addresses.filter((a) => a.id !== id);
      setAddresses(updated);
      if (selectedAddressId === id) {
        setSelectedAddressId(updated.length > 0 ? updated[0].id : null);
      }
      if (updated.length === 0) {
        setShowAddressForm(true);
        setAddressForm((f) => ({
          ...f,
          firstName: user?.firstName || user?.first_name || "",
          lastName: user?.lastName || user?.last_name || "",
        }));
      }
      showToast("Address deleted.");
    } catch (err) {
      showToast("Failed to delete address.");
    }
  };

  const setDefaultAddress = async (id) => {
    const user = getUserFromSession();
    try {
      await fetch(apiUrl(`/user-addresses/${id}/default`), {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ userId: user.id }),
      });
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
      showToast("Default address updated.");
    } catch (err) {
      showToast("Failed to update default.");
    }
  };

  // ── Toast helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  // ── Phone validation (order form phone - not used separately now, but kept for slip validation context)
  const phoneError = (msg) => setPhoneState({ error: msg, status: "error" });
  const phoneClear = () => setPhoneState({ error: "", status: "" });
  const phoneSuccess = () => setPhoneState({ error: "", status: "success" });

  // ── Address form phone validation
  const addrPhoneError = (msg) => setAddrPhoneState({ error: msg, status: "error" });
  const addrPhoneClear = () => setAddrPhoneState({ error: "", status: "" });
  const addrPhoneSuccess = () => setAddrPhoneState({ error: "", status: "success" });

  const handleAddrPhoneKeyDown = (e) => {
    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab", "Home", "End", "Enter"];
    if (allowed.includes(e.key)) return;
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      addrPhoneError("Phone number must contain numbers only.");
    }
  };

  const handleAddrPhoneInput = (e) => {
    const clean = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
    setAF("phone", clean);
    if (clean.length === 10) addrPhoneSuccess();
    else addrPhoneClear();
  };

  const handleAddrPhoneBlur = () => {
    const len = addressForm.phone.length;
    if (len === 0) addrPhoneClear();
    else if (len < 10) addrPhoneError(`Need ${10 - len} more digit${10 - len > 1 ? "s" : ""}.`);
    else addrPhoneSuccess();
  };

  // ── Slip upload
  const handleSlipUpload = (e) => { const f = e.target.files[0]; if (f) setSlipFile(f); };
  const removeSlip = (e) => {
    e.stopPropagation();
    setSlipFile(null);
    if (slipInputRef.current) slipInputRef.current.value = "";
  };

  // ── Confirm order
  const confirmOrder = async () => {
    setFormError("");
    setLoading(true);

    if (!form.email) { setFormError("Email is required"); setLoading(false); return; }
    if (!selectedAddress) { setFormError("Please select or add a delivery address."); setLoading(false); return; }
    if (!form.payment) { setFormError("Please select a payment method"); setLoading(false); return; }

    const user = getUserFromSession();
    if (!user || !user.id) {
      setFormError("Please login to place order");
      setLoading(false);
      navigate("/login");
      return;
    }

    const fd = new FormData();
    fd.append("userId", user.id);
    fd.append("email", form.email);
    fd.append("firstName", selectedAddress.firstName);
    fd.append("lastName", selectedAddress.lastName);
    fd.append("address", selectedAddress.address);
    fd.append("city", selectedAddress.city);
    fd.append("district", selectedAddress.district);
    fd.append("province", selectedAddress.province);
    fd.append("phone", selectedAddress.phone);
    fd.append("paymentMethod", form.payment);
    fd.append("selectedItems", JSON.stringify(selectedItems));
    fd.append("subtotal", cartSubtotal.toString());
    fd.append("shippingCost", shippingCost.toString());
    if (slipFile) fd.append("bankSlip", slipFile);

    try {
      const res = await fetch(apiUrl('/orders/create'), {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        const currentDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        const orderDetails = {
          orderNumber: data.data.orderNumber,
          barcode: data.data.barcode,
          items: selectedItems,
          productName: selectedItems.length === 1 ? selectedItems[0].name : `${selectedItems.length} items`,
          quantity: totalItemCount,
          price: total,
          paymentMethod: form.payment === "cod" ? "Cash on Delivery" : "Bank Deposit",
          confirmed: true,
          paidDate: currentDate,
          paidAmount: total,
          customerName: `${selectedAddress.firstName} ${selectedAddress.lastName}`,
          email: form.email,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          city: selectedAddress.city,
          district: selectedAddress.district,
          province: selectedAddress.province,
          subtotal: cartSubtotal,
          shipping: shippingCost,
        };
        window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { purchasedItems: selectedItems } }));
        navigate("/order/confirmation", { state: { orderDetails } });
      } else {
        setFormError(data.message || "Error placing order. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedItems.length === 0) navigate("/cart");
  }, [selectedItems, navigate]);

  const focusStyle = { borderColor: "#c9a882", background: "#fff", boxShadow: "0 0 0 3px rgba(201,168,130,0.12)" };
  const blurStyle = { borderColor: "transparent", background: "#f5f5f5", boxShadow: "none" };
  const inputEvents = {
    onFocus: (e) => Object.assign(e.target.style, focusStyle),
    onBlur: (e) => Object.assign(e.target.style, blurStyle),
  };

  return (
    <>
      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <div className="logo">Click</div>
        <button className="cart-btn" aria-label="Cart" onClick={() => navigate("/cart")}>
          <CartIcon />
          <span className="cart-badge">{totalItemCount}</span>
        </button>
      </nav>

      {/* ── MAIN GRID ── */}
      <div className="checkout-wrapper">

        {/* ── LEFT PANEL ── */}
        <div className="panel">
          {formError && <div className="form-error">{formError}</div>}

          {/* Email */}
          <div className="field-full">
            <input type="email" placeholder="E-mail" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              {...inputEvents} disabled={loading} required />
          </div>
          <div className="cb-row">
            <input type="checkbox" id="offers" checked={form.offers}
              onChange={(e) => setForm((f) => ({ ...f, offers: e.target.checked }))} disabled={loading} />
            <label className="cb-label" htmlFor="offers">E-mail me with offers and discounts</label>
          </div>

          <div className="divider" />

          {/* ── DELIVERY ADDRESS SECTION ── */}
          <div className="addr-section-header">
            <span className="section-title" style={{ marginBottom: 0 }}>Delivery Address</span>
            {addresses.length > 0 && !showAddressForm && (
              <button className="addr-add-btn" onClick={openAddForm} disabled={loading}>
                <PlusIcon /> Add New Address
              </button>
            )}
          </div>

          {addressesLoading ? (
            <div className="addr-loading">Loading addresses...</div>
          ) : (
            <>
              {/* Saved Address Cards */}
              {addresses.length > 0 && !showAddressForm && (
                <div className="addr-cards-list">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`addr-card ${selectedAddressId === addr.id ? "selected" : ""}`}
                      onClick={() => setSelectedAddressId(addr.id)}
                    >
                      {/* Radio indicator */}
                      <div className="addr-card-radio">
                        <div className="addr-radio-dot" />
                      </div>

                      <div className="addr-card-body">
                        <div className="addr-card-top">
                          <span className="addr-card-label">{addr.label || "Home"}</span>
                          {addr.isDefault && <span className="addr-default-badge">Default</span>}
                        </div>
                        <div className="addr-card-name">{addr.firstName} {addr.lastName}</div>
                        <div className="addr-card-detail">
                          {addr.address}, {addr.city}
                        </div>
                        <div className="addr-card-detail">
                          {addr.district}, {addr.province}
                        </div>
                        <div className="addr-card-phone">{addr.phone}</div>
                      </div>

                      <div className="addr-card-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="addr-action-btn edit"
                          title="Edit"
                          onClick={() => openEditForm(addr)}
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="addr-action-btn delete"
                          title="Delete"
                          onClick={() => deleteAddress(addr.id)}
                        >
                          <TrashIcon />
                        </button>
                        {!addr.isDefault && (
                          <button
                            className="addr-action-btn set-default"
                            title="Set as default"
                            onClick={() => setDefaultAddress(addr.id)}
                          >
                            Set Default
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add / Edit Address Form */}
              {showAddressForm && (
                <div className="addr-form-card">
                  <div className="addr-form-title">
                    {editingAddress ? "Edit Address" : "Add New Address"}
                  </div>

                  {addressFormError && (
                    <div className="form-error" style={{ marginBottom: 12 }}>{addressFormError}</div>
                  )}

                  {/* Label */}
                  <div className="addr-label-chips">
                    {["Home", "Work", "Other"].map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        className={`addr-label-chip ${addressForm.label === lbl ? "active" : ""}`}
                        onClick={() => setAF("label", lbl)}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>

                  <div className="field-row">
                    <input type="text" placeholder="First Name" value={addressForm.firstName}
                      onChange={(e) => setAF("firstName", e.target.value)} {...inputEvents} />
                    <input type="text" placeholder="Last Name" value={addressForm.lastName}
                      onChange={(e) => setAF("lastName", e.target.value)} {...inputEvents} />
                  </div>
                  <div className="field-full">
                    <input type="text" placeholder="Address" value={addressForm.address}
                      onChange={(e) => setAF("address", e.target.value)} {...inputEvents} />
                  </div>
                  <div className="field-full">
                    <input type="text" placeholder="City" value={addressForm.city}
                      onChange={(e) => setAF("city", e.target.value)} {...inputEvents} />
                  </div>
                  <div className="field-row">
                    <div className="select-wrap">
                      <select value={addressForm.district} onChange={(e) => setAF("district", e.target.value)}>
                        <option value="">Select District</option>
                        {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="select-wrap">
                      <select value={addressForm.province} onChange={(e) => setAF("province", e.target.value)}>
                        <option value="">Select Province</option>
                        {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="field-full phone-field-wrap" style={{ marginBottom: 0 }}>
                    <input
                      type="tel" placeholder="Phone Number" value={addressForm.phone}
                      maxLength={10} autoComplete="off"
                      className={addrPhoneState.status === "error" ? "error" : addrPhoneState.status === "success" ? "success" : ""}
                      onKeyDown={handleAddrPhoneKeyDown}
                      onInput={handleAddrPhoneInput}
                      onBlur={handleAddrPhoneBlur}
                      {...inputEvents}
                    />
                    {addrPhoneState.error && (
                      <div className="phone-error show">
                        <AlertIcon /><span>{addrPhoneState.error}</span>
                      </div>
                    )}
                  </div>

                  <div className="addr-form-actions">
                    {addresses.length > 0 && (
                      <button className="addr-cancel-btn" onClick={cancelAddressForm} disabled={addressFormLoading}>
                        Cancel
                      </button>
                    )}
                    <button className="addr-save-btn" onClick={saveAddress} disabled={addressFormLoading}>
                      {addressFormLoading ? "Saving..." : (editingAddress ? "Update Address" : "Save Address")}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="divider" />

          {/* Payment Method */}
          <div className="section-title">Payment Method</div>
          <div className="payment-opts">
            <label className="radio-row">
              <input type="radio" name="payment" value="cod"
                checked={form.payment === "cod"} onChange={() => setForm((f) => ({ ...f, payment: "cod" }))} disabled={loading} />
              <span className="radio-label">Cash on Delivery</span>
            </label>
            <label className="radio-row">
              <input type="radio" name="payment" value="bank"
                checked={form.payment === "bank"} onChange={() => setForm((f) => ({ ...f, payment: "bank" }))} disabled={loading} />
              <span className="radio-label">Bank Deposit</span>
            </label>
          </div>

          {/* Bank Deposit Section */}
          {form.payment === "bank" && (
            <div className="bank-section show">
              <div className="bank-section-title">Account Details</div>
              <div className="bank-details-card">
                {bankDetails.length > 0 ? (
                  bankDetails.map(({ label, value }) => (
                    <div className="bank-detail-row" key={label}>
                      <span className="bank-detail-label">{label}</span>
                      <span className="bank-detail-value">{value}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#9a958d", fontSize: "14px", padding: "10px" }}>Loading bank details...</p>
                )}
              </div>

              {/* 48-hour instruction card */}
              <div style={{
                background: "linear-gradient(135deg, #fff8e6, #fff3d0)",
                border: "1.5px solid #f0b429",
                borderRadius: "12px",
                padding: "16px 18px",
                marginBottom: "14px",
                fontSize: "13px",
                color: "#5a3e00",
                lineHeight: "1.75"
              }}>
                <div style={{ fontWeight: 700, marginBottom: "6px", color: "#7d5a00", fontSize: "14px" }}>⚠️ Important Payment Instructions</div>
                <ul style={{ margin: 0, paddingLeft: "18px" }}>
                  <li>Please complete your bank deposit within <strong>48 hours</strong> of placing the order.</li>
                  <li>Use your unique <strong>Order Number</strong> as the bank transfer remark/reference.</li>
                  <li>Uploading the payment slip is <strong>optional now</strong> — you can upload it later from your email link or Order History.</li>
                </ul>
              </div>

              <div
                id="uploadSlipBox"
                className="upload-slip-box"
                tabIndex={0}
                role="button"
                aria-label="Upload payment slip (optional)"
                onClick={() => !loading && slipInputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && slipInputRef.current?.click()}
              >
                <input ref={slipInputRef} type="file" accept="image/*,.pdf"
                  style={{ display: "none" }} onChange={handleSlipUpload} disabled={loading} />
                {slipFile ? (
                  <div className="upload-slip-preview">
                    <CheckIcon />
                    <span>{slipFile.name.length > 28 ? slipFile.name.slice(0, 25) + "..." : slipFile.name}</span>
                    <button className="remove-file" tabIndex={0} onClick={removeSlip} disabled={loading}>✕</button>
                  </div>
                ) : (
                  <div className="upload-slip-content">
                    <UploadIcon /><span>Upload slip here <span style={{ color: "#c9a882", fontSize: "11px" }}>(optional — you can upload later)</span></span>
                  </div>
                )}
              </div>
            </div>
          )}

          <button className="confirm-btn" onClick={confirmOrder} disabled={loading}>
            {loading ? "Processing..." : "Confirm Order"}
          </button>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="summary-panel">
          <h2 className="summary-title">Order Summary</h2>
          <div className="summary-items-list">
            {selectedItems.length === 0 ? (
              <p className="empty-summary">No items selected.</p>
            ) : (
              selectedItems.map((item) => (
                <div className="summary-item" key={item.id}>
                  <div className="summary-img-wrap">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="summary-item-img" />
                    ) : (
                      <div className="summary-img-placeholder" style={{ background: item.color }} />
                    )}
                    <span className="summary-img-badge">{item.qty || item.quantity}</span>
                  </div>
                  <div className="summary-item-info">
                    <div className="summary-item-name">{item.name}</div>
                    <div className="summary-item-meta">
                      Size: {item.sizeLabel || item.size}
                      <span className="summary-color-dot" style={{ background: item.color }} />
                    </div>
                  </div>
                  <div className="summary-item-price">Rs. {(item.price * item.qty).toLocaleString()}.00</div>
                </div>
              ))
            )}
          </div>

          <div className="summary-divider" />

          <div className="summary-totals">
            <div className="summary-row">
              <span className="summary-label">Subtotal</span>
              <span className="summary-val">Rs. {cartSubtotal.toLocaleString()}.00</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Shipping</span>
              <span className="summary-val">Rs. {shippingCost.toLocaleString()}.00</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row grand">
              <span className="summary-label">Total</span>
              <span className="summary-val">Rs. {total.toLocaleString()}.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TOAST ── */}
      <div className={`toast ${toast ? "show" : ""}`}>{toastMessage}</div>

      <Footer />
    </>
  );
}
