const mongoose = require('mongoose');

const exchangeRateSchema = new mongoose.Schema({
    base: {
        type: String,
        required: true,
        default: 'USD'
    },
    rates: {
        type: Map,
        of: Number,
        required: true
    },
    names: {
        type: Map,
        of: String,
        default: {}
    },
    timestamp: {
        type: Number,
        required: true
    },
    lastFetched: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const ExchangeRate = mongoose.model('ExchangeRate', exchangeRateSchema);

module.exports = ExchangeRate;
