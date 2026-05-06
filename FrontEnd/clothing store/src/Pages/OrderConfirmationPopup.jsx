import React from 'react';
import jsPDF from 'jspdf';
import './OrderConfirmationPopup.css';

const OrderConfirmationPopup = ({ orderDetails, onClose }) => {
  
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(76, 175, 80);
    doc.text('Order Confirmed!', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 15;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Receipt', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 15;
    
    // Draw border for receipt box
    doc.setDrawColor(33, 150, 243);
    doc.setLineWidth(0.5);
    doc.rect(15, yPos, pageWidth - 30, 180);
    
    yPos += 10;
    
    // Order Details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    const leftMargin = 25;
    const lineHeight = 12;
    
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
    
    doc.text(`Address: ${orderDetails.address}`, leftMargin, yPos);
    yPos += lineHeight;
    
    if (orderDetails.city) {
      doc.text(`City: ${orderDetails.city}`, leftMargin, yPos);
      yPos += lineHeight;
    }
    
    if (orderDetails.district) {
      doc.text(`District: ${orderDetails.district}`, leftMargin, yPos);
      yPos += lineHeight;
    }
    
    if (orderDetails.province) {
      doc.text(`Province: ${orderDetails.province}`, leftMargin, yPos);
      yPos += lineHeight;
    }
    
    yPos += 5;
    
    // Product Information
    doc.setFont(undefined, 'bold');
    doc.text('Order Details:', leftMargin, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, 'normal');
    
    // List all items
    if (orderDetails.items && orderDetails.items.length > 0) {
      orderDetails.items.forEach((item, index) => {
        const itemText = `${index + 1}. ${item.name} - Size: ${item.sizeLabel || item.size || 'N/A'} - Qty: ${item.qty} - Rs. ${(item.price * item.qty).toLocaleString()}.00`;
        // Handle long text wrapping
        const splitText = doc.splitTextToSize(itemText, pageWidth - 40);
        doc.text(splitText, leftMargin, yPos);
        yPos += (splitText.length * lineHeight);
      });
    } else {
      doc.text(`Product: ${orderDetails.productName}`, leftMargin, yPos);
      yPos += lineHeight;
      doc.text(`Quantity: ${orderDetails.quantity}`, leftMargin, yPos);
      yPos += lineHeight;
    }
    
    yPos += 5;
    
    // Financial Details
    doc.setFont(undefined, 'bold');
    doc.text(`Subtotal: Rs. ${(orderDetails.subtotal || 0).toLocaleString()}.00`, leftMargin, yPos);
    yPos += lineHeight;
    
    doc.text(`Shipping: Rs. ${(orderDetails.shipping || 0).toLocaleString()}.00`, leftMargin, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(76, 175, 80);
    doc.text(`Total Amount: Rs. ${(orderDetails.price || orderDetails.paidAmount || 0).toLocaleString()}.00`, leftMargin, yPos);
    yPos += lineHeight + 5;
    
    // Payment Information
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.text(`Payment Method: ${orderDetails.paymentMethod}`, leftMargin, yPos);
    yPos += lineHeight;
    
    doc.text(`Payment Status: ${orderDetails.confirmed ? 'Confirmed' : 'Pending'}`, leftMargin, yPos);
    yPos += lineHeight;
    
    doc.text(`Date: ${orderDetails.paidDate || new Date().toLocaleDateString()}`, leftMargin, yPos);
    
    // Footer
    yPos = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for shopping with Click Super Mall!', pageWidth / 2, yPos, { align: 'center' });
    
    // Save PDF
    doc.save(`order-receipt-${orderDetails.orderNumber || Date.now()}.pdf`);
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="success-checkmark">
          <div className="check-icon">✓</div>
        </div>
        
        <h1 className="confirmation-title">Your order is confirmed!</h1>
        
        <p className="order-number">Order #{orderDetails.orderNumber}</p>
        
        {orderDetails.barcode && (
          <div className="barcode-section">
            <span className="barcode-label">Barcode:</span>
            <span className="barcode-value">{orderDetails.barcode}</span>
          </div>
        )}
        
        <div className="receipt-box">
          <h3 className="receipt-title">Order Summary</h3>
          
          <div className="order-details">
            <div className="detail-row">
              <span className="detail-label">Customer Name:</span>
              <span className="detail-value">{orderDetails.customerName}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{orderDetails.email}</span>
            </div>
            
            {orderDetails.phone && (
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{orderDetails.phone}</span>
              </div>
            )}
            
            <div className="detail-row">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{orderDetails.address}</span>
            </div>
            
            {orderDetails.city && (
              <div className="detail-row">
                <span className="detail-label">City:</span>
                <span className="detail-value">{orderDetails.city}</span>
              </div>
            )}
            
            {orderDetails.district && (
              <div className="detail-row">
                <span className="detail-label">District:</span>
                <span className="detail-value">{orderDetails.district}</span>
              </div>
            )}
            
            {orderDetails.province && (
              <div className="detail-row">
                <span className="detail-label">Province:</span>
                <span className="detail-value">{orderDetails.province}</span>
              </div>
            )}
            
            <div className="divider"></div>
            
            <div className="detail-row">
              <span className="detail-label">Items:</span>
              <span className="detail-value">
                {orderDetails.items && orderDetails.items.length > 0 ? (
                  <div className="items-list">
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="item-entry">
                        {item.name} - {item.sizeLabel || item.size || 'N/A'} - Qty: {item.qty} - Rs. {(item.price * item.qty).toLocaleString()}.00
                      </div>
                    ))}
                  </div>
                ) : (
                  `${orderDetails.productName} x ${orderDetails.quantity}`
                )}
              </span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Subtotal:</span>
              <span className="detail-value">Rs. {(orderDetails.subtotal || 0).toLocaleString()}.00</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Shipping:</span>
              <span className="detail-value">Rs. {(orderDetails.shipping || 0).toLocaleString()}.00</span>
            </div>
            
            <div className="detail-row total-row">
              <span className="detail-label">Total Amount:</span>
              <span className="detail-value">Rs. {(orderDetails.price || orderDetails.paidAmount || 0).toLocaleString()}.00</span>
            </div>
            
            <div className="divider"></div>
            
            <div className="detail-row">
              <span className="detail-label">Payment Method:</span>
              <span className="detail-value">{orderDetails.paymentMethod}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Order Status:</span>
              <span className={`detail-value status ${orderDetails.confirmed ? 'confirmed' : 'pending'}`}>
                {orderDetails.confirmed ? 'Confirmed ✓' : 'Pending'}
              </span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Order Date:</span>
              <span className="detail-value">{orderDetails.paidDate || new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="button-group">
          <button className="download-btn" onClick={generatePDF}>
             Download Receipt
          </button>
          <button className="close-confirm-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPopup;