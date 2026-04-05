const Order = require('../models/Order');
const PaymentConfig = require('../models/PaymentConfig');
const stripeLib = require('stripe');
const { sendOrderConfirmationEmail } = require('../utils/emailService');
const { validateAndDeductOrderStock } = require('../utils/inventoryService');

// Helper to get active configuration
// Helper to get active configuration - SECURE: prioritize .env for secrets
const getActiveConfig = async () => {
    let dbConfig = await PaymentConfig.findOne();

    // Core infrastructure keys must come from .env for security
    const secureConfig = {
        stripe: {
            secretKey: process.env.STRIPE_SECRET_KEY,
            publicKey: process.env.STRIPE_PUBLIC_KEY,
            enabled: dbConfig?.stripe?.enabled ?? true
        },
        paypal: {
            clientId: process.env.PAYPAL_CLIENT_ID,
            secret: process.env.PAYPAL_SECRET,
            mode: process.env.PAYPAL_MODE || 'sandbox',
            enabled: dbConfig?.paypal?.enabled ?? true
        },
        applePay: {
            merchantId: dbConfig?.applePay?.merchantId || process.env.APPLE_PAY_MERCHANT_ID,
            enabled: dbConfig?.applePay?.enabled ?? true
        },
        googlePay: {
            merchantId: dbConfig?.googlePay?.merchantId || process.env.GOOGLE_PAY_MERCHANT_ID,
            merchantName: dbConfig?.googlePay?.merchantName || 'ZhenKala',
            enabled: dbConfig?.googlePay?.enabled ?? true
        },
        businessInfo: dbConfig?.businessInfo || {}
    };

    return secureConfig;
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
                let savedOrder;
                let shouldSendEmail = false;

                const order = await Order.findById(orderId)
                    .populate('user', 'firstName lastName email');

                if (order && !order.isPaid) {
                    if (!order.stockDeducted) {
                        await validateAndDeductOrderStock(order);
                        order.stockDeducted = true;
                    }

                    order.isPaid = true;
                    order.paidAt = Date.now();
                    order.orderStatus = 'processing';
                    order.paymentResult = {
                        id: paymentIntent.id,
                        status: paymentIntent.status,
                        update_time: new Date().toISOString(),
                        email_address: paymentIntent.receipt_email || '',
                    };

                    savedOrder = await order.save();
                    shouldSendEmail = true;
                }

                if (shouldSendEmail && savedOrder) {
                    await sendOrderConfirmationEmail(savedOrder);
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
                    order.orderStatus = 'checkout failed';
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
            if (paymentMethodType === 'WeChat Pay') {
                intentOptions.payment_method_options = {
                    wechat_pay: { client: 'web' }
                };
            }
        } else {
            intentOptions.automatic_payment_methods = { enabled: true };
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
        res.json({ clientId: config.paypal?.clientId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const FonepayService = require('../utils/fonepayService');

// @desc    Create Fonepay Payment URL
// @route   POST /api/payments/fonepay/create-url
// @access  Private
exports.createFonepayPaymentUrl = async (req, res) => {
    const { orderId } = req.body;
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const result = await FonepayService.generateWebPaymentUrl(order);
        res.json(result);
    } catch (error) {
        console.error('[Fonepay] URL Generation Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Fonepay Payment Callback
// @route   GET /api/payments/fonepay/callback
// @access  Public (Redirect from Fonepay)
exports.verifyFonepayPayment = async (req, res) => {
    try {
        const verification = await FonepayService.verifyPayment(req.query);
        const orderId = req.query.PRN.split('_')[0]; // Extract original OrderID

        const order = await Order.findById(orderId).populate('user', 'firstName lastName email');
        if (!order) {
            return res.redirect(`${process.env.CLIENT_URL}/payment/error?message=OrderNotFound`);
        }

        if (verification.success) {
            // Mark as paid
            if (!order.isPaid) {
                if (!order.stockDeducted) {
                    await validateAndDeductOrderStock(order);
                    order.stockDeducted = true;
                }
                order.isPaid = true;
                order.paidAt = Date.now();
                order.paymentResult = {
                    id: verification.transactionId,
                    status: 'completed',
                    update_time: new Date().toISOString()
                };
                order.paymentMethod = 'fonepay';
                await order.save();
                await sendOrderConfirmationEmail(order);
            }
            return res.redirect(`${process.env.CLIENT_URL}/orders/${orderId}?success=true`);
        } else {
            console.warn(`[Fonepay] Payment Failed for Order ${orderId}: ${verification.message}`);
            return res.redirect(`${process.env.CLIENT_URL}/orders/${orderId}?success=false&error=${encodeURIComponent(verification.message)}`);
        }
    } catch (error) {
        console.error('[Fonepay] Callback Error:', error);
        res.redirect(`${process.env.CLIENT_URL}/payment/error?message=${encodeURIComponent(error.message)}`);
    }
};

// @desc    Retrieve Payment Configuration (Public parts)
// @route   GET /api/payments/config
// @access  Private
exports.getPaymentConfig = async (req, res) => {
    try {
        const config = await getActiveConfig();
        res.json({
            stripePublicKey: config.stripe?.publicKey,
            paypalClientId: config.paypal?.clientId,
            applePayMerchantId: config.applePay?.merchantId,
            googlePayMerchantId: config.googlePay?.merchantId,
            googlePayMerchantName: config.googlePay?.merchantName,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

