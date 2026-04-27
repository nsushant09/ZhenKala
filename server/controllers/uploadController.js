const path = require('path');
const fs = require('fs');
const multer = require('multer');
const client = require('../config/oss');

const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// @desc    Upload file to Aliyun OSS
// @route   POST /api/upload
// @access  Private/Admin
exports.uploadFile = (req, res) => {
    const handler = upload.single('image');

    handler(req, res, async (err) => {
        if (err) {
            console.error('Multer error during upload:', err);
            return res.status(400).json({ message: err.message || String(err) });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file selected' });
        }

        try {
            const fileName = `products/${Date.now()}-${req.file.originalname}`;
            const filePath = req.file.path;

            const stream = fs.createReadStream(filePath);
            const result = await client.putStream(fileName, stream);

            return res.json({
                message: 'File uploaded',
                imageUrl: result.url,
            });
        } catch (error) {
            console.error('OSS upload error:', error);
            return res.status(500).json({ message: error.message || 'Failed to upload image' });
        }
    });
};

