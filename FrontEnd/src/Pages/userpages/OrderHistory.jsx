import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import './OrderHistory.css';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [viewingImage, setViewingImage] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user') || 'null');

    if (!storedUser || !storedUser.id) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/customer-orders/user/${storedUser.id}`);

        if (response.data.success) {
          setOrders(response.data.data || []);
        } else {
          setError('Failed to fetch orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.response?.data?.message || 'Error fetching orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const storedUser = JSON.parse(sessionStorage.getItem('user') || 'null');
  const isLoggedIn = !!(storedUser?.id);

  const handleTrackOrder = (order) => {
    setSelectedOrder(order);
    setShowTrackModal(true);
  };

  const handleCloseModal = () => {
    setShowTrackModal(false);
    setSelectedOrder(null);
  };

  //see more part
  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleReviewOrder = (order) => {
    navigate('/user/reviews', {
      state: {
        orderId: order.id,
        orderNumber: order.order_number,
        products: order.items || []
      }
    });
  };

  const getMappedStatuses = (order) => {
    const stage = (order.status || 'pending').toLowerCase();
    const method = (order.payment_method || '').toLowerCase();
    const isCod = method.includes('cod') || method.includes('cash');

    let orderStatus = stage;
    let paymentStatus = 'pending';

    if (isCod) {
      // COD order status: pending -> pending, confirmed -> confirmed, shipped -> shipped, delivered -> delivered
      orderStatus = stage;

      // COD payment status: pending -> pending, confirmed -> pending, shipped -> pending, delivered -> confirmed
      if (stage === 'delivered') {
        paymentStatus = 'confirmed';
      } else {
        paymentStatus = 'pending';
      }
    } else {
      // Bank deposit order status: pending -> pending, confirmed -> confirmed, shipped -> shipped, delivered -> delivered
      orderStatus = stage;

      // Bank deposit payment status: pending -> pending, confirmed -> confirmed, shipped -> confirmed, delivered -> confirmed
      if (stage === 'pending') {
        paymentStatus = 'pending';
      } else {
        paymentStatus = 'confirmed';
      }
    }

    return { orderStatus, paymentStatus };
  };

  const getDownloadButtonText = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'shipped') return 'DOWNLOAD SHIPPING NOTE';
    if (s === 'delivered') return 'DOWNLOAD INVOICE';
    return 'DOWNLOAD RECEIPT';
  };

  const handleDownloadReceipt = (order) => {
    const { orderStatus, paymentStatus } = getMappedStatuses(order);
    const stage = (order.status || '').toLowerCase();
    
    let docTitle = 'Receipt';
    if (stage === 'shipped') docTitle = 'Shipping Note';
    else if (stage === 'delivered') docTitle = 'Invoice';

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    const subtotal = order.items?.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.quantity || 1)), 0) || 0;
    const shipping = parseFloat(order.delivery_charges || 400);
    const total = parseFloat(order.total_bill || (subtotal + shipping));

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${docTitle} - ${order.order_number || order.id}</title>
        <style>
          body {
            font-family: 'Jost', 'Helvetica Neue', Arial, sans-serif;
            color: #111;
            margin: 0;
            padding: 20px;
            background: #fff;
          }
          .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 30px;
            border: 1px solid #ede9e4;
            border-radius: 4px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #111;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 2px;
            color: #111;
          }
          .logo-subtitle {
            font-size: 11px;
            color: #999;
            letter-spacing: 1px;
            margin-top: 2px;
            text-transform: uppercase;
          }
          .receipt-title {
            font-size: 22px;
            font-weight: 600;
            color: #c8a97e;
            text-align: right;
            letter-spacing: 1px;
          }
          .details-grid {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            gap: 20px;
          }
          .details-col {
            flex: 1;
          }
          .details-title {
            font-size: 11px;
            font-weight: bold;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 8px;
            border-bottom: 1px solid #eee;
            padding-bottom: 4px;
          }
          .details-text {
            font-size: 13px;
            line-height: 1.6;
            color: #555;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .table th {
            background: #fafafa;
            text-align: left;
            padding: 12px 10px;
            font-size: 11px;
            font-weight: 600;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 2px solid #eee;
          }
          .table td {
            padding: 14px 10px;
            font-size: 13px;
            border-bottom: 1px solid #f0f0f0;
            color: #333;
          }
          .table th.num, .table td.num {
            text-align: right;
          }
          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 40px;
          }
          .totals-table {
            width: 300px;
            border-collapse: collapse;
          }
          .totals-table td {
            padding: 8px 10px;
            font-size: 13px;
            color: #666;
          }
          .totals-table tr.total-row td {
            font-size: 16px;
            font-weight: 600;
            color: #111;
            border-top: 2px solid #111;
            padding-top: 12px;
          }
          .totals-table td.num {
            text-align: right;
            color: #111;
            font-weight: 600;
          }
          .footer {
            text-align: center;
            color: #999;
            font-size: 11px;
            border-top: 1px solid #eee;
            padding-top: 20px;
            margin-top: 40px;
            line-height: 1.5;
          }
          @media print {
            body {
              padding: 0;
              background: #fff;
            }
            .receipt-container {
              border: none;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div>
              <div class="logo">CLICK</div>
              <div class="logo-subtitle">CLOTHING</div>
            </div>
            <div>
              <div class="receipt-title">${docTitle.toUpperCase()}</div>
              <div style="font-size:13px; color:#555; margin-top:5px; text-align:right;">Order: #${order.order_number || order.id}</div>
            </div>
          </div>

          <div class="details-grid">
            <div class="details-col">
              <div class="details-title">Customer Details</div>
              <div class="details-text">
                <strong>${order.customer?.firstName || ''} ${order.customer?.lastName || ''}</strong><br>
                Phone: ${order.customer?.phone || 'N/A'}<br>
                Email: ${order.customer?.email || 'N/A'}
              </div>
            </div>
            <div class="details-col">
              <div class="details-title">Shipping Address</div>
              <div class="details-text">
                ${order.customer?.address || 'N/A'},<br>
                ${order.customer?.city || ''}, ${order.customer?.district || ''},<br>
                ${order.customer?.province || ''}
              </div>
            </div>
            <div class="details-col">
              <div class="details-title">Order Info</div>
              <div class="details-text">
                Date: ${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}<br>
                Payment Method: ${order.payment_method || 'N/A'}<br>
                Order Status: ${orderStatus.toUpperCase()}<br>
                Payment Status: ${paymentStatus.toUpperCase()}
              </div>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Size</th>
                <th>Color</th>
                <th class="num">Qty</th>
                <th class="num">Unit Price</th>
                <th class="num">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map(item => `
                <tr>
                  <td>${item.Product?.name || 'Product'}</td>
                  <td>${item.size || '-'}</td>
                  <td>${item.color || '-'}</td>
                  <td class="num">${item.quantity || 1}</td>
                  <td class="num">Rs.${parseFloat(item.price || 0).toFixed(2)}</td>
                  <td class="num">Rs.${(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals-section">
            <table class="totals-table">
              <tr>
                <td>Subtotal</td>
                <td class="num">Rs.${parseFloat(subtotal).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Shipping Cost</td>
                <td class="num">Rs.${parseFloat(shipping).toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td>Grand Total</td>
                <td class="num">Rs.${parseFloat(total).toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="footer">
            <p>Thank you for shopping with Click Clothing!</p>
            <p>This is a computer-generated ${docTitle.toLowerCase()} and does not require a signature.</p>
            <p style="font-size:10px; margin-top:10px; color:#ccc;">© ${new Date().getFullYear()} Click Clothing. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  if (!isLoggedIn) {
    return (
      <div className="orders-section">
        <h2 className="section-title">Order History</h2>
        <div className="empty-state">
          <p className="empty-title">You're not signed in</p>
          <p className="empty-subtitle">Please login to view your order history.</p>
          <button className="empty-btn" onClick={() => navigate('/login')}>Login</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="orders-section">
        <h2 className="section-title">Order History</h2>
        <div className="loading-state">Loading your orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-section">
        <h2 className="section-title">Order History</h2>
        <div className="error-state">{error}</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-section">
        <h2 className="section-title">Order History</h2>
        <div className="empty-state">
          <p className="empty-title">No Orders Yet</p>
          <p className="empty-subtitle">You haven't placed any orders yet. Start shopping!</p>
          <button className="empty-btn" onClick={() => navigate('/')}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status?.toLowerCase() === activeTab.toLowerCase();
  });

  const getTabCount = (status) => {
    if (status === 'all') return orders.length;
    return orders.filter(o => o.status?.toLowerCase() === status.toLowerCase()).length;
  };

  return (
    <div className="orders-section">
      <h2 className="section-title">Order History</h2>

      <div className="order-tabs-container">
        <button
          className={`order-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Orders
          <span className="tab-count">{getTabCount('all')}</span>
        </button>
        {['pending', 'confirmed', 'shipped', 'delivered'].map(tab => (
          <button
            key={tab}
            className={`order-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            <span className="tab-count">{getTabCount(tab)}</span>
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">
            {/* activeTab === 'all' ? 'No Orders Yet' : */} `No ${activeTab} Orders`
          </p>
          <p className="empty-subtitle">
            {/* activeTab === 'all' 
              ? "You haven't placed any orders yet. Start shopping!" 
              : */} `You don't have any orders in the ${activeTab} stage.`
          </p>
          {/* activeTab === 'all' && (
            <button className="empty-btn" onClick={() => navigate('/')}>Continue Shopping</button>
          ) */}
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => {
            const itemCount = order.items?.length || 0;
            const isExpanded = expandedOrders[order.id] || false;
            const visibleItems = isExpanded ? order.items : order.items?.slice(0, 2);
            const hasMoreItems = itemCount > 2;

            return (
              <div key={order.id} className="order-card">
                {/* Order Header */}
                <div className="order-header">
                  <div className="order-header-left">
                    <div className="order-top-row">
                      <h3 className="order-number">#{order.order_number || order.id}</h3>
                      <span className={`order-status ${getMappedStatuses(order).orderStatus.toLowerCase()}`}>
                        {getMappedStatuses(order).orderStatus.toUpperCase()}
                      </span>
                    </div>
                    <div className="order-info-row">
                      <span className="order-info-item">
                        <span className="order-info-icon">👤</span>
                        {order.customer?.firstName || 'N/A'} {order.customer?.lastName || 'N/A'}
                      </span>
                      <span className="order-info-separator">•</span>
                      <span className="order-info-item">
                        <span className="order-info-icon">📍</span>
                        {order.customer?.address || 'N/A'}, {order.customer?.city || 'N/A'}, {order.customer?.district || 'N/A'}
                      </span>
                      <span className="order-info-separator">•</span>
                      <span className="order-info-item">
                        <span className="order-info-icon">🗓</span>
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="order-header-right">
                    <div className="order-total-section">
                      <span className="order-total-label">ORDER TOTAL</span>
                      <span className="order-total-value">
                        Rs.{parseFloat(
                          order.total_bill ||
                          order.items?.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.quantity || 1)), 0) ||
                          0
                        ).toFixed(2)}
                      </span>
                      <span className="order-item-count">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Items Section */}
                <div className="order-items-section">
                  <div className="items-header">
                    <span className="items-label">ITEMS IN THIS ORDER</span>
                    {hasMoreItems && (
                      <button className="show-more-btn" onClick={() => toggleExpand(order.id)}>
                        {isExpanded ? 'Show less ▲' : `+${itemCount - 2} more ▼`}
                      </button>
                    )}
                  </div>

                  <div className="items-grid-2col">
                    {visibleItems?.map(item => {
                      const exactVariant = item.Product?.variants?.find(
                        v =>
                          String(v.size || '').toLowerCase().trim() === String(item.size || '').toLowerCase().trim() &&
                          String(v.color || '').toLowerCase().trim() === String(item.color || '').toLowerCase().trim() &&
                          v.imageUrl
                      );

                      const colorVariant = item.Product?.variants?.find(
                        v => {
                          if (!v.imageUrl || !v.color || !item.color) return false;
                          const vColor = String(v.color).toLowerCase().trim();
                          const iColor = String(item.color).toLowerCase().trim();
                          return vColor === iColor || vColor.includes(iColor) || iColor.includes(vColor);
                        }
                      );

                      const imageUrl = exactVariant?.imageUrl ||
                        colorVariant?.imageUrl ||
                        item.Product?.variants?.find(v => v.imageUrl)?.imageUrl ||
                        '/placeholder.png';

                      return (
                        <div key={item.id} className="product-card">
                          <div className="product-image">
                            <img
                              src={imageUrl}
                              alt={item.Product?.name || 'Product'}
                              onClick={() => setViewingImage(imageUrl)}
                              style={{ cursor: 'pointer' }}
                              onError={(e) => { e.target.src = '/placeholder.png'; }}
                            />
                            {item.quantity > 1 && <div className="product-qty-badge">×{item.quantity}</div>}
                          </div>
                          <div className="product-details">
                            <h4 className="product-title">{item.Product?.name || 'Product'}</h4>
                            <div className="product-attributes">
                              {item.color && <span className="product-color">{item.color}</span>}
                              {item.size && <span className="product-size">{item.size}</span>}
                            </div>
                            <div className="product-price">Rs.{parseFloat(item.price || 0).toFixed(2)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="order-footer">
                  <div className="tracking-status">
                    <span className={`tracking-dot ${order.status?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'shipped' ? 'active' : 'pending'}`} />
                    {order.status?.toLowerCase() === 'delivered' ? 'Tracking available' : 'Tracking pending'}
                  </div>
                  <div className="footer-actions">
                    <button className="download-receipt-btn" onClick={() => handleDownloadReceipt(order)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      {getDownloadButtonText(order.status)}
                    </button>
                    {/* Upload slip button for pending bank deposit orders */}
                    {(() => {
                      const pm = (order.payment_method || '').toLowerCase();
                      const ps = (order.payment_status || '').toLowerCase();
                      const isBank = pm.includes('bank');
                      const isPending = ps === 'pending';
                      if (!isBank || !isPending) return null;
                      const customer = order.customer || {};
                      const email = customer.email || '';
                      const uploadUrl = `/upload-slip?order=${encodeURIComponent(order.order_number)}&email=${encodeURIComponent(email)}&id=${order.id}`;
                      return (
                        <button
                          className="track-order-btn"
                          style={{ background: 'linear-gradient(135deg, #c9a882, #a07840)', color: '#fff', borderColor: 'transparent' }}
                          onClick={() => navigate(uploadUrl)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
                            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                          </svg>
                          UPLOAD SLIP
                        </button>
                      );
                    })()}
                    {order.status?.toLowerCase() === 'delivered' && (
                      <button className="review-order-btn" onClick={() => handleReviewOrder(order)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                        WRITE REVIEW
                      </button>
                    )}
                    <button className="track-order-btn" onClick={() => handleTrackOrder(order)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      TRACK ORDER
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Track Order Modal */}
      {showTrackModal && selectedOrder && (
        <div className="modal-overlay track-modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content track-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body track-modal-body">
              <h4 className="track-section-title">DELIVERY PROGRESS</h4>

              <div className="progress-container">
                <div className="progress-line"></div>

                <div className={`progress-step ${['pending', 'confirmed', 'shipped', 'delivered'].includes(selectedOrder.status?.toLowerCase() || 'pending') ? 'completed' : ''}`}>
                  <div className="progress-icon">📋</div>
                  <span className="progress-label">PENDING</span>
                </div>

                <div className={`progress-step ${['confirmed', 'shipped', 'delivered'].includes(selectedOrder.status?.toLowerCase() || 'pending') ? 'completed' : ''}`}>
                  <div className="progress-icon">⚙️</div>
                  <span className="progress-label">CONFIRMED</span>
                </div>

                <div className={`progress-step ${['shipped', 'delivered'].includes(selectedOrder.status?.toLowerCase() || 'pending') ? 'completed' : ''}`}>
                  <div className="progress-icon">🚚</div>
                  <span className="progress-label">SHIPPED</span>
                </div>

                <div className={`progress-step ${['delivered'].includes(selectedOrder.status?.toLowerCase() || 'pending') ? 'completed' : ''}`}>
                  <div className="progress-icon">✅</div>
                  <span className="progress-label">DELIVERED</span>
                </div>
              </div>

              <div className="track-barcode-section">
                <h4 className="track-section-title">TRACKING NUMBER</h4>
                <div className="barcode-box">
                  <div className="barcode-text-display">
                    {selectedOrder.detail?.barcode || selectedOrder.OrderDetail?.barcode || `TRK-PENDING-${selectedOrder.id}`}
                  </div>
                </div>
                <p className="barcode-subtext">
                  📦 Copy your Tracking Number above and visit <a href="https://koombiyodelivery.lk/Track/" target="_blank" rel="noopener noreferrer" className="koombiyo-link">koombiyodelivery.lk</a> for live delivery updates!
                </p>
              </div>
            </div>
            <div className="track-modal-footer">
              <button className="track-close-btn" onClick={handleCloseModal}>CLOSE</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div className="modal-overlay" onClick={() => setViewingImage(null)} style={{ zIndex: 9999 }}>
          <div className="image-viewer-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn image-viewer-close" onClick={() => setViewingImage(null)}>×</button>
            <img src={viewingImage} alt="Expanded view" className="expanded-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
