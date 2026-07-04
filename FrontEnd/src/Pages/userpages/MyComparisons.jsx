import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/header';
import Footer from '../../Components/footer';
import './MyComparisons.css';

const ROWS = [
  {
    key: 'imageUrl',
    label: 'Product Image',
    render: (product) => (
      <img
        className="pc-product-image"
        src={product.imageUrl || product.img || 'https://via.placeholder.com/160'}
        alt={product.name}
        onError={(e) => (e.target.src = 'https://via.placeholder.com/160')}
      />
    ),
  },
  {
    key: 'name',
    label: 'Product Name',
    render: (product) => <span className="pc-strong">{product.name}</span>,
  },
  {
    key: 'price',
    label: 'Price',
    render: (product) => (
      <span className="pc-price">
        RS. {parseFloat(product.price || product.basePrice || 0).toFixed(2)}
      </span>
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
    render: (product) => product.material || 'N/A',
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
    render: (product) =>
      product.inStock === false ? (
        <span className="pc-out-stock">✕ Out of Stock</span>
      ) : (
        <span className="pc-in-stock">✓ In Stock</span>
      ),
  },
  {
    key: 'description',
    label: 'Description',
    render: (product) => <span className="pc-description">{product.description || 'N/A'}</span>,
  },
];

const MyComparisons = () => {
  const navigate = useNavigate();
  const [savedComparisons, setSavedComparisons] = useState([]);
  const [selectedComparison, setSelectedComparison] = useState(null);
  const [products, setProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get user ID from sessionStorage
  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserId(user.id);
      } catch (err) {
        console.error('Error parsing user:', err);
        setError('Unable to load user information');
      }
    } else {
      setError('Please login to view your comparisons');
    }
  }, []);

  // Fetch saved comparisons when user ID is available
  useEffect(() => {
    if (userId) {
      fetchSavedComparisons();
    }
  }, [userId]);

  const fetchSavedComparisons = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await API.get(
        `/comparisons/user/${userId}`
      );
      if (response.data.success) {
        setSavedComparisons(response.data.data || []);
        if (response.data.data && response.data.data.length > 0) {
          // Load the first comparison by default
          handleLoadComparison(response.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching saved comparisons:', err);
      setError('Failed to load your comparisons');
      setSavedComparisons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadComparison = (comparison) => {
    setSelectedComparison(comparison);
    if (comparison.productDetails && Array.isArray(comparison.productDetails)) {
      setProducts(comparison.productDetails);
    } else {
      setProducts([]);
    }
  };

  const handleDeleteComparison = async (comparisonId) => {
    if (!window.confirm('Are you sure you want to delete this comparison?')) {
      return;
    }

    try {
      const response = await API.delete(
        `/comparisons/${comparisonId}`
      );
      if (response.data.success) {
        setSavedComparisons(prev => prev.filter(c => c.id !== comparisonId));
        if (selectedComparison?.id === comparisonId) {
          setSelectedComparison(null);
          setProducts([]);
        }
        alert('Comparison deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting comparison:', err);
      alert('Error deleting comparison');
    }
  };

  // Show loading state
  if (isLoading && savedComparisons.length === 0) {
    return (
      <>
        <Header />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', minHeight: '60vh' }}>
      <div className="pc-page">
        <div className="pc-header">
          <h1>📊 My Comparisons</h1>
        </div>
        <div className="pc-empty">
          <p>⏳ Loading your comparisons...</p>
        </div>
      </div>
      </div>
      <Footer />
      </>
    );
  }

  // Show error state
  if (error && savedComparisons.length === 0) {
    return (
      <>
        <Header />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', minHeight: '60vh' }}>
      <div className="pc-page">
        <div className="pc-header">
          <h1>📊 My Comparisons</h1>
        </div>
        <div className="pc-empty">
          <p>❌ {error}</p>
          <button className="pc-back-btn" onClick={() => navigate('/login')}>
            ← Login
          </button>
        </div>
      </div>
      </div>
      <Footer />
      </>
    );
  }

  // Show no comparisons state
  if (savedComparisons.length === 0) {
    return (
      <>
        <Header />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', minHeight: '60vh' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: "'Jost', sans-serif", fontSize: '14px', 
            fontWeight: '500', color: '#888', padding: '0',
            marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px',
            textTransform: 'uppercase', letterSpacing: '0.5px'
          }}
        >
          <span style={{ fontSize: '18px' }}>←</span> Back
        </button>
      <div className="pc-page">
        <div className="pc-header">
          <h1>📊 My Comparisons</h1>
        </div>
        <div className="pc-empty">
          <p>No saved comparisons yet.</p>
          <p>Go to a product and add items to your comparison to save them!</p>
          <button className="pc-back-btn" onClick={() => navigate('/')}>
            ← Browse Products
          </button>
        </div>
      </div>
      </div>
      <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', minHeight: '60vh' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: "'Jost', sans-serif", fontSize: '14px', 
            fontWeight: '500', color: '#888', padding: '0',
            marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px',
            textTransform: 'uppercase', letterSpacing: '0.5px'
          }}
        >
          <span style={{ fontSize: '18px' }}>←</span> Back
        </button>
    <div className="pc-page">
      <div className="pc-header">
        <h1>📊 My Comparisons</h1>
      </div>

      <div className="pc-container">
        {/* Sidebar with saved comparisons list */}
        <div className="pc-sidebar">
          <div className="pc-sidebar-header">
            <h3>📋 Your Saved Comparisons ({savedComparisons.length})</h3>
          </div>
          <div className="pc-comparisons-list">
            {savedComparisons.map(comparison => (
              <div
                key={comparison.id}
                className={`pc-comparison-item ${selectedComparison?.id === comparison.id ? 'active' : ''}`}
              >
                <div
                  className="pc-comparison-item-content"
                  onClick={() => handleLoadComparison(comparison)}
                >
                  <h4>{comparison.comparisonName}</h4>
                  <p className="pc-product-count">
                    📦 {comparison.productIds?.length || 0} product(s)
                  </p>
                  <p className="pc-saved-date">
                    🕒 {new Date(comparison.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  className="pc-delete-btn"
                  onClick={() => handleDeleteComparison(comparison.id)}
                  title="Delete this comparison"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main comparison view */}
        <div className="pc-main">
          {selectedComparison && products.length > 0 ? (
            <>
              <div className="pc-comparison-header">
                <h2>{selectedComparison.comparisonName}</h2>
                <p className="pc-comparison-subtitle">
                  Comparing {products.length} product(s) | Saved on {new Date(selectedComparison.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="pc-table-wrapper">
                <table className="pc-table">
                  <tbody>
                    {ROWS.map((row) => (
                      <React.Fragment key={row.key}>
                        <tr className="pc-attr-row">
                          <th colSpan={products.length} className="pc-attr-label">
                            {row.label}
                          </th>
                        </tr>
                        <tr className="pc-data-row">
                          {products.map((product) => (
                            <td key={product.id} className="pc-cell">
                              {row.render(product)}
                            </td>
                          ))}
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="pc-empty">
              <p>Select a comparison from the left to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
    <Footer />
    </>
  );
};

export default MyComparisons;