const express = require('express');
const router = express.Router();
const {
    createStripePaymentIntent,
    getPayPalClientId,
    getPaymentConfig,
    handleStripeWebhook,
    createFonepayPaymentUrl,
    verifyFonepayPayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/webhook', handleStripeWebhook);
router.post('/create-payment-intent', protect, createStripePaymentIntent);
router.post('/fonepay/create-url', protect, createFonepayPaymentUrl);
router.get('/fonepay/callback', verifyFonepayPayment);
router.get('/paypal/client-id', getPayPalClientId);
router.get('/config', protect, getPaymentConfig);

module.exports = router;
