/**
 * productRoutes.js  —  /api/products
 */
const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const ctrl = require('../controllers/productController');

/* ─────────────────────────────────────────────
   📌 IMAGE UPLOAD (Cloudinary)
   ───────────────────────────────────────────── */
router.post('/upload-image', upload.single('image'), ctrl.uploadImage);

/* ── Special routes (must be BEFORE /:id) ── */
router.post('/bulk', ctrl.bulkCreateProducts);
router.get('/categories/all', ctrl.getAllCategories);
router.get('/category/:category', ctrl.getProductsByCategory);

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
