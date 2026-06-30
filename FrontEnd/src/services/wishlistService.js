import API from './api';

// Logged in user database call
export const getWishlistDB = (userId) =>
  API.get(`/wishlist/${userId}`);

export const addToWishlistDB = (item) =>
  API.post('/wishlist', item);

export const removeFromWishlistDB = (id) =>
  API.delete(`/wishlist/${id}`);

export const removeFromWishlistByProductDB = (userId, productId) =>
  API.delete(`/wishlist/by-product/${userId}/${productId}`);

// guest user session storage part
const GUEST_KEY = 'guestWishlist';

export const getGuestWishlist = () => {
  try {
    return JSON.parse(sessionStorage.getItem(GUEST_KEY) || '[]');
  } catch {
    return [];
  }
};

export const addToGuestWishlist = (item) => {
  const list = getGuestWishlist();
  const exists = list.find(i => i.productId === item.productId);
  if (exists) return list;
  const updated = [...list, { ...item, id: Date.now() }];
  sessionStorage.setItem(GUEST_KEY, JSON.stringify(updated));
  return updated;
};

export const removeFromGuestWishlist = (productId) => {
  const updated = getGuestWishlist().filter(i => i.productId !== productId);
  sessionStorage.setItem(GUEST_KEY, JSON.stringify(updated));
  return updated;
};
