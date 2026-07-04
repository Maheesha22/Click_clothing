const express = require('express');
const router = express.Router();

const upload = require('../config/multer');
const productController = require('../controllers/productController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.post(
  '/upload-image',
  authenticate,
  requireAdmin,
  upload.single('image'),
  productController.uploadImage
);

router.get(
  '/categories/all',
  productController.getAllCategories
);

// Create product
router.post(
  '/',
  authenticate,
  requireAdmin,
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
  authenticate,
  requireAdmin,
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
  authenticate,
  requireAdmin,
  productController.updateProduct
);

// Delete product
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  productController.deleteProduct
);

// Get variants of product
router.get(
  '/:id/variants',
  productController.getProductVariants
);

router.patch(
  '/:id/availability',
  authenticate,
  requireAdmin,
  productController.updateAvailability
);

router.patch(
  '/:id/quantity',
  authenticate,
  requireAdmin,
  productController.updateQuantity
);

module.exports = router;