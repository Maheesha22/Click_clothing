// Components/WhatsAppButton.jsx
import React from 'react';
import './whatsappbtn.css';

// ── Shop's WhatsApp number (Sri Lanka: 076 450 8349) ────────────
const SHOP_PHONE = "94764508349";
const SHOP_NAME  = "Click Super Mall";

// ── Category-aware message templates ───────────────────────────
const getCategoryMessage = (context = {}) => {
  const { productName, category, page, price } = context;

  // If a specific product is known
  if (productName && category) {
    const templates = {
  Trousers:      `Hi ${SHOP_NAME}! 👋 I'm interested in the *${productName}* trousers priced at Rs. ${price}. Could you please confirm available waist sizes and stock?`,
  Shirts:        `Hi ${SHOP_NAME}! 👋 I like the *${productName}* shirt at Rs. ${price}. Do you have it in my size? Please assist me.`,
  "Formal Shirts": `Hi ${SHOP_NAME}! 👋 I'm interested in the formal shirt *${productName}* (Rs. ${price}). Could you share size and fabric details?`,
  "T Shirts":    `Hi ${SHOP_NAME}! 👋 I'm checking out the *${productName}* T‑shirt priced at Rs. ${price}. Is it available in cotton?`,
  Shorts:        `Hi ${SHOP_NAME}! 👋 I'd like to know more about the *${productName}* shorts at Rs. ${price}. What lengths and sizes do you have?`,
  Accessories:   `Hi ${SHOP_NAME}! 👋 I'm interested in the accessory *${productName}* (Rs. ${price}). Could you provide more details and availability?`,
};
    return templates[category] || `Hi ${SHOP_NAME}! 👋 I'm interested in the *${productName}* priced at Rs. ${price}. Could you please provide more details?`;
  }

  // Page-level fallbacks (no specific product selected)
  const pageMessages = {
    trousers:        `Hi ${SHOP_NAME}! 👋 I'm browsing your *Trousers* collection and I'd love some help finding the right fit. Could you assist me?`,
    shirts:          `Hi ${SHOP_NAME}! 👋 I'm looking at your *Shirts* collection. Can you recommend something based on my preferences?`,
    "formal-shirts": `Hi ${SHOP_NAME}! 👋 I'm interested in your *Formal Shirts* collection. Could you guide me with available styles and sizes?`,
    tshirts:         `Hi ${SHOP_NAME}! 👋 I'm checking out your *T-Shirts* collection. What are the popular picks right now?`,
    shorts:          `Hi ${SHOP_NAME}! 👋 I'm browsing your *Shorts* collection. Could you help me find the right style?`,
    accessories:     `Hi ${SHOP_NAME}! 👋 I'm interested in your *Men's Accessories*. Could you showcase what's currently available?`,
    "men-accessories": `Hi ${SHOP_NAME}! 👋 I'm browsing your *Men's Accessories* section. Can you help me find the perfect item?`,
    gifts:           `Hi ${SHOP_NAME}! 👋 I'm looking for gift ideas. Could you suggest some popular picks from your collection?`,
    sarong:          `Hi ${SHOP_NAME}! 👋 I'm interested in your *Sarong / Mens* collection. Could you assist me with available options?`,
  };

  if (page && pageMessages[page]) return pageMessages[page];

  // Default home/generic message
  return `Hi ${SHOP_NAME}! 👋 I'm browsing your store and would love some assistance. Could you help me find what I'm looking for?`;
};

// ── Component ───────────────────────────────────────────────────
// Props:
//   context = { productName, category, price, page }
//   Pass these from whatever page/component renders this button.
const WhatsAppButton = ({ context = {} }) => {
  const handleClick = () => {
    const message  = getCategoryMessage(context);
    const encoded  = encodeURIComponent(message);
    const url      = `https://wa.me/${SHOP_PHONE}?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      className="whatsapp-btn"
      onClick={handleClick}
      aria-label="Chat on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <svg
        className="whatsapp-icon"
        viewBox="0 0 32 32"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16.003 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.363.627 4.608 1.723 6.555L2.667 29.333l6.96-1.693A13.27 13.27 0 0 0 16.003 29.333C23.363 29.333 29.333 23.36 29.333 16S23.363 2.667 16.003 2.667zm0 2.4c5.96 0 10.93 4.973 10.93 10.933S21.963 26.933 16.003 26.933a10.9 10.9 0 0 1-5.547-1.52l-.4-.24-4.12 1.001.987-3.947-.267-.413a10.886 10.886 0 0 1-1.586-5.814c0-5.96 4.97-10.933 10.933-10.933zm-3.44 4.8c-.2 0-.533.08-.8.373-.267.293-1.04 1.013-1.04 2.48s1.067 2.88 1.213 3.08c.147.2 2.08 3.187 5.04 4.347 2.493.96 3 .76 3.547.72.547-.04 1.76-.72 2.013-1.413.253-.693.253-1.293.173-1.413-.08-.12-.293-.2-.613-.36-.32-.16-1.787-.88-2.067-.987-.28-.107-.48-.16-.693.16-.213.32-.827 1-.987 1.2-.16.2-.32.213-.627.053-.307-.16-1.28-.467-2.44-1.493-.907-.8-1.52-1.787-1.68-2.093-.16-.307-.013-.467.12-.613.12-.133.307-.347.453-.52.147-.173.2-.293.293-.493.093-.2.053-.387-.013-.547-.067-.16-.667-1.64-.92-2.24-.24-.587-.48-.507-.667-.52-.173-.013-.373-.013-.573-.013z" />
      </svg>

      {/* Pulse ring */}
      <span className="whatsapp-pulse" aria-hidden="true" />
    </button>
  );
};

export default WhatsAppButton;
