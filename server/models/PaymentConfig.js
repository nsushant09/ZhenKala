const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const paymentConfigSchema = new mongoose.Schema(
    {
        stripe: {
            publicKey: { type: String, default: '' },
            secretKey: { type: String, default: '' }, // This will be encrypted
            enabled: { type: Boolean, default: true },
        },
        paypal: {
            clientId: { type: String, default: '' },
            secret: { type: String, default: '' }, // This will be encrypted
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
            email: { type: String, default: 'contact.zhenkala@gmail.com' },
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

// Decrypt secrets after fetching from DB
paymentConfigSchema.post('init', function (doc) {
    if (doc.stripe?.secretKey) doc.stripe.secretKey = decrypt(doc.stripe.secretKey);
    if (doc.paypal?.secret) doc.paypal.secret = decrypt(doc.paypal.secret);
});

// Encrypt secrets before saving to DB
paymentConfigSchema.pre('save', function (next) {
    if (this.isModified('stripe.secretKey') && this.stripe.secretKey) {
        this.stripe.secretKey = encrypt(this.stripe.secretKey);
    }
    if (this.isModified('paypal.secret') && this.paypal.secret) {
        this.paypal.secret = encrypt(this.paypal.secret);
    }
    next();
});

module.exports = mongoose.model('PaymentConfig', paymentConfigSchema);
