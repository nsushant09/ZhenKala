const express = require('express');
const router = express.Router();
const {
    createStripePaymentIntent,
    getPayPalClientId,
    getPaymentConfig,
    handleStripeWebhook
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/webhook', handleStripeWebhook);
router.post('/create-payment-intent', protect, createStripePaymentIntent);
router.get('/paypal/client-id', getPayPalClientId);
router.get('/config', protect, getPaymentConfig);

module.exports = router;
