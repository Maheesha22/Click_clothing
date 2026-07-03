import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useComparison } from '../context/ComparisonContext';
import { useNavigate } from 'react-router-dom';
import './CompareBar.css';

const CompareBar = () => {
  const { comparisonCart, showCompareBar, setShowCompareBar, removeFromComparison, clearComparison } = useComparison();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  if (!showCompareBar || comparisonCart.length < 2) {
    return null;
  }

  const handleViewComparison = () => {
    navigate('/comparison', { state: { products: comparisonCart } });
  };

  const handleViewSavedComparisons = () => {
    navigate('/user/comparisons');
  };

  const handleClose = () => {
    setShowCompareBar(false);
  };

  return (
    <div className="compare-bar">
      <div className="compare-bar-content">
        <div className="compare-bar-left">
          <span className="compare-count">
            📊 {comparisonCart.length}/3 Products Selected
          </span>
          <div className="compare-products-preview">
            {comparisonCart.map(product => (
              <div key={product.id} className="compare-preview-item">
                <img 
                  src={product.imageUrl || '/placeholder.png'} 
                  alt={product.name}
                  className="compare-preview-image"
                />
                <button
                  className="compare-remove-btn"
                  onClick={() => removeFromComparison(product.id)}
                  title="Remove from comparison"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="compare-bar-actions">
          <button 
            className="btn-compare-view"
            onClick={handleViewComparison}
            disabled={isLoading || comparisonCart.length < 2}
            title={comparisonCart.length < 2 ? 'Add at least 2 products to compare' : 'View comparison details'}
          >
            {isLoading ? 'Loading...' : `🔍 Compare Now (${comparisonCart.length})`}
          </button>
          <button 
            className="btn-compare-saved"
            onClick={handleViewSavedComparisons}
            title="View your saved comparisons"
          >
            📋 My Comparisons
          </button>
          <button 
            className="btn-compare-clear"
            onClick={clearComparison}
          >
            🗑️ Clear
          </button>
          <button 
            className="btn-compare-close"
            onClick={handleClose}
            title="Collapse compare bar"
          >
            −
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;
