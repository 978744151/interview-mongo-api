const TheOneNews = require('../models/theOneNews');
const asyncHandler = require('../middleware/async');

exports.getNews = asyncHandler(async (req, res) => {
    const news = await TheOneNews.find()
        .sort('-createdTime')
        .limit(50);
    res.status(200).json({
        success: true,
        count: news.length,
        data: news
    });
});

exports.syncNews = asyncHandler(async (req, res) => {
    const TheOneService = require('../services/theOneService');
    const result = await TheOneService.fetchNews();
    
    if (!result.success) {
        return res.status(500).json(result);
    }
    
    res.status(200).json(result);
});