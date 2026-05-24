const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

/**
 * GET /api/reports/stats?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
const getReportStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    let params = [];

    if (startDate && endDate) {
      dateFilter = `WHERE DATE(createdAt) BETWEEN ? AND ?`;
      params = [startDate, endDate];
    } else {
      // Default to today if no dates provided
      dateFilter = `WHERE DATE(createdAt) = CURDATE()`;
    }

    // 1. Orders Count in range
    const orderResult = await sequelize.query(
      `SELECT COUNT(*) AS count FROM orders ${dateFilter}`,
      { replacements: params, type: QueryTypes.SELECT }
    );
    const orderCount = Number(orderResult[0].count);

    // 2. Revenue in range
    const revenueResult = await sequelize.query(
      `SELECT CAST(COALESCE(SUM(total_bill), 0) AS DECIMAL(12,2)) AS revenue FROM orders ${dateFilter}`,
      { replacements: params, type: QueryTypes.SELECT }
    );
    const totalRevenue = Number(revenueResult[0].revenue);

    // 3. New Customers in range
    const customerResult = await sequelize.query(
      `SELECT COUNT(*) AS count FROM customers ${dateFilter}`,
      { replacements: params, type: QueryTypes.SELECT }
    );
    const customerCount = Number(customerResult[0].count);

    // 4. Returns in range for Return Rate
    const returnResult = await sequelize.query(
      `SELECT COUNT(*) AS count FROM returns ${dateFilter}`,
      { replacements: params, type: QueryTypes.SELECT }
    );
    const returnCount = Number(returnResult[0].count);
    const returnRate = orderCount > 0 ? ((returnCount / orderCount) * 100).toFixed(1) : 0;

    // 5. Daily Stats for Chart
    const dailyStatsResult = await sequelize.query(
      `SELECT DATE(createdAt) AS date, CAST(COALESCE(SUM(total_bill), 0) AS DECIMAL(12,2)) AS revenue, COUNT(*) AS orders 
       FROM orders ${dateFilter} GROUP BY DATE(createdAt) ORDER BY DATE(createdAt) ASC`,
      { replacements: params, type: QueryTypes.SELECT }
    );

    // 6. Top Products in range
    const topProductsResult = await sequelize.query(
      `SELECT p.name, SUM(oi.quantity) AS quantity
       FROM order_items oi
       JOIN products p ON oi.productId = p.id
       JOIN orders o ON oi.orderId = o.id
       ${dateFilter.replace('createdAt', 'o.createdAt')}
       GROUP BY p.id, p.name
       ORDER BY quantity DESC
       LIMIT 5`,
      { replacements: params, type: QueryTypes.SELECT }
    );

    // 7. Recent Orders in range
    const recentOrdersResult = await sequelize.query(
      `SELECT o.id, o.order_number, o.status, o.total_bill, o.payment_status, o.createdAt, 
              c.first_name, c.last_name
       FROM orders o
       LEFT JOIN customers c ON o.userId = c.userId
       ${dateFilter.replace('createdAt', 'o.createdAt')}
       ORDER BY o.createdAt DESC
       LIMIT 10`,
      { replacements: params, type: QueryTypes.SELECT }
    );

    res.status(200).json({
      success: true,
      data: {
        orderCount,
        totalRevenue,
        customerCount,
        returnRate,
        dailyStats: dailyStatsResult,
        topProducts: topProductsResult,
        recentOrders: recentOrdersResult
      }
    });
  } catch (error) {
    console.error('SERVER ERROR [getReportStats]:', error);
    res.status(500).json({
      success: false,
      message: 'Report data error: ' + error.message
    });
  }
};

module.exports = { getReportStats };
