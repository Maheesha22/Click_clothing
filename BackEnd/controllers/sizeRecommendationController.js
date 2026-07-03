const { SizeRecommendation, Product } = require('../models');

const getUserRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const items = await SizeRecommendation.findAll({
      where: { userId },
      include: [{
        model: Product,
        attributes: ['id', 'name', 'price', 'description'],
      }],
      order: [['createdAt', 'DESC']],
    });

    res.json(items);
  } catch (error) {
    console.error('❌ [SIZE RECOMMENDATION] getUserRecommendations error:', error);
    res.status(500).json({ message: 'Error fetching size recommendations', error: error.message });
  }
};

const createSizeRecommendation = async (req, res) => {
  try {
    const {
      userId,
      productId,
      recommendedSize,
      bodyType,
      confidence,
      chestEstimate,
      productName,
    } = req.body;

    if (!userId || !recommendedSize || !bodyType) {
      return res.status(400).json({ message: 'userId, recommendedSize, and bodyType are required' });
    }

    const item = await SizeRecommendation.create({
      userId,
      productId: productId || null,
      recommendedSize,
      bodyType,
      confidence: confidence || null,
      chestEstimate: chestEstimate || null,
      productName: productName || null,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('❌ [SIZE RECOMMENDATION] createSizeRecommendation error:', error);
    res.status(500).json({ message: 'Error creating size recommendation', error: error.message });
  }
};

const deleteSizeRecommendation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'id is required' });
    }

    const deleted = await SizeRecommendation.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('❌ [SIZE RECOMMENDATION] deleteSizeRecommendation error:', error);
    res.status(500).json({ message: 'Error deleting size recommendation', error: error.message });
  }
};

module.exports = {
  getUserRecommendations,
  createSizeRecommendation,
  deleteSizeRecommendation,
};
