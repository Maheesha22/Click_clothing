const { Order, OrderItem, Product, Customer, ProductVariant, OrderDetail } = require('../models');

const getCustomerOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'Product',
              include: [
                {
                  model: ProductVariant,
                  as: 'variants'
                }
              ]
            }
          ]
        },
        {
          model: OrderDetail,
          as: 'detail'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    
    const customer = await Customer.findOne({ where: { userId } });

    
    const formattedOrders = orders.map(order => {
      const orderJson = order.toJSON();
      orderJson.customer = customer ? customer.toJSON() : null;
      return orderJson;
    });

    res.status(200).json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer orders'
    });
  }
};

module.exports = { getCustomerOrders };
