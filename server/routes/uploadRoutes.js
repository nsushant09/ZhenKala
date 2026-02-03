const express = require('express');
const router = express.Router();
const { uploadFile } = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, admin, uploadFile);

module.exports = router;
