const { Return, User, Order, Product, OrderItem } = require('../models');
const { Op } = require('sequelize'); 


const getAllReturns = async (req, res) => {
  try {
    const returns = await Return.findAll({
      include: [
        { model: User, attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: Order, attributes: ['id', 'order_number', 'createdAt', 'status'] }
      ],
      order: [['createdAt', 'DESC']]
    });

   
    const enrichedReturns = await Promise.all(returns.map(async (ret) => {
      const productsWithDetails = await Promise.all(
        (ret.products || []).map(async (product) => {
          const productData = await Product.findByPk(product.productId, {
            attributes: ['id', 'name', 'price']
          });
          return {
            ...product,
            productDetails: productData
          };
        })
      );

      return {
        ...ret.dataValues,
        products: productsWithDetails
      };
    }));

    res.status(200).json({
      success: true,
      data: enrichedReturns,
      total: enrichedReturns.length
    });
  } catch (error) {
    console.error('Error fetching returns:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching returns',
      error: error.message
    });
  }
};


const getUserReturns = async (req, res) => {
  try {
    const { userId } = req.params;
    const returns = await Return.findAll({
      where: { userId },
      include: [
        { model: Order, attributes: ['id', 'order_number', 'createdAt'] },
        { model: Product, attributes: ['id', 'name', 'price'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: returns,
      total: returns.length
    });
  } catch (error) {
    console.error('Error fetching user returns:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user returns',
      error: error.message
    });
  }
};


const getReturnsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = new Date(startDate);
    if (endDate) dateFilter[Op.lte] = new Date(endDate);

    const returns = await Return.findAll({
      where: {
        createdAt: dateFilter
      },
      include: [
        { model: User, attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: Order, attributes: ['id', 'order_number'] },
        { model: Product, attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: returns,
      total: returns.length
    });
  } catch (error) {
    console.error('Error fetching returns by date:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching returns by date range',
      error: error.message
    });
  }
};


const getReturnsStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    const returns = await Return.findAll({
      attributes: [
        'createdAt',
        'reason',
        'products'
      ],
      order: [['createdAt', 'DESC']]
    });

    const stats = {};
    returns.forEach(ret => {
      const date = new Date(ret.createdAt);
      let key;

      if (period === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!stats[key]) {
        stats[key] = { count: 0, quantity: 0, reasons: {} };
      }

      stats[key].count += 1;

      
      const totalQty = (ret.products || []).reduce((sum, p) => sum + (p.quantity || 0), 0);
      stats[key].quantity += totalQty;

      stats[key].reasons[ret.reason || 'Not specified'] = (stats[key].reasons[ret.reason || 'Not specified'] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      period,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching returns stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching returns statistics',
      error: error.message
    });
  }
};


const createMultiProductReturn = async (req, res) => {
  try {
    console.log('=== CREATE MULTI-PRODUCT RETURN ===');
    console.log('Request body:', req.body);

    const { userId, orderId, products, reason } = req.body;

    
    if (!userId || !orderId || !products || products.length === 0) {
      console.log('Validation failed - missing fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, orderId, products array'
      });
    }

    console.log('Validating user ID:', userId);
    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found (ID: ${userId})`
      });
    }

    console.log('Validating order ID:', orderId);
    // Verify order exists
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found (ID: ${orderId})`
      });
    }

    // Verify all products exist
    console.log('Validating products:', products.map(p => p.productId));
    const productIds = products.map(p => p.productId);
    const productsInDb = await Product.findAll({
      where: { id: productIds },
      attributes: ['id', 'name']
    });

    console.log('Products found in DB:', productsInDb.length, 'Expected:', productIds.length);

    if (productsInDb.length !== productIds.length) {
      const foundIds = productsInDb.map(p => p.id);
      const notFoundIds = productIds.filter(id => !foundIds.includes(id));
      return res.status(404).json({
        success: false,
        message: `One or more products not found. Not found IDs: ${notFoundIds.join(', ')}`
      });
    }

    console.log('Creating return...');
    
    const newReturn = await Return.create({
      userId,
      orderId,
      products: products.map(p => ({
        productId: p.productId,
        quantity: p.quantity || 1,
        size: p.size || null,
        color: p.color || null
      })),
      reason: reason || null,
      status: 'pending'
    });

    console.log('Return created with ID:', newReturn.id);

    
    const productsWithDetails = await Promise.all(
      (newReturn.products || []).map(async (product) => {
        const productData = await Product.findByPk(product.productId, {
          attributes: ['id', 'name', 'price']
        });
        return {
          ...product,
          productDetails: productData
        };
      })
    );

    const returnWithDetails = await Return.findByPk(newReturn.id, {
      include: [
        { model: User, attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: Order, attributes: ['id', 'order_number', 'createdAt'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Return with multiple products created successfully',
      data: {
        ...returnWithDetails.dataValues,
        products: productsWithDetails
      }
    });
  } catch (error) {
    console.error('Error creating return:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error creating return: ' + error.message,
      error: error.message
    });
  }
};


