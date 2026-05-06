// controllers/productController.js
const { Product, Category, ProductVariant } = require('../models');

/* ─── POST /api/products/upload-image ────────────────────── */
exports.uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file received.' });
  }

  res.status(200).json({
    success   : true,
    image_url : req.file.path,
    public_id : req.file.filename,
    message   : 'Image uploaded successfully',
  });
};

/* ─── POST /api/products ──────────────────────────────────── */
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      name: req.body.product_name || req.body.name,
      description: req.body.product_description || req.body.description,
      price: req.body.price,
      categoryId: req.body.categoryId
    });
    
    res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

/* ─── GET /api/products ───────────────────────────────────── */
exports.getAllProducts = async (req, res) => {
  try {
    // Get all products
    const products = await Product.findAll({
      attributes: ['id', 'name', 'price', 'categoryId']
    });

    // Get all categories
    const categories = await Category.findAll({
      attributes: ['id', 'name']
    });

    // Get all variants
    const variants = await ProductVariant.findAll({
      attributes: ['productId', 'imageUrl', 'quantity']
    });

    // Create category lookup map
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = cat.name;
    });

    // Group variants by productId
    const variantsMap = {};
    variants.forEach(variant => {
      if (!variantsMap[variant.productId]) {
        variantsMap[variant.productId] = [];
      }
      variantsMap[variant.productId].push(variant);
    });

    // Format response
    const formattedProducts = products.map(product => {
      const productVariants = variantsMap[product.id] || [];
      
      let totalQuantity = 0;
      let productImage = null;
      
      productVariants.forEach(variant => {
        totalQuantity += Number(variant.quantity) || 0;
        if (!productImage && variant.imageUrl) {
          productImage = variant.imageUrl;
        }
      });
      
      if (!productImage) {
        productImage = `https://picsum.photos/id/${(product.id % 80) + 1}/100/100`;
      }
      
      return {
        id: product.id,
        product_name: product.name,
        price: Number(product.price) || 0,
        image_url: productImage,
        quantity: totalQuantity,
        available: totalQuantity > 0,
        categoryId: product.categoryId,
        category: {
          id: product.categoryId,
          name: categoryMap[product.categoryId] || 'Uncategorized'
        }
      };
    });

    res.status(200).json({
      success: true,
      data: formattedProducts
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

/* ─── GET /api/products/categories/all ───────────────────── */
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']],
      attributes: ['id', 'name']
    });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─── GET /api/products/category/:category ───────────────── */
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { categoryId: req.params.category },
      attributes: ['id', 'name', 'price', 'categoryId']
    });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─── GET /api/products/:id ──────────────────────────────── */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      attributes: ['id', 'name', 'price', 'categoryId']
    });
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    const variants = await ProductVariant.findAll({
      where: { productId: product.id },
      attributes: ['id', 'size', 'color', 'quantity', 'imageUrl']
    });
    
    const category = await Category.findByPk(product.categoryId, {
      attributes: ['id', 'name']
    });
    
    res.status(200).json({ 
      success: true, 
      data: {
        ...product.toJSON(),
        variants,
        category
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─── PUT /api/products/:id ──────────────────────────────── */
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updates = {};
    if (req.body.product_name || req.body.name) updates.name = req.body.product_name || req.body.name;
    if (req.body.price !== undefined) updates.price = req.body.price;
    if (req.body.categoryId !== undefined) updates.categoryId = req.body.categoryId;

    await product.update(updates);
    
    res.status(200).json({ success: true, data: product, message: 'Product updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* ─── DELETE /api/products/:id ───────────────────────────── */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    await ProductVariant.destroy({ where: { productId: product.id } });
    await product.destroy();
    
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─── PATCH /api/products/:id/availability ───────────────── */
exports.updateAvailability = async (req, res) => {
  try {
    const { available } = req.body;
    if (typeof available !== 'boolean') {
      return res.status(400).json({ success: false, message: 'available must be boolean' });
    }
    
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    product.available = available;
    await product.save();
    
    res.status(200).json({ success: true, data: product, message: 'Availability updated' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* ─── PATCH /api/products/:id/quantity ───────────────────── */
exports.updateQuantity = async (req, res) => {
  try {
    const { quantity, operation } = req.body;
    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ success: false, message: 'quantity must be non-negative number' });
    }
    
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (operation === 'add') {
      product.quantity += quantity;
    } else if (operation === 'subtract') {
      if (product.quantity - quantity < 0) {
        return res.status(400).json({ success: false, message: 'Insufficient quantity' });
      }
      product.quantity -= quantity;
    } else {
      product.quantity = quantity;
    }

    product.available = product.quantity > 0;
    await product.save();
    
    res.status(200).json({ success: true, data: product, message: 'Quantity updated' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* ─── POST /api/products/bulk ────────────────────────────── */
exports.bulkCreateProducts = async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: 'products must be non-empty array' });
    }
    
    const created = await Product.bulkCreate(products);
    res.status(201).json({ success: true, data: created, message: `${created.length} products created` });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
