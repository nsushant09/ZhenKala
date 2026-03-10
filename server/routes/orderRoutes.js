const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToFailed,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getAnalytics,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .post(protect, createOrder)
  .get(protect, admin, getAllOrders);

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/analytics')
  .get(protect, admin, getAnalytics);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/pay')
  .put(protect, updateOrderToPaid);

router.route('/:id/fail')
  .put(protect, updateOrderToFailed);

router.route('/:id/status')
  .put(protect, admin, updateOrderStatus);

module.exports = router;
