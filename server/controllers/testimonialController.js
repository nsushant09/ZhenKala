const Testimonial = require('../models/Testimonial');

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
const getTestimonials = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 0; // 0 means no limit

        let query = Testimonial.find({ isActive: true }).sort('-createdAt');

        if (limit > 0) {
            query = query.limit(limit);
        }

        const testimonials = await query;
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a testimonial
// @route   POST /api/testimonials
// @access  Private/Admin
const createTestimonial = async (req, res) => {
    try {
        const { name, quote, address, rating } = req.body;

        const testimonial = new Testimonial({
            name,
            quote,
            address,
            rating: rating || 5,
        });

        const createdTestimonial = await testimonial.save();
        res.status(201).json(createdTestimonial);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getTestimonials,
    createTestimonial,
};
