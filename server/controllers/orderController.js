const Order = require('../models/Order');
const Product = require('../models/Product');
const { validateAndDeductOrderStock } = require('../utils/inventoryService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
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
      coupon,
      discountAmount,
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
      coupon,
      discountAmount,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Make sure user owns order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const { sendOrderConfirmationEmail } = require('../utils/emailService');

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const summaryTotals = req.body.orderSummaryTotals;

    if (summaryTotals && summaryTotals.totalPrice !== undefined && summaryTotals.currency) {
      const targetTotal = Number(summaryTotals.totalPrice);
      const targetCurrency = String(summaryTotals.currency).toUpperCase();
      const sourceTotal = Number(order.totalPrice) || 0;

      if (sourceTotal > 0 && targetTotal > 0 && targetCurrency !== order.currency) {
        const conversionFactor = targetTotal / sourceTotal;
        order.orderItems.forEach(item => {
          item.price = Number((item.price * conversionFactor).toFixed(2));
        });
      }

      if (summaryTotals.itemsPrice !== undefined) order.itemsPrice = Number(summaryTotals.itemsPrice);
      if (summaryTotals.shippingPrice !== undefined) order.shippingPrice = Number(summaryTotals.shippingPrice);
      order.totalPrice = targetTotal;
      order.currency = targetCurrency;
    }

    const previouslyPaid = order.isPaid;

    if (!order.stockDeducted) {
      await validateAndDeductOrderStock(order);
      order.stockDeducted = true;
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.orderStatus = 'processing';
    if (req.body.paymentMethod) {
      order.paymentMethod = req.body.paymentMethod;
    }
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();
    const shouldSendConfirmationEmail = !previouslyPaid;

    if (shouldSendConfirmationEmail) {
      await sendOrderConfirmationEmail(updatedOrder);
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update order to failed
// @route   PUT /api/orders/:id/fail
// @access  Private
exports.updateOrderToFailed = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = 'checkout failed';
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
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

    if ((orderStatus === 'processing' || orderStatus === 'delivered') && !order.stockDeducted) {
      await validateAndDeductOrderStock(order);
      order.stockDeducted = true;
    }

    if (orderStatus === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get sales analytics
// @route   GET /api/orders/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    const orders = await Order.find({ isPaid: true });

    let totalSales = 0;
    let totalItemCost = 0;
    let totalShippingRevenue = 0;
    let totalActualShippingCost = 0;

    orders.forEach(order => {
      // We assume calculations are in USD base for analytics consistency if multiple currencies are used
      // However, for simplicity now, we use the stored numeric values which reflect the charge.
      // If the app uses multiple currencies, a more complex conversion logic would be needed here.
      // For now, we assume standard amount stored in DB.

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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
