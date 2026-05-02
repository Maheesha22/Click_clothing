// controllers/productController.js
// Full CRUD for Products + Cloudinary image upload handler.
//
// FIX: Removed the duplicate inline cloudinary.config() that was inside this file.
//      Cloudinary is now configured ONCE in config/cloudinary.js and shared via
//      config/multer.js. Duplicating the config here caused conflicts when
//      environment variables weren't loaded yet.

const { Product } = require('../models');
const { Op }      = require('sequelize');

/* ─── POST /api/products/upload-image ────────────────────── */
// multer middleware is applied in the route (upload.single('image')),
// so by the time this handler runs, req.file is already the Cloudinary result.
exports.uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file received.' });
  }

  // multer-storage-cloudinary puts the Cloudinary secure URL in req.file.path
  // and the public_id in req.file.filename
  res.status(200).json({
    success   : true,
    image_url : req.file.path,       // ← Cloudinary secure URL (https://res.cloudinary.com/...)
    public_id : req.file.filename,
    message   : 'Image uploaded successfully',
  });
};

/* ─── POST /api/products ──────────────────────────────────── */
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* ─── GET /api/products ───────────────────────────────────── */
exports.getAllProducts = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    const where  = {};

    if (req.query.category)               where.category  = req.query.category;
    if (req.query.available !== undefined) where.available = req.query.available === 'true';
    if (req.query.size)                   where.size      = req.query.size;
    if (req.query.color)                  where.color     = req.query.color;

    if (req.query.minPrice || req.query.maxPrice) {
      where.price = {};
      if (req.query.minPrice) where.price[Op.gte] = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) where.price[Op.lte] = parseFloat(req.query.maxPrice);
    }

    if (req.query.search) {
      where[Op.or] = [
        { product_name:        { [Op.like]: `%${req.query.search}%` } },
        { product_description: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    const { count, rows } = await Product.findAndCountAll({
      where, limit, offset,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total      : count,
        page,
        limit,
        totalPages : Math.ceil(count / limit),
        hasNext    : page < Math.ceil(count / limit),
        hasPrev    : page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─── GET /api/products/categories/all ───────────────────── */
exports.getAllCategories = async (req, res) => {
  try {
    const FIXED_CATS = [
      { name: 'Sarong',      icon: '🧣', description: 'Traditional & batik sarongs' },
      { name: 'Trousers',    icon: '👖', description: 'Formal & casual trousers'    },
      { name: 'Shorts',      icon: '🩳', description: 'Casual & sports shorts'      },
      { name: 'T-shirts',    icon: '👕', description: 'Graphic & plain T-shirts'    },
      { name: 'Accessories', icon: '🎩', description: 'Cap, Perfume, Deodorant'     },
    ];

    const counts = await Product.findAll({
      attributes: [
        'category',
        [Product.sequelize.fn('COUNT', Product.sequelize.col('id')), 'total'],
        [Product.sequelize.fn('SUM', Product.sequelize.literal("CASE WHEN available = 1 THEN 1 ELSE 0 END")), 'active'],
      ],
      group: ['category'],
    });

    const countMap = {};
    counts.forEach(r => {
      countMap[r.category] = {
        total  : parseInt(r.dataValues.total)  || 0,
        active : parseInt(r.dataValues.active) || 0,
      };
    });

    const data = FIXED_CATS.map(c => ({
      ...c,
      total  : countMap[c.name]?.total  || 0,
      active : countMap[c.name]?.active || 0,
      status : 'Active',
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─── GET /api/products/category/:category ───────────────── */
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.findAll({
      where : { category: req.params.category },
      order : [['price', 'ASC']],
    });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─── GET /api/products/:id ──────────────────────────────── */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─── PUT /api/products/:id ──────────────────────────────── */
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const allowed = [
      'product_name', 'product_description', 'size', 'color',
      'price', 'image_url', 'quantity', 'category', 'available',
    ];
    const updates = {};
    Object.keys(req.body).forEach(k => { if (allowed.includes(k)) updates[k] = req.body[k]; });

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
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
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
    if (typeof available !== 'boolean')
      return res.status(400).json({ success: false, message: 'available must be boolean' });
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
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
    if (typeof quantity !== 'number' || quantity < 0)
      return res.status(400).json({ success: false, message: 'quantity must be non-negative number' });
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if      (operation === 'add')      product.quantity += quantity;
    else if (operation === 'subtract') {
      if (product.quantity - quantity < 0)
        return res.status(400).json({ success: false, message: 'Insufficient quantity' });
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
    if (!Array.isArray(products) || products.length === 0)
      return res.status(400).json({ success: false, message: 'products must be non-empty array' });
    const created = await Product.bulkCreate(products);
    res.status(201).json({ success: true, data: created, message: `${created.length} products created` });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
