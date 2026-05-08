const { Order, OrderItem, Cart, Customer, SelectedItems, OrderDetail, Product, ProductVariant } = require('../models');
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

// Ensure barcode is unique (checking OrderDetail table now)
const generateUniqueBarcode = async () => {
  let barcode;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 5;
  
  while (!isUnique && attempts < maxAttempts) {
    barcode = generateBarcode();
    const existingDetail = await OrderDetail.findOne({ where: { barcode } });
    if (!existingDetail) {
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
      subtotal,
      shippingCost
    } = req.body;

    const uId = parseInt(userId);

    // 1. Customer management
    let customer = await Customer.findOne({ where: { userId: uId } });
    const customerData = {
      userId: uId,
      firstName,
      lastName,
      email,
      address,
      city,
      district,
      province,
      phone
    };

    if (customer) {
      await customer.update(customerData);
      console.log('Customer updated:', customer.id);
    } else {
      customer = await Customer.create(customerData);
      console.log('New customer created:', customer.id);
    }

    // 2. Determine items to process
    let itemsToProcess = [];
    
    // Check if selectedItems are provided in the request body (e.g., from Buy It Now)
    if (req.body.selectedItems) {
      try {
        const rawItems = typeof req.body.selectedItems === 'string' 
          ? JSON.parse(req.body.selectedItems) 
          : req.body.selectedItems;
        
        if (Array.isArray(rawItems) && rawItems.length > 0) {
          // Map frontend fields to backend model fields
          itemsToProcess = rawItems.map(item => ({
            productId: item.productId || item.id,
            size: item.sizeLabel || item.size,
            color: item.colorName || item.color,
            quantity: item.quantity || item.qty || 1,
            price: item.price
          }));
          console.log('Using items from request body:', itemsToProcess.length);
        }
      } catch (parseError) {
        console.error('Error parsing selectedItems from body:', parseError);
      }
    }

    // If no items in body, fallback to SelectedItems table
    if (itemsToProcess.length === 0) {
      const selectedItemsList = await SelectedItems.findAll({ where: { userId: uId } });
      if (selectedItemsList && selectedItemsList.length > 0) {
        itemsToProcess = selectedItemsList.map(item => item.toJSON ? item.toJSON() : item);
        console.log('Using items from SelectedItems table:', itemsToProcess.length);
      }
    }

    if (itemsToProcess.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items found in selection. Please try again.'
      });
    }

    const totalBill = parseFloat(subtotal) + parseFloat(shippingCost || 400);
    const orderNumber = generateOrderNumber();
    const barcode = await generateUniqueBarcode();

    // 3. Create order
    const order = await Order.create({
      order_number: orderNumber,
      userId: uId,
      status: 'pending',
      payment_method: paymentMethod,
      payment_status: 'PENDING',
      payment_slip: req.file ? req.file.path : null, // Cloudinary URL
      delivery_charges: parseFloat(shippingCost || 400),
      total_bill: totalBill
    });

    console.log('Order created:', order.id);

    // 4. Create order items
    for (const item of itemsToProcess) {
      await OrderItem.create({
        orderId: order.id,
        userId: uId,
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price
      });
    }

    console.log('Order items created');

    // 5. Create OrderDetail (Barcode)
    await OrderDetail.create({
      orderId: order.id,
      barcode: barcode
    });

    console.log('Order details created');

    // 6. Cleanup: Remove from Cart and SelectedItems
    const productIds = itemsToProcess.map(item => item.productId);
    
    await Cart.destroy({
      where: {
        userId: uId,
        productId: productIds
      }
    });
    
    await SelectedItems.destroy({
      where: { userId: uId }
    });
    
    console.log('Cleanup completed (Cart and SelectedItems cleared)');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        barcode: barcode,
        totalAmount: totalBill
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
    
    const updateData = { status };

    // Automatic payment confirmation for COD when delivered
    if (status.toLowerCase() === 'delivered' && order.payment_method === 'Cash on Delivery') {
      updateData.payment_status = 'Confirmed';
    }

    await order.update(updateData);
    
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

// Get all orders (Admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            include: [{
              model: ProductVariant,
              as: 'variants'
            }]
          }]
        },
        {
          model: OrderDetail,
          as: 'detail'
        },
        {
          model: Customer,
          as: 'customer'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching all orders'
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
    
    // Prevent changing payment status if it's already Confirmed
    if (order.payment_status === 'Confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Payment status is already confirmed and cannot be changed.'
      });
    }

    await order.update({ payment_status: paymentStatus });
    
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
  updatePaymentStatus,
  getAllOrders
};
