const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Public route - Submit contact form
router.post('/submit', contactController.submitContactForm);

// Admin routes - Add your authentication middleware here
router.get('/submissions', contactController.getAllSubmissions);
router.get('/submissions/:id', contactController.getSubmissionById);
router.delete('/submissions/:id', contactController.deleteSubmission);

module.exports = router;