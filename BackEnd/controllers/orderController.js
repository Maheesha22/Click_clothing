const { Order, OrderItem, Cart } = require('../models');
const { generateBarcode } = require('../utils/barcodeGenerator');

// Generate unique order number
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}${day}-${random}`;
};

// Ensure barcode is unique
const generateUniqueBarcode = async () => {
  let barcode;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 5;
  
  while (!isUnique && attempts < maxAttempts) {
    barcode = generateBarcode();
    const existingOrder = await Order.findOne({ where: { barcode } });
    if (!existingOrder) {
      isUnique = true;
    }
    attempts++;
  }
  
  if (!isUnique) {
    barcode = generateBarcode() + Date.now().toString().slice(-4);
  }
  
  return barcode;
};

// Create order from checkout
const createOrder = async (req, res) => {
  try {
    console.log('=== ORDER CREATION DEBUG ===');
    console.log('Request body:', req.body);
    
    // Extract data from request body
    const {
      userId,
      email,
      firstName,
      lastName,
      phone,
      address,
      city,
      district,
      province,
      paymentMethod,
      selectedItems,
      subtotal,
      shippingCost
    } = req.body;

    // Parse selectedItems if it's a string
    let items = selectedItems;
    if (typeof selectedItems === 'string') {
      items = JSON.parse(selectedItems);
    }

    console.log('Items to purchase:', items);

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items selected for order'
      });
    }

    const totalAmount = parseFloat(subtotal) + parseFloat(shippingCost || 400);
    const orderNumber = generateOrderNumber();
    const barcode = await generateUniqueBarcode();

    // Create order
    const order = await Order.create({
      orderNumber,
      barcode,
      userId: parseInt(userId),
      totalAmount,
      subtotal: parseFloat(subtotal),
      shippingCost: parseFloat(shippingCost || 400),
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      status: 'pending',
      email,
      firstName,
      lastName,
      phone,
      address,
      city,
      district,
      province
    });

    console.log('Order created:', order.id);

    // Create order items
    for (const item of items) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.id,
        productName: item.name,
        size: item.sizeLabel || item.size || 'N/A',
        color: item.colorName || item.color || 'N/A',
        quantity: item.qty,
        price: item.price
      });
    }

    console.log('Order items created');

    // IMPORTANT: Only delete the purchased items from cart, not all items
    // Get the IDs of purchased items
    const purchasedItemIds = items.map(item => item.id);
    
    // Delete only the purchased items from cart
    const deletedCount = await Cart.destroy({
      where: {
        userId: parseInt(userId),
        productId: purchasedItemIds
      }
    });
    
    console.log(`Removed ${deletedCount} purchased items from cart`);
    console.log('Purchased product IDs removed:', purchasedItemIds);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        barcode: order.barcode,
        totalAmount: order.totalAmount
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order: ' + error.message
    });
  }
};

// Get user's orders with their items
const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const orders = await Order.findAll({
      where: { userId },
      include: [{
        model: OrderItem,
        as: 'items'
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
};

// Get single order details with items
const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id, {
      include: [{
        model: OrderItem,
        as: 'items'
      }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
};

// Get order by barcode
const getOrderByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    
    const order = await Order.findOne({
      where: { barcode },
      include: [{
        model: OrderItem,
        as: 'items'
      }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
};

// Update order status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    await order.update({ status });
    
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
};

// Update payment status (Admin)
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    await order.update({ paymentStatus });
    
    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment status'
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetails,
  getOrderByBarcode,
  updateOrderStatus,
  updatePaymentStatus
};