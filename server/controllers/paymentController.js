const Order = require('../models/Order');
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

// @desc    Handle Stripe Webhooks
// @route   POST /api/payments/webhook
// @access  Public (Signature verification required)
exports.handleStripeWebhook = async (req, res) => {
    const config = await getActiveConfig();
    const secretKey = config.stripe?.secretKey || process.env.STRIPE_SECRET_KEY;
    const stripe = stripeLib(secretKey);
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (endpointSecret && sig) {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } else {
            // For development if no secret is provided, use raw body directly (NOT FOR PRODUCTION)
            console.warn('⚠️ Stripe Webhook SECRET not provided. Skipping signature verification.');
            const body = JSON.parse(req.body.toString());
            event = { type: body.type, data: { object: body.data.object } };
        }
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);

            // Extract order ID from metadata
            const orderId = paymentIntent.metadata.orderId;
            if (orderId) {
                const order = await Order.findById(orderId);
                if (order && !order.isPaid) {
                    order.isPaid = true;
                    order.paidAt = Date.now();
                    order.orderStatus = 'processing';
                    order.paymentResult = {
                        id: paymentIntent.id,
                        status: paymentIntent.status,
                        update_time: new Date().toISOString(),
                        email_address: paymentIntent.receipt_email || '',
                    };
                    await order.save();
                    console.log(`Order ${orderId} marked as PAID via Webhook.`);
                }
            }
            break;

        case 'payment_intent.payment_failed':
            const intent = event.data.object;
            const failOrderId = intent.metadata.orderId;
            console.log(`Payment failed for Order: ${failOrderId}. Reason: ${intent.last_payment_error?.message}`);

            if (failOrderId) {
                const order = await Order.findById(failOrderId);
                if (order) {
                    order.orderStatus = 'cancelled'; // or leave as pending
                    await order.save();
                }
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};


// @desc    Create Stripe Payment Intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
exports.createStripePaymentIntent = async (req, res) => {
    const { amount, currency, metadata, paymentMethodType } = req.body;

    try {
        const config = await getActiveConfig();
        const secretKey = config.stripe?.secretKey || process.env.STRIPE_SECRET_KEY;
        const stripe = stripeLib(secretKey);

        let finalCurrency = (currency || 'usd').toLowerCase();
        let finalAmount = Math.round(amount * 100);
        let methodTypes = ['card'];

        // Enforcement for specific methods
        if (paymentMethodType === 'Alipay' || paymentMethodType === 'WeChat Pay') {
            methodTypes = [paymentMethodType === 'Alipay' ? 'alipay' : 'wechat_pay'];

            // If the requested currency is not supported by these methods, default to CNY
            if (!['cny', 'eur'].includes(finalCurrency)) {
                finalCurrency = 'cny';
            }
        } else {
            // General Stripe Elements (Cards, Apple/Google Pay)
            methodTypes = ['card'];
        }

        console.log(`Creating PaymentIntent: ${finalAmount} ${finalCurrency} for ${paymentMethodType}`);

        const intentOptions = {
            amount: finalAmount,
            currency: finalCurrency,
            metadata: metadata || {}, // Ensure metadata with orderId is passed correctly
        };

        if (paymentMethodType === 'Alipay' || paymentMethodType === 'WeChat Pay') {
            intentOptions.payment_method_types = methodTypes;
        } else {
            // Use explicit types to avoid Link prompts while keeping Card/Wallets
            intentOptions.payment_method_types = ['card'];
        }

        const paymentIntent = await stripe.paymentIntents.create(intentOptions);

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            currency: finalCurrency,
            amount: finalAmount
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

