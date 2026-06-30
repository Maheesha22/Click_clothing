import API from './api';

// Logged in user database call
export const getRecentlyViewedDB = (userId, limit = 10) =>
  API.get(`/recently-viewed/${userId}`, { params: { limit } });

export const addToRecentlyViewedDB = (item) =>
  API.post('/recently-viewed', item);

export const removeFromRecentlyViewedDB = (id) =>
  API.delete(`/recently-viewed/${id}`);

export const removeFromRecentlyViewedByProductDB = (userId, productId) =>
  API.delete(`/recently-viewed/by-product/${userId}/${productId}`);

export const clearAllRecentlyViewedDB = (userId) =>
  API.delete(`/recently-viewed/clear/${userId}`);

// Guest user session storage part
const GUEST_KEY = 'guestRecentlyViewed';

export const getGuestRecentlyViewed = (limit = 10) => {
  try {
    const viewed = JSON.parse(sessionStorage.getItem(GUEST_KEY) || '[]');
    return viewed.slice(0, limit); // Return only the last 'limit' items
  } catch {
    return [];
  }
};

export const addToGuestRecentlyViewed = (item) => {
  const list = getGuestRecentlyViewed(100); // Get up to 100 for internal management
  const index = list.findIndex(i => i.productId === item.productId);
  
  if (index > -1) {
    // If product already exists, move it to the top
    const [existing] = list.splice(index, 1);
    existing.viewedAt = new Date().toISOString();
    list.unshift(existing);
  } else {
    // Add new product to the top
    const newItem = { ...item, id: Date.now(), viewedAt: new Date().toISOString() };
    list.unshift(newItem);
  }
  
  sessionStorage.setItem(GUEST_KEY, JSON.stringify(list));
  return list;
};

export const removeFromGuestRecentlyViewed = (productId) => {
  const updated = getGuestRecentlyViewed(100).filter(i => i.productId !== productId);
  sessionStorage.setItem(GUEST_KEY, JSON.stringify(updated));
  return updated;
};

export const clearGuestRecentlyViewed = () => {
  sessionStorage.removeItem(GUEST_KEY);
  return [];
};
