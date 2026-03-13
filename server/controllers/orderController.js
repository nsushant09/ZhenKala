const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    currency,
    estimatedDeliveryDate,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  // Check stock availability and capture cost price
  const finalOrderItems = [];
  for (let item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({ message: `Product ${item.name} not found` });
    }

    let availableStock = product.stock;
    let costPrice = product.costPrice || 0;

    if (item.variant && product.variants && product.variants.length > 0) {
      const variant = product.variants.id(item.variant);
      if (variant) {
        availableStock = variant.stock;
        costPrice = variant.costPrice || product.costPrice || 0;
      }
    }

    if (availableStock < item.quantity) {
      return res.status(400).json({
        message: `Insufficient stock for ${item.name}${item.size ? ` (${item.size})` : ''}. Available: ${availableStock}`
      });
    }

    finalOrderItems.push({
      ...item,
      costPrice: costPrice
    });
  }

  const order = await Order.create({
    orderItems: finalOrderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    currency,
    estimatedDeliveryDate,
  });

  res.status(201).json(order);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Make sure user owns order or is admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  res.json(order);
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = asyncHandler(async (req, res) => {
  const { id, status, update_time, email_address, paymentMethod } = req.body;

  // Use a transaction to ensure atomicity of order update and stock reduction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Order not found' });
    }

    // IDEMPOTENCY CHECK
    if (order.isPaid || (id && order.paymentResult?.id === id)) {
      await session.abortTransaction();
      session.endSession();
      return res.json(order);
    }

    if (req.body.itemsPrice) order.itemsPrice = req.body.itemsPrice;
    if (req.body.shippingPrice) order.shippingPrice = req.body.shippingPrice;

    if (req.body.totalPrice && req.body.currency && req.body.currency !== order.currency) {
      const oldTotal = order.totalPrice || 1;
      const conversionFactor = req.body.totalPrice / oldTotal;
      order.orderItems.forEach(item => {
        item.price = Number((item.price * conversionFactor).toFixed(2));
      });
      order.totalPrice = req.body.totalPrice;
      order.currency = req.body.currency;
    } else if (req.body.totalPrice) {
      order.totalPrice = req.body.totalPrice;
    }

    if (req.body.currency) order.currency = req.body.currency;

    order.isPaid = true;
    order.paidAt = Date.now();
    order.orderStatus = 'processing';
    if (paymentMethod) order.paymentMethod = paymentMethod;

    order.paymentResult = {
      id,
      status,
      update_time,
      email_address,
    };

    // Update product stock within transaction
    for (let item of order.orderItems) {
      const product = await Product.findById(item.product).session(session);
      if (product) {
        const quantityToDeduct = Number(item.quantity) || 0;

        if (item.variant && product.variants && product.variants.length > 0) {
          let variant = product.variants.id(item.variant);
          if (!variant) {
            variant = product.variants.find(v =>
              String(v.size) === String(item.size) &&
              String(v.color) === String(item.color)
            );
          }

          if (variant) {
            variant.stock = Math.max(0, variant.stock - quantityToDeduct);
            product.markModified('variants');
          } else {
            product.stock = Math.max(0, product.stock - quantityToDeduct);
          }
        } else {
          product.stock = Math.max(0, product.stock - quantityToDeduct);
        }
        await product.save({ session });
      }
    }

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Async email sending
    sendOrderConfirmationEmail(order).catch(err => console.error('E-mail error:', err));

    res.json(order);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

// @desc    Update order to failed
// @route   PUT /api/orders/:id/fail
// @access  Private
exports.updateOrderToFailed = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.orderStatus = 'checkout failed';
  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'id firstName lastName email')
    .sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, trackingNumber, actualShippingCost } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (actualShippingCost !== undefined) {
    order.actualShippingCost = actualShippingCost;
  }

  order.orderStatus = orderStatus;
  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }
  if (orderStatus === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

// @desc    Get sales analytics
// @route   GET /api/orders/analytics
// @access  Private/Admin
exports.getAnalytics = asyncHandler(async (req, res) => {
  const orders = await Order.find({ isPaid: true });

  let totalSales = 0;
  let totalItemCost = 0;
  let totalShippingRevenue = 0;
  let totalActualShippingCost = 0;

  orders.forEach(order => {
    totalSales += order.totalPrice;
    totalShippingRevenue += order.shippingPrice;
    totalActualShippingCost += (order.actualShippingCost || 0);

    order.orderItems.forEach(item => {
      totalItemCost += (item.costPrice || 0) * item.quantity;
    });
  });

  const netProfit = totalSales - totalItemCost - totalActualShippingCost;

  res.json({
    totalOrders: orders.length,
    totalSales: Math.round(totalSales * 100) / 100,
    totalItemCost: Math.round(totalItemCost * 100) / 100,
    totalShippingRevenue: Math.round(totalShippingRevenue * 100) / 100,
    totalActualShippingCost: Math.round(totalActualShippingCost * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100
  });
});
