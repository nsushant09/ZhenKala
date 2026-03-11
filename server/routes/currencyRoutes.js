const express = require('express');
const router = express.Router();
const { getRates, refreshRates } = require('../controllers/currencyController');
const { protect, admin } = require('../middleware/auth');

// Public route to get rates
router.get('/rates', getRates);

// Admin-only route to manually refresh rates
router.post('/refresh', protect, admin, refreshRates);

module.exports = router;
