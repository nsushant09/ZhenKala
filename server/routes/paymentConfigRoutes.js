const express = require('express');
const router = express.Router();
const {
    getPaymentSettings,
    updatePaymentSettings
} = require('../controllers/paymentConfigController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
    .get(protect, admin, getPaymentSettings)
    .put(protect, admin, updatePaymentSettings);

module.exports = router;
