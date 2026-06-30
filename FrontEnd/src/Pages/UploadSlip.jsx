import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiUrl } from '../services/api';
import './UploadSlip.css';

const CheckCircleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="20 6 9 17 4 12" />
  </svg>
);

const UploadCloudIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

const PackageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

export default function UploadSlipPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderNumber = searchParams.get('order') || '';
  const emailParam = searchParams.get('email') || '';
  const orderId = searchParams.get('id') || '';

  const [step, setStep] = useState('loading'); // loading | verify | upload | done | error | confirmed
  const [order, setOrder] = useState(null);
  const [emailInput, setEmailInput] = useState(emailParam);
  const [orderInput, setOrderInput] = useState(orderNumber);
  const [slipFile, setSlipFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  const fileInputRef = useRef(null);

  // Auto-verify if both params came from URL
  useEffect(() => {
    if (orderNumber && emailParam) {
      verifyOrder(orderNumber, emailParam);
    } else {
      setStep('verify');
    }
  }, []); // eslint-disable-line

  const verifyOrder = async (oNum, email) => {
    setStep('loading');
    setErrorMsg('');
    try {
      const res = await fetch(
        apiUrl(`/orders/search/verify?orderNumber=${encodeURIComponent(oNum)}&email=${encodeURIComponent(email)}`)
      );
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        const pm = (data.data.payment_method || '').toLowerCase();
        if (!pm.includes('bank')) {
          setStep('error');
          setErrorMsg('This order is not a Bank Deposit order. No slip upload required.');
          return;
        }
        if ((data.data.payment_status || '').toLowerCase() === 'confirmed') {
          setStep('confirmed');
          return;
        }
        setStep('upload');
      } else {
        setStep('verify');
        setErrorMsg(data.message || 'Order not found. Please check your order number and email.');
      }
    } catch {
      setStep('verify');
      setErrorMsg('Network error. Please try again.');
    }
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (!orderInput.trim() || !emailInput.trim()) {
      setErrorMsg('Please enter both order number and email.');
      return;
    }
    verifyOrder(orderInput.trim(), emailInput.trim());
  };

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setErrorMsg('Please upload a JPG, PNG, or PDF file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File is too large. Maximum allowed size is 5MB.');
      return;
    }
    setErrorMsg('');
    setSlipFile(file);
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleUpload = async () => {
    if (!slipFile) { setErrorMsg('Please select a file first.'); return; }
    setUploading(true);
    setErrorMsg('');
    try {
      const fd = new FormData();
      fd.append('bankSlip', slipFile);
      const res = await fetch(apiUrl(`/orders/${order.id}/upload-slip`), {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setStep('done');
      } else {
        setErrorMsg(data.message || 'Upload failed. Please try again.');
      }
    } catch {
      setErrorMsg('Network error during upload. Please check your connection.');
    } finally {
      setUploading(false);
    }
  };

  const totalBill = order
    ? parseFloat(order.total_bill || 0)
    : 0;

  return (
    <div className="us-page">
      {/* Background blobs */}
      <div className="us-blob us-blob--1" />
      <div className="us-blob us-blob--2" />

      <div className="us-container">
        {/* Header */}
        <div className="us-brand" onClick={() => navigate('/')}>
          <span className="us-brand-name">CLICK</span>
          <span className="us-brand-sub">CLOTHING</span>
        </div>

        {/* ── LOADING ── */}
        {step === 'loading' && (
          <div className="us-card">
            <div className="us-spinner-wrap">
              <div className="us-spinner" />
              <p className="us-spinner-text">Verifying your order…</p>
            </div>
          </div>
        )}

        {/* ── VERIFY FORM ── */}
        {step === 'verify' && (
          <div className="us-card">
            <div className="us-card-header">
              <div className="us-header-icon">📄</div>
              <h1 className="us-title">Upload Payment Slip</h1>
              <p className="us-subtitle">Enter your order details to continue</p>
            </div>
            <form className="us-form" onSubmit={handleVerifySubmit}>
              <div className="us-field">
                <label className="us-label">Order Number</label>
                <input
                  className="us-input"
                  type="text"
                  placeholder="e.g. ORD-20260524-1234"
                  value={orderInput}
                  onChange={e => setOrderInput(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="us-field">
                <label className="us-label">Email Address</label>
                <input
                  className="us-input"
                  type="email"
                  placeholder="your@email.com"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  autoComplete="email"
                />
              </div>
              {errorMsg && <div className="us-error">{errorMsg}</div>}
              <button className="us-btn-primary" type="submit">Continue →</button>
            </form>
          </div>
        )}

        {/* ── UPLOAD ── */}
        {step === 'upload' && order && (
          <div className="us-card">
            {/* Order summary strip */}
            <div className="us-order-strip">
              <div className="us-order-strip-icon"><PackageIcon /></div>
              <div className="us-order-strip-body">
                <div className="us-order-num">{order.order_number}</div>
                <div className="us-order-total">Amount Due: <strong>Rs. {totalBill.toLocaleString()}.00</strong></div>
              </div>
              <div className="us-payment-badge">Bank Deposit</div>
            </div>

            {/* Warning */}
            <div className="us-warning-card">
              <div className="us-warning-title">⚠️ Payment Deadline</div>
              <p className="us-warning-text">
                Please complete your bank deposit within <strong>48 hours</strong> from your order date.
                Use <strong>{order.order_number}</strong> as the bank transfer remark.
              </p>
            </div>

            {/* Upload zone */}
            <div className="us-upload-section">
              <div className="us-upload-label">Upload Bank Slip</div>
              <div
                className={`us-drop-zone${dragOver ? ' drag-over' : ''}${slipFile ? ' has-file' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                {slipFile ? (
                  <div className="us-file-selected">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Slip preview" className="us-preview-img" />
                    ) : (
                      <div className="us-pdf-icon">📄</div>
                    )}
                    <div className="us-file-name">{slipFile.name}</div>
                    <div className="us-file-size">{(slipFile.size / 1024).toFixed(1)} KB</div>
                    <button
                      className="us-change-file"
                      onClick={(e) => { e.stopPropagation(); setSlipFile(null); setPreviewUrl(null); }}
                    >
                      Change File
                    </button>
                  </div>
                ) : (
                  <div className="us-drop-content">
                    <div className="us-drop-icon"><UploadCloudIcon /></div>
                    <div className="us-drop-text">Drag & drop your slip here</div>
                    <div className="us-drop-sub">or click to browse</div>
                    <div className="us-drop-hint">JPG, PNG or PDF · Max 5MB</div>
                  </div>
                )}
              </div>
            </div>

            {errorMsg && <div className="us-error">{errorMsg}</div>}

            <button
              className="us-btn-primary"
              onClick={handleUpload}
              disabled={uploading || !slipFile}
            >
              {uploading ? (
                <span className="us-btn-loading"><span className="us-btn-spinner" /> Uploading…</span>
              ) : 'Submit Payment Slip'}
            </button>
          </div>
        )}

        {/* ── DONE ── */}
        {step === 'done' && (
          <div className="us-card us-card--success">
            <div className="us-success-icon"><CheckCircleIcon /></div>
            <h1 className="us-title">Slip Uploaded!</h1>
            <p className="us-subtitle">
              Your payment slip has been submitted. Our team will verify it within <strong>24 hours</strong> and update your order status.
            </p>
            <div className="us-success-order">{order?.order_number}</div>
            <button className="us-btn-primary" onClick={() => navigate('/')}>Back to Home</button>
            <button className="us-btn-ghost" onClick={() => navigate('/user/orders')}>View Orders</button>
          </div>
        )}

        {/* ── ALREADY CONFIRMED ── */}
        {step === 'confirmed' && (
          <div className="us-card us-card--success">
            <div className="us-success-icon" style={{ color: '#22c55e' }}><CheckCircleIcon /></div>
            <h1 className="us-title">Payment Confirmed</h1>
            <p className="us-subtitle">
              Your payment for order <strong>{order?.order_number}</strong> has already been confirmed. No further action is needed.
            </p>
            <button className="us-btn-primary" onClick={() => navigate('/user/orders')}>View My Orders</button>
          </div>
        )}

        {/* ── ERROR ── */}
        {step === 'error' && (
          <div className="us-card">
            <div className="us-error-icon">⚠️</div>
            <h1 className="us-title">Something Went Wrong</h1>
            <p className="us-subtitle">{errorMsg}</p>
            <button className="us-btn-primary" onClick={() => navigate('/')}>Back to Home</button>
          </div>
        )}

        <p className="us-footer-text">© {new Date().getFullYear()} Click Clothing · Secure Payment Portal</p>
      </div>
    </div>
  );
}
