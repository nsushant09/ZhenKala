const express = require('express');
const router = express.Router();
const {
    getTestimonials,
    createTestimonial,
} = require('../controllers/testimonialController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
    .get(getTestimonials)
    .post(protect, admin, createTestimonial);

module.exports = router;
