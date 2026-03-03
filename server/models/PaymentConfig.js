const mongoose = require('mongoose');

const paymentConfigSchema = new mongoose.Schema(
    {
        stripe: {
            publicKey: { type: String, default: '' },
            secretKey: { type: String, default: '' },
            enabled: { type: Boolean, default: true },
        },
        paypal: {
            clientId: { type: String, default: '' },
            secret: { type: String, default: '' },
            mode: { type: String, enum: ['sandbox', 'live'], default: 'sandbox' },
            enabled: { type: Boolean, default: true },
        },
        applePay: {
            merchantId: { type: String, default: '' },
            enabled: { type: Boolean, default: true },
        },
        googlePay: {
            merchantId: { type: String, default: '' },
            merchantName: { type: String, default: 'ZhenKala' },
            enabled: { type: Boolean, default: true },
        },
        businessInfo: {
            legalName: { type: String, default: 'ZhenKala Art & Handicrafts' },
            email: { type: String, default: 'sales@zhenkala.com' },
            phone: { type: String, default: '' },
            address: { type: String, default: '' },
            bankName: { type: String, default: '' },
            accountName: { type: String, default: '' },
            accountNumber: { type: String, default: '' },
            swiftCode: { type: String, default: '' },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('PaymentConfig', paymentConfigSchema);
