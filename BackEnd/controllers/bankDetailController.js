const { BankDetail } = require('../models');

exports.getBankDetails = async (req, res) => {
  try {
    const details = await BankDetail.findAll({
      where: { isActive: true }
    });
    res.status(200).json({
      success: true,
      data: details
    });
  } catch (error) {
    console.error('Error fetching bank details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bank details'
    });
  }
};

// Add more methods like create/update if needed for admin panel
