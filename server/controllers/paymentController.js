const PaymentConfig = require('../models/PaymentConfig');
const stripeLib = require('stripe');

// Helper to get active configuration
const getActiveConfig = async () => {
    let config = await PaymentConfig.findOne();
    if (!config) {
        // Fallback to environment variables if no DB config
        return {
            stripe: {
                secretKey: process.env.STRIPE_SECRET_KEY,
                publicKey: process.env.STRIPE_PUBLIC_KEY
            },
            paypal: {
                clientId: process.env.PAYPAL_CLIENT_ID
            }
        };
    }
    return config;
};

// @desc    Create Stripe Payment Intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
exports.createStripePaymentIntent = async (req, res) => {
    const { amount, currency, metadata } = req.body;

    try {
        const config = await getActiveConfig();
        const secretKey = config.stripe?.secretKey || process.env.STRIPE_SECRET_KEY;
        const stripe = stripeLib(secretKey);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amount in cents
            currency: currency || 'usd',
            metadata: metadata || {},
            payment_method_types: ['card', 'alipay', 'wechat_pay'], // Explicitly enabling requested methods
            // Note: Apple Pay and Google Pay work via 'card' method type in payment_element
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Stripe Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get PayPal Client ID
// @route   GET /api/payments/paypal/client-id
// @access  Public
exports.getPayPalClientId = async (req, res) => {
    try {
        const config = await getActiveConfig();
        const clientId = config.paypal?.clientId || process.env.PAYPAL_CLIENT_ID;
        res.json({ clientId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Retrieve Payment Configuration (Public parts)
// @route   GET /api/payments/config
// @access  Private
exports.getPaymentConfig = async (req, res) => {
    try {
        const config = await getActiveConfig();
        res.json({
            stripePublicKey: config.stripe?.publicKey || process.env.STRIPE_PUBLIC_KEY,
            paypalClientId: config.paypal?.clientId || process.env.PAYPAL_CLIENT_ID,
            applePayMerchantId: config.applePay?.merchantId || process.env.APPLE_PAY_MERCHANT_ID,
            googlePayMerchantId: config.googlePay?.merchantId || process.env.GOOGLE_PAY_MERCHANT_ID,
            googlePayMerchantName: config.googlePay?.merchantName || 'ZhenKala',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

