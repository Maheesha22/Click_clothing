import React from 'react';
import jsPDF from 'jspdf';
import './OrderConfirmationPopup.css';

const OrderConfirmationPopup = ({ orderDetails, onClose }) => {
  
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Header - Black & White
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0); // Black
    doc.text('Order Received', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 15;
    doc.setFontSize(16);
    doc.text('Receipt', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 15;
    
    // Draw border for receipt box - Black
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(15, yPos, pageWidth - 30, 185);
    
    yPos += 10;
    
    // Order Details
    doc.setFontSize(12);
    
    const leftMargin = 25;
    const lineHeight = 10;
    
    // Order Number and Barcode
    doc.setFont(undefined, 'bold');
    doc.text('Order Information:', leftMargin, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, 'normal');
    if (orderDetails.orderNumber) {
      doc.text(`Order Number: ${orderDetails.orderNumber}`, leftMargin, yPos);
      yPos += lineHeight;
    }
    
    if (orderDetails.barcode) {
      doc.text(`Barcode: ${orderDetails.barcode}`, leftMargin, yPos);
      yPos += lineHeight;
    }
    
    yPos += 5;
    
    // Customer Information
    doc.setFont(undefined, 'bold');
    doc.text('Customer Information:', leftMargin, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, 'normal');
    doc.text(`Name: ${orderDetails.customerName}`, leftMargin, yPos);
    yPos += lineHeight;
    
    doc.text(`Email: ${orderDetails.email}`, leftMargin, yPos);
    yPos += lineHeight;
    
    if (orderDetails.phone) {
      doc.text(`Phone: ${orderDetails.phone}`, leftMargin, yPos);
      yPos += lineHeight;
    }
    
    doc.text(`Address: ${orderDetails.address}, ${orderDetails.city || ''}`, leftMargin, yPos);
    yPos += lineHeight;
    
    if (orderDetails.district || orderDetails.province) {
      doc.text(`${orderDetails.district || ''}, ${orderDetails.province || ''}`, leftMargin, yPos);
      yPos += lineHeight;
    }
    
    yPos += 5;
    
    // Product Information
    doc.setFont(undefined, 'bold');
    doc.text('Order Summary:', leftMargin, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, 'normal');
    
    // List all items
    if (orderDetails.items && orderDetails.items.length > 0) {
      orderDetails.items.forEach((item, index) => {
        const itemText = `${index + 1}. ${item.name} (${item.sizeLabel || item.size || 'N/A'}) x${item.qty} - Rs. ${(item.price * item.qty).toLocaleString()}`;
        const splitText = doc.splitTextToSize(itemText, pageWidth - 40);
        doc.text(splitText, leftMargin, yPos);
        yPos += (splitText.length * 8);
      });
    }
    
    yPos += 5;
    
    // Totals
    doc.text(`Subtotal: Rs. ${(orderDetails.subtotal || 0).toLocaleString()}`, leftMargin, yPos);
    yPos += lineHeight;
    doc.text(`Shipping: Rs. ${(orderDetails.shipping || 0).toLocaleString()}`, leftMargin, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, 'bold');
    doc.text(`Total Amount: Rs. ${(orderDetails.price || orderDetails.paidAmount || 0).toLocaleString()}`, leftMargin, yPos);
    yPos += lineHeight + 5;
    
    // Status
    doc.setFont(undefined, 'normal');
    doc.text(`Payment Method: ${orderDetails.paymentMethod}`, leftMargin, yPos);
    yPos += lineHeight;
    doc.text(`Order Status: Pending`, leftMargin, yPos);
    yPos += lineHeight;
    doc.text(`Payment Status: Pending`, leftMargin, yPos);
    yPos += lineHeight;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, leftMargin, yPos);
    
    // Footer
    yPos = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for shopping with Click!', pageWidth / 2, yPos, { align: 'center' });
    
    // Save PDF
    doc.save(`order-receipt-${orderDetails.orderNumber || 'receipt'}.pdf`);
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="status-header">
          <div className="receipt-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h1 className="confirmation-title">Your order is received</h1>
          <p className="order-tag">Order #{orderDetails.orderNumber}</p>
        </div>
        
        <div className="receipt-box">
          <div className="receipt-section">
            <h3 className="section-title">Delivery Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Customer</span>
                <span className="info-value">{orderDetails.customerName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Address</span>
                <span className="info-value">{orderDetails.address}, {orderDetails.city}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{orderDetails.phone}</span>
              </div>
            </div>
          </div>

          <div className="receipt-section">
            <h3 className="section-title">Order Summary</h3>
            <div className="items-container">
              {orderDetails.items?.map((item, idx) => (
                <div key={idx} className="receipt-item">
                  <div className="item-main">
                    <span className="item-name">{item.name}</span>
                    <span className="item-variant">{item.sizeLabel || item.size} / {item.color}</span>
                  </div>
                  <div className="item-pricing">
                    <span className="item-qty">x{item.qty}</span>
                    <span className="item-sub">Rs. {(item.price * item.qty).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="receipt-section totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span>Rs. {orderDetails.subtotal?.toLocaleString()}</span>
            </div>
            <div className="total-row">
              <span>Shipping</span>
              <span>Rs. {orderDetails.shipping?.toLocaleString()}</span>
            </div>
            <div className="total-row grand">
              <span>Total Bill</span>
              <span>Rs. {(orderDetails.subtotal + orderDetails.shipping).toLocaleString()}</span>
            </div>
          </div>

          <div className="receipt-section status-section">
            <div className="status-row">
              <span className="status-label">Order Status</span>
              <span className="status-value pending">Pending</span>
            </div>
            <div className="status-row">
              <span className="status-label">Payment Status</span>
              <span className="status-value pending">Pending</span>
            </div>
            <div className="status-row">
              <span className="status-label">Payment Method</span>
              <span className="status-value">{orderDetails.paymentMethod}</span>
            </div>
          </div>
          
          {orderDetails.barcode && (
            <div className="barcode-footer">
              <div className="barcode-text">{orderDetails.barcode}</div>
              <div className="barcode-label">Order Reference Barcode</div>
            </div>
          )}
        </div>
        
        <div className="action-buttons">
          <button className="btn-primary" onClick={generatePDF}>Download Receipt (PDF)</button>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPopup;
