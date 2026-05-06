const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const multer = require('multer');

// Configure multer for memory storage (or disk storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed'), false);
    }
  }
});

// Order routes - use upload.none() for form-data without file, or upload.single() for with file
router.post('/create', upload.single('bankSlip'), orderController.createOrder);
router.get('/user/:userId', orderController.getUserOrders);
router.get('/:id', orderController.getOrderDetails);
router.get('/track/:barcode', orderController.getOrderByBarcode);
router.put('/:id/status', orderController.updateOrderStatus);
router.put('/:id/payment', orderController.updatePaymentStatus);

module.exports = router;