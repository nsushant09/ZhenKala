/**
 * Payment Configuration
 * This file centralizes all payment method developer/business details.
 * In production, these should be securely stored in .env
 */

const paymentConfig = {
    stripe: {
        publicKey: process.env.STRIPE_PUBLIC_KEY || 'pk_test_placeholder',
        secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
        enabled: true,
        supportedMethods: ['card', 'apple_pay', 'google_pay', 'unionpay']
    },
    paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID || 'client_id_placeholder',
        secret: process.env.PAYPAL_SECRET || 'secret_placeholder',
        mode: process.env.PAYPAL_MODE || 'sandbox', // 'sandbox' or 'live'
        enabled: true
    },
    applePay: {
        merchantIdentifier: process.env.APPLE_PAY_MERCHANT_ID || 'merchant.com.zhenkala',
        domainName: 'zhenkala.com', // Replace with actual domain
        enabled: true
    },
    googlePay: {
        merchantId: process.env.GOOGLE_PAY_MERCHANT_ID || '1234567890',
        merchantName: 'ZhenKala',
        enabled: true
    },
    // Business / Recipient Details (Used for Invoices and Wire Transfers)
    businessInfo: {
        legalName: 'ZhenKala Art & Handicrafts',
        bankDetails: {
            bankName: 'Himalayan Bank Ltd.',
            accountName: 'ZhenKala Art PVT LTD',
            accountNumber: 'XXXX-XXXX-XXXX',
            swiftCode: 'HIMANPKA',
            iban: 'NP00 0000 0000 0000 0000',
            branch: 'Thamel, Kathmandu'
        },
        contact: {
            email: 'sales@zhenkala.com',
            phone: '+977-1-4XXXXXX',
            address: 'Thamel St, Kathmandu, Nepal'
        }
    }
};

module.exports = paymentConfig;
