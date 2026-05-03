import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../Components/footer";
import EditProductModal from "./EditProduct";
import cartService from "../services/cartService";
import "./cart.css";

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

const colorPalette = [
  { name: "Black", value: "#1F1F1F" },
  { name: "White", value: "#F5F5F5" },
  { name: "Gray", value: "#9E9E9E" },
  { name: "Navy", value: "#1B2A4A" },
  { name: "Sand", value: "#D6C5A9" },
];

export default function Cart() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get userId from sessionStorage
  const getUserId = () => {
    try {
      const userData = sessionStorage.getItem('user');
      console.log('Cart - SessionStorage user data:', userData);
      
      if (userData) {
        const user = JSON.parse(userData);
        console.log('Cart - Parsed user:', user);
        return user.id;
      }
    } catch (error) {
      console.error('Cart - Error parsing user data:', error);
    }
    return null;
  };

  const userId = getUserId();
  console.log('Cart - Final userId:', userId);

  const fetchCartItems = useCallback(async () => {
    console.log('Cart - Fetching cart items for userId:', userId);
    
    if (!userId) {
      console.log('Cart - No userId, setting loading false');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await cartService.getCart(userId);
      console.log('Cart - API Response:', response);
      
      if (response && response.success) {
        const cartItems = response.cartItems || [];
        console.log('Cart - Raw cart items:', cartItems);
        console.log('Cart - Number of items:', cartItems.length);
        
        if (cartItems.length > 0) {
          const formattedItems = cartItems.map(item => ({
            id: item.id,
            name: item.name || 'Product',
            size: item.size ? parseInt(item.size) : 32,
            sizeLabel: item.size || '32',
            price: parseFloat(item.price) || 0,
            qty: item.quantity || 1,
            color: item.color || '#000000',
            colorName: item.color || 'Black',
            imageUrl: item.imageUrl || ''
          }));
          
          console.log('Cart - Formatted items:', formattedItems);
          setItems(formattedItems);
        } else {
          console.log('Cart - No items in cart');
          setItems([]);
        }
      } else {
        console.log('Cart - Response success is false or response is invalid');
        setItems([]);
      }
    } catch (error) {
      console.error('Cart - Error fetching cart:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch cart on mount and when userId changes
  useEffect(() => {
    console.log('Cart - useEffect triggered');
    fetchCartItems();
  }, [userId, fetchCartItems]);

  // Listen for cart updates - UPDATED to handle partial removal
  useEffect(() => {
    const handleCartUpdate = (event) => {
      console.log('Cart - Received cartUpdated event:', event.detail);
      
      // Check if this is a partial update (only purchased items)
      if (event.detail && event.detail.purchasedItems) {
        // Remove only the purchased items from cart state
        const purchasedProductIds = event.detail.purchasedItems.map(item => item.id);
        console.log('Cart - Removing purchased items with IDs:', purchasedProductIds);
        
        setItems(prevItems => 
          prevItems.filter(item => !purchasedProductIds.includes(item.id))
        );
        
        // Also remove from selected set if any purchased items were selected
        setSelected(prevSelected => {
          const newSelected = new Set(prevSelected);
          purchasedProductIds.forEach(id => newSelected.delete(id));
          return newSelected;
        });
      } else {
        // Full refresh if no specific items provided (for other cart updates)
        console.log('Cart - Full cart refresh');
        fetchCartItems();
      }
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [fetchCartItems]);

  const toggleSelect = (id) => {
    setSelected(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  };

  const changeQty = async (id, delta) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    const newQty = Math.max(1, item.qty + delta);
    
    if (newQty !== item.qty) {
      try {
        const response = await cartService.updateQuantity(id, newQty);
        console.log('Cart - Update quantity response:', response);
        
        if (response.success) {
          setItems(prev =>
            prev.map(item =>
              item.id === id ? { ...item, qty: newQty } : item
            )
          );
        }
      } catch (error) {
        console.error('Cart - Error updating quantity:', error);
      }
    }
  };

  const removeItem = async (id) => {
    try {
      const response = await cartService.removeFromCart(id);
      console.log('Cart - Remove item response:', response);
      
      if (response.success) {
        setItems(prev => prev.filter(item => item.id !== id));
        setSelected(prev => {
          const newSelected = new Set(prev);
          newSelected.delete(id);
          return newSelected;
        });
      }
    } catch (error) {
      console.error('Cart - Error removing item:', error);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [tempColor, setTempColor] = useState("");
  const [tempSize, setTempSize] = useState("");

  const openEditModal = (item) => {
    setEditingItem(item);
    setTempColor(item.colorName);
    setTempSize(item.sizeLabel);
    setIsModalOpen(true);
  };

  const saveEditChanges = () => {
    if (editingItem) {
      const updatedColor = colorPalette.find(c => c.name === tempColor);
      setItems(prev =>
        prev.map(item =>
          item.id === editingItem.id
            ? {
                ...item,
                colorName: tempColor,
                color: updatedColor ? updatedColor.value : item.color,
                sizeLabel: tempSize,
                size: tempSize,
              }
            : item
        )
      );
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const selectedItems = items.filter(item => selected.has(item.id));
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const selectedTotalQty = selectedItems.reduce((sum, item) => sum + item.qty, 0);

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to proceed.");
      return;
    }
    navigate("/checkout", {
      state: { selectedItems, subtotal },
    });
  };

  const handleProceedToHome = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="cart-page-wrapper">
        <header className="cart-header">
          <img src="/logo.jpeg" alt="CLiCK" className="cart-logo-img" />
        </header>
        <main className="cart-main">
          <div style={{ textAlign: 'center', padding: '50px' }}>Loading your cart...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      <header className="cart-header">
        <img src="/logo.jpeg" alt="CLiCK" className="cart-logo-img" />
        <div className="cart-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="#1e1e1e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span className="cart-icon-badge">{selectedTotalQty > 0 ? selectedTotalQty : "0"}</span>
        </div>
      </header>

      <main className="cart-main">
        <h1 className="cart-page-title">Your Cart</h1>

        <div className="cart-layout">
          <div className="cart-items-container">
            <div className="cart-table-header">
              <span>Product</span>
              <span className="th-center">Price</span>
              <span className="th-center">Quantity</span>
              <span className="th-center">Total</span>
              <span />
            </div>

            {items.length === 0 ? (
              <div className="empty-cart-message" style={{ textAlign: 'center', padding: '50px' }}>
                <p>Your cart is empty!</p>
                <button 
                  onClick={() => navigate('/trousers')} 
                  style={{ 
                    padding: '10px 20px', 
                    cursor: 'pointer',
                    backgroundColor: '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    marginTop: '10px'
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div className="cart-row" key={item.id}>
                  <div
                    className={`select-circle${selected.has(item.id) ? " selected" : ""}`}
                    onClick={() => toggleSelect(item.id)}
                  />

                  <div className="product-cell">
                    <div className="product-image">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                      ) : (
                        <ProductSVG />
                      )}
                    </div>
                    <div className="product-meta">
                      <span className="product-name">{item.name}</span>
                      <div className="product-info-row">
                        <span className="product-size">Size: {item.sizeLabel}</span>
                        <span
                          className="product-color-swatch"
                          style={{ 
                            background: item.color,
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            display: 'inline-block',
                            marginLeft: '10px'
                          }}
                        />
                        <button 
                          className="edit-pencil-btn" 
                          onClick={() => openEditModal(item)}
                          style={{ marginLeft: '10px', cursor: 'pointer' }}
                        >
                          ✏️
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="price-cell">Rs.{item.price.toFixed(2)}</div>

                  <div className="qty-cell">
                    <div className="qty-control">
                      <button onClick={() => changeQty(item.id, -1)}>-</button>
                      <span className="qty-num">{item.qty}</span>
                      <button onClick={() => changeQty(item.id, 1)}>+</button>
                    </div>
                  </div>

                  <div className="total-cell">
                    Rs.{(item.price * item.qty).toFixed(2)}
                  </div>

                  <div className="remove-cell">
                    <button className="remove-btn" onClick={() => removeItem(item.id)}>✕</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <aside className="order-summary">
            <h2 className="summary-title">Order Summary</h2>
            <div className="summary-divider" />
            <div className="summary-row">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-divider" />
            <p className="shipping-note">Shipping calculated at checkout</p>
            <button className="btn-checkout" onClick={handleProceedToCheckout}>
              Proceed to Checkout
            </button>
            <button className="btn-continue" onClick={handleProceedToHome}>Continue Shopping</button>
          </aside>
        </div>
      </main>

      <EditProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingItem}
        tempColor={tempColor}
        setTempColor={setTempColor}
        tempSize={tempSize}
        setTempSize={setTempSize}
        onSave={saveEditChanges}
      />

      <Footer />
    </div>
  );
}