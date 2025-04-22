const cron = require('node-cron');
const TheOneService = require('../services/theOneService');
// const HaitangService = require('../services/haitangService');

// 每5分钟执行一次
cron.schedule('*/10 * * * * *', async () => {
    // console.log('开始同步TheOne新闻数据...');
    // await TheOneService.fetchNews();
    // await HaitangService.fetchNews();
});