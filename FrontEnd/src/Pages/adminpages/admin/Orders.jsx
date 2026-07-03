import { useState, useEffect } from 'react';
import API, { assetUrl } from '../../../services/api';
import { O_BADGE, P_BADGE, IcoSearch, Avatar, Badge, Modal, IcoClose, IcoBox, IcoCard, IcoUsers } from './shared';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);import { useState, useEffect } from 'react';
import API, { assetUrl } from '../../../services/api';
import { O_BADGE, P_BADGE, IcoSearch, Avatar, Badge, Modal, IcoClose, IcoBox, IcoCard, IcoUsers } from './shared';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  
  const [viewOrder, setViewOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await API.get('/orders');
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Connection error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, type, value) => {
    setUpdating(true);
    try {
      const endpoint = type === 'order' ? 'status' : 'payment';
      const payload = type === 'order' ? { status: value } : { paymentStatus: value };
      
      const response = await API.put(`/orders/${orderId}/${endpoint}`, payload);
      if (response.data.success) {
        
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, [type === 'order' ? 'status' : 'payment_status']: value } : o));
        setEditOrder(null);
       
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update status: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  
  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'confirmed' || s === 'delivered') return 'b-delivered'; 
    if (s === 'shipped') return 'b-shipped'; 
    if (s === 'cancelled') return 'b-cancelled'; 
    return 'b-pending'; 
  };

  const pills = ['all', 'Delivered', 'Processing', 'Shipped', 'Confirmed', 'pending', 'Cancelled'];

  const rows = orders.filter(o => {
    const currentStatus = o.status || 'pending';
    const statusMatch = filter === 'all' || currentStatus.toLowerCase() === filter.toLowerCase();
    const customerName = o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : 'Unknown';
    const searchLower = search.toLowerCase();
    const pm = (o.payment_method || '').toLowerCase();
    const paymentMatch =
      paymentFilter === 'all' ||
      (paymentFilter === 'cod' && (pm.includes('cod') || pm.includes('cash'))) ||
      (paymentFilter === 'bank' && pm.includes('bank'));
    const searchMatch = !search || 
      (o.order_number && o.order_number.toLowerCase().includes(searchLower)) ||
      customerName.toLowerCase().includes(searchLower) ||
      (o.detail && o.detail.barcode && o.detail.barcode.toLowerCase().includes(searchLower));
    return statusMatch && paymentMatch && searchMatch;
  });

  return (
    <div className="view">
      <div className="ph">
        <div>
          <h1 className="ph-title">Order Management <span className="ph-badge">{rows.length} Total</span></h1>
          <p className="ph-sub">Process, track, and manage customer fulfillment cycles.</p>
        </div>
      </div>
      
      <div className="filter-pills">
        {pills.map(p => (
          <button 
            key={p} 
            className={`fp${filter === p ? ' active' : ''}`} 
            onClick={() => setFilter(p)}
          >
            {p === 'all' ? 'All Orders' : p}
          </button>
        ))}
      </div>

      {/* Payment method filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: '💳 All Methods' },
          { key: 'cod', label: '🚚 Cash on Delivery' },
          { key: 'bank', label: '🏦 Bank Deposit' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPaymentFilter(key)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: paymentFilter === key ? '1.5px solid var(--black)' : '1.5px solid var(--g3)',
              background: paymentFilter === key ? 'var(--black)' : 'transparent',
              color: paymentFilter === key ? '#fff' : 'var(--g6)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {label}
            <span style={{ marginLeft: 6, opacity: 0.6, fontSize: 11 }}>
              ({orders.filter(o => {
                const pm = (o.payment_method || '').toLowerCase();
                if (key === 'all') return true;
                if (key === 'cod') return pm.includes('cod') || pm.includes('cash');
                if (key === 'bank') return pm.includes('bank');
                return false;
              }).length})
            </span>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <div className="tb-search">
          <IcoSearch w={13}/>
          <input 
            className="tb-inp" 
            placeholder="Search Order #, Customer, Barcode…" 
            value={search} 
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-card" style={{overflow:'hidden'}}>
        <div className="tbl-wrap">
          <table className="tbl" style={{minWidth:1020}}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Order Number</th>
                <th>Barcode</th>
                <th>Cust ID</th>
                <th>Customer Name</th>
                <th>Payment Method</th>
                <th>Order Status</th>
                <th>Payment Status</th>
                <th style={{textAlign:'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className="empty-cell">Loading orders from database...</td></tr>
              ) : error ? (
                <tr><td colSpan="9" className="empty-cell" style={{color:'var(--red)'}}>{error}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan="9" className="empty-cell">No matching orders found.</td></tr>
              ) : rows.map(o => (
                <tr key={o.id}>
                  <td><span className="cell-id">#{o.id}</span></td>
                  <td className="cell-nm" style={{fontWeight:700}}>{o.order_number}</td>
                  <td className="cell-dim">{o.detail?.barcode || 'N/A'}</td>
                  <td className="cell-dim">C-{o.customer?.id || '??'}</td>
                  <td>
                    <div className="av-cell">
                      <Avatar ini={o.customer ? o.customer.firstName[0] + o.customer.lastName[0] : '??'}/>
                      <span className="cell-nm">{o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : 'Unknown'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', fontWeight:600, textTransform:'uppercase'}}>
                      <IcoCard /> {o.payment_method}
                    </div>
                  </td>
                  <td>
                    <Badge 
                      label={o.status || 'pending'} 
                      cls={getStatusBadge(o.status)}
                    />
                  </td>
                  <td>
                    <Badge 
                      label={o.payment_status || 'PENDING'} 
                      cls={getStatusBadge(o.payment_status)}
                    />
                  </td>
                  <td>
                    <div className="act-grp" style={{justifyContent:'flex-end'}}>
                      <button className="ab ab-view" onClick={() => setViewOrder(o)}>👁 View</button>
                      <button className="ab ab-edit" onClick={() => setEditOrder(o)}>✏️ Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---  VIEW POPUP --- */}
      <Modal 
        open={!!viewOrder} 
        onClose={() => setViewOrder(null)} 
        title={null}
      >
        {viewOrder && (
          <div className="premium-order-view">
           
            <div style={{background:'var(--black)', color:'white', padding:'24px', borderRadius:'16px 16px 0 0', position:'relative'}}>
              <button onClick={() => setViewOrder(null)} style={{position:'absolute', right:'20px', top:'20px', background:'rgba(255,255,255,0.1)', border:'none', color:'white', padding:'5px', borderRadius:'50%', cursor:'pointer'}}><IcoClose /></button>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
                <div>
                  <div style={{fontSize:'12px', opacity:0.7, textTransform:'uppercase', letterSpacing:'1px', marginBottom:'4px'}}>Order Transaction</div>
                  <h2 style={{fontSize:'24px', fontWeight:800, margin:0}}>{viewOrder.order_number}</h2>
                </div>
                <div style={{textAlign:'right'}}>
                  <Badge label={viewOrder.status} cls={getStatusBadge(viewOrder.status)} />
                </div>
              </div>
            </div>

            <div style={{padding:'24px', maxHeight:'75vh', overflowY:'auto'}}>
             
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'20px', marginBottom:'30px'}}>
                <div className="info-card" style={{background:'var(--g1)', padding:'16px', borderRadius:'12px', border:'1px solid var(--g3)'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px', color:'var(--g5)', fontSize:'11px', fontWeight:700, textTransform:'uppercase'}}>
                    <IcoUsers /> Customer Details
                  </div>
                  <div style={{fontWeight:700, fontSize:'14px'}}>{viewOrder.customer?.firstName} {viewOrder.customer?.lastName}</div>
                  <div style={{fontSize:'12px', color:'var(--g6)', marginTop:'4px'}}>{viewOrder.customer?.email}</div>
                  <div style={{fontSize:'12px', color:'var(--g6)'}}>{viewOrder.customer?.phone}</div>
                </div>

                <div className="info-card" style={{background:'var(--g1)', padding:'16px', borderRadius:'12px', border:'1px solid var(--g3)'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px', color:'var(--g5)', fontSize:'11px', fontWeight:700, textTransform:'uppercase'}}>
                    <IcoBox /> Shipping Address
                  </div>
                  <div style={{fontSize:'12px', color:'var(--g7)', lineHeight:'1.5'}}>
                    {viewOrder.customer?.address}<br/>
                    {viewOrder.customer?.city}, {viewOrder.customer?.district}<br/>
                    {viewOrder.customer?.province}
                  </div>
                </div>

                <div className="info-card" style={{background:'var(--g1)', padding:'16px', borderRadius:'12px', border:'1px solid var(--g3)'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px', color:'var(--g5)', fontSize:'11px', fontWeight:700, textTransform:'uppercase'}}>
                    <IcoCard /> Payment Info
                  </div>
                  <div style={{fontSize:'12px', color:'var(--g7)'}}>
                    <strong>Method:</strong> {viewOrder.payment_method}<br/>
                    <strong>Status:</strong> {viewOrder.payment_status}<br/>
                    <strong>Total:</strong> <span style={{fontSize:'16px', fontWeight:800}}>Rs. {parseFloat(viewOrder.total_bill).toLocaleString()}</span>
                  </div>
                </div>
              </div>

            
              <h3 style={{fontSize:'14px', fontWeight:800, marginBottom:'15px', display:'flex', alignItems:'center', gap:'10px'}}>
                Items Purchased <span style={{height:'1px', flex:1, background:'var(--g3)'}}></span>
              </h3>
              
              <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                {viewOrder.items?.map((item, idx) => {
                  
                  const variant = item.Product?.variants?.find(v => v.color === item.color && v.size === item.size) || item.Product?.variants?.[0];
                  const imgUrl = variant?.imageUrl || 'https://via.placeholder.com/100?text=No+Image';

                  return (
                    <div key={idx} style={{display:'flex', gap:'16px', padding:'12px', background:'white', borderRadius:'12px', border:'1px solid var(--g2)', boxShadow:'0 2px 8px rgba(0,0,0,0.02)'}}>
                      <div style={{width:'80px', height:'80px', borderRadius:'8px', overflow:'hidden', background:'var(--g2)', border:'1px solid var(--g3)', flexShrink:0}}>
                        <img src={imgUrl} alt={item.Product?.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                      </div>
                      <div style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'center'}}>
                        <div style={{fontSize:'14px', fontWeight:700, color:'var(--black)'}}>{item.Product?.name || 'Deleted Product'}</div>
                        <div style={{fontSize:'11px', color:'var(--g5)', marginTop:'2px', textTransform:'uppercase', fontWeight:600}}>
                          Size: {item.size} • Color: {item.color}
                        </div>
                        <div style={{fontSize:'12px', fontWeight:700, marginTop:'8px', color:'var(--black)'}}>
                          {item.quantity} x Rs. {parseFloat(item.price).toLocaleString()}
                        </div>
                      </div>
                      <div style={{display:'flex', alignItems:'center', fontWeight:800, fontSize:'14px'}}>
                        Rs. {(item.quantity * item.price).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {viewOrder.payment_slip && (() => {
                const slipUrl = viewOrder.payment_slip.startsWith('http') ? viewOrder.payment_slip : assetUrl(`/uploads/${viewOrder.payment_slip}`);
                const isPdf = viewOrder.payment_slip.toLowerCase().endsWith('.pdf');
                return (
                <div style={{marginTop:'30px'}}>
                  <h3 style={{fontSize:'14px', fontWeight:800, marginBottom:'15px', display:'flex', alignItems:'center', gap:'10px'}}>
                    Payment Proof <span style={{height:'1px', flex:1, background:'var(--g3)'}}></span>
                  </h3>
                  <div style={{background:'var(--g1)', padding:'20px', borderRadius:'16px', border:'1px dashed var(--g4)', textAlign:'center'}}>
                    {isPdf ? (
                      <iframe
                        src={slipUrl}
                        title="Payment Slip PDF"
                        style={{width:'100%', height:'400px', borderRadius:'8px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}}
                      />
                    ) : (
                      <img 
                        src={slipUrl} 
                        alt="Payment Slip" 
                        style={{maxWidth:'100%', maxHeight:'400px', borderRadius:'8px', boxShadow:'0 10px 30px rgba(0,0,0,0.1)', cursor:'pointer'}}
                        onClick={() => window.open(slipUrl, '_blank')}
                      />
                    )}
                    <div style={{marginTop:'12px'}}>
                      <button 
                        onClick={() => window.open(slipUrl, '_blank')}
                        style={{background:'white', border:'1px solid var(--g3)', padding:'8px 16px', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer', boxShadow:'var(--shadow)'}}
                      >
                        📂 View Full Document
                      </button>
                    </div>
                  </div>
                </div>
                );
              })()}
            </div>
            
            <div style={{padding:'20px 24px', borderTop:'1px solid var(--g3)', background:'var(--g1)', textAlign:'right'}}>
              <button onClick={() => setViewOrder(null)} className="btn-primary" style={{padding:'10px 30px'}}>Done</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ---  EDIT POPUP --- */}
      <Modal 
        open={!!editOrder} 
        onClose={() => setEditOrder(null)} 
        title={null}
        compact
      >
        {editOrder && (
          <div className="premium-edit-view">
             <div style={{padding:'24px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px'}}>
                  <div style={{width:'40px', height:'40px', background:'var(--black)', color:'white', borderRadius:'10px', display:'flex', alignItems:'center', justifyCenter:'center', fontSize:'18px'}}>✏️</div>
                  <div>
                    <h2 style={{fontSize:'16px', fontWeight:800, margin:0}}>Update Order Status</h2>
                    <p style={{fontSize:'12px', color:'var(--g5)', margin:0}}>{editOrder.order_number}</p>
                  </div>
                </div>

                <div style={{display:'flex', flexDirection:'column', gap:'18px'}}>
                  <div>
                    <label style={{fontSize:'11px', fontWeight:700, color:'var(--g5)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px', display:'block'}}>Fulfillment Status</label>
                    <select 
                      style={{width:'100%', padding:'12px', borderRadius:'10px', border:'2px solid var(--g3)', outline:'none', fontWeight:600, fontSize:'14px'}}
                      value={editOrder.status}
                      onChange={(e) => setEditOrder({...editOrder, status: e.target.value})}
                    >
                      <option value="pending"> Pending</option>
                      <option value="confirmed"> Confirmed</option>
                      <option value="shipped"> Shipped</option>
                      <option value="delivered"> Delivered</option>
                      <option value="cancelled"> Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label style={{fontSize:'11px', fontWeight:700, color:'var(--g5)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px', display:'block'}}>Payment Verification</label>
                    <select 
                      style={{width:'100%', padding:'12px', borderRadius:'10px', border:'2px solid var(--g3)', outline:'none', fontWeight:600, fontSize:'14px'}}
                      value={editOrder.payment_status}
                      onChange={(e) => setEditOrder({...editOrder, payment_status: e.target.value})}
                    >
                      <option value="PENDING"> Payment Pending</option>
                      <option value="Confirmed"> Payment Confirmed</option>
                      <option value="Cancelled"> Payment Cancelled</option>
                    </select>
                  </div>
                </div>

                <div style={{display:'flex', gap:'12px', marginTop:'30px'}}>
                  <button 
                    onClick={() => setEditOrder(null)} 
                    style={{flex:1, padding:'12px', background:'var(--g2)', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'13px', cursor:'pointer'}}
                  >
                    Discard
                  </button>
                  <button 
                    disabled={updating}
                    onClick={async () => {
                      const o = editOrder;
                      await handleUpdateStatus(o.id, 'order', o.status);
                      await handleUpdateStatus(o.id, 'payment', o.payment_status);
                    }}
                    style={{flex:2, padding:'12px', background:'var(--black)', color:'white', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'13px', cursor:'pointer', boxShadow:'0 4px 12px rgba(0,0,0,0.2)'}}
                  >
                    {updating ? 'Processing...' : 'Confirm Changes'}
                  </button>
                </div>
             </div>
          </div>
        )}
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .empty-cell { text-align: center; padding: 40px !important; color: var(--g5); font-size: 13px; font-weight: 500; }
        .premium-order-view::-webkit-scrollbar { width: 6px; }
        .premium-order-view::-webkit-scrollbar-thumb { background: var(--g3); border-radius: 10px; }
        .info-card { transition: transform 0.2s; }
        .info-card:hover { transform: translateY(-2px); border-color: var(--black) !important; }
        
        .overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: transparent !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: 99999 !important;
          margin: 0 !important;
          padding: 20px !important;
          width: 100vw !important;
          height: 100vh !important;
        }
        
        .modal {
          margin: auto !important;
          position: relative !important;
          z-index: 100000 !important;
          max-height: 90vh !important;
          overflow-y: auto !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3) !important;
        }

        .premium-order-view, .premium-edit-view {
          width: 100%;
        }
      `}} />

    </div>
  );
}

  const [filter, setFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  
  const [viewOrder, setViewOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await API.get('/orders');
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Connection error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, type, value) => {
    setUpdating(true);
    try {
      const endpoint = type === 'order' ? 'status' : 'payment';
      const payload = type === 'order' ? { status: value } : { paymentStatus: value };
      
      const response = await API.put(`/orders/${orderId}/${endpoint}`, payload);
      if (response.data.success) {
        
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, [type === 'order' ? 'status' : 'payment_status']: value } : o));
        setEditOrder(null);
       
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update status: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  
  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'confirmed' || s === 'delivered') return 'b-delivered'; 
    if (s === 'shipped') return 'b-shipped'; 
    if (s === 'cancelled') return 'b-cancelled'; 
    return 'b-pending'; 
  };

  const pills = ['all', 'Delivered', 'Processing', 'Shipped', 'Confirmed', 'pending', 'Cancelled'];

  const rows = orders.filter(o => {
    const currentStatus = o.status || 'pending';
    const statusMatch = filter === 'all' || currentStatus.toLowerCase() === filter.toLowerCase();
    const customerName = o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : 'Unknown';
    const searchLower = search.toLowerCase();
    const pm = (o.payment_method || '').toLowerCase();
    const paymentMatch =
      paymentFilter === 'all' ||
      (paymentFilter === 'cod' && (pm.includes('cod') || pm.includes('cash'))) ||
      (paymentFilter === 'bank' && pm.includes('bank'));
    const searchMatch = !search || 
      (o.order_number && o.order_number.toLowerCase().includes(searchLower)) ||
      customerName.toLowerCase().includes(searchLower) ||
      (o.detail && o.detail.barcode && o.detail.barcode.toLowerCase().includes(searchLower));
    return statusMatch && paymentMatch && searchMatch;
  });

  return (
    <div className="view">
      <div className="ph">
        <div>
          <h1 className="ph-title">Order Management <span className="ph-badge">{rows.length} Total</span></h1>
          <p className="ph-sub">Process, track, and manage customer fulfillment cycles.</p>
        </div>
      </div>
      
      <div className="filter-pills">
        {pills.map(p => (
          <button 
            key={p} 
            className={`fp${filter === p ? ' active' : ''}`} 
            onClick={() => setFilter(p)}
          >
            {p === 'all' ? 'All Orders' : p}
          </button>
        ))}
      </div>

      {/* Payment method filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: '💳 All Methods' },
          { key: 'cod', label: '🚚 Cash on Delivery' },
          { key: 'bank', label: '🏦 Bank Deposit' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPaymentFilter(key)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: paymentFilter === key ? '1.5px solid var(--black)' : '1.5px solid var(--g3)',
              background: paymentFilter === key ? 'var(--black)' : 'transparent',
              color: paymentFilter === key ? '#fff' : 'var(--g6)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {label}
            <span style={{ marginLeft: 6, opacity: 0.6, fontSize: 11 }}>
              ({orders.filter(o => {
                const pm = (o.payment_method || '').toLowerCase();
                if (key === 'all') return true;
                if (key === 'cod') return pm.includes('cod') || pm.includes('cash');
                if (key === 'bank') return pm.includes('bank');
                return false;
              }).length})
            </span>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <div className="tb-search">
          <IcoSearch w={13}/>
          <input 
            className="tb-inp" 
            placeholder="Search Order #, Customer, Barcode…" 
            value={search} 
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-card" style={{overflow:'hidden'}}>
        <div className="tbl-wrap">
          <table className="tbl" style={{minWidth:1020}}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Order Number</th>
                <th>Barcode</th>
                <th>Cust ID</th>
                <th>Customer Name</th>
                <th>Payment Method</th>
                <th>Order Status</th>
                <th>Payment Status</th>
                <th style={{textAlign:'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className="empty-cell">Loading orders from database...</td></tr>
              ) : error ? (
                <tr><td colSpan="9" className="empty-cell" style={{color:'var(--red)'}}>{error}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan="9" className="empty-cell">No matching orders found.</td></tr>
              ) : rows.map(o => (
                <tr key={o.id}>
                  <td><span className="cell-id">#{o.id}</span></td>
                  <td className="cell-nm" style={{fontWeight:700}}>{o.order_number}</td>
                  <td className="cell-dim">{o.detail?.barcode || 'N/A'}</td>
                  <td className="cell-dim">C-{o.customer?.id || '??'}</td>
                  <td>
                    <div className="av-cell">
                      <Avatar ini={o.customer ? o.customer.firstName[0] + o.customer.lastName[0] : '??'}/>
                      <span className="cell-nm">{o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : 'Unknown'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', fontWeight:600, textTransform:'uppercase'}}>
                      <IcoCard /> {o.payment_method}
                    </div>
                  </td>
                  <td>
                    <Badge 
                      label={o.status || 'pending'} 
                      cls={getStatusBadge(o.status)}
                    />
                  </td>
                  <td>
                    <Badge 
                      label={o.payment_status || 'PENDING'} 
                      cls={getStatusBadge(o.payment_status)}
                    />
                  </td>
                  <td>
                    <div className="act-grp" style={{justifyContent:'flex-end'}}>
                      <button className="ab ab-view" onClick={() => setViewOrder(o)}>👁 View</button>
                      <button className="ab ab-edit" onClick={() => setEditOrder(o)}>✏️ Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---  VIEW POPUP --- */}
      <Modal 
        open={!!viewOrder} 
        onClose={() => setViewOrder(null)} 
        title={null}
      >
        {viewOrder && (
          <div className="premium-order-view">
           
            <div style={{background:'var(--black)', color:'white', padding:'24px', borderRadius:'16px 16px 0 0', position:'relative'}}>
              <button onClick={() => setViewOrder(null)} style={{position:'absolute', right:'20px', top:'20px', background:'rgba(255,255,255,0.1)', border:'none', color:'white', padding:'5px', borderRadius:'50%', cursor:'pointer'}}><IcoClose /></button>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
                <div>
                  <div style={{fontSize:'12px', opacity:0.7, textTransform:'uppercase', letterSpacing:'1px', marginBottom:'4px'}}>Order Transaction</div>
                  <h2 style={{fontSize:'24px', fontWeight:800, margin:0}}>{viewOrder.order_number}</h2>
                </div>
                <div style={{textAlign:'right'}}>
                  <Badge label={viewOrder.status} cls={getStatusBadge(viewOrder.status)} />
                </div>
              </div>
            </div>

            <div style={{padding:'24px', maxHeight:'75vh', overflowY:'auto'}}>
             
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'20px', marginBottom:'30px'}}>
                <div className="info-card" style={{background:'var(--g1)', padding:'16px', borderRadius:'12px', border:'1px solid var(--g3)'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px', color:'var(--g5)', fontSize:'11px', fontWeight:700, textTransform:'uppercase'}}>
                    <IcoUsers /> Customer Details
                  </div>
                  <div style={{fontWeight:700, fontSize:'14px'}}>{viewOrder.customer?.firstName} {viewOrder.customer?.lastName}</div>
                  <div style={{fontSize:'12px', color:'var(--g6)', marginTop:'4px'}}>{viewOrder.customer?.email}</div>
                  <div style={{fontSize:'12px', color:'var(--g6)'}}>{viewOrder.customer?.phone}</div>
                </div>

                <div className="info-card" style={{background:'var(--g1)', padding:'16px', borderRadius:'12px', border:'1px solid var(--g3)'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px', color:'var(--g5)', fontSize:'11px', fontWeight:700, textTransform:'uppercase'}}>
                    <IcoBox /> Shipping Address
                  </div>
                  <div style={{fontSize:'12px', color:'var(--g7)', lineHeight:'1.5'}}>
                    {viewOrder.customer?.address}<br/>
                    {viewOrder.customer?.city}, {viewOrder.customer?.district}<br/>
                    {viewOrder.customer?.province}
                  </div>
                </div>

                <div className="info-card" style={{background:'var(--g1)', padding:'16px', borderRadius:'12px', border:'1px solid var(--g3)'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px', color:'var(--g5)', fontSize:'11px', fontWeight:700, textTransform:'uppercase'}}>
                    <IcoCard /> Payment Info
                  </div>
                  <div style={{fontSize:'12px', color:'var(--g7)'}}>
                    <strong>Method:</strong> {viewOrder.payment_method}<br/>
                    <strong>Status:</strong> {viewOrder.payment_status}<br/>
                    <strong>Total:</strong> <span style={{fontSize:'16px', fontWeight:800}}>Rs. {parseFloat(viewOrder.total_bill).toLocaleString()}</span>
                  </div>
                </div>
              </div>

            
              <h3 style={{fontSize:'14px', fontWeight:800, marginBottom:'15px', display:'flex', alignItems:'center', gap:'10px'}}>
                Items Purchased <span style={{height:'1px', flex:1, background:'var(--g3)'}}></span>
              </h3>
              
              <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                {viewOrder.items?.map((item, idx) => {
                  
                  const variant = item.Product?.variants?.find(v => v.color === item.color && v.size === item.size) || item.Product?.variants?.[0];
                  const imgUrl = variant?.imageUrl || 'https://via.placeholder.com/100?text=No+Image';

                  return (
                    <div key={idx} style={{display:'flex', gap:'16px', padding:'12px', background:'white', borderRadius:'12px', border:'1px solid var(--g2)', boxShadow:'0 2px 8px rgba(0,0,0,0.02)'}}>
                      <div style={{width:'80px', height:'80px', borderRadius:'8px', overflow:'hidden', background:'var(--g2)', border:'1px solid var(--g3)', flexShrink:0}}>
                        <img src={imgUrl} alt={item.Product?.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                      </div>
                      <div style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'center'}}>
                        <div style={{fontSize:'14px', fontWeight:700, color:'var(--black)'}}>{item.Product?.name || 'Deleted Product'}</div>
                        <div style={{fontSize:'11px', color:'var(--g5)', marginTop:'2px', textTransform:'uppercase', fontWeight:600}}>
                          Size: {item.size} • Color: {item.color}
                        </div>
                        <div style={{fontSize:'12px', fontWeight:700, marginTop:'8px', color:'var(--black)'}}>
                          {item.quantity} x Rs. {parseFloat(item.price).toLocaleString()}
                        </div>
                      </div>
                      <div style={{display:'flex', alignItems:'center', fontWeight:800, fontSize:'14px'}}>
                        Rs. {(item.quantity * item.price).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {viewOrder.payment_slip && (() => {
                const slipUrl = viewOrder.payment_slip.startsWith('http') ? viewOrder.payment_slip : assetUrl(`/uploads/${viewOrder.payment_slip}`);
                const isPdf = viewOrder.payment_slip.toLowerCase().endsWith('.pdf');
                return (
                <div style={{marginTop:'30px'}}>
                  <h3 style={{fontSize:'14px', fontWeight:800, marginBottom:'15px', display:'flex', alignItems:'center', gap:'10px'}}>
                    Payment Proof <span style={{height:'1px', flex:1, background:'var(--g3)'}}></span>
                  </h3>
                  <div style={{background:'var(--g1)', padding:'20px', borderRadius:'16px', border:'1px dashed var(--g4)', textAlign:'center'}}>
                    {isPdf ? (
                      <iframe
                        src={slipUrl}
                        title="Payment Slip PDF"
                        style={{width:'100%', height:'400px', borderRadius:'8px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}}
                      />
                    ) : (
                      <img 
                        src={slipUrl} 
                        alt="Payment Slip" 
                        style={{maxWidth:'100%', maxHeight:'400px', borderRadius:'8px', boxShadow:'0 10px 30px rgba(0,0,0,0.1)', cursor:'pointer'}}
                        onClick={() => window.open(slipUrl, '_blank')}
                      />
                    )}
                    <div style={{marginTop:'12px'}}>
                      <button 
                        onClick={() => window.open(slipUrl, '_blank')}
                        style={{background:'white', border:'1px solid var(--g3)', padding:'8px 16px', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer', boxShadow:'var(--shadow)'}}
                      >
                        📂 View Full Document
                      </button>
                    </div>
                  </div>
                </div>
                );
              })()}
            </div>
            
            <div style={{padding:'20px 24px', borderTop:'1px solid var(--g3)', background:'var(--g1)', textAlign:'right'}}>
              <button onClick={() => setViewOrder(null)} className="btn-primary" style={{padding:'10px 30px'}}>Done</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ---  EDIT POPUP --- */}
      <Modal 
        open={!!editOrder} 
        onClose={() => setEditOrder(null)} 
        title={null}
        compact
      >
        {editOrder && (
          <div className="premium-edit-view">
             <div style={{padding:'24px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px'}}>
                  <div style={{width:'40px', height:'40px', background:'var(--black)', color:'white', borderRadius:'10px', display:'flex', alignItems:'center', justifyCenter:'center', fontSize:'18px'}}>✏️</div>
                  <div>
                    <h2 style={{fontSize:'16px', fontWeight:800, margin:0}}>Update Order Status</h2>
                    <p style={{fontSize:'12px', color:'var(--g5)', margin:0}}>{editOrder.order_number}</p>
                  </div>
                </div>

                <div style={{display:'flex', flexDirection:'column', gap:'18px'}}>
                  <div>
                    <label style={{fontSize:'11px', fontWeight:700, color:'var(--g5)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px', display:'block'}}>Fulfillment Status</label>
                    <select 
                      style={{width:'100%', padding:'12px', borderRadius:'10px', border:'2px solid var(--g3)', outline:'none', fontWeight:600, fontSize:'14px'}}
                      value={editOrder.status}
                      onChange={(e) => setEditOrder({...editOrder, status: e.target.value})}
                    >
                      <option value="pending"> Pending</option>
                      <option value="confirmed"> Confirmed</option>
                      <option value="shipped"> Shipped</option>
                      <option value="delivered"> Delivered</option>
                      <option value="cancelled"> Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label style={{fontSize:'11px', fontWeight:700, color:'var(--g5)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px', display:'block'}}>Payment Verification</label>
                    <select 
                      style={{width:'100%', padding:'12px', borderRadius:'10px', border:'2px solid var(--g3)', outline:'none', fontWeight:600, fontSize:'14px'}}
                      value={editOrder.payment_status}
                      onChange={(e) => setEditOrder({...editOrder, payment_status: e.target.value})}
                    >
                      <option value="PENDING"> Payment Pending</option>
                      <option value="Confirmed"> Payment Confirmed</option>
                      <option value="Cancelled"> Payment Cancelled</option>
                    </select>
                  </div>
                </div>

                <div style={{display:'flex', gap:'12px', marginTop:'30px'}}>
                  <button 
                    onClick={() => setEditOrder(null)} 
                    style={{flex:1, padding:'12px', background:'var(--g2)', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'13px', cursor:'pointer'}}
                  >
                    Discard
                  </button>
                  <button 
                    disabled={updating}
                    onClick={async () => {
                      const o = editOrder;
                      await handleUpdateStatus(o.id, 'order', o.status);
                      await handleUpdateStatus(o.id, 'payment', o.payment_status);
                    }}
                    style={{flex:2, padding:'12px', background:'var(--black)', color:'white', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'13px', cursor:'pointer', boxShadow:'0 4px 12px rgba(0,0,0,0.2)'}}
                  >
                    {updating ? 'Processing...' : 'Confirm Changes'}
                  </button>
                </div>
             </div>
          </div>
        )}
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .empty-cell { text-align: center; padding: 40px !important; color: var(--g5); font-size: 13px; font-weight: 500; }
        .premium-order-view::-webkit-scrollbar { width: 6px; }
        .premium-order-view::-webkit-scrollbar-thumb { background: var(--g3); border-radius: 10px; }
        .info-card { transition: transform 0.2s; }
        .info-card:hover { transform: translateY(-2px); border-color: var(--black) !important; }
        
        .overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: transparent !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: 99999 !important;
          margin: 0 !important;
          padding: 20px !important;
          width: 100vw !important;
          height: 100vh !important;
        }
        
        .modal {
          margin: auto !important;
          position: relative !important;
          z-index: 100000 !important;
          max-height: 90vh !important;
          overflow-y: auto !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3) !important;
        }

        .premium-order-view, .premium-edit-view {
          width: 100%;
        }
      `}} />

    </div>
  );
}
