// BackEnd/controllers/categoryController.js
const { Category, Product, ProductVariant } = require('../models');

/* ── GET /api/categories ─────────────────────────────────────
   Returns all categories with their product counts           */
exports.getAllCategories = async (req, res) => {
    try {
        console.log('--- GET /api/categories ---');
        
        const categories = await Category.findAll({
            order: [['name', 'ASC']]
        });
        
        console.log(`Found ${categories.length} categories in DB.`);

        // Get product counts
        const productCounts = await Product.findAll({
            attributes: [
                'categoryId',
                [Category.sequelize.fn('COUNT', Category.sequelize.col('id')), 'totalProducts']
            ],
            group: ['categoryId']
        });

        const countMap = {};
        productCounts.forEach(pc => {
            countMap[pc.categoryId] = parseInt(pc.dataValues.totalProducts) || 0;
        });

        const result = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            productCount: countMap[cat.id] || 0,
            createdAt: cat.createdAt,
            updatedAt: cat.updatedAt
        }));

        console.log('Returning categories:', result.length);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error in getAllCategories:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ── POST /api/categories ────────────────────────────────────
   Create a new category                                      */
exports.createCategory = async (req, res) => {
  try {
    const name = (req.body.name || '').trim();

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    // Check duplicate
    const existing = await Category.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ success: false, message: `Category "${name}" already exists` });
    }

    const category = await Category.create({ name });
    res.status(201).json({ success: true, data: { id: category.id, name: category.name, productCount: 0 }, message: 'Category created' });
  } catch (error) {
    console.error('createCategory error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'Category name already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ── PUT /api/categories/:id ─────────────────────────────────
   Rename a category                                          */
exports.updateCategory = async (req, res) => {
  try {
    const id   = parseInt(req.params.id, 10);
    const name = (req.body.name || '').trim();

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check duplicate on other record
    const dup = await Category.findOne({ where: { name } });
    if (dup && dup.id !== id) {
      return res.status(409).json({ success: false, message: `Category "${name}" already exists` });
    }

    await category.update({ name });
    res.json({ success: true, data: { id: category.id, name: category.name }, message: 'Category updated' });
  } catch (error) {
    console.error('updateCategory error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ── DELETE /api/categories/:id ─────────────────────────────
   Delete a category (only if it has no products)            */
exports.deleteCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Prevent deleting if products exist under this category
    const productCount = await Product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${productCount} product(s) belong to this category. Move or delete them first.`,
      });
    }

    await category.destroy();
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('deleteCategory error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ── GET /api/categories/:id/products ───────────────────────
   Get all products in a category, with their variants       */
exports.getProductsByCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id, 10);
    if (isNaN(categoryId)) {
      return res.status(400).json({ success: false, message: 'Invalid category id' });
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const products = await Product.findAll({
      where: { categoryId },
      attributes: ['id', 'name', 'description', 'price', 'categoryId'],
      order: [['name', 'ASC']],
    });

    // Load all variants for these products in one query
    const productIds = products.map(p => p.id);
    const variants   = productIds.length > 0
      ? await ProductVariant.findAll({
          where: { productId: productIds },
          attributes: ['id', 'productId', 'color', 'size', 'quantity', 'imageUrl'],
          order: [['color', 'ASC'], ['size', 'ASC']],
        })
      : [];

    // Group variants by productId
    const variantMap = {};
    variants.forEach(v => {
      if (!variantMap[v.productId]) variantMap[v.productId] = [];
      variantMap[v.productId].push({
        id:       v.id,
        color:    v.color,
        size:     v.size,
        quantity: v.quantity,
        imageUrl: v.imageUrl,
      });
    });

    const result = products.map(p => {
      const pVariants  = variantMap[p.id] || [];
      const totalQty   = pVariants.reduce((s, v) => s + (v.quantity || 0), 0);
      const firstImage = pVariants.find(v => v.imageUrl)?.imageUrl || null;
      const colors     = [...new Set(pVariants.map(v => v.color))].filter(Boolean);

      return {
        id:                  p.id,
        product_name:        p.name,
        product_description: p.description,
        price:               parseFloat(p.price),
        image_url:           firstImage,
        total_quantity:      totalQty,
        available:           totalQty > 0,
        colors,
        variants: pVariants,
      };
    });

    res.json({ success: true, category: { id: category.id, name: category.name }, data: result });
  } catch (error) {
    console.error('getProductsByCategory error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
