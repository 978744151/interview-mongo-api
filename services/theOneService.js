const axios = require('axios');
const TheOneNews = require('../models/theOneNews');
const sendEmail = require('../utils/sendEmail');

class TheOneService {

    static previousAnnouncements = []; // 记录上一次的公告列表
    static isFirstRun = true; // 添加首次运行标志

    static async fetchNews() {
        try {
            // 获取最新公告列表
            const response = await axios.post('https://api.theone.art/market/api/dynamicNews/findNewsList', {
                "categoryId": 36, "location": "list", "pageCount": 1, "pageSize": 20, "commodityCategoryIds": [], "top": 0
            });
            const currentAnnouncements = response.data.data.records; // 当前时间的公告列表

            // 找出新公告（在当前列表中但不在上一次列表中的公告）
            const newAnnouncements = currentAnnouncements.filter(record =>
                !this.previousAnnouncements.some(item =>
                    item.name === record.name && item.createTime === record.createTime
                )
            );

            console.log(`发现${newAnnouncements.length}条新公告`);

            // 处理新公告，但如果是首次运行则只保存不推送
            for (const record of newAnnouncements) {
                // 检查数据库中是否已存在
                const exists = await TheOneNews.findOne({
                    title: record.name,
                    createTime: record.createTime
                });

                if (!exists) {
                    // 创建新记录
                    const newNews = await TheOneNews.create({
                        title: record.name,
                        content: record.content,
                        createTime: record.createTime,
                        newsType: record.newsType,
                        readNum: record.readNum,
                        originalData: record,
                        isPushed: this.isFirstRun // 首次运行时标记为已推送
                    });

                    // 只有非首次运行才推送新消息
                    if (!this.isFirstRun) {
                        await this.pushNotification(newNews);

                        // 更新为已推送状态
                        await TheOneNews.findByIdAndUpdate(newNews._id, {
                            isPushed: true
                        });
                    }
                }
            }

            // 更新上一次的公告列表为当前的公告列表
            this.previousAnnouncements = currentAnnouncements;

            // 首次运行完成后，将标志设为false
            if (this.isFirstRun) {
                this.isFirstRun = false;
                console.log('首次运行完成，已记录当前公告，下次有新公告时将发送通知');
            }

            return {
                success: true,
                message: `数据同步成功，发现${newAnnouncements.length}条新公告${this.isFirstRun ? '（首次运行，仅记录不推送）' : ''}`
            };
        } catch (error) {
            console.error('TheOne API 同步失败:', error);
            return { success: false, error: error.message };
        }
    }

    static async pushNotification(news) {
        try {
            console.log('新公告推送:', news.title);

            // 发送邮件通知
            const message = `
                <h2 style="color:#1890ff;">${news.title}</h2>
                <div style="padding:15px;border:1px solid #eee;border-radius:5px;">
                    <p>${news.content}</p>
                    <p style="color:#888;">发布时间：${new Date(news.createTime).toLocaleString()}</p>
                </div>
                <p style="font-size:12px;color:#999;">此邮件由TheOne监控系统自动发送</p>
            `;

            await sendEmail({
                email: 'chentao19951011@icloud.com',
                subject: `TheOne新公告：${news.title}`,
                message,
                html: true  // 添加这个参数，指示邮件内容是HTML格式
            });

            console.log(`邮件已发送：${news.title}`);
        } catch (error) {
            console.error('推送失败:', error);
        }
    }
}

module.exports = TheOneService;