const createReturn = async (req, res) => {
  try {
    const { userId, orderId, productId, size, color, quantity, reason } = req.body;

    if (!userId || !orderId || !productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, orderId, productId, quantity'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    
    const newReturn = await Return.create({
      userId,
      orderId,
      products: [{
        productId,
        quantity,
        size,
        color
      }],
      reason: reason || null,
      status: 'pending'
    });

    const returnWithDetails = await Return.findByPk(newReturn.id, {
      include: [
        { model: User, attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: Order, attributes: ['id', 'order_number', 'createdAt'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Return created successfully',
      data: returnWithDetails
    });
  } catch (error) {
    console.error('Error creating return:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating return',
      error: error.message
    });
  }
};


const getEligibleOrdersForReturns = async (req, res) => {
  try {
    //Get all orderIds that already have a return record
    const existingReturns = await Return.findAll({
      attributes: ['orderId'],
      raw: true
    });
    const alreadyReturnedOrderIds = existingReturns.map(r => r.orderId);

    //Build where clause - exclude already-returned orders
    const whereClause = {
      status: { [Op.in]: ['shipped', 'delivered', 'Shipped', 'Delivered'] },
      payment_method: { [Op.in]: ['Cash on Delivery', 'cash on delivery'] }
    };

    if (alreadyReturnedOrderIds.length > 0) {
      whereClause.id = { [Op.notIn]: alreadyReturnedOrderIds };
    }

    //Fetch eligible orders
    const orders = await Order.findAll({
      where: whereClause,
      attributes: ['id', 'order_number', 'status', 'total_bill', 'createdAt', 'payment_method'],
      include: [
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`Already returned order IDs: [${alreadyReturnedOrderIds.join(', ')}]`);
    console.log(`Found ${orders.length} eligible orders for return`);

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching eligible orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders for returns',
      error: error.message
    });
  }
};

// Update return
const updateReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, status, products } = req.body;

    const returnItem = await Return.findByPk(id);
    if (!returnItem) {
      return res.status(404).json({
        success: false,
        message: 'Return not found'
      });
    }

    if (reason !== undefined) returnItem.reason = reason;
    if (status !== undefined) returnItem.status = status;
    if (products !== undefined) returnItem.products = products;

    await returnItem.save();

    const updatedReturn = await Return.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: Order, attributes: ['id', 'order_number', 'createdAt'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Return updated successfully',
      data: updatedReturn
    });
  } catch (error) {
    console.error('Error updating return:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating return',
      error: error.message
    });
  }
};

// Delete return
const deleteReturn = async (req, res) => {
  try {
    const { id } = req.params;

    const returnItem = await Return.findByPk(id);
    if (!returnItem) {
      return res.status(404).json({
        success: false,
        message: 'Return not found'
      });
    }

    await returnItem.destroy();

    res.status(200).json({
      success: true,
      message: 'Return deleted successfully',
      data: id
    });
  } catch (error) {
    console.error('Error deleting return:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting return',
      error: error.message
    });
  }
};

// Get return by ID
const getReturnById = async (req, res) => {
  try {
    const { id } = req.params;

    const returnItem = await Return.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: Order, attributes: ['id', 'order_number', 'createdAt'] }
      ]
    });

    if (!returnItem) {
      return res.status(404).json({
        success: false,
        message: 'Return not found'
      });
    }

    // Enrich with product details
    const productsWithDetails = await Promise.all(
      (returnItem.products || []).map(async (product) => {
        const productData = await Product.findByPk(product.productId, {
          attributes: ['id', 'name', 'price']
        });
        return {
          ...product,
          productDetails: productData
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        ...returnItem.dataValues,
        products: productsWithDetails
      }
    });
  } catch (error) {
    console.error('Error fetching return:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching return',
      error: error.message
    });
  }
};

module.exports = {
  getAllReturns,
  getUserReturns,
  getReturnsByDateRange,
  getReturnsStats,
  createReturn,
  createMultiProductReturn,
  updateReturn,
  deleteReturn,
  getReturnById,
  getEligibleOrdersForReturns
};
