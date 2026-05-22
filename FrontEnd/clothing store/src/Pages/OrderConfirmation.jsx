import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./OrderConfirmation.css";

const CheckCircleIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PackageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ShoppingBagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export default function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderDetails = location.state?.orderDetails;

  const [toast, setToast] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    // If no order data, redirect home
    if (!orderDetails) {
      navigate("/");
      return;
    }

    // Fire toast after a short delay for entrance animation
    const t1 = setTimeout(() => {
      setToast(true);
      setToastVisible(true);
    }, 600);

    const t2 = setTimeout(() => {
      setToastVisible(false);
    }, 5000);

    const t3 = setTimeout(() => {
      setToast(false);
    }, 5600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [orderDetails, navigate]);

  if (!orderDetails) return null;

  const {
    orderNumber,
    customerName,
    email,
    items = [],
    subtotal,
    shipping,
    price: total,
    paymentMethod,
    paidDate,
    address,
    city,
    district,
    province,
  } = orderDetails;

  return (
    <>
      {/* ── TOAST ── */}
      {toast && (
        <div className={`oc-toast ${toastVisible ? "oc-toast--show" : "oc-toast--hide"}`}>
          <span className="oc-toast__icon">✅</span>
          <span>Order placed successfully! Check your email for the receipt.</span>
        </div>
      )}

      <div className="oc-page">
        {/* Background decorative blobs */}
        <div className="oc-blob oc-blob--1" />
        <div className="oc-blob oc-blob--2" />

        <div className="oc-container">
          {/* ── SUCCESS HEADER ── */}
          <div className="oc-header">
            <div className="oc-icon-ring">
              <CheckCircleIcon />
            </div>
            <h1 className="oc-heading">Order Confirmed!</h1>
            <p className="oc-subheading">
              Thank you, <strong>{customerName}</strong>. Your order has been placed successfully.
            </p>
            {orderNumber && (
              <div className="oc-order-badge">
                <span className="oc-order-badge__label">Order #</span>
                <span className="oc-order-badge__number">{orderNumber}</span>
              </div>
            )}
          </div>

          {/* ── INFO CARDS ── */}
          <div className="oc-cards">

            {/* Email notice */}
            <div className="oc-card oc-card--highlight">
              <div className="oc-card__icon"><MailIcon /></div>
              <div className="oc-card__body">
                <div className="oc-card__title">Receipt sent to your email</div>
                <div className="oc-card__desc">{email}</div>
              </div>
            </div>

            {/* Delivery */}
            <div className="oc-card">
              <div className="oc-card__icon"><PackageIcon /></div>
              <div className="oc-card__body">
                <div className="oc-card__title">Delivery Address</div>
                <div className="oc-card__desc">
                  {address}, {city}, {district}, {province}
                </div>
              </div>
            </div>

            {/* Customer */}
            <div className="oc-card">
              <div className="oc-card__icon"><UserIcon /></div>
              <div className="oc-card__body">
                <div className="oc-card__title">Customer</div>
                <div className="oc-card__desc">{customerName}</div>
              </div>
            </div>
          </div>

          {/* ── ORDER ITEMS ── */}
          <div className="oc-section">
            <h2 className="oc-section__title">
              <ShoppingBagIcon /> Items Ordered
            </h2>

            <div className="oc-items">
              {items.map((item, idx) => (
                <div className="oc-item" key={item.id || idx}>
                  <div className="oc-item__img-wrap">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="oc-item__img" />
                    ) : (
                      <div className="oc-item__img-placeholder" style={{ background: item.color || "#e8e0d8" }} />
                    )}
                    <span className="oc-item__qty">{item.qty || item.quantity}</span>
                  </div>
                  <div className="oc-item__info">
                    <div className="oc-item__name">{item.name}</div>
                    <div className="oc-item__meta">
                      Size: {item.sizeLabel || item.size}
                      {item.color && (
                        <span className="oc-item__color-dot" style={{ background: item.color }} />
                      )}
                    </div>
                  </div>
                  <div className="oc-item__price">
                    Rs. {((item.price || 0) * (item.qty || item.quantity || 1)).toLocaleString()}.00
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="oc-totals">
              <div className="oc-total-row">
                <span>Subtotal</span>
                <span>Rs. {(subtotal || 0).toLocaleString()}.00</span>
              </div>
              <div className="oc-total-row">
                <span>Shipping</span>
                <span>Rs. {(shipping || 0).toLocaleString()}.00</span>
              </div>
              <div className="oc-total-row oc-total-row--grand">
                <span>Total</span>
                <span>Rs. {(total || 0).toLocaleString()}.00</span>
              </div>
              <div className="oc-total-row">
                <span>Payment</span>
                <span>{paymentMethod}</span>
              </div>
              {paidDate && (
                <div className="oc-total-row">
                  <span>Date</span>
                  <span>{paidDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── NEXT STEPS ── */}
          <div className="oc-steps">
            <h2 className="oc-steps__title">What happens next?</h2>
            <div className="oc-steps__list">
              <div className="oc-step">
                <div className="oc-step__num">1</div>
                <div className="oc-step__text">You'll receive an email receipt shortly</div>
              </div>
              <div className="oc-step__connector" />
              <div className="oc-step">
                <div className="oc-step__num">2</div>
                <div className="oc-step__text">We'll prepare and dispatch your order</div>
              </div>
              <div className="oc-step__connector" />
              <div className="oc-step">
                <div className="oc-step__num">3</div>
                <div className="oc-step__text">Track your order in <strong>My Account → Orders</strong></div>
              </div>
              <div className="oc-step__connector" />
              <div className="oc-step">
                <div className="oc-step__num">4</div>
                <div className="oc-step__text">Download your PDF invoice anytime from Order History</div>
              </div>
            </div>
          </div>

          {/* ── ACTIONS ── */}
          <div className="oc-actions">
            <button className="oc-btn oc-btn--primary" onClick={() => navigate("/user/orders")}>
              View Order History
            </button>
            <button className="oc-btn oc-btn--ghost" onClick={() => navigate("/")}>
              <HomeIcon /> Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
