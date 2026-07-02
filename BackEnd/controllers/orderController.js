const { Order, OrderItem, Cart, Customer, SelectedItems, OrderDetail, Product, ProductVariant } = require('../models');
const { generateBarcode } = require('../utils/barcodeGenerator');
const { sendOrderConfirmationEmail } = require('../services/emailService');
const { notifyNewOrder, notifyLowStock, notifyPaymentFailure } = require('../services/notificationService');

// Generate unique order number
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}${day}-${random}`;
};


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
  const { sequelize } = require('../models');
  const t = await sequelize.transaction();

  try {
    console.log('=== ORDER CREATION DEBUG ===');
    console.log('Request body:', req.body);
    
  
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
    let customer = await Customer.findOne({ where: { userId: uId }, transaction: t });
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
      await customer.update(customerData, { transaction: t });
      console.log('Customer updated:', customer.id);
    } else {
      customer = await Customer.create(customerData, { transaction: t });
      console.log('New customer created:', customer.id);
    }

    
    let itemsToProcess = [];
    
  
    if (req.body.selectedItems) {
      try {
        const rawItems = typeof req.body.selectedItems === 'string' 
          ? JSON.parse(req.body.selectedItems) 
          : req.body.selectedItems;
        
        if (Array.isArray(rawItems) && rawItems.length > 0) {
         
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

    
    if (itemsToProcess.length === 0) {
      const selectedItemsList = await SelectedItems.findAll({ where: { userId: uId } });
      if (selectedItemsList && selectedItemsList.length > 0) {
        itemsToProcess = selectedItemsList.map(item => item.toJSON ? item.toJSON() : item);
        console.log('Using items from SelectedItems table:', itemsToProcess.length);
      }
    }

    if (itemsToProcess.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'No items found in selection. Please try again.'
      });
    }

    const totalBill = parseFloat(subtotal) + parseFloat(shippingCost || 400);
    const orderNumber = generateOrderNumber();
    const barcode = await generateUniqueBarcode();

    // Slip is always optional — customer can upload later for bank deposits
    const slipUrl = req.file ? req.file.path : null;

    // 3. Create order
    const order = await Order.create({
      order_number: orderNumber,
      userId: uId,
      status: 'pending',
      payment_method: paymentMethod,
      payment_status: 'PENDING',
      payment_slip: slipUrl, // null if deferred
      delivery_charges: parseFloat(shippingCost || 400),
      total_bill: totalBill
    }, { transaction: t });

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
      }, { transaction: t });
    }

    console.log('Order items created');

    // 4.5 Deduct inventory — reduce ProductVariant quantity for each ordered item
    const variantsToCheckForLowStock = [];
    for (const item of itemsToProcess) {
      try {
        const variant = await ProductVariant.findOne({
          where: {
            productId: item.productId,
            size: item.size,
            color: item.color
          },
          transaction: t
        });

        if (variant) {
          const orderedQty = parseInt(item.quantity) || 1;
          const newQty = Math.max(0, variant.quantity - orderedQty);
          await variant.update({ quantity: newQty }, { transaction: t });
          console.log(
            `Stock deducted — productId:${item.productId} color:${item.color} size:${item.size} | ${variant.quantity} → ${newQty}`
          );
          // Remember the post-deduction quantity so we can raise a low-stock
          // notification after the transaction commits.
          variantsToCheckForLowStock.push({
            id: variant.id,
            productId: variant.productId,
            size: variant.size,
            color: variant.color,
            quantity: newQty
          });
        } else {
          console.warn(
            `Variant not found for deduction — productId:${item.productId} color:${item.color} size:${item.size}`
          );
        }
      } catch (deductErr) {
        console.error('Error deducting stock for item:', item, deductErr);
        // Non-fatal: log and continue so the order still completes
      }
    }

    console.log('Inventory deduction completed');

    // 5. Create OrderDetail (Barcode)
    await OrderDetail.create({
      orderId: order.id,
      barcode: barcode
    }, { transaction: t });

    console.log('Order details created');

    
    const productIds = itemsToProcess.map(item => item.productId);
    
    await Cart.destroy({
      where: {
        userId: uId,
        productId: productIds
      },
      transaction: t
    });
    
    await SelectedItems.destroy({
      where: { userId: uId },
      transaction: t
    });
    
    console.log('Cleanup completed (Cart and SelectedItems cleared)');

    // Commit the transaction — all DB changes are now permanent
    await t.commit();
    console.log('Transaction committed successfully');

    // Fire admin-dashboard notifications now that the order is safely
    // committed. These never throw — a notification failure must not
    // affect the customer-facing order response.
    notifyNewOrder(order).catch(err => console.error('notifyNewOrder failed:', err));

    for (const v of variantsToCheckForLowStock) {
      const product = await Product.findByPk(v.productId).catch(() => null);
      notifyLowStock(v, product).catch(err => console.error('notifyLowStock failed:', err));
    }

    // Enrich items with actual product names from the database for the email template
    const enrichedItems = [];
    try {
      for (const item of itemsToProcess) {
        const prod = await Product.findByPk(item.productId);
        enrichedItems.push({
          ...item,
          name: prod ? prod.name : 'Product'
        });
      }
    } catch (enrichErr) {
      console.error('Error enriching items for email:', enrichErr);
    }

    // Send order confirmation email (fire-and-forget — does not block response)
    const isBankDeposit = (paymentMethod || '').toLowerCase() === 'bank';
    const emailData = {
      email,
      customerName: `${firstName} ${lastName}`,
      orderNumber: order.order_number,
      orderId: order.id,
      items: enrichedItems.length > 0 ? enrichedItems : itemsToProcess,
      subtotal: parseFloat(subtotal),
      shipping: parseFloat(shippingCost || 400),
      total: totalBill,
      paymentMethod: isBankDeposit ? 'Bank Deposit' : 'Cash on Delivery',
      isBankDeposit,
      address,
      city,
      district,
      province,
      paidDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    const fs = require('fs');
    const path = require('path');
    sendOrderConfirmationEmail(emailData).catch(err => {
      console.error('Email send failed (non-critical):', err);
      try {
        fs.appendFileSync(
          path.join(__dirname, '../email_errors.log'),
          `[${new Date().toISOString()}] Catch Error: ${err.message}\n${err.stack}\n\n`
        );
      } catch (fsErr) {
        console.error('Failed to log email send catch error:', fsErr);
      }
    });

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
    // Roll back all DB changes if anything went wrong
    try { await t.rollback(); } catch (rbErr) { console.error('Rollback error:', rbErr); }
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order: ' + error.message
    });
  }
};


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

    // Notify admins if this update marks the payment as failed.
    if ((paymentStatus || '').toLowerCase() === 'failed') {
      notifyPaymentFailure(order).catch(err => console.error('notifyPaymentFailure failed:', err));
    }

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

// Get order securely by number and customer email
const getOrderByNumberAndEmail = async (req, res) => {
  try {
    const { orderNumber, email } = req.query;
    if (!orderNumber || !email) {
      return res.status(400).json({
        success: false,
        message: 'Order number and email are required'
      });
    }

    const order = await Order.findOne({
      where: { order_number: orderNumber },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product }]
        },
        {
          model: Customer,
          as: 'customer'
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify email matches the customer's email
    const customerEmail = order.customer?.email || '';
    if (customerEmail.toLowerCase().trim() !== email.toLowerCase().trim()) {
      return res.status(403).json({
        success: false,
        message: 'Invalid order number or email combination'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order by number & email:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order details'
    });
  }
};

// Upload deferred payment slip
const uploadPaymentSlip = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a bank slip.'
      });
    }

    await order.update({
      payment_slip: req.file.path,
      payment_status: order.payment_status === 'Cancelled' ? 'PENDING' : order.payment_status
    });

    res.status(200).json({
      success: true,
      message: 'Bank slip uploaded successfully',
      data: order
    });
  } catch (error) {
    console.error('Error uploading payment slip:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading payment slip: ' + error.message
    });
  }
};

// Get revenue by status (Bar Chart)
const getRevenueByStatus = async (req, res) => {
  try {
    const { sequelize } = require('../models');
    const { QueryTypes } = require('sequelize');
    const results = await sequelize.query(`
      SELECT status, SUM(total_bill) AS total_revenue
      FROM orders
      GROUP BY status;
    `, {
      type: QueryTypes.SELECT
    });

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching revenue by status:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
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
  getAllOrders,
  getOrderByNumberAndEmail,
  uploadPaymentSlip,
  getRevenueByStatus
};
