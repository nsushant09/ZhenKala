const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paymentConfig = require('../config/paymentConfig');

// @desc    Create Stripe Payment Intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
exports.createStripePaymentIntent = async (req, res) => {
    const { amount, currency, metadata } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amount in cents
            currency: currency || 'usd',
            metadata: metadata || {},
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get PayPal Client ID
// @route   GET /api/payments/paypal/client-id
// @access  Public
exports.getPayPalClientId = (req, res) => {
    res.json({ clientId: paymentConfig.paypal.clientId });
};

// @desc    Retrieve Payment Configuration (Public parts)
// @route   GET /api/payments/config
// @access  Private
exports.getPaymentConfig = (req, res) => {
    res.json({
        stripePublicKey: paymentConfig.stripe.publicKey,
        paypalClientId: paymentConfig.paypal.clientId,
        applePayMerchantId: paymentConfig.applePay.merchantIdentifier,
        googlePayMerchantId: paymentConfig.googlePay.merchantId,
        googlePayMerchantName: paymentConfig.googlePay.merchantName,
    });
};
