import API from './api';

const selectedItemsService = {
    // Save selected items for checkout
    saveSelectedItems: async (userId, items) => {
        try {
            const response = await API.post('/selected-items/save', { userId, items });
            return response.data;
        } catch (error) {
            console.error('Save selected items error:', error);
            throw error.response?.data || error;
        }
    },

    // Get selected items for checkout
    getSelectedItems: async (userId) => {
        try {
            const response = await API.get(`/selected-items/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Get selected items error:', error);
            throw error.response?.data || error;
        }
    }
};

export default selectedItemsService;
