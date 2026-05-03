const { Wishlist } = require('../models');

// GET /api/wishlist/:userId
const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const items = await Wishlist.findAll({ where: { userId } });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching wishlist', error: err.message });
  }
};

// POST /api/wishlist
const addToWishlist = async (req, res) => {
  try {
    const { userId, productId, productName, price, emoji, imageUrl } = req.body;

    // Prevent duplicates
    const existing = await Wishlist.findOne({ where: { userId, productId } });
    if (existing) {
      return res.status(409).json({ message: 'Item already in wishlist' });
    }

    const item = await Wishlist.create({ userId, productId, productName, price, emoji, imageUrl });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error adding to wishlist', error: err.message });
  }
};

// DELETE /api/wishlist/:id
const removeFromWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Wishlist.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing from wishlist', error: err.message });
  }
};

// DELETE /api/wishlist/by-product/:userId/:productId
const removeFromWishlistByProduct = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const deleted = await Wishlist.destroy({ where: { userId, productId } });
    if (!deleted) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing from wishlist', error: err.message });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, removeFromWishlistByProduct };
