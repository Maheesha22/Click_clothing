/**
 * productRoutes.js  —  /api/products
 */
const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { Product } = require('../models');
const ctrl = require('../controllers/productController');
/* ─────────────────────────────────────────────
   📌 IMAGE UPLOAD (Cloudinary)
   ───────────────────────────────────────────── */
router.post(
  '/upload-image',
  upload.single('image'),   // field name must be "image"
  ctrl.uploadImage
);

/* ── Special routes (must be BEFORE /:id) ── */
router.post('/bulk', ctrl.bulkCreateProducts);
router.get('/categories/all', ctrl.getAllCategories);
router.get('/category/:category', ctrl.getProductsByCategory);

/* ─────────────────────────────────────────────
   📌 NEW ROUTE: Upload + Save (Sequelize version)
   ───────────────────────────────────────────── */
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { name, product_name, category, price, quantity, color, size, product_description } = req.body;
    
    // Some implementations send "name" while others send "product_name"
    const finalName = name || product_name;

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // Cloudinary URL
    const imageUrl = req.file.path;

    const newProduct = await Product.create({
      product_name: finalName,
      category: category,
      price: price,
      quantity: quantity,
      color: color,
      size: size,
      product_description: product_description,
      image_url: imageUrl,
      available: quantity > 0 ? true : false
    });

    res.json({
      message: "Product added successfully",
      imageUrl: imageUrl,
      productId: newProduct.id,
      product: newProduct
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload error", error: error.message });
  }
});

/* ── Main CRUD ── */
router.route('/')
  .get(ctrl.getAllProducts)
  .post(ctrl.createProduct);

router.route('/:id')
  .get(ctrl.getProductById)
  .put(ctrl.updateProduct)
  .delete(ctrl.deleteProduct);

/* ── Field patches ── */
router.patch('/:id/availability', ctrl.updateAvailability);
router.patch('/:id/quantity', ctrl.updateQuantity);

module.exports = router;
