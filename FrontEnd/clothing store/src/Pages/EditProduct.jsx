import React from "react";
import "./EditProduct.css";

const EditProductModal = ({ 
  isOpen, 
  onClose, 
  product, 
  tempColor, 
  setTempColor, 
  tempSize, 
  setTempSize, 
  onSave 
}) => {
  if (!isOpen) return null;

  // Extract available variants from the product data
  const variants = product?.availableVariants || [];
  
  // Get all unique colors available for this product
  const allUniqueColors = [...new Set(variants.map(v => v.color))];
  
  // Get all unique sizes available for this product
  const allUniqueSizes = [...new Set(variants.map(v => v.size))];

  // Logic to determine if a size is available for the currently selected color
  const isSizeAvailableForColor = (size) => {
    return variants.some(v => v.color === tempColor && v.size === size);
  };

  // Logic to determine if a color is available for the currently selected size
  const isColorAvailableForSize = (color) => {
    return variants.some(v => v.color === color && v.size === tempSize);
  };

  // Get current image based on selected color
  const currentVariant = variants.find(v => v.color === tempColor) || variants[0];
  const currentImage = currentVariant?.imageUrl || product?.imageUrl;

  // Product SVG component (fallback)
  const ProductSVG = () => (
    <svg viewBox="0 0 82 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="82" height="100" fill="#e8ddd5" />
      <ellipse cx="41" cy="28" rx="15" ry="18" fill="#d4a574" />
      <path d="M26 22 C26 8 56 8 56 22 C56 15 52 11 41 11 C30 11 26 15 26 22Z" fill="#3d2008" />
      <path d="M13 100 C13 64 23 53 41 51 C59 53 69 64 69 100Z" fill="#c0834a" />
      <path d="M18 70 C8 65 5 54 9 45 C16 35 22 51 25 64Z" fill="#c0834a" />
      <path d="M64 70 C74 65 77 54 73 45 C66 35 60 51 57 64Z" fill="#c0834a" />
      <path d="M32 51 C32 45 41 42 41 42 C41 42 50 45 50 51Z" fill="#d4956a" />
    </svg>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Product Details</h3>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Product Preview Section */}
          <div className="product-preview-row">
            <div className="preview-image">
              {currentImage ? (
                <img src={currentImage} alt={product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
              ) : (
                <ProductSVG />
              )}
            </div>
            <div className="preview-info">
              <div className="product-title">{product?.name || "Product"}</div>
              <div className="product-price" style={{ fontWeight: '600', color: '#333' }}>Rs. {product?.price?.toFixed(2)}</div>
              <div className="selection-status">
                <span className="status-badge">Selection: {tempColor} / {tempSize}</span>
              </div>
            </div>
          </div>

          {/* Color Selection - Showing all from Variants */}
          <div className="edit-group">
            <div className="edit-label">Select Color</div>
            <div className="color-options">
              {allUniqueColors.map((color) => (
                <div
                  key={color}
                  className={`color-badge ${tempColor === color ? "selected" : ""} ${!isColorAvailableForSize(color) ? "not-available" : ""}`}
                  onClick={() => {
                    setTempColor(color);
                    // If the current size isn't available for the new color, auto-select the first available size
                    const availableSizesForNewColor = variants.filter(v => v.color === color).map(v => v.size);
                    if (!availableSizesForNewColor.includes(tempSize)) {
                      setTempSize(availableSizesForNewColor[0]);
                    }
                  }}
                >
                  <div className="color-swatch" style={{ backgroundColor: color }}></div>
                  <span>{color}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Size Selection - Showing all from Variants */}
          <div className="edit-group">
            <div className="edit-label">Select Size</div>
            <div className="size-options">
              {allUniqueSizes.map((size) => (
                <div
                  key={size}
                  className={`size-badge ${tempSize === size ? "selected" : ""} ${!isSizeAvailableForColor(size) ? "not-available" : ""}`}
                  onClick={() => {
                    if (isSizeAvailableForColor(size)) {
                      setTempSize(size);
                    } else {
                      // Optionally switch color to one that has this size, 
                      // but let's keep it simple: just select the size and find first color that matches
                      const firstColorForSize = variants.find(v => v.size === size)?.color;
                      if (firstColorForSize) {
                        setTempColor(firstColorForSize);
                        setTempSize(size);
                      }
                    }
                  }}
                >
                  {size}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="save-btn" onClick={onSave}>Update Cart Item</button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
