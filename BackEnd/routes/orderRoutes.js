const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure multer to upload bank slips directly to Cloudinary
const slipStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'click_clothing_slips',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto',  // allows PDF uploads too
  },
});

const upload = multer({
  storage: slipStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Order routes - use upload.none() for form-data without file, or upload.single() for with file
router.post('/create', upload.single('bankSlip'), orderController.createOrder);
router.get('/user/:userId', orderController.getUserOrders);
router.get('/:id', orderController.getOrderDetails);
router.get('/track/:barcode', orderController.getOrderByBarcode);
router.get('/', orderController.getAllOrders);
router.put('/:id/status', orderController.updateOrderStatus);
router.put('/:id/payment', orderController.updatePaymentStatus);

module.exports = router;
