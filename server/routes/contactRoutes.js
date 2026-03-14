const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../utils/emailService');

// @route   POST /api/contact
// @desc    Send contact list email
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, email, message } = req.body;
        
        if (!firstName || !lastName || !email || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        
        const fullName = `${firstName} ${lastName}`;
        const emailSent = await sendContactEmail(fullName, email, message);
        
        if (emailSent) {
            res.status(200).json({ success: true, message: 'Message sent successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to send message. Please try again later.' });
        }
    } catch (error) {
        console.error('Contact Form Error:', error);
        res.status(500).json({ success: false, message: 'Server error while sending message' });
    }
});

module.exports = router;
