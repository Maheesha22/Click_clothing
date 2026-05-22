const { Wishlist, Product, ProductVariant } = require('../models');


const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const items = await Wishlist.findAll({ 
      where: { userId },
      include: [{
        model: Product,
        include: [{
          model: ProductVariant,
          as: 'variants',
          attributes: ['imageUrl']
        }]
      }]
    });

    const formattedItems = items.map(item => {
      const product = item.Product;
      
      let imageUrl = null;
      if (product && product.variants && product.variants.length > 0) {
        imageUrl = product.variants.find(v => v.imageUrl)?.imageUrl || product.variants[0].imageUrl;
      }

      return {
        id: item.id,
        userId: item.userId,
        productId: item.productId,
        productName: product ? product.name : 'Unknown Product',
        price: product ? product.price : 0,
        imageUrl: imageUrl,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };
    });

    res.json(formattedItems);
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({ message: 'Error fetching wishlist', error: err.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { userId, productId, productName, price, imageUrl } = req.body;

    // Prevent duplicates
    const existing = await Wishlist.findOne({ where: { userId, productId } });
    if (existing) {
      return res.status(409).json({ message: 'Item already in wishlist' });
    }

    const item = await Wishlist.create({ userId, productId, productName, price, imageUrl });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error adding to wishlist', error: err.message });
  }
};

// DELETE 
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

// DELETE 
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
