// routes/productRoutes.js

const express = require('express');
const router = express.Router();

const upload = require('../config/multer');
const productController = require('../controllers/productController');

/* ─────────────────────────────────────────
   IMAGE UPLOAD
───────────────────────────────────────── */
router.post(
  '/upload-image',
  upload.single('image'),
  productController.uploadImage
);

/* ─────────────────────────────────────────
   CATEGORIES
───────────────────────────────────────── */
router.get(
  '/categories/all',
  productController.getAllCategories
);

/* ─────────────────────────────────────────
   PRODUCTS
───────────────────────────────────────── */

// Create product
router.post(
  '/',
  productController.createProduct
);

// Get all products
router.get(
  '/',
  productController.getAllProducts
);

// Bulk create
router.post(
  '/bulk',
  productController.bulkCreateProducts
);

// Get products by category
router.get(
  '/category/:category',
  productController.getProductsByCategory
);

// Get single product
router.get(
  '/:id',
  productController.getProductById
);

// Update product
router.put(
  '/:id',
  productController.updateProduct
);

// Delete product
router.delete(
  '/:id',
  productController.deleteProduct
);

/* ─────────────────────────────────────────
   PRODUCT VARIANTS
───────────────────────────────────────── */

// Get variants of product
router.get(
  '/:id/variants',
  productController.getProductVariants
);

/* ─────────────────────────────────────────
   AVAILABILITY & QUANTITY
───────────────────────────────────────── */

router.patch(
  '/:id/availability',
  productController.updateAvailability
);

router.patch(
  '/:id/quantity',
  productController.updateQuantity
);

module.exports = router;
