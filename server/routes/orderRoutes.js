const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .post(protect, createOrder)
  .get(protect, admin, getAllOrders);

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/pay')
  .put(protect, updateOrderToPaid);

router.route('/:id/status')
  .put(protect, admin, updateOrderStatus);

module.exports = router;
