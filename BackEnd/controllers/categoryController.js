'use strict';
const { Category, Product, ProductVariant } = require('../models');


exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    // Manually count products..
    const result = await Promise.all(categories.map(async (cat) => {
      const productCount = await Product.count({ where: { categoryId: cat.id } });

      const firstProduct = await Product.findOne({
        where: { categoryId: cat.id },
        order: [['id', 'ASC']]
      });

      let thumbnailImage = null;
      if (firstProduct) {
        const firstVariant = await ProductVariant.findOne({
          where: { productId: firstProduct.id },
          attributes: ['imageUrl'],
          order: [['id', 'ASC']]
        });
        if (firstVariant && firstVariant.imageUrl) {
          thumbnailImage = firstVariant.imageUrl;
        }
      }

      return {
        ...cat.toJSON(),
        productCount,
        thumbnailImage
      };
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/categories
 */
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const category = await Category.create({ name });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/categories/:id
 */
exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    await category.update({ name });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/categories/:id..
 */
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const productCount = await Product.count({ where: { categoryId: category.id } });
    if (productCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete category with active products. Move or delete products first.' 
      });
    }

    await category.destroy();
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/categories/:id/products..
 */
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { categoryId: req.params.id },
      include: [{ model: ProductVariant, as: 'variants' }],
      order: [['name', 'ASC']]
    });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
