import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './MyComparisons.css';

// Each entry becomes: one full-width header row with the attribute name,
// followed by one data row with a cell per product.
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
        ₹{parseFloat(product.price || product.basePrice || 0).toFixed(2)}
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
  const location = useLocation();
  const navigate = useNavigate();
  const products = location.state?.products || [];

  if (!products.length) {
    return (
      <div className="pc-page">
        <div className="pc-header">
          <h1>📊 Product Comparison</h1>
          <button className="pc-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
        <div className="pc-empty">
          <p>No products selected for comparison.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pc-page">
      <div className="pc-header">
        <h1>📊 Product Comparison</h1>
        <button className="pc-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
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
    </div>
  );
};

export default MyComparisons;