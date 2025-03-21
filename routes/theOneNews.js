const express = require('express');
const router = express.Router();
const { getNews, syncNews } = require('../controllers/theOneNews');

router.get('/', getNews);
router.post('/sync', syncNews);

module.exports = router;