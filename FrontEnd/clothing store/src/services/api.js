import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:3000/api',
});

// Cart API methods
export const cartAPI = {
    // Add item to cart
    addToCart: (cartData) => API.post('/cart/add', cartData),
    
    // Get user's cart
    getCart: (userId) => API.get(`/cart/${userId}`),
    
    // Update cart item quantity
    updateQuantity: (cartId, quantity) => API.put(`/cart/update/${cartId}`, { quantity }),
    
    // Remove item from cart
    removeFromCart: (cartId) => API.delete(`/cart/remove/${cartId}`),
    
    // Clear entire cart
    clearCart: (userId) => API.delete(`/cart/clear/${userId}`)
};

export default API;