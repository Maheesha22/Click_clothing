import React, { createContext, useState, useContext, useEffect } from 'react';

export const ComparisonContext = createContext();

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    console.warn('useComparison called outside ComparisonProvider');
    return {
      comparisonCart: [],
      addToComparison: () => {},
      removeFromComparison: () => {},
      clearComparison: () => {},
      showCompareBar: false,
      setShowCompareBar: () => {},
      savedComparisons: [],
      addSavedComparison: () => {},
      removeSavedComparison: () => {}
    };
  }
  return context;
};

export const ComparisonProvider = ({ children }) => {
  const [comparisonCart, setComparisonCart] = useState([]);
  const [savedComparisons, setSavedComparisons] = useState([]);
  const [showCompareBar, setShowCompareBar] = useState(false);

  useEffect(() => {
    try {
      const storedCart = sessionStorage.getItem('comparisonCart');
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setComparisonCart(parsed);
          setShowCompareBar(parsed.length >= 2);
        }
      }
    } catch (error) {
      console.error('Failed to load comparison cart from storage', error);
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem('comparisonCart', JSON.stringify(comparisonCart));
      setShowCompareBar(comparisonCart.length >= 2);
    } catch (error) {
      console.error('Failed to save comparison cart to storage', error);
    }
  }, [comparisonCart]);

  const persistCart = (cart) => {
    try {
      sessionStorage.setItem('comparisonCart', JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to persist comparison cart', error);
    }
  };

  // Add product to comparison (max 3)
  const addToComparison = (product) => {
    setComparisonCart(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) return prev;
      if (prev.length >= 3) {
        alert('Maximum 3 products can be compared');
        return prev;
      }
      const updated = [...prev, product];
      persistCart(updated);
      setShowCompareBar(updated.length >= 2);
      console.log('Product added to comparison:', product.name, 'Total:', updated.length);
      return updated;
    });
  };

  // Remove product from comparison
  const removeFromComparison = (productId) => {
    setComparisonCart(prev => {
      const next = prev.filter(p => p.id !== productId);
      persistCart(next);
      setShowCompareBar(next.length >= 2);
      return next;
    });
  };

  // Clear all comparisons
  const clearComparison = () => {
    setComparisonCart([]);
    persistCart([]);
    setShowCompareBar(false);
  };

  // Add saved comparison
  const addSavedComparison = (comparison) => {
    setSavedComparisons(prev => [...prev, comparison]);
  };

  // Remove saved comparison
  const removeSavedComparison = (comparisonId) => {
    setSavedComparisons(prev => prev.filter(c => c.id !== comparisonId));
  };

  const value = {
    comparisonCart,
    savedComparisons,
    showCompareBar,
    setShowCompareBar,
    addToComparison,
    removeFromComparison,
    clearComparison,
    addSavedComparison,
    removeSavedComparison,
    setComparisonCart,
    setSavedComparisons
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};
