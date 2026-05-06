const { Contact } = require('../models'); // Adjust path based on your structure
const { sendStoreNotification, sendCustomerAutoReply } = require('../services/emailService');

// Submit contact form
const submitContactForm = async (req, res) => {
  try {
    const { name, phone, email, comment } = req.body;

    // Validation
    if (!name || !phone || !email || !comment) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Save to database
    const contact = await Contact.create({
      name,
      phone,
      email,
      comment
    });

    // Send emails (don't await - let them run in background)
    sendStoreNotification({ name, phone, email, comment });
    sendCustomerAutoReply({ name, email, comment });

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        createdAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
};

// Get all submissions (Admin)
const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Contact.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions'
    });
  }
};

// Get single submission (Admin)
const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Contact.findByPk(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submission'
    });
  }
};

// Delete submission (Admin)
const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Contact.findByPk(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    await submission.destroy();

    res.status(200).json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting submission'
    });
  }
};

module.exports = {
  submitContactForm,
  getAllSubmissions,
  getSubmissionById,
  deleteSubmission
};