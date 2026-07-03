const { Comparison, Product, ProductVariant, User } = require('../models');
const recommendationEngine = require('../services/recommendationEngine');

/**
 * Save a comparison
 * POST /api/comparisons
 */
exports.saveComparison = async (req, res) => {
  try {
    const { userId, productIds, comparisonName } = req.body;

    if (!userId || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'userId and productIds array are required'
      });
    }

    if (productIds.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 3 products can be compared'
      });
    }

    // Fetch product details
    const products = await Product.findAll({
      where: { id: productIds },
      include: [{
        model: ProductVariant,
        as: 'variants',
        attributes: ['color', 'size', 'quantity', 'imageUrl']
      }]
    });

    if (products.length !== productIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more products not found'
      });
    }

    // Prepare product details for cache
    const productDetails = products.map(p => {
      // Extract unique sizes from variants
      const uniqueSizes = p.variants && Array.isArray(p.variants)
        ? [...new Set(p.variants.map(v => v.size).filter(s => s))]
        : [];

      return {
        id: p.id,
        name: p.name,
        price: p.price,
        description: p.description,
        categoryId: p.categoryId,
        brand: p.brand || 'N/A',
        material: p.material || 'N/A',
        color: p.color || 'N/A',
        availability: p.availability || 0,
        sizes: uniqueSizes,
        imageUrl: p.variants?.[0]?.imageUrl || null
      };
    });

    const name = comparisonName || `Comparison - ${new Date().toLocaleDateString()}`;

    const comparison = await Comparison.create({
      userId,
      comparisonName: name,
      productIds,
      productDetails
    });

    res.status(201).json({
      success: true,
      data: comparison,
      message: 'Comparison saved successfully'
    });
  } catch (err) {
    console.error('Error saving comparison:', err);
    res.status(500).json({
      success: false,
      message: 'Error saving comparison',
      error: err.message
    });
  }
};

/**
 * Get all saved comparisons for a user
 * GET /api/comparisons/:userId
 */
exports.getUserComparisons = async (req, res) => {
  try {
    const { userId } = req.params;

    const comparisons = await Comparison.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: comparisons,
      count: comparisons.length
    });
  } catch (err) {
    console.error('Error fetching comparisons:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching comparisons',
      error: err.message
    });
  }
};

/**
 * Get a specific comparison
 * GET /api/comparisons/detail/:comparisonId
 */
exports.getComparison = async (req, res) => {
  try {
    const { comparisonId } = req.params;

    const comparison = await Comparison.findByPk(comparisonId);

    if (!comparison) {
      return res.status(404).json({
        success: false,
        message: 'Comparison not found'
      });
    }

    res.json({
      success: true,
      data: comparison
    });
  } catch (err) {
    console.error('Error fetching comparison:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching comparison',
      error: err.message
    });
  }
};

/**
 * Update comparison
 * PUT /api/comparisons/:comparisonId
 */
exports.updateComparison = async (req, res) => {
  try {
    const { comparisonId } = req.params;
    const { productIds, comparisonName } = req.body;

    const comparison = await Comparison.findByPk(comparisonId);
    if (!comparison) {
      return res.status(404).json({
        success: false,
        message: 'Comparison not found'
      });
    }

    if (productIds && productIds.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 3 products can be compared'
      });
    }

    // Update product details if productIds changed
    let updatedDetails = comparison.productDetails;
    if (productIds) {
      const products = await Product.findAll({
        where: { id: productIds },
        include: [{
          model: ProductVariant,
          as: 'variants',
          attributes: ['color', 'size', 'quantity', 'imageUrl']
        }]
      });

      updatedDetails = products.map(p => {
        // Extract unique sizes from variants
        const uniqueSizes = p.variants && Array.isArray(p.variants)
          ? [...new Set(p.variants.map(v => v.size).filter(s => s))]
          : [];

        return {
          id: p.id,
          name: p.name,
          price: p.price,
          description: p.description,
          categoryId: p.categoryId,
          brand: p.brand || 'N/A',
          material: p.material || 'N/A',
          color: p.color || 'N/A',
          availability: p.availability || 0,
          sizes: uniqueSizes,
          imageUrl: p.variants?.[0]?.imageUrl || null
        };
      });
    }

    await comparison.update({
      comparisonName: comparisonName || comparison.comparisonName,
      productIds: productIds || comparison.productIds,
      productDetails: updatedDetails
    });

    res.json({
      success: true,
      data: comparison,
      message: 'Comparison updated successfully'
    });
  } catch (err) {
    console.error('Error updating comparison:', err);
    res.status(500).json({
      success: false,
      message: 'Error updating comparison',
      error: err.message
    });
  }
};

/**
 * Delete comparison
 * DELETE /api/comparisons/:comparisonId
 */
