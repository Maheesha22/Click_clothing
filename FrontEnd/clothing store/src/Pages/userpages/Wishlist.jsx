import React from 'react';

const Wishlist = ({ wishlistItems }) => (
  <div className="wishlist-section">
    <h2 className="section-title">My Wishlist</h2>
    <div className="wishlist-grid">
      {wishlistItems.map(item => (
        <div key={item.id} className="wishlist-item">
          <div className="item-emoji">{item.emoji}</div>
          <h3 className="item-name">{item.name}</h3>
          <p className="item-price">${item.price.toFixed(2)}</p>
          <div className="item-actions">
            <button className="add-to-cart-btn">Add to Cart</button>
            <button className="remove-btn">Remove</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Wishlist;
