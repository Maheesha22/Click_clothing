const { RecentlyViewed, Product, ProductVariant } = require('../models');

// GET: Fetch all recently viewed products for a user (sorted by viewedAt - newest first)
const getRecentlyViewed = async (req, res) => {
  try {
    console.log('📥 [GET RECENTLY VIEWED] Request received:', { params: req.params, query: req.query });
    const { userId } = req.params;
    const { limit = 10 } = req.query; // Default to 10 most recent

    const items = await RecentlyViewed.findAll({
      where: { userId },
      include: [{
        model: Product,
        include: [{
          model: ProductVariant,
          as: 'variants',
          attributes: ['imageUrl']
        }]
      }],
      order: [['viewedAt', 'DESC']], // Most recent first
      limit: parseInt(limit)
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
        description: product ? product.description : '',
        imageUrl: imageUrl,
        viewedAt: item.viewedAt,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };
    });

    console.log('✅ [GET RECENTLY VIEWED] Success:', formattedItems.length, 'items');
    res.json(formattedItems);
  } catch (err) {
    console.error('❌ [GET RECENTLY VIEWED] Error:', err);
    res.status(500).json({ message: 'Error fetching recently viewed products', error: err.message });
  }
};

// POST: Add a product to recently viewed (or update if already exists)
const addToRecentlyViewed = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    console.log('📥 [RECENTLY VIEWED POST] Received:', { userId, productId });

    if (!userId || !productId) {
      console.warn('⚠️ [RECENTLY VIEWED POST] Missing userId or productId');
      return res.status(400).json({ message: 'userId and productId are required' });
    }

    // Check if product already exists in recently viewed
    const existing = await RecentlyViewed.findOne({ where: { userId, productId } });

    if (existing) {
      // Update the viewedAt timestamp (move to top)
      console.log('📝 [RECENTLY VIEWED POST] Updating existing record');
      await existing.update({ viewedAt: new Date() });
      return res.json({
        message: 'Product view updated',
        item: existing
      });
    }

    // Create new entry if doesn't exist
    console.log('✏️ [RECENTLY VIEWED POST] Creating new record');
    const item = await RecentlyViewed.create({ userId, productId, viewedAt: new Date() });
    console.log('✅ [RECENTLY VIEWED POST] Success:', item);
    res.status(201).json({
      message: 'Added to recently viewed',
      item: item
    });
  } catch (err) {
    console.error('❌ [RECENTLY VIEWED POST] Error:', err);
    res.status(500).json({ message: 'Error adding to recently viewed', error: err.message });
  }
};

// DELETE: Remove a single product from recently viewed
const removeFromRecentlyViewed = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await RecentlyViewed.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Removed from recently viewed' });
  } catch (err) {
    console.error('Error removing from recently viewed:', err);
    res.status(500).json({ message: 'Error removing from recently viewed', error: err.message });
  }
};

// DELETE: Remove a product by userId and productId
const removeFromRecentlyViewedByProduct = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const deleted = await RecentlyViewed.destroy({ where: { userId, productId } });

    if (!deleted) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Removed from recently viewed' });
  } catch (err) {
    console.error('Error removing from recently viewed:', err);
    res.status(500).json({ message: 'Error removing from recently viewed', error: err.message });
  }
};

// DELETE: Clear all recently viewed products for a user
const clearAllRecentlyViewed = async (req, res) => {
  try {
    const { userId } = req.params;

    const deleted = await RecentlyViewed.destroy({ where: { userId } });

    if (deleted === 0) {
      return res.status(404).json({ message: 'No items found to clear' });
    }

    res.json({ message: `Cleared ${deleted} items from recently viewed` });
  } catch (err) {
    console.error('Error clearing recently viewed:', err);
    res.status(500).json({ message: 'Error clearing recently viewed', error: err.message });
  }
};

module.exports = {
  getRecentlyViewed,
  addToRecentlyViewed,
  removeFromRecentlyViewed,
  removeFromRecentlyViewedByProduct,
  clearAllRecentlyViewed
};
