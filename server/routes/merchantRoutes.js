const express = require('express');
const router = express.Router();
const { getMerchantDetails, updateMerchantDetails } = require('../controllers/merchantController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
    .get(getMerchantDetails)
    .put(protect, admin, updateMerchantDetails);

module.exports = router;
