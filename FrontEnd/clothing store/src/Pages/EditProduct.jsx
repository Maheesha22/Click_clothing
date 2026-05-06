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

  // Extract variants from product directly (populated via CartController)
  const variants = product?.availableVariants || [];
  
  // Extract unique colors (case-insensitive) and sizes from variants
  const colorMap = new Map();
  variants.forEach(v => {
    if (v.color && !colorMap.has(v.color.toLowerCase())) {
      colorMap.set(v.color.toLowerCase(), v.color);
    }
  });
  const uniqueColors = Array.from(colorMap.values());
  
  const sizeSet = new Set();
  variants.forEach(v => {
    if (v.size) sizeSet.add(String(v.size));
  });
  const uniqueSizes = Array.from(sizeSet);

  // If variants aren't loaded properly or empty, fallback to original dummy data so the UI doesn't break completely
  const colorOptions = uniqueColors.length > 0 ? uniqueColors : ["Black", "White", "Gray", "Navy", "Sand"];
  const sizeOptions = uniqueSizes.length > 0 ? uniqueSizes : ["XS", "S", "M", "L", "XL"];

  // Helper to get hex colors for swatches
  const getHexForColor = (colorName) => {
    const predefined = [
      { name: "Black", value: "#1F1F1F" },
      { name: "White", value: "#F5F5F5" },
      { name: "Gray", value: "#9E9E9E" },
      { name: "Grey", value: "#9E9E9E" },
      { name: "Navy", value: "#1B2A4A" },
      { name: "Sand", value: "#D6C5A9" },
      { name: "Red", value: "#D32F2F" },
      { name: "Blue", value: "#1976D2" },
      { name: "Green", value: "#388E3C" },
      { name: "Olive", value: "#3d4a2e" },
      { name: "Beige", value: "#f5f5dc" },
      { name: "Brown", value: "#8b4513" }
    ];
    const match = predefined.find(p => p.name.toLowerCase() === colorName.toLowerCase());
    return match ? match.value : colorName;
  };

  // Find image matching the selected color, or fallback to main product image
  const matchingVariant = variants.find(v => v.color?.toLowerCase() === tempColor?.toLowerCase() && v.imageUrl);
  const displayImage = matchingVariant ? matchingVariant.imageUrl : product?.imageUrl;

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
              {displayImage ? (
                <img src={displayImage} alt={product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
              ) : (
                <ProductSVG />
              )}
            </div>
            <div className="preview-info">
              <div className="product-title">{product?.name || "Product"}</div>
              <div className="current-vs-new">
                <span>Current: {product?.colorName || product?.color} / {product?.sizeLabel || product?.size}</span>
                <span>→ New: {tempColor} / {tempSize}</span>
              </div>
            </div>
          </div>

          {/* Color Selection with Actual Swatches */}
          <div className="edit-group">
            <div className="edit-label">Color</div>
            <div className="color-options">
              {colorOptions.map((colorName) => (
                <div
                  key={colorName}
                  className={`color-badge ${tempColor === colorName ? "selected" : ""}`}
                  onClick={() => setTempColor(colorName)}
                >
                  <div className="color-swatch" style={{ backgroundColor: getHexForColor(colorName) }}></div>
                  <span>{colorName}</span>
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
