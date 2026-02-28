const MerchantDetails = require('../models/MerchantDetails');

// @desc    Get merchant details
// @route   GET /api/merchant-details
// @access  Public (some info), Internal use
exports.getMerchantDetails = async (req, res) => {
    try {
        const details = await MerchantDetails.getSingleton();
        res.json(details);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update merchant details
// @route   PUT /api/merchant-details
// @access  Private/Admin
exports.updateMerchantDetails = async (req, res) => {
    try {
        let details = await MerchantDetails.getSingleton();

        // Update fields from body
        Object.assign(details, req.body);

        await details.save();
        res.json(details);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
