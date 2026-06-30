
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/categoryController');
const { authenticate, requireAdmin } = require('../middleware/auth');


router.route('/')
  .get(ctrl.getAllCategories)
  .post(authenticate, requireAdmin, ctrl.createCategory);


router.get('/:id/products', ctrl.getProductsByCategory);

router.route('/:id')
  .put(authenticate, requireAdmin, ctrl.updateCategory)
  .delete(authenticate, requireAdmin, ctrl.deleteCategory);

module.exports = router;
