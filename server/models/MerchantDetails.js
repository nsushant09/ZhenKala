const mongoose = require('mongoose');

const merchantDetailsSchema = new mongoose.Schema({
    businessName: {
        type: String,
        default: 'ZhenKala'
    },
    bankDetails: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        swiftCode: String,
        iban: String,
        branchName: String
    },
    contactEmail: String,
    contactPhone: String,
    address: String,
    paypalEmail: String,
    taxId: String,
    deliveryCharges: {
        nepal: { type: Number, default: 130 },
        international: { type: Number, default: 2000 }
    },
    freeShippingThreshold: { type: Number, default: 13000 }
}, { timestamps: true });

// Ensure only one settings document exists
merchantDetailsSchema.statics.getSingleton = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('MerchantDetails', merchantDetailsSchema);
