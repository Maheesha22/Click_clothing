import React, { useContext } from 'react';
import { ComparisonContext } from '../context/ComparisonContext';
import './CompareButton.css';

const CompareButton = ({ product }) => {
  const context = useContext(ComparisonContext);
  
  if (!context) {
    return <div style={{display: 'none'}} />;
  }

  const { comparisonCart, addToComparison, removeFromComparison } = context;
  
  if (!product || !product.id) {
    return null;
  }
  
  const isInComparison = comparisonCart?.some(p => p.id === product.id);
  const isDisabled = !isInComparison && (comparisonCart?.length || 0) >= 3;

  const handleClick = (e) => {
    e.stopPropagation();
    if (isInComparison) {
      removeFromComparison(product.id);
    } else {
      addToComparison(product);
    }
  };

  return (
    <button
      className={`compare-button ${isInComparison ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
      onClick={handleClick}
      disabled={isDisabled}
      title={isInComparison ? 'Remove from comparison' : isDisabled ? 'Maximum 3 products' : 'Add to comparison'}
    >
      📊
    </button>
  );
};

export default CompareButton;
