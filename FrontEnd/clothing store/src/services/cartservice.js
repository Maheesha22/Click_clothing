import API from './api';

const cartService = {
    // Add item to cart
    addToCart: async (cartData) => {
        try {
            const response = await API.post('/cart/add', cartData);
            return response.data;
        } catch (error) {
            console.error('Add to cart error:', error);
            throw error.response?.data || error;
        }
    },
    
    // Get user's cart
    getCart: async (userId) => {
        try {
            const response = await API.get(`/cart/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Get cart error:', error);
            throw error.response?.data || error;
        }
    },
    
    // Update cart item quantity
    updateQuantity: async (cartId, quantity) => {
        try {
            const response = await API.put(`/cart/update/${cartId}`, { quantity });
            return response.data;
        } catch (error) {
            console.error('Update quantity error:', error);
            throw error.response?.data || error;
        }
    },
    
    // Remove item from cart
    removeFromCart: async (cartId) => {
        try {
            const response = await API.delete(`/cart/remove/${cartId}`);
            return response.data;
        } catch (error) {
            console.error('Remove from cart error:', error);
            throw error.response?.data || error;
        }
    },
    
    // Clear entire cart
    clearCart: async (userId) => {
        try {
            const response = await API.delete(`/cart/clear/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Clear cart error:', error);
            throw error.response?.data || error;
        }
    }
};

export default cartService;