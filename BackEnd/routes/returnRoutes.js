const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');

//used
router.get('/eligible-orders', returnController.getEligibleOrdersForReturns);

// used
router.post('/multi-product', returnController.createMultiProductReturn);

// used
router.get('/stats', returnController.getReturnsStats);

router.get('/date-range', returnController.getReturnsByDateRange);

router.get('/user/:userId', returnController.getUserReturns);

// used
router.get('/', returnController.getAllReturns);

router.get('/:id', returnController.getReturnById);

router.post('/create', returnController.createReturn);

router.put('/:id', returnController.updateReturn);

// used 
router.delete('/:id', returnController.deleteReturn);

module.exports = router;
