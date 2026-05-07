const express = require('express');
const router = express.Router();
const SelectedItemsController = require('../controllers/SelectedItemsController');

// Routes for selected items
router.post('/save', SelectedItemsController.saveSelectedItems);
router.get('/:userId', SelectedItemsController.getSelectedItems);

module.exports = router;
