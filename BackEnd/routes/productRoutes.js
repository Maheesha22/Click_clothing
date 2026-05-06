const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const ctrl = require('../controllers/productController');

router.post('/upload-image', upload.single('image'), ctrl.uploadImage);
router.post('/bulk', ctrl.bulkCreateProducts);
router.get('/categories/all', ctrl.getAllCategories);
router.get('/category/:category', ctrl.getProductsByCategory);

router.route('/')
  .get(ctrl.getAllProducts)
  .post(ctrl.createProduct);

router.route('/:id')
  .get(ctrl.getProductById)
  .put(ctrl.updateProduct)
  .delete(ctrl.deleteProduct);

router.get('/:id/variants', ctrl.getProductVariants);

router.patch('/:id/availability', ctrl.updateAvailability);
router.patch('/:id/quantity', ctrl.updateQuantity);

module.exports = router;
