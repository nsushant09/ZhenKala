const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    quote: {
        type: String,
        required: true,
    },
    address: {
        type: String,
    },
    rating: {
        type: Number,
        default: 5,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

module.exports = Testimonial;
