const PaymentConfig = require('../models/PaymentConfig');

// @desc    Get payment configuration
// @route   GET /api/payment-settings
// @access  Private/Admin
exports.getPaymentSettings = async (req, res) => {
    try {
        let config = await PaymentConfig.findOne();

        // If no config exists, create a default one
        if (!config) {
            config = await PaymentConfig.create({});
        }

        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update payment configuration
// @route   PUT /api/payment-settings
// @access  Private/Admin
exports.updatePaymentSettings = async (req, res) => {
    try {
        let config = await PaymentConfig.findOne();

        if (!config) {
            config = await PaymentConfig.create(req.body);
        } else {
            // Update individual fields to avoid overwriting nested objects if not provided
            if (req.body.stripe) config.stripe = { ...config.stripe.toObject(), ...req.body.stripe };
            if (req.body.paypal) config.paypal = { ...config.paypal.toObject(), ...req.body.paypal };
            if (req.body.applePay) config.applePay = { ...config.applePay.toObject(), ...req.body.applePay };
            if (req.body.googlePay) config.googlePay = { ...config.googlePay.toObject(), ...req.body.googlePay };
            if (req.body.businessInfo) config.businessInfo = { ...config.businessInfo.toObject(), ...req.body.businessInfo };

            await config.save();
        }

        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
