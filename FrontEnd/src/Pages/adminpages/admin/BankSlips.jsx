import { useState, useEffect } from 'react';
import API, { assetUrl } from '../../../services/api';
import { IcoSearch, Avatar, Badge, Modal, IcoClose, IcoCard, IcoUsers } from './shared';

const getStatusCls = (ps) => {
  const s = (ps || '').toLowerCase();
  if (s === 'confirmed') return 'b-delivered';
  if (s === 'cancelled') return 'b-cancelled';
  return 'b-pending';
};

export default function BankSlips() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewOrder, setViewOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get('/orders');
      if (res.data.success) {
        // Show only bank deposit orders
        const bankOrders = res.data.data.filter(o =>
          (o.payment_method || '').toLowerCase().includes('bank')
        );
        setOrders(bankOrders);
      } else {
        setError(res.data.message || 'Failed to load orders');
      }
    } catch (err) {
      setError('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleVerify = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      await API.put(`/orders/${orderId}/payment`, {
        paymentStatus: newStatus
      });
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, payment_status: newStatus } : o)
      );
      if (viewOrder?.id === orderId) {
        setViewOrder(v => ({ ...v, payment_status: newStatus }));
      }
      showToast(newStatus === 'Confirmed' ? '✅ Slip approved & payment confirmed.' : '❌ Slip rejected.');
    } catch (err) {
      showToast('Update failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  const pills = ['all', 'pending', 'confirmed', 'cancelled'];
  const rows = orders.filter(o => {
    const ps = (o.payment_status || 'PENDING').toLowerCase();
    const statusMatch = filter === 'all' || ps === filter;
    const sl = (search || '').toLowerCase();
    const name = o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : '';
    const searchMatch = !search ||
      (o.order_number || '').toLowerCase().includes(sl) ||
      name.toLowerCase().includes(sl);
    return statusMatch && searchMatch;
  });

  const slipOrders = rows.filter(o => o.payment_slip);
  const pendingCount = orders.filter(o => o.payment_slip && (o.payment_status || '').toLowerCase() === 'pending').length;
  const confirmedCount = orders.filter(o => (o.payment_status || '').toLowerCase() === 'confirmed').length;
  const noSlipCount = orders.filter(o => !o.payment_slip).length;

  return (
    <div className="view">
      <div className="ph">
        <div>
          <h1 className="ph-title">
            Bank Slips
            {pendingCount > 0 && (
              <span className="ph-badge" style={{ background: '#f59e0b', marginLeft: 10 }}>
                {pendingCount} Pending
              </span>
            )}
          </h1>
          <p className="ph-sub">Review and verify uploaded bank deposit payment slips.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mini-grid" style={{ marginBottom: 20 }}>
        {[
          ['📤', orders.length, 'Total Bank Orders'],
          ['⏳', pendingCount, 'Slips Pending'],
          ['✅', confirmedCount, 'Confirmed'],
          ['📋', noSlipCount, 'Awaiting Upload'],
        ].map(([ico, val, lbl]) => (
          <div key={lbl} className="mini-card">
            <div className="mini-ico">{ico}</div>
            <div><div className="mini-val">{val}</div><div className="mini-lbl">{lbl}</div></div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="filter-pills">
        {pills.map(p => (
          <button
            key={p}
            className={`fp${filter === p ? ' active' : ''}`}
            onClick={() => setFilter(p)}
          >
            {p === 'all' ? 'All Bank Deposits' : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="toolbar">
        <div className="tb-search">
          <IcoSearch w={13} />
          <input
            className="tb-inp"
            placeholder="Search order number or customer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-card" style={{ overflow: 'hidden' }}>
        <div className="tbl-wrap">
          <table className="tbl" style={{ minWidth: 980 }}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Order Amount</th>
                <th>Slip Status</th>
                <th>Payment Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="empty-cell">Loading bank deposit orders…</td></tr>
              ) : error ? (
                <tr><td colSpan="7" className="empty-cell" style={{ color: 'var(--red)' }}>{error}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan="7" className="empty-cell">No bank deposit orders found.</td></tr>
              ) : rows.map(o => {
                const slipUrl = o.payment_slip
                  ? (o.payment_slip.startsWith('http') ? o.payment_slip : assetUrl(`/uploads/${o.payment_slip}`))
                  : null;
                const ps = (o.payment_status || 'PENDING');
                const hasSlip = !!o.payment_slip;
                return (
                  <tr key={o.id}>
                    <td><span style={{ fontWeight: 700 }}>{o.order_number}</span></td>
                    <td>
                      <div className="av-cell">
                        <Avatar ini={o.customer ? o.customer.firstName[0] + o.customer.lastName[0] : '??'} />
                        <div>
                          <div className="cell-nm">{o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : 'Unknown'}</div>
                          <div className="cell-dim" style={{ fontSize: 11 }}>{o.customer?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontWeight: 700 }}>Rs. {parseFloat(o.total_bill || 0).toLocaleString()}.00</span></td>
                    <td>
                      {hasSlip ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
                          ✓ Uploaded
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
                          ⏳ Awaiting
                        </span>
                      )}
                    </td>
                    <td><Badge label={ps} cls={getStatusCls(ps)} /></td>
                    <td className="cell-dim">{new Date(o.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td>
                      <div className="act-grp" style={{ justifyContent: 'flex-end' }}>
                        <button className="ab ab-view" onClick={() => setViewOrder(o)}>👁 View</button>
                        {hasSlip && ps.toLowerCase() !== 'confirmed' && (
                          <button
                            className="ab"
                            style={{ background: '#22c55e', color: '#fff', borderColor: 'transparent', fontSize: 11, padding: '5px 10px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', border: 'none' }}
                            onClick={() => handleVerify(o.id, 'Confirmed')}
                            disabled={updating}
                          >
                            ✅ Approve
                          </button>
                        )}
                        {hasSlip && ps.toLowerCase() === 'confirmed' && (
                          <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>Confirmed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── VIEW MODAL ── */}
      <Modal open={!!viewOrder} onClose={() => setViewOrder(null)} title={null}>
        {viewOrder && (() => {
          const slipUrl = viewOrder.payment_slip
            ? (viewOrder.payment_slip.startsWith('http') ? viewOrder.payment_slip : assetUrl(`/uploads/${viewOrder.payment_slip}`))
            : null;
          const isPdf = viewOrder.payment_slip?.toLowerCase().endsWith('.pdf');
          const ps = (viewOrder.payment_status || 'PENDING');
          const isConfirmed = ps.toLowerCase() === 'confirmed';
          return (
            <div className="premium-order-view">
              {/* Header */}
              <div style={{ background: 'var(--black)', color: 'white', padding: '24px', borderRadius: '16px 16px 0 0', position: 'relative' }}>
                <button onClick={() => setViewOrder(null)} style={{ position: 'absolute', right: '20px', top: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '5px', borderRadius: '50%', cursor: 'pointer' }}><IcoClose /></button>
                <div style={{ fontSize: 12, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Bank Deposit Order</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{viewOrder.order_number}</h2>
                <div style={{ marginTop: 8 }}>
                  <Badge label={ps} cls={getStatusCls(ps)} />
                </div>
              </div>

              <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
                {/* Info cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 24 }}>
                  <div style={{ background: 'var(--g1)', padding: 16, borderRadius: 12, border: '1px solid var(--g3)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--g5)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', gap: 6, alignItems: 'center' }}><IcoUsers /> Customer</div>
                    <div style={{ fontWeight: 700 }}>{viewOrder.customer?.firstName} {viewOrder.customer?.lastName}</div>
                    <div style={{ fontSize: 12, color: 'var(--g6)', marginTop: 4 }}>{viewOrder.customer?.email}</div>
                    <div style={{ fontSize: 12, color: 'var(--g6)' }}>{viewOrder.customer?.phone}</div>
                  </div>
                  <div style={{ background: 'var(--g1)', padding: 16, borderRadius: 12, border: '1px solid var(--g3)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--g5)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', gap: 6, alignItems: 'center' }}><IcoCard /> Payment</div>
                    <div style={{ fontSize: 14, color: 'var(--g7)' }}>
                      <strong>Method:</strong> {viewOrder.payment_method}<br />
                      <strong>Status:</strong> {ps}<br />
                      <strong>Amount:</strong> <span style={{ fontSize: 18, fontWeight: 800 }}>Rs. {parseFloat(viewOrder.total_bill).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Slip Viewer */}
                <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                  Payment Slip <span style={{ height: 1, flex: 1, background: 'var(--g3)' }} />
                </h3>

                {slipUrl ? (
                  <div style={{ background: 'var(--g1)', padding: 20, borderRadius: 16, border: '1px dashed var(--g4)', textAlign: 'center' }}>
                    {isPdf ? (
                      <iframe src={slipUrl} title="Bank Slip PDF" style={{ width: '100%', height: 380, borderRadius: 8, border: 'none' }} />
                    ) : (
                      <img
                        src={slipUrl}
                        alt="Bank Slip"
                        style={{ maxWidth: '100%', maxHeight: 380, borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', cursor: 'pointer' }}
                        onClick={() => window.open(slipUrl, '_blank')}
                      />
                    )}
                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 10 }}>
                      <button
                        onClick={() => window.open(slipUrl, '_blank')}
                        style={{ background: 'white', border: '1px solid var(--g3)', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                      >
                        📂 Open Full Size
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'var(--g1)', padding: 30, borderRadius: 16, border: '2px dashed var(--g3)', textAlign: 'center', color: 'var(--g5)' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                    <div style={{ fontWeight: 700 }}>No Slip Uploaded Yet</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>The customer hasn't uploaded a bank slip for this order.</div>
                  </div>
                )}

                {/* Verification Actions */}
                {slipUrl && !isConfirmed && (
                  <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                    <button
                      onClick={() => handleVerify(viewOrder.id, 'Confirmed')}
                      disabled={updating}
                      style={{ flex: 2, padding: '13px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}
                    >
                      {updating ? 'Processing…' : '✅ Approve — Confirm Payment'}
                    </button>
                    <button
                      onClick={() => handleVerify(viewOrder.id, 'Cancelled')}
                      disabled={updating}
                      style={{ flex: 1, padding: '13px', background: 'var(--g2)', color: 'var(--g7)', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
                {isConfirmed && (
                  <div style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, color: '#16a34a', fontWeight: 700, textAlign: 'center', fontSize: 14 }}>
                    ✅ Payment has been confirmed for this order.
                  </div>
                )}
              </div>

              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--g3)', background: 'var(--g1)', textAlign: 'right' }}>
                <button onClick={() => setViewOrder(null)} className="btn-primary" style={{ padding: '10px 30px' }}>Close</button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Toast */}
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--black)', color: '#fff', padding: '12px 22px', borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 99999, boxShadow: '0 8px 30px rgba(0,0,0,0.3)', border: '1px solid rgba(201,168,130,0.3)' }}>
          {toastMsg}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .empty-cell { text-align:center; padding:40px!important; color:var(--g5); font-size:13px; }
        .premium-order-view::-webkit-scrollbar { width:6px; }
        .premium-order-view::-webkit-scrollbar-thumb { background:var(--g3); border-radius:10px; }
        .overlay { position:fixed!important; top:0!important; left:0!important; right:0!important; bottom:0!important; background:rgba(0,0,0,0.6)!important; display:flex!important; align-items:center!important; justify-content:center!important; z-index:99999!important; padding:20px!important; }
        .modal { margin:auto!important; position:relative!important; z-index:100000!important; max-height:90vh!important; overflow-y:auto!important; box-shadow:0 20px 50px rgba(0,0,0,0.3)!important; }
        .premium-order-view { width:100%; }
      `}} />
    </div>
  );
}
