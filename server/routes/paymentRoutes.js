const express = require('express');
const router = express.Router();
const {
    createStripePaymentIntent,
    getPayPalClientId,
    getPaymentConfig,
    handleStripeWebhook
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const { paymentLimiter } = require('../middleware/rateLimiter');

router.post('/webhook', handleStripeWebhook);
router.post('/create-payment-intent', protect, paymentLimiter, createStripePaymentIntent);
router.get('/paypal/client-id', getPayPalClientId);
router.get('/config', protect, getPaymentConfig);

module.exports = router;
