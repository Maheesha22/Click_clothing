import { useState, useEffect } from 'react'; 
import API from '../../../services/api';
import { IcoSearch, Avatar, Modal } from './shared';

export default function Returns() {
  const [returns, setReturns] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('month');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Multi-product form states
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [orderLoading, setOrderLoading] = useState(false);
  const [returnReason, setReturnReason] = useState(''); // ONE REASON FOR ALL PRODUCTS

  // Fetch returns, stats, and eligible orders on mount
  useEffect(() => {
    fetchReturns();
    fetchStats();
    fetchEligibleOrders();
  }, [period]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await API.get('/returns');
      if (response.data.success) {
        setReturns(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching returns:', error);
      setMessage('Error fetching returns');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await API.get(`/returns/stats?period=${period}`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch orders eligible for returns (shipped or delivered)
  const fetchEligibleOrders = async () => {
    try {
      const response = await API.get('/returns/eligible-orders');
      if (response.data.success) {
        setEligibleOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching eligible orders:', error);
    }
  };

  // Fetch order details when order is selected
  const fetchOrderDetails = async (orderId) => {
    if (!orderId) {
      setOrderDetails(null);
      setOrderItems([]);
      return;
    }

    try {
      setOrderLoading(true);
      setMessage(''); // Clear previous messages
      
      const response = await API.get(`/orders/${orderId}`);
      if (response.data.success) {
        const order = response.data.data;
        
        // ============ VALIDATE ORDER ELIGIBILITY ============
        const eligibilityErrors = [];
        
        // Check order status (must be shipped or delivered)
        if (!['shipped', 'delivered'].includes(order.status?.toLowerCase())) {
          eligibilityErrors.push(`❌ Order status is "${order.status}" - Only shipped/delivered orders can be returned`);
        }
        
        // Check payment method (must be COD) - handle both camelCase and snake_case from API
        const paymentMethod = (order.payment_method || order.paymentMethod || '');
        const isCOD = ['cod', 'cash on delivery'].includes(paymentMethod.toLowerCase());
        if (!isCOD) {
          eligibilityErrors.push(`❌ Payment method is "${paymentMethod}" - Only COD orders can be returned (Bank deposits cannot be returned)`);
        }
        
        // If there are errors, show them and don't allow selection
        if (eligibilityErrors.length > 0) {
          setMessage(eligibilityErrors.join('\n'));
          setOrderDetails(null);
          setOrderItems([]);
          setSelectedItems({});
          return;
        }
        
        // Order is eligible - proceed
        setOrderDetails(order);
        
        // Extract items from order details
        const items = order.items || [];
        setOrderItems(items);
        
        // Initialize selected items state
        const initialSelected = {};
        items.forEach(item => {
          initialSelected[item.id] = {
            selected: false,
            quantity: 1,
            size: item.size,
            color: item.color
          };
        });
        setSelectedItems(initialSelected);
        
        const paymentDisplay = order.payment_method || order.paymentMethod || 'N/A';
        setMessage(`✅ Order is eligible for return (Status: ${order.status}, Payment: ${paymentDisplay})`);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setOrderItems([]);
      setMessage('❌ Order not found or error fetching details');
    } finally {
      setOrderLoading(false);
    }
  };

  // Handle order selection change
  const handleOrderChange = (e) => {
    const orderId = e.target.value;
    setSelectedOrderId(orderId);
    if (orderId) {
      fetchOrderDetails(orderId);
    } else {
      setOrderDetails(null);
      setOrderItems([]);
      setSelectedItems({});
    }
  };

  // Handle item selection
  const handleItemSelect = (itemId, isSelected) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        selected: isSelected
      }
    }));
  };

  // Handle quantity change
  const handleQuantityChange = (itemId, quantity) => {
    const item = orderItems.find(i => i.id === itemId);
    const maxQty = item?.quantity || 1;
    const newQty = Math.min(maxQty, Math.max(1, parseInt(quantity) || 1));
    
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        quantity: newQty
      }
    }));
  };

  // Submit multi-product return with ONE REASON
  const handleSubmit = async () => {
    console.log("=== SUBMIT CLICKED ===");
    console.log("selectedItems state:", selectedItems);
    
    // Validate selections first
    const selectedProducts = Object.entries(selectedItems)
      .filter(([_, data]) => data.selected)
      .map(([itemId, data]) => {
        const orderItem = orderItems.find(i => i.id === parseInt(itemId));
        return {
          productId: orderItem?.productId,
          quantity: data.quantity,
          size: data.size,
          color: data.color
        };
      });

    console.log("Selected products count:", selectedProducts.length);
    console.log("Selected products:", selectedProducts);

    if (selectedProducts.length === 0) {
      console.warn("No products selected");
      setMessage('⚠️ Please select at least one product to return');
      return;
    }

    if (selectedProducts.some(p => !p.productId)) {
      console.error("Invalid products found:", selectedProducts.filter(p => !p.productId));
      setMessage('❌ Error: One or more items missing product information');
      return;
    }

    try {
      setLoading(true);
      
      // Get current user ID (from localStorage or context - adjust as needed)
      const userId = localStorage.getItem('userId') || 1;
      
      const payload = {
        userId: parseInt(userId),
        orderId: parseInt(selectedOrderId),
        products: selectedProducts,
        reason: returnReason || null
      };
      
      console.log("Sending payload:", JSON.stringify(payload, null, 2));
      
      const response = await API.post('/returns/multi-product', payload);
      
      console.log("✅ API Response:", response.data);
      
      if (response.data.success) {
        setMessage('✅ Return created successfully!');
        // Close form and reset state
        setTimeout(() => {
          setShowForm(false);
          setSelectedOrderId('');
          setOrderDetails(null);
          setOrderItems([]);
          setSelectedItems({});
          setReturnReason('');
          setMessage('');
        }, 500);
        
        // Refresh data
        fetchReturns();
        fetchStats();
      } else {
        setMessage('❌ ' + (response.data.message || 'Failed to create return'));
        console.error("Error response:", response.data);
      }
    } catch (error) {
      console.error('❌ Error creating return:', error);
      console.error('Error response data:', error.response?.data);
      setMessage('❌ Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReturn = async (id) => {
    if (window.confirm('Are you sure you want to delete this return?')) {
      try {
        const response = await API.delete(`/returns/${id}`);
        if (response.data.success) {
          setMessage('Return deleted successfully!');
          fetchReturns();
          fetchStats();
          setTimeout(() => setMessage(''), 3000);
        }
      } catch (error) {
        console.error('Error deleting return:', error);
        setMessage('Error deleting return');
      }
    }
  };

  const filteredReturns = returns.filter(r => {
    const matchesFilter = filter === 'all' || (filter === 'recent' && new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    const matchesSearch = !search || [
      r.id,
      r.User?.first_name,
      r.User?.last_name,
      r.Order?.order_number,
      r.reason,
      (r.products || []).map(p => p.productDetails?.name).join(', ')
    ].some(v => v?.toString().toLowerCase().includes(search.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const statKeys = Object.keys(stats).sort().reverse();

  return (
    <div className="view">
      {/* Header */}
      <div className="ph">
        <div>
          <h1 className="ph-title">Returns <span className="ph-badge">{returns.length} total</span></h1>
          <p className="ph-sub">Manage customer product returns with multiple items per return request.</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '16px',
          backgroundColor: message.includes('❌') ? '#fee' : message.includes('✅') ? '#e8f5e9' : '#fff3cd',
          color: message.includes('❌') ? '#c33' : message.includes('✅') ? '#2e7d32' : '#856404',
          borderRadius: '6px',
          fontSize: '14px',
          whiteSpace: 'pre-wrap',
          lineHeight: '1.5'
        }}>
          {message}
        </div>
      )}

      {/* Add Return Button */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          + Add Return
        </button>
      </div>

      {/* Statistics */}
      {statKeys.length > 0 && (
        <div className="admin-card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Returns Statistics ({period})</h3>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="tb-sel"
            >
              <option value="month">By Month</option>
              <option value="week">By Week</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {statKeys.map(key => {
              const stat = stats[key];
              return (
                <div key={key} className="stat-card">
                  <div className="stat-body">
                    <div>
                      <div className="stat-lbl">{key}</div>
                      <div className="stat-val">{stat.count}</div>
                      <div className="stat-chg">{stat.quantity} items returned</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Pills */}
      <div className="filter-pills">
        <button
          className={`fp${filter === 'all' ? ' active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Returns
        </button>
        <button
          className={`fp${filter === 'recent' ? ' active' : ''}`}
          onClick={() => setFilter('recent')}
        >
          Recent
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="toolbar">
        <div className="tb-search">
          <IcoSearch w={13} />
          <input
            className="tb-inp"
            placeholder="Search returns, customers, orders…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Returns Table */}
      <div className="admin-card" style={{ overflow: 'hidden' }}>
        {filteredReturns.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#999' }}>
            <p>No returns found</p>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl" style={{ minWidth: 1200 }}>
              <thead>
                <tr>
                  <th>Return ID</th>
                  <th>Customer</th>
                  <th>Order ID</th>
                  <th>Products Returned</th>
                  <th>Total Qty</th>
                  <th>Reason</th>
                  <th>Order Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReturns.map(ret => {
                  const totalQty = (ret.products || []).reduce((sum, p) => sum + (p.quantity || 0), 0);
                  
                  return (
                    <tr key={ret.id}>
                      <td className="cell-id">#{ret.id}</td>
                      <td>
                        <div className="av-cell">
                          <Avatar ini={ret.User?.first_name?.[0]} />
                          <span>{ret.User?.first_name} {ret.User?.last_name}</span>
                        </div>
                      </td>
                      <td>{ret.Order?.order_number || `#${ret.Order?.id}`}</td>
                      <td className="cell-dim">
                        <div style={{ maxWidth: '300px' }}>
                          {(ret.products || []).map((product, idx) => (
                            <div key={idx} style={{ fontSize: '13px', marginBottom: '4px' }}>
                              <strong>{product.productDetails?.name || `Product #${product.productId}`}</strong>
                              {' '} x{product.quantity}
                              {product.size && ` (${product.size})`}
                              {product.color && ` - ${product.color}`}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>{totalQty}</td>
                      <td className="cell-dim" style={{ maxWidth: '200px' }}>
                        {ret.reason ? ret.reason.substring(0, 50) + (ret.reason.length > 50 ? '...' : '') : '-'}
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor:
                            ret.Order?.status?.toLowerCase() === 'shipped'   ? '#dbeafe' :
                            ret.Order?.status?.toLowerCase() === 'delivered' ? '#d4edda' :
                            ret.Order?.status?.toLowerCase() === 'confirmed' ? '#e0f7fa' :
                            ret.Order?.status?.toLowerCase() === 'pending'   ? '#fff3cd' : '#e2e3e5',
                          color:
                            ret.Order?.status?.toLowerCase() === 'shipped'   ? '#1d4ed8' :
                            ret.Order?.status?.toLowerCase() === 'delivered' ? '#155724' :
                            ret.Order?.status?.toLowerCase() === 'confirmed' ? '#006064' :
                            ret.Order?.status?.toLowerCase() === 'pending'   ? '#856404' : '#383d41'
                        }}>
                          {ret.Order?.status
                            ? ret.Order.status.charAt(0).toUpperCase() + ret.Order.status.slice(1)
                            : '-'}
                        </span>
                      </td>
                      <td className="cell-dim">
                        {new Date(ret.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="act-grp">
                          <button
                            className="ab ab-delete"
                            onClick={() => handleDeleteReturn(ret.id)}
                            title="Delete return"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Multi-Product Return Modal */}
      <Modal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedOrderId('');
          setOrderDetails(null);
          setOrderItems([]);
          setSelectedItems({});
          setReturnReason('');
        }}
        title="Create Return Request"
      >
        <div className="return-modal-body">
          {/* Order Dropdown */}
          <div className="return-order-section">
            <label className="return-order-label">
              SELECT ORDER <span style={{ color: '#e53935' }}>*</span>
              <small style={{ display: 'block', marginTop: '6px', fontWeight: 'normal', color: '#666' }}>
                Only shipped/delivered + COD orders are eligible
              </small>
            </label>
            <select
              value={selectedOrderId}
              onChange={handleOrderChange}
              className="return-order-input"
              style={{ cursor: 'pointer' }}
            >
              <option value="">-- Select an order --</option>
              {eligibleOrders.map(order => {
                // Backend already filters for eligible orders (shipped/delivered + COD)
                // Just display them all as selectable
                const paymentMethod = order.payment_method || order.paymentMethod || '';
                return (
                  <option key={order.id} value={order.id}>
                    #{order.id} - {order.order_number} - {order.status} - {paymentMethod} - Rs {order.total_bill} ✓
                  </option>
                );
              })}
            </select>
          </div>

          {/* Loading State */}
          {orderLoading && (
            <div className="return-empty-state">
              Loading order items...
            </div>
          )}

          {/* Order Items List */}
          {!orderLoading && orderItems.length > 0 && (
            <div>
              <div className="return-products-title">Select products to return</div>
              <div className="return-products-list">
                {orderItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={`return-product-card ${selectedItems[item.id]?.selected ? 'selected' : ''}`}
                  >
                    <div className="return-product-row">
                      <input
                        type="checkbox"
                        checked={selectedItems[item.id]?.selected || false}
                        onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                        className="return-product-checkbox"
                      />
                      
                      <div className="return-product-info">
                        <div className="return-product-name">
                          {item.Product?.name || `Product #${item.productId}`}
                        </div>
                        <div className="return-product-meta">
                          <span>📏 Size: <strong>{item.size}</strong></span>
                          <span>🎨 Color: <strong>{item.color}</strong></span>
                          <span>💰 Price: <strong className="return-product-price">Rs {item.price}</strong></span>
                          <span>📦 Ordered: <strong>{item.quantity}</strong></span>
                        </div>
                      </div>

                      {selectedItems[item.id]?.selected && (
                        <div className="return-fields">
                          <div className="return-field-group">
                            <label className="return-field-label">Return Quantity</label>
                            <input
                              type="number"
                              min="1"
                              max={item.quantity}
                              value={selectedItems[item.id]?.quantity || 1}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              className="return-quantity-input"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Items Found */}
          {!orderLoading && selectedOrderId && orderItems.length === 0 && (
            <div className="return-empty-state">
              No products found for this order
            </div>
          )}

          {/* Tip for user */}
          {!selectedOrderId && (
            <div className="return-tip">
              ℹ️ Select an order to see its products and select items to return
            </div>
          )}

          {/* Return Reason - ONE FOR ALL SELECTED PRODUCTS */}
          {Object.values(selectedItems).some(item => item.selected) && (
            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
              <label className="return-field-label" style={{ display: 'block', marginBottom: '8px' }}>
                Return Reason (applies to all selected products) <span style={{ color: '#e53935' }}>*</span>
              </label>
              <textarea
                rows="4"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Please explain why you're returning these items..."
                className="return-reason-input"
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit' }}
              />
              <small style={{ color: '#666', display: 'block', marginTop: '6px' }}>
                This reason will apply to all {Object.values(selectedItems).filter(item => item.selected).length} selected product(s)
              </small>
            </div>
          )}

          {/* BUTTONS INSIDE MODAL BODY */}
          <div className="modal-footer-buttons" style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                console.log("Cancel button clicked");
                setShowForm(false);
                setSelectedOrderId('');
                setOrderDetails(null);
                setOrderItems([]);
                setSelectedItems({});
                setReturnReason('');
                setMessage('');
              }}
              className="modal-cancel-btn"
              disabled={loading}
              type="button"
            >
              {loading ? 'Processing...' : 'Cancel'}
            </button>
            <button
              onClick={(e) => {
                console.log("Create Return button clicked - Event:", e);
                e.preventDefault();
                handleSubmit();
              }}
              disabled={loading}
              className="modal-submit-btn"
              type="button"
              style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Creating...' : 'Create Return'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
