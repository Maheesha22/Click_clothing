// components/WhatsAppButton.jsx
import React from 'react';
import './whatsappbtn.css';

const WhatsAppButton = () => {
  const phoneNumber = "94XXXXXXXXX"; // Replace with your actual WhatsApp number
  const message = "Hello! I have a question about your products.";

  const handleClick = () => {
    let whatsappUrl = `https://wa.me/${phoneNumber}`;
    if (message) {
      whatsappUrl += `?text=${encodeURIComponent(message)}`;
    }
    window.open(whatsappUrl, "_blank", "noopener,norreferrer");
  };

  return (
    <button 
      className="whatsapp-btn"
      onClick={handleClick}
      aria-label="Chat on WhatsApp"
    >
      <svg 
        className="whatsapp-icon"
        viewBox="0 0 32 32" 
        fill="currentColor" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16.003 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.363.627 4.608 1.723 6.555L2.667 29.333l6.96-1.693A13.27 13.27 0 0 0 16.003 29.333C23.363 29.333 29.333 23.36 29.333 16S23.363 2.667 16.003 2.667zm0 2.4c5.96 0 10.93 4.973 10.93 10.933S21.963 26.933 16.003 26.933a10.9 10.9 0 0 1-5.547-1.52l-.4-.24-4.12 1.001.987-3.947-.267-.413a10.886 10.886 0 0 1-1.586-5.814c0-5.96 4.97-10.933 10.933-10.933zm-3.44 4.8c-.2 0-.533.08-.8.373-.267.293-1.04 1.013-1.04 2.48s1.067 2.88 1.213 3.08c.147.2 2.08 3.187 5.04 4.347 2.493.96 3 .76 3.547.72.547-.04 1.76-.72 2.013-1.413.253-.693.253-1.293.173-1.413-.08-.12-.293-.2-.613-.36-.32-.16-1.787-.88-2.067-.987-.28-.107-.48-.16-.693.16-.213.32-.827 1-.987 1.2-.16.2-.32.213-.627.053-.307-.16-1.28-.467-2.44-1.493-.907-.8-1.52-1.787-1.68-2.093-.16-.307-.013-.467.12-.613.12-.133.307-.347.453-.52.147-.173.2-.293.293-.493.093-.2.053-.387-.013-.547-.067-.16-.667-1.64-.92-2.24-.24-.587-.48-.507-.667-.52-.173-.013-.373-.013-.573-.013z"/>
      </svg>
    </button>
  );
};

export default WhatsAppButton;
