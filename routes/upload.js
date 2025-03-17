const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload');
const upload = require('../utils/upload');
const { protect } = require('../middleware/auth');

router.post(
    '/image',
    protect,
    upload.single('file'),
    uploadController.uploadImage
);

module.exports = router;