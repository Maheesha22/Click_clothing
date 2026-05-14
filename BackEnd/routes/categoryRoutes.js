
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/categoryController');


router.route('/')
  .get(ctrl.getAllCategories)
  .post(ctrl.createCategory);


router.get('/:id/products', ctrl.getProductsByCategory);

router.route('/:id')
  .put(ctrl.updateCategory)
  .delete(ctrl.deleteCategory);

module.exports = router;
