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

  // Color palette with actual color values and names
  const colorPalette = [
    { name: "Black", value: "#1F1F1F" },
    { name: "White", value: "#F5F5F5" },
    { name: "Gray", value: "#9E9E9E" },
    { name: "Navy", value: "#1B2A4A" },
    { name: "Sand", value: "#D6C5A9" },
  ];

  const sizeOptions = ["XS", "S", "M", "L", "XL"];

  // Product SVG component (same as your existing one)
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
          <h3>Edit Product</h3>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Product Preview Section */}
          <div className="product-preview-row">
            <div className="preview-image">
              <ProductSVG />
            </div>
            <div className="preview-info">
              <div className="product-title">{product?.name || "Long Sleeve"}</div>
              <div className="current-vs-new">
                <span>Current: {product?.colorName || product?.color} / {product?.sizeLabel || product?.size}</span>
                <span>→ New: {tempColor} / {tempSize}</span>
              </div>
            </div>
          </div>

          {/* Color Selection with Actual Swatches */}
          <div className="edit-group">
            <div className="edit-label">Color · actual swatches</div>
            <div className="color-options">
              {colorPalette.map((color) => (
                <div
                  key={color.name}
                  className={`color-badge ${tempColor === color.name ? "selected" : ""}`}
                  onClick={() => setTempColor(color.name)}
                >
                  <div className="color-swatch" style={{ backgroundColor: color.value }}></div>
                  <span>{color.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="edit-group">
            <div className="edit-label">Size</div>
            <div className="size-options">
              {sizeOptions.map((size) => (
                <div
                  key={size}
                  className={`size-badge ${tempSize === size ? "selected" : ""}`}
                  onClick={() => setTempSize(size)}
                >
                  {size}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="save-btn" onClick={onSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;