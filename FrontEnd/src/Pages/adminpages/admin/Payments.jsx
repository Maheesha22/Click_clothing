import { useState, useEffect } from 'react';
import API from '../../../services/api';
import { Avatar, Badge, MiniStats, Modal, IcoClose } from './shared';

export default function Payments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Status badge styling lookup
  const tBadge = {
    Confirmed: 'b-delivered', // green/paid
    PENDING: 'b-pending',    // yellow/pending
    Cancelled: 'b-cancelled'  // red/failed
  };

  const cBadge = {
    Paid: 'b-courier-paid',
    Pending: 'b-courier-pending',
    Processing: 'b-courier-processing'
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await API.get('/orders');
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch payment records');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Connection error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      const response = await API.put(`/orders/${orderId}/payment`, {
        paymentStatus: newStatus
      });
      if (response.data.success) {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, payment_status: newStatus } : o))
        );
        setSelectedPayment(null);
      }
    } catch (error) {
      console.error('Update payment status error:', error);
      alert('Failed to update payment status: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  // Calculate stats dynamically from actual database records
  const calculateStats = () => {
    let totalRevenue = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    let failedAmount = 0;

    orders.forEach(o => {
      const bill = parseFloat(o.total_bill) || 0;
      if (o.payment_status === 'Confirmed') {
        paidAmount += bill;
        totalRevenue += bill;
      } else if (o.payment_status === 'PENDING') {
        pendingAmount += bill;
      } else if (o.payment_status === 'Cancelled') {
        failedAmount += bill;
      }
    });

    return [
      ['💰', `Rs. ${totalRevenue.toLocaleString()}`, 'Total Revenue'],
      ['✅', `Rs. ${paidAmount.toLocaleString()}`, 'Paid'],
      ['⏳', `Rs. ${pendingAmount.toLocaleString()}`, 'Pending'],
      ['❌', `Rs. ${failedAmount.toLocaleString()}`, 'Failed']
    ];
  };

  const pagedOrders = orders.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pageCount = Math.max(1, Math.ceil(orders.length / pageSize));

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), pageCount));
  };

  return (
    <div className="view">
      <div className="ph">
        <div>
          <h1 className="ph-title">Payments Dashboard</h1>
          <p className="ph-sub">Real-time database transaction records &amp; payment slip verification.</p>
        </div>
      </div>

      <MiniStats items={calculateStats()} />

      <div className="admin-card" style={{ overflow: 'hidden', marginBottom: 16 }}>
        <div className="admin-card-hdr-pad">
          <div className="c-title">Payment Transactions</div>
        </div>
        <div className="tbl-wrap">
          <table className="tbl" style={{ minWidth: 1000 }}>
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Customer</th>
                <th>Order ID</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Slip / Proof</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="empty-cell">
                    Loading payments from database...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="empty-cell" style={{ color: 'var(--red)' }}>
                    {error}
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-cell">
                    No transaction records found.
                  </td>
                </tr>
              ) : (
                pagedOrders.map(o => {
                  const paymentId = `PAY-${o.id.toString().padStart(4, '0')}`;
                  const customerName = o.customer
                    ? `${o.customer.firstName} ${o.customer.lastName}`
                    : 'Guest/Unknown';
                  const initials = o.customer
                    ? `${o.customer.firstName[0]}${o.customer.lastName[0]}`
                    : 'G';

                  return (
                    <tr key={o.id}>
                      <td className="cell-id">{paymentId}</td>
                      <td>
                        <div className="av-cell">
                          <Avatar ini={initials} />
                          <span>{customerName}</span>
                        </div>
                      </td>
                      <td className="cell-dim">{o.order_number}</td>
                      <td className="cell-price">Rs. {parseFloat(o.total_bill).toLocaleString()}</td>
                      <td className="cell-dim">{o.payment_method}</td>
                      <td>
                        {o.payment_slip ? (
                          <button
                            onClick={() => setSelectedPayment(o)}
                            style={{
                              background: 'transparent',
                              border: '1px solid rgba(15, 23, 42, 0.08)',
                              color: 'var(--black)',
                              fontWeight: 700,
                              borderRadius: '10px',
                              padding: '8px 14px',
                              cursor: 'pointer',
                              minWidth: 120,
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.04)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            View Slip
                          </button>
                        ) : (
                          <span style={{ color: 'var(--g5)', fontSize: '11px' }}>No Slip Uploaded</span>
                        )}
                      </td>
                      <td className="cell-dim">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="ab ab-view" onClick={() => setSelectedPayment(o)}>
                          👁 Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--g3)', background: 'var(--g1)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              style={{
                border: '1px solid rgba(15, 23, 42, 0.1)',
                background: currentPage <= 1 ? 'var(--g2)' : 'white',
                color: currentPage <= 1 ? 'var(--g5)' : 'var(--black)',
                padding: '8px 12px',
                borderRadius: '10px',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Prev
            </button>
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => goToPage(index + 1)}
                style={{
                  border: '1px solid rgba(15, 23, 42, 0.1)',
                  background: currentPage === index + 1 ? 'var(--black)' : 'white',
                  color: currentPage === index + 1 ? 'white' : 'var(--black)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= pageCount}
              style={{
                border: '1px solid rgba(15, 23, 42, 0.1)',
                background: currentPage >= pageCount ? 'var(--g2)' : 'white',
                color: currentPage >= pageCount ? 'var(--g5)' : 'var(--black)',
                padding: '8px 12px',
                borderRadius: '10px',
                cursor: currentPage >= pageCount ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
          <div style={{ color: 'var(--g5)', fontSize: '13px' }}>
            Page {currentPage} of {pageCount}
          </div>
        </div>
      </div>

      {/* --- PAYMENT VERIFICATION MODAL --- */}
      <Modal open={!!selectedPayment} onClose={() => setSelectedPayment(null)} title={null}>
        {selectedPayment && (
          <div className="payment-modal-view">
            <div
              style={{
                background: 'var(--black)',
                color: 'white',
                padding: '24px',
                borderRadius: '16px 16px 0 0',
                position: 'relative'
              }}
            >
              <button
                onClick={() => setSelectedPayment(null)}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '20px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  padding: '5px',
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
              >
                <IcoClose />
              </button>
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    opacity: 0.7,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '4px'
                  }}
                >
                  Payment Proof Verification
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>
                  Order: {selectedPayment.order_number}
                </h2>
              </div>
            </div>

            <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'var(--g1)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--g5)', fontWeight: 700 }}>CUSTOMER</div>
                  <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '2px' }}>
                    {selectedPayment.customer
                      ? `${selectedPayment.customer.firstName} ${selectedPayment.customer.lastName}`
                      : 'Guest'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--g6)' }}>
                    {selectedPayment.customer?.email}
                  </div>
                </div>
                <div style={{ background: 'var(--g1)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--g5)', fontWeight: 700 }}>PAYMENT DETAILS</div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--black)', marginTop: '2px' }}>
                    Rs. {parseFloat(selectedPayment.total_bill).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--g6)' }}>
                    Method: {selectedPayment.payment_method}
                  </div>
                </div>
              </div>

              {selectedPayment.payment_slip ? (
                <div style={{ marginTop: '20px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--g5)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                      letterSpacing: '0.1em'
                    }}
                  >
                    Payment Proof
                  </div>
                  <div
                    style={{
                      background: 'white',
                      padding: '18px',
                      borderRadius: '20px',
                      border: '1px solid rgba(15, 23, 42, 0.08)',
                      boxShadow: '0 12px 34px rgba(15, 23, 42, 0.06)',
                      textAlign: 'center'
                    }}
                  >
                    {selectedPayment.payment_slip.toLowerCase().endsWith('.pdf') ? (
                      <div style={{ display: 'grid', gap: '12px' }}>
                        <div style={{
                          padding: '26px 16px',
                          borderRadius: '14px',
                          background: 'var(--g1)',
                          border: '1px solid rgba(15, 23, 42, 0.06)',
                          color: 'var(--g6)',
                          fontWeight: 700
                        }}>
                          PDF preview available below.
                        </div>
                        <iframe
                          src={selectedPayment.payment_slip}
                          title="Payment Slip PDF"
                          style={{ width: '100%', height: '360px', borderRadius: '16px', border: '1px solid rgba(15, 23, 42, 0.08)' }}
                        />
                      </div>
                    ) : (
                      <img
                        src={selectedPayment.payment_slip}
                        alt="Payment Slip"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '420px',
                          borderRadius: '18px',
                          boxShadow: '0 18px 48px rgba(15,0,0,0.08)',
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(selectedPayment.payment_slip, '_blank')}
                      />
                    )}
                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                      <button
                        onClick={() => window.open(selectedPayment.payment_slip, '_blank')}
                        style={{
                          background: 'var(--black)',
                          color: 'white',
                          border: 'none',
                          padding: '12px 18px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Open Payment Proof
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: 'var(--g5)',
                    border: '1px dashed var(--g3)',
                    borderRadius: '8px'
                  }}
                >
                  No slip uploaded. This transaction is likely Cash on Delivery (COD).
                </div>
              )}
            </div>

            <div
              style={{
                padding: '20px 24px',
                borderTop: '1px solid var(--g3)',
                background: 'var(--g1)',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}
            >
              <button
                onClick={() => setSelectedPayment(null)}
                style={{
                  padding: '10px 16px',
                  background: 'white',
                  border: '1px solid var(--g3)',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              
              {selectedPayment.payment_status !== 'Confirmed' && (
                <>
                  <button
                    disabled={updating}
                    onClick={() => handleUpdatePaymentStatus(selectedPayment.id, 'Cancelled')}
                    style={{
                      padding: '10px 16px',
                      background: 'var(--red, #e02424)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Decline Payment
                  </button>
                  <button
                    disabled={updating}
                    onClick={() => handleUpdatePaymentStatus(selectedPayment.id, 'Confirmed')}
                    style={{
                      padding: '10px 20px',
                      background: 'var(--black)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                  >
                    {updating ? 'Verifying...' : 'Verify & Confirm'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      <style dangerouslySetInnerHTML={{
        __html: `
        .empty-cell { text-align: center; padding: 40px !important; color: var(--g5); font-size: 13px; font-weight: 500; }
        .payment-modal-view::-webkit-scrollbar { width: 6px; }
        .payment-modal-view::-webkit-scrollbar-thumb { background: var(--g3); border-radius: 10px; }
        
        .overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: rgba(0,0,0,0.4) !important;
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
          background: white !important;
          border-radius: 16px !important;
          width: 100% !important;
          max-width: 550px !important;
          margin: auto !important;
          position: relative !important;
          z-index: 100000 !important;
          max-height: 90vh !important;
          overflow: hidden !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3) !important;
        }
      `}} />
    </div>
  );
}
