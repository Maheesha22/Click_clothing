
'use strict';
const { Product, Category, ProductVariant } = require('../models');
const { Sequelize } = require('sequelize');

/**
 * GET /api/search?q=query
 * Searches for products by name, description, or category
 * Returns matching products with their details and variants
 */
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    // Validate search query
    if (!q || q.trim().length === 0) {
      return res.json({ success: true, data: [] });
    }

    const searchTerm = `%${q.trim()}%`;

    // Search products by name, description, or category name
    const searchResults = await Product.findAll({
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
          where: {
            [Sequelize.Op.or]: [
              {
                name: {
                  [Sequelize.Op.like]: searchTerm
                }
              }
            ]
          },
          required: false
        },
        {
          model: ProductVariant,
          as: 'variants',
          attributes: ['id', 'size', 'color', 'quantity', 'imageUrl']
        }
      ],
      where: {
        [Sequelize.Op.or]: [
          {
            name: {
              [Sequelize.Op.like]: searchTerm
            }
          },
          {
            description: {
              [Sequelize.Op.like]: searchTerm
            }
          }
        ]
      },
      attributes: ['id', 'name', 'description', 'price', 'categoryId'],
      limit: 10
    });

    // Format the response
    const formattedResults = searchResults.map(product => {
      const variants = product.variants || [];
      const categoryName = product.category?.name || 'Unknown';
      
      return {
        productId: product.id,
        productName: product.name,
        description: product.description,
        price: product.price,
        categoryName: categoryName,
        categoryId: product.categoryId,
        variants: variants.map(v => ({
          id: v.id,
          size: v.size,
          color: v.color,
          quantity: v.quantity,
          imageUrl: v.imageUrl
        }))
      };
    });

    res.json({ success: true, data: formattedResults });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
