const axios = require('axios');
const ExchangeRate = require('../models/ExchangeRate');
const cron = require('node-cron');

// Fetch rates from external API and store in DB
const updateExchangeRates = async () => {
    try {
        const appId = process.env.OPEN_EXCHANGE_RATES_APP_ID;
        if (!appId) {
            console.error('❌ OPEN_EXCHANGE_RATES_APP_ID is not defined in environment variables.');
            return;
        }

        console.log('🔄 Fetching latest exchange rates and currency names...');

        // Fetch Rates
        const ratesResponse = await axios.get(`https://openexchangerates.org/api/latest.json?app_id=${appId}`);
        const { base, rates, timestamp } = ratesResponse.data;

        // Fetch Names
        const namesResponse = await axios.get('https://openexchangerates.org/api/currencies.json');
        const names = namesResponse.data;

        // Filter out non-national currencies (Commodities, Crypto, etc.)
        const excludedCodes = ['BTC', 'ETH', 'XAU', 'XAG', 'XPD', 'XPT', 'LTC', 'XDR'];
        const filteredNames = {};
        const filteredRates = {};

        Object.keys(names).forEach(code => {
            if (!excludedCodes.includes(code) && !names[code].toLowerCase().includes('bitcoin')) {
                filteredNames[code] = names[code];
                if (rates[code]) {
                    filteredRates[code] = rates[code];
                }
            }
        });

        console.log(`🔍 Filtered ${Object.keys(filteredNames).length} currencies.`);

        // Use find and save instead of findOneAndUpdate for better Map support
        let exchangeDoc = await ExchangeRate.findOne({ base });
        if (!exchangeDoc) {
            exchangeDoc = new ExchangeRate({ base });
        }

        exchangeDoc.rates = filteredRates;
        exchangeDoc.names = filteredNames;
        exchangeDoc.timestamp = timestamp;
        exchangeDoc.lastFetched = new Date();

        await exchangeDoc.save();

        console.log('✅ Exchange rates and names updated successfully in DB.');
    } catch (error) {
        console.error('❌ Error updating exchange rates:', error.message);
    }
};

// Scheduled task: Run every 24 hours (at midnight)
cron.schedule('0 0 * * *', () => {
    updateExchangeRates();
});

// Manual trigger for first time/debugging
exports.refreshRates = async (req, res) => {
    await updateExchangeRates();
    res.json({ message: 'Refresh triggered' });
};

// Get current rates from DB
exports.getRates = async (req, res) => {
    try {
        console.log('📬 GET /api/currencies/rates called');
        const data = await ExchangeRate.findOne({ base: 'USD' });
        if (!data) {
            console.log('⚠️ No rates found in DB. Triggering fetch...');
            // If no data exists yet, try to fetch it now
            await updateExchangeRates();
            const newData = await ExchangeRate.findOne({ base: 'USD' });
            if (!newData) return res.json({ message: 'No rates available' });

            const result = newData.toObject();
            result.rates = Object.fromEntries(newData.rates);
            result.names = Object.fromEntries(newData.names);
            return res.json(result);
        }

        console.log('✅ Found rates in DB. Returning data.');
        const result = data.toObject();
        result.rates = Object.fromEntries(data.rates);
        result.names = Object.fromEntries(data.names);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export the updater to be called in server.js on startup if needed
exports.updateExchangeRates = updateExchangeRates;
