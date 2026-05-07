const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

/**
 * Fetches professional customer dashboard data including total orders and spending.
 * Uses LEFT JOIN to ensure customers without orders are still included.
 */
const getCustomerDashboardData = async (req, res) => {
  try {
    const query = `
      SELECT 
          c.userId, 
          c.first_name, 
          c.last_name, 
          c.email, 
          c.address, 
          c.city,
          c.district,
          c.province,
          c.phone,
          COUNT(o.id) AS number_of_orders,
          CAST(COALESCE(SUM(o.total_bill), 0) AS DECIMAL(10,2)) AS total_spending
      FROM 
          customers c
      LEFT JOIN 
          orders o ON c.userId = o.userId
      GROUP BY 
          c.id;
    `;

    console.log('Executing Customer Dashboard Query...');
    const results = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });
    console.log(`Query successful. Found ${results.length} customers.`);

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('SERVER ERROR [getCustomerDashboardData]:', error);
    res.status(500).json({
      success: false,
      message: 'Database error: ' + error.message
    });
  }
};

module.exports = { getCustomerDashboardData };
