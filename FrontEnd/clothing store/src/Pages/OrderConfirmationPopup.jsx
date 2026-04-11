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
    doc.rect(15, yPos, pageWidth - 30, 160);
    
    yPos += 10;
    
    // Order Details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    const leftMargin = 25;
    const lineHeight = 12;
    
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
    
    yPos += 5;
    
    // Product Information
    doc.setFont(undefined, 'bold');
    doc.text('Order Details:', leftMargin, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, 'normal');
    
    // List all items
    if (orderDetails.items && orderDetails.items.length > 0) {
      orderDetails.items.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.name} - Size: ${item.size} - Qty: ${item.qty} - Rs. ${(item.price * item.qty).toLocaleString()}.00`, leftMargin, yPos);
        yPos += lineHeight;
      });
    } else {
      doc.text(`Product: ${orderDetails.productName}`, leftMargin, yPos);
      yPos += lineHeight;
    }
    
    yPos += 5;
    
    // Financial Details
    doc.text(`Subtotal: Rs. ${orderDetails.subtotal.toLocaleString()}.00`, leftMargin, yPos);
    yPos += lineHeight;
    
    doc.text(`Shipping: Rs. ${orderDetails.shipping.toLocaleString()}.00`, leftMargin, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, 'bold');
    doc.text(`Total Amount: Rs. ${orderDetails.price.toLocaleString()}.00`, leftMargin, yPos);
    yPos += lineHeight + 5;
    
    // Payment Information
    doc.setFont(undefined, 'normal');
    doc.text(`Payment Method: ${orderDetails.paymentMethod}`, leftMargin, yPos);
    yPos += lineHeight;
    
    doc.text(`Payment Status: ${orderDetails.confirmed ? 'Confirmed' : 'Pending'}`, leftMargin, yPos);
    yPos += lineHeight;
    
    doc.text(`Date: ${orderDetails.paidDate}`, leftMargin, yPos);
    
    // Footer
    yPos = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for your order!', pageWidth / 2, yPos, { align: 'center' });
    
    // Save PDF
    doc.save(`order-receipt-${Date.now()}.pdf`);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h1 className="confirmation-title">Your order is confirmed!</h1>
        
        <h2 className="receipt-title">Download Your Receipt</h2>
        
        <div className="receipt-box">
          <div className="order-details">
            <div className="detail-row">
              <span className="detail-label">Customer Name:</span>
              <span className="detail-value">{orderDetails.customerName}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Product:</span>
              <span className="detail-value">{orderDetails.productName}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Quantity:</span>
              <span className="detail-value">{orderDetails.quantity}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Price:</span>
              <span className="detail-value">Rs. {orderDetails.price.toLocaleString()}.00</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Payment Method:</span>
              <span className="detail-value">{orderDetails.paymentMethod}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Order Status:</span>
              <span className={`detail-value ${orderDetails.confirmed ? 'confirmed' : 'pending'}`}>
                {orderDetails.confirmed ? 'Confirmed' : 'Pending'}
              </span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Paid Date:</span>
              <span className="detail-value">{orderDetails.paidDate}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Paid Amount:</span>
              <span className="detail-value">Rs. {orderDetails.paidAmount.toLocaleString()}.00</span>
            </div>
          </div>
        </div>
        
        <button className="download-btn" onClick={generatePDF}>Download</button>
      </div>
    </div>
  );
};

export default OrderConfirmationPopup;