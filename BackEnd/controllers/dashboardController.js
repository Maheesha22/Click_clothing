const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize'); 

/**
 * GET /api/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    /* ── 1. Counts ── */
    const productResult = await sequelize.query(
      `SELECT COUNT(*) AS totalProducts FROM products`,
      { type: QueryTypes.SELECT }
    );
    const totalProducts = Number(productResult[0].totalProducts);

    const orderResult = await sequelize.query(
      `SELECT COUNT(*) AS totalOrders FROM orders`,
      { type: QueryTypes.SELECT }
    );
    const totalOrders = Number(orderResult[0].totalOrders);

    const customerResult = await sequelize.query(
      `SELECT COUNT(*) AS totalCustomers FROM customers`,
      { type: QueryTypes.SELECT }
    );
    const totalCustomers = Number(customerResult[0].totalCustomers);

    const revenueResult = await sequelize.query(
      `SELECT CAST(COALESCE(SUM(total_bill), 0) AS DECIMAL(12,2)) AS totalRevenue FROM orders`,
      { type: QueryTypes.SELECT }
    );
    const totalRevenue = Number(revenueResult[0].totalRevenue);

    /* ── 2. Monthly change helpers ── */
    const newProdResult = await sequelize.query(
      `SELECT COUNT(*) AS cnt FROM products
       WHERE MONTH(createdAt) = MONTH(CURDATE()) AND YEAR(createdAt) = YEAR(CURDATE())`,
      { type: QueryTypes.SELECT }
    );
    const newProductsThisMonth = Number(newProdResult[0].cnt);

    const weekOrderResult = await sequelize.query(
      `SELECT COUNT(*) AS cnt FROM orders
       WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
      { type: QueryTypes.SELECT }
    );
    const ordersThisWeek = Number(weekOrderResult[0].cnt);

    const newCustResult = await sequelize.query(
      `SELECT COUNT(*) AS cnt FROM customers
       WHERE DATE(createdAt) = CURDATE()`,
      { type: QueryTypes.SELECT }
    );
    const newCustomersToday = Number(newCustResult[0].cnt);

    const ordersTodayResult = await sequelize.query(
      `SELECT COUNT(*) AS cnt FROM orders
       WHERE DATE(createdAt) = CURDATE()`,
      { type: QueryTypes.SELECT }
    );
    const ordersToday = Number(ordersTodayResult[0].cnt);

    const revenueTodayResult = await sequelize.query(
      `SELECT CAST(COALESCE(SUM(total_bill), 0) AS DECIMAL(12,2)) AS revenueToday FROM orders
       WHERE DATE(createdAt) = CURDATE()`,
      { type: QueryTypes.SELECT }
    );
    const revenueToday = Number(revenueTodayResult[0].revenueToday);

    const totalReturnsResult = await sequelize.query(
      `SELECT COUNT(*) AS cnt FROM returns`,
      { type: QueryTypes.SELECT }
    );
    const totalReturns = Number(totalReturnsResult[0].cnt);
    const returnRate = totalOrders > 0 ? ((totalReturns / totalOrders) * 100).toFixed(1) : 0;

    /* ── 3. Low-stock items (variants qty <= 10) ── */
    const lowStockItems = await sequelize.query(
      `SELECT
         pv.id        AS variantId,
         p.id         AS productId,
         p.name       AS productName,
         pv.size,
         pv.color,
         pv.quantity,
         pv.imageUrl,
         p.categoryId  AS categoryId,
         COALESCE(cat.name, 'Other') AS categoryName
       FROM product_variants pv
       JOIN products p ON pv.productId = p.id
       LEFT JOIN categories cat ON p.categoryId = cat.id
       WHERE pv.quantity <= 5
       ORDER BY categoryName ASC, pv.quantity ASC`,
      { type: QueryTypes.SELECT }
    );

    /* ── 4. Recent orders (latest 6) ── */
    const recentOrders = await sequelize.query(
      `SELECT
         o.id,
         o.order_number,
         o.status,
         o.payment_status,
         o.total_bill,
         o.payment_method,
         o.createdAt,
         c.first_name,
         c.last_name,
         c.email
       FROM orders o
       LEFT JOIN customers c ON o.userId = c.userId
       ORDER BY o.createdAt DESC
       LIMIT 6`,
      { type: QueryTypes.SELECT }
    );

    /* ── 5. Weekly revenue for chart ── */
    const weeklyRevenue = await sequelize.query(
      `SELECT
         DATE(createdAt)     AS day,
         DAYNAME(createdAt)  AS dayName,
         CAST(COALESCE(SUM(total_bill), 0) AS DECIMAL(12,2))  AS revenue,
         COUNT(*)            AS orderCount
       FROM orders
       WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY DATE(createdAt), DAYNAME(createdAt)
       ORDER BY DATE(createdAt) ASC`,
      { type: QueryTypes.SELECT }
    );

    console.log('Dashboard stats fetched successfully');

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue,
        newProductsThisMonth,
        ordersThisWeek,
        newCustomersToday,
        ordersToday,
        revenueToday,
        returnRate,
        lowStockItems,
        recentOrders,
        weeklyRevenue
      }
    });
  } catch (error) {
    console.error('SERVER ERROR [getDashboardStats]:', error);
    res.status(500).json({
      success: false,
      message: 'Dashboard data error: ' + error.message
    });
  }
};

module.exports = { getDashboardStats };
