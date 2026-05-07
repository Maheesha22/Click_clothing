// controllers/productController.js
const { Product, Category, ProductVariant } = require('../models');

/* ─── POST /api/products/upload-image ────────────────────── */
exports.uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file received.' });
  }
  res.status(200).json({
    success: true,
    image_url: req.file.path,
    public_id: req.file.filename,
    message: 'Image uploaded successfully',
  });
};

/* ─── POST /api/products (handles simple or advanced payload) ── */
exports.createProduct = async (req, res) => {
  try {
    const { product_name, description, categoryId, price, variants } = req.body;

    // Validate required fields
    const name = product_name || req.body.name;
    const catId = parseInt(categoryId || req.body.categoryId, 10);
    const priceVal = parseFloat(price || req.body.price);

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }
    if (!catId || isNaN(catId)) {
      return res.status(400).json({ success: false, message: 'Valid category is required' });
    }
    if (!priceVal || isNaN(priceVal) || priceVal <= 0) {
      return res.status(400).json({ success: false, message: 'Valid price is required' });
    }

    // Create the product first
    const product = await Product.create({
      name: name.trim(),
      description: (description || req.body.product_description || '').trim(),
      price: priceVal,
      categoryId: catId,
    });

    // If variants provided, create them
    if (variants && Array.isArray(variants) && variants.length > 0) {
      const validVariants = variants.filter(v =>
        v.color && v.color.trim() &&
        v.size && v.size.trim() &&
        parseInt(v.quantity, 10) >= 0
      );

      if (validVariants.length === 0) {
        await product.destroy();
        return res.status(400).json({ success: false, message: 'At least one valid variant (color + size + quantity) is required' });
      }

      const variantRecords = validVariants.map(v => ({
        productId: product.id,
        color: v.color.trim(),
        size: v.size.trim(),
        quantity: parseInt(v.quantity, 10),
        imageUrl: v.image_url || null,
      }));

      // Use ignoreDuplicates to avoid unique constraint crash
      await ProductVariant.bulkCreate(variantRecords, { ignoreDuplicates: true });
    }

    return res.status(201).json({ success: true, data: { id: product.id }, message: 'Product created successfully' });
  } catch (error) {
    console.error('Create product error:', error);
    // Return a clear message for unique constraint violations
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'Duplicate variant: same color + size combination already exists for this product' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─── GET /api/products ───────────────────────────────────── */
exports.getAllProducts = async (req, res) => {
  try {
    const { category, categoryId } = req.query;
    let whereClause = {};

    if (categoryId) {
      whereClause.categoryId = categoryId;
    } else if (category) {
      const cat = await Category.findOne({ where: { name: category } });
      if (cat) {
        whereClause.categoryId = cat.id;
      } else {
        // Category name not found, return empty list
        return res.json({ success: true, data: [] });
      }
    }

    const products = await Product.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'description', 'price', 'categoryId', 'createdAt', 'updatedAt'],
    });

    const categories = await Category.findAll({ attributes: ['id', 'name'] });
    const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

    const variants = await ProductVariant.findAll({
      attributes: ['productId', 'color', 'size', 'quantity', 'imageUrl'],
    });

    const variantsByProduct = {};
    variants.forEach(v => {
      if (!variantsByProduct[v.productId]) variantsByProduct[v.productId] = [];
      variantsByProduct[v.productId].push(v);
    });

    const result = products.map(product => {
      const productVariants = variantsByProduct[product.id] || [];
      let totalQty = 0;
      let firstImage = null;
      const colorsSet = new Set();
      const sizesSet = new Set();

      productVariants.forEach(v => {
        totalQty += v.quantity;
        if (!firstImage && v.imageUrl) firstImage = v.imageUrl;
        if (v.color) colorsSet.add(v.color);
        if (v.size) sizesSet.add(v.size);
      });

      return {
        id: product.id,
        product_name: product.name,
        product_description: product.description,
        price: parseFloat(product.price),
        image_url: firstImage,
        quantity: totalQty,
        available: totalQty > 0,
        categoryId: product.categoryId,
        category: {
          id: product.categoryId,
          name: categoryMap[product.categoryId] || 'Uncategorized',
        },
        color: Array.from(colorsSet).join(', ') || '—',
        size: Array.from(sizesSet).join(', ') || '—',
        variant_count: productVariants.length,
      };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─── GET /api/products/categories/all ───────────────────── */
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']], attributes: ['id', 'name'] });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─── GET /api/products/:id ──────────────────────────────── */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      attributes: ['id', 'name', 'description', 'price', 'categoryId', 'createdAt', 'updatedAt'],
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const variants = await ProductVariant.findAll({ where: { productId: product.id } });
    const category = await Category.findByPk(product.categoryId);
    res.json({
      success: true,
      data: {
        ...product.toJSON(),
        variants,
        category: category ? { id: category.id, name: category.name } : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─── PUT /api/products/:id ──────────────────────────────── */
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const updates = {};
    if (req.body.product_name || req.body.name) updates.name = req.body.product_name || req.body.name;
    if (req.body.product_description || req.body.description) updates.description = req.body.product_description || req.body.description;
    if (req.body.price !== undefined) updates.price = req.body.price;
    if (req.body.categoryId !== undefined) updates.categoryId = req.body.categoryId;

    await product.update(updates);
    res.json({ success: true, data: product, message: 'Product updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─── DELETE /api/products/:id ───────────────────────────── */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await ProductVariant.destroy({ where: { productId: product.id } });
    await product.destroy();
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─── PATCH /api/products/:id/availability ───────────────── */
exports.updateAvailability = async (req, res) => {
  // This endpoint is kept for compatibility – availability is now computed from variants
  res.status(200).json({ success: true, message: 'Availability is auto-calculated from variant quantities' });
};

/* ─── PATCH /api/products/:id/quantity ───────────────────── */
exports.updateQuantity = async (req, res) => {
  res.status(501).json({ success: false, message: 'Update variant quantities directly' });
};

/* ─── POST /api/products/bulk ────────────────────────────── */
exports.bulkCreateProducts = async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: 'products must be a non-empty array' });
    }
    const created = await Product.bulkCreate(products);
    res.status(201).json({ success: true, data: created, message: `${created.length} products created` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─── GET /api/products/category/:category ───────────────── */
exports.getProductsByCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.category, 10);

    if (isNaN(categoryId)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID' });
    }

    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Fetch products with their variants
    const products = await Product.findAll({
      where: { categoryId: categoryId },
      include: [
        {
          model: ProductVariant,
          as: 'variants',
          attributes: ['id', 'size', 'color', 'quantity', 'imageUrl', 'createdAt', 'updatedAt']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      attributes: ['id', 'name', 'description', 'price', 'categoryId', 'createdAt', 'updatedAt'],
      order: [['name', 'ASC']]
    });

    if (products.length === 0) {
      return res.json({
        success: true,
        message: `No products found in category: ${category.name}`,
        data: [],
        category: { id: category.id, name: category.name }
      });
    }

    res.json({
      success: true,
      data: products,
      category: { id: category.id, name: category.name },
      totalProducts: products.length
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─── GET /api/products/:id/variants ─────────────────────── */
exports.getProductVariants = async (req, res) => {
  try {
    const variants = await ProductVariant.findAll({
      where: { productId: req.params.id },
      attributes: ['id', 'color', 'size', 'quantity', 'imageUrl']
    });
    res.json({ success: true, data: variants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
