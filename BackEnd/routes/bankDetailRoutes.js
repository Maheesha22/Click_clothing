const express = require('express');
const router = express.Router();
const bankDetailController = require('../controllers/bankDetailController');

router.get('/', bankDetailController.getBankDetails);

module.exports = router;
