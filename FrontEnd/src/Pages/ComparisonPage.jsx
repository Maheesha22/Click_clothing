import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useComparison } from '../context/ComparisonContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NavBar from '../components/navsidebar';
import '../styles/ComparisonPage.css';

// Each entry becomes: one full-width header bar with the attribute name,
// followed by a grid row with one column per product.
const buildRows = (formatPrice) => [
  {
    key: 'image',
    label: 'Product Image',
    render: (product) => (
      <img
        src={product.imageUrl || product.img || '/placeholder.png'}
        alt={product.name}
        className="product-comparison-image"
      />
    ),
  },
  {
    key: 'name',
    label: 'Product Name',
    render: (product) => <h3>{product.name}</h3>,
  },
  {
    key: 'price',
    label: 'Price',
    render: (product) => (
      <span className="price">{formatPrice(product.price || product.basePrice)}</span>
    ),
  },
  {
    key: 'brand',
    label: 'Brand',
    render: (product) => product.brand || 'N/A',
  },
  {
    key: 'material',
    label: 'Material',
    render: (product) => product.material || product.composition || 'N/A',
  },
  {
    key: 'color',
    label: 'Color',
    render: (product) => product.color || 'Various',
  },
  {
    key: 'sizes',
    label: 'Available Sizes',
    render: (product) =>
      Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || 'N/A',
  },
  {
    key: 'availability',
    label: 'Availability',
    render: (product) => (
      <span className={product.inStock || product.availability > 0 ? 'available' : 'unavailable'}>
        {product.inStock || product.availability > 0 ? '✓ In Stock' : '✗ Out of Stock'}
      </span>
    ),
  },
  {
    key: 'description',
    label: 'Description',
    render: (product) => <p>{product.description || product.modelInfo || 'N/A'}</p>,
  },
];

const ComparisonPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { comparisonCart, clearComparison, setComparisonCart } = useComparison();

  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [savedComparisons, setSavedComparisons] = useState([]);
  const [comparisonName, setComparisonName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserId(user.id);
      } catch (err) {
        console.error('Error parsing user:', err);
      }
    }
  }, []);

  useEffect(() => {
    const prods = location.state?.products || comparisonCart;
    if (prods && prods.length > 0) {
      setProducts(prods);
      fetchRecommendations(prods);
    }
  }, [location.state, comparisonCart]);

  useEffect(() => {
    if (userId) {
      fetchSavedComparisons();
    }
  }, [userId]);

  const fetchRecommendations = async (prods) => {
    try {
      setIsLoading(true);
      const productIds = prods.map(p => p.id);

      // Send request to backend
      const response = await axios.post(
        'http://localhost:3000/api/comparisons/recommendations/get',
        { productIds, limit: 4 }
      );

      if (response.data.success && response.data.data) {
        setRecommendations(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedComparisons = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/comparisons/user/${userId}`
      );
      if (response.data.success) {
        setSavedComparisons(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching saved comparisons:', err);
    }
  };

  const parsePriceValue = (price) => {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      const normalized = price.replace(/,/g, '').trim();
      const parsed = parseFloat(normalized);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    if (price === null || price === undefined) return 0;
    return Number(price) || 0;
  };

  const formatPrice = (price) => {
    const value = parsePriceValue(price);
    return `₹${value.toFixed(2)}`;
  };

  const handleSaveComparison = async () => {
    if (!userId) {
      alert('Please login to save comparisons');
      return;
    }

    if (!comparisonName.trim()) {
      alert('Please enter a comparison name');
      return;
    }

    if (products.length === 0) {
      alert('No products to compare');
      return;
    }

    try {
      setIsSaving(true);
      const productIds = products.map(p => p.id);
      const response = await axios.post(
        'http://localhost:3000/api/comparisons',
        {
          userId: parseInt(userId),
          productIds,
          comparisonName
        }
      );

      if (response.data.success) {
        alert('Comparison saved successfully!');
        setComparisonName('');
        fetchSavedComparisons();
      }
    } catch (err) {
      console.error('Error saving comparison:', err);
      alert('Error saving comparison: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSavedComparison = async (comparisonId) => {
    if (!window.confirm('Are you sure you want to delete this comparison?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:3000/api/comparisons/${comparisonId}`
      );
      if (response.data.success) {
        fetchSavedComparisons();
        alert('Comparison deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting comparison:', err);
      alert('Error deleting comparison');
    }
  };

  const handleLoadSavedComparison = (comparison) => {
    if (comparison.productDetails && comparison.productDetails.length > 0) {
      setProducts(comparison.productDetails);
      fetchRecommendations(comparison.productDetails);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (products.length === 0) {
    return (
      <div className="sh-page">
        <Header />
        <NavBar />
        <div className="comparison-page">
          <div className="comparison-empty">
            <h2>No Products to Compare</h2>
            <p>Select products from the store to start comparing.</p>
            <button className="btn-back" onClick={handleBack}>
              ← Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const rows = buildRows(formatPrice);

  return (
    <div className="sh-page">
      <Header />
      <NavBar />
      <div className="comparison-page">
        <div className="comparison-header">
          <h1>📊 Product Comparison</h1>
          <button className="btn-back" onClick={handleBack}>
            ← Back
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="comparison-container">
          <div className="comparison-table-wrapper">
            {rows.map((row) => (
              <div key={row.key} className="attribute-block">
                <div className="attribute-label">{row.label}</div>
                <div
                  className="attribute-data"
                  style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', width: '100%' }}
                >
                  {products.map(product => (
                    <div
                      key={product.id}
                      className="product-cell"
                      style={{ flex: '1 1 0%', minWidth: 0 }}
                    >
                      {row.render(product)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Comparison Section */}
        <div className="save-comparison-section">
          <h3>💾 Save This Comparison</h3>
          <div className="save-comparison-form">
            <input
              type="text"
              placeholder="Enter comparison name (e.g., 'Best Shirts')"
              value={comparisonName}
              onChange={(e) => setComparisonName(e.target.value)}
              className="comparison-name-input"
            />
            <button
              className="btn-save-comparison"
              onClick={handleSaveComparison}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Comparison'}
            </button>
          </div>
        </div>

        {/* Saved Comparisons */}
        {savedComparisons.length > 0 && (
          <div className="saved-comparisons-section">
            <h3>📋 Your Saved Comparisons</h3>
            <div className="saved-comparisons-list">
              {savedComparisons.map(comparison => (
                <div key={comparison.id} className="saved-comparison-item">
                  <div className="saved-comparison-info">
                    <h4>{comparison.comparisonName}</h4>
                    <p>Products: {comparison.productIds?.length || 0}</p>
                    <p className="saved-date">Saved: {new Date(comparison.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="saved-comparison-actions">
                    <button
                      className="btn-load"
                      onClick={() => handleLoadSavedComparison(comparison)}
                    >
                      Load
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteSavedComparison(comparison.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="recommendations-section">
            <h3>🎯 Recommended For You</h3>
            <p className="recommendations-subtitle">Similar products based on your comparison:</p>
            <div className="recommendations-grid">
              {recommendations.map(product => (
                <div key={product.id} className="recommendation-card">
                  <img
                    src={product.imageUrl || product.img || '/placeholder.png'}
                    alt={product.name}
                    className="recommendation-image"
                  />
                  <div className="recommendation-content">
                    <h4>{product.name}</h4>
                    <p className="recommendation-price">{formatPrice(product.price || product.basePrice)}</p>
                    <div className="recommendation-score">
                      <div className="score-bar">
                        <div
                          className="score-fill"
                          style={{ width: `${product.similarityScore || 0}%` }}
                        ></div>
                      </div>
                      <span className="score-text">{product.similarityScore || 0}% Match</span>
                    </div>
                    <button className="btn-view-product" onClick={() => navigate(`/category/${product.categoryId}`)}>
                      View Product
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="loading-section">
            <p>⏳ Calculating recommendations...</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ComparisonPage;