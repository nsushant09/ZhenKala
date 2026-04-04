const Coupon = require('../models/Coupon');

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
exports.getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get coupon by ID
// @route   GET /api/coupons/:id
// @access  Private/Admin
exports.getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res) => {
    try {
        const { code, discountPercent, startDate, endDate, isActive } = req.body;

        const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
        if (couponExists) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountPercent,
            startDate,
            endDate,
            isActive,
        });

        res.status(201).json(coupon);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (coupon) {
            coupon.code = req.body.code?.toUpperCase() || coupon.code;
            coupon.discountPercent = req.body.discountPercent || coupon.discountPercent;
            coupon.startDate = req.body.startDate || coupon.startDate;
            coupon.endDate = req.body.endDate || coupon.endDate;
            coupon.isActive = req.body.isActive !== undefined ? req.body.isActive : coupon.isActive;

            const updatedCoupon = await coupon.save();
            res.json(updatedCoupon);
        } else {
            res.status(404).json({ message: 'Coupon not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (coupon) {
            await coupon.deleteOne();
            res.json({ message: 'Coupon removed' });
        } else {
            res.status(404).json({ message: 'Coupon not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private (Registered users only)
exports.validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const now = new Date();
        const midnight = new Date(now);
        midnight.setUTCHours(0, 0, 0, 0);

        console.log(`[Coupon Debug] Validating: "${code}"`);
        console.log(`[Coupon Debug] Server Time: ${now.toISOString()}`);

        const coupon = await Coupon.findOne({
            code: code.trim().toUpperCase(),
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: midnight },
        });

        if (!coupon) {
            console.log(`[Coupon Debug] Result: NOT FOUND or INACTIVE/EXPIRED`);
            return res.status(404).json({ message: 'Invalid or expired coupon code' });
        }

        console.log(`[Coupon Debug] Result: Found ${coupon.code} (${coupon.discountPercent}%)`);
        res.json({
            code: coupon.code,
            discountPercent: coupon.discountPercent,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
