const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     UserPoints:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *           description: 用户ID
 *         points:
 *           type: number
 *           description: 用户当前积分
 *         lastCheckIn:
 *           type: string
 *           format: date-time
 *           description: 上次签到时间
 *         consecutiveCheckIns:
 *           type: number
 *           description: 连续签到天数
 *       example:
 *         user: "5d7a514b5d2c12c7449be042"
 *         points: 150
 *         lastCheckIn: "2023-06-15T08:00:00.000Z"
 *         consecutiveCheckIns: 5
 */
const UserPointsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    points: {
        type: Number,
        default: 0
    },
    lastCheckIn: {
        type: Date,
        default: null
    },
    consecutiveCheckIns: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// 更新时间中间件
UserPointsSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('UserPoints', UserPointsSchema); 