exports.deleteComparison = async (req, res) => {
  try {
    const { comparisonId } = req.params;

    const comparison = await Comparison.findByPk(comparisonId);
    if (!comparison) {
      return res.status(404).json({
        success: false,
        message: 'Comparison not found'
      });
    }

    await comparison.destroy();

    res.json({
      success: true,
      message: 'Comparison deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting comparison:', err);
    res.status(500).json({
      success: false,
      message: 'Error deleting comparison',
      error: err.message
    });
  }
};

/**
 * Get recommendations based on compared products
 * POST /api/comparisons/recommendations/get
 */
exports.getRecommendations = async (req, res) => {
  try {
    const { productIds, limit = 5 } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'productIds array is required'
      });
    }

    // Fetch comparison products with full details
    const comparisonProducts = await Product.findAll({
      where: { id: productIds },
      include: [{
        model: ProductVariant,
        as: 'variants',
        attributes: ['color', 'size', 'quantity', 'imageUrl']
      }]
    });

    // Fetch all products for recommendation
    const allProducts = await Product.findAll({
      include: [{
        model: ProductVariant,
        as: 'variants',
        attributes: ['color', 'size', 'quantity', 'imageUrl']
      }],
      limit: 100 // Limit for performance
    });

    // Enrich products with additional attributes
    const enrichedComparison = comparisonProducts.map(p => {
      const uniqueSizes = p.variants && Array.isArray(p.variants)
        ? [...new Set(p.variants.map(v => v.size).filter(s => s))]
        : [];
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        categoryId: p.categoryId,
        brand: p.brand || 'N/A',
        material: p.material || 'N/A',
        color: p.color || 'N/A',
        availability: p.availability || 0,
        sizes: uniqueSizes
      };
    });

    const enrichedAll = allProducts.map(p => {
      const uniqueSizes = p.variants && Array.isArray(p.variants)
        ? [...new Set(p.variants.map(v => v.size).filter(s => s))]
        : [];
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        categoryId: p.categoryId,
        brand: p.brand || 'N/A',
        material: p.material || 'N/A',
        color: p.color || 'N/A',
        availability: p.availability || 0,
        sizes: uniqueSizes,
        description: p.description,
        imageUrl: p.variants?.[0]?.imageUrl || null
      };
    });

    // Get recommendations (in-memory calculation)
    const recommendations = recommendationEngine.getRecommendations(
      enrichedComparison,
      enrichedAll,
      limit
    );

    res.json({
      success: true,
      data: recommendations,
      count: recommendations.length
    });
  } catch (err) {
    console.error('Error getting recommendations:', err);
    res.status(500).json({
      success: false,
      message: 'Error getting recommendations',
      error: err.message
    });
  }
};

/**
 * Get comparison details with recommendations
 * POST /api/comparisons/with-recommendations
 */
exports.getComparisonWithRecommendations = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'productIds array is required'
      });
    }

    // Fetch comparison products
    const products = await Product.findAll({
      where: { id: productIds },
      include: [{
        model: ProductVariant,
        as: 'variants',
        attributes: ['color', 'size', 'quantity', 'imageUrl']
      }]
    });

    // Fetch all products
    const allProducts = await Product.findAll({
      include: [{
        model: ProductVariant,
        as: 'variants',
        attributes: ['color', 'size', 'quantity', 'imageUrl']
      }],
      limit: 100
    });

    // Enrich data
    const enrichedProducts = products.map(p => {
      const uniqueSizes = p.variants && Array.isArray(p.variants)
        ? [...new Set(p.variants.map(v => v.size).filter(s => s))]
        : [];
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        description: p.description,
        categoryId: p.categoryId,
        brand: p.brand || 'N/A',
        material: p.material || 'N/A',
        color: p.color || 'N/A',
        availability: p.availability || 0,
        sizes: uniqueSizes,
        imageUrl: p.variants?.[0]?.imageUrl || null,
        variants: p.variants
      };
    });

    const enrichedAll = allProducts.map(p => {
      const uniqueSizes = p.variants && Array.isArray(p.variants)
        ? [...new Set(p.variants.map(v => v.size).filter(s => s))]
        : [];
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        description: p.description,
        categoryId: p.categoryId,
        brand: p.brand || 'N/A',
        material: p.material || 'N/A',
        color: p.color || 'N/A',
        availability: p.availability || 0,
        sizes: uniqueSizes,
        imageUrl: p.variants?.[0]?.imageUrl || null
      };
    });

    // Get recommendations
    const recommendations = recommendationEngine.getRecommendations(
      enrichedProducts,
      enrichedAll,
      5
    );

    res.json({
      success: true,
      comparison: enrichedProducts,
      recommendations,
      message: 'Comparison data retrieved successfully'
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      message: 'Error retrieving comparison',
      error: err.message
    });
  }
};
