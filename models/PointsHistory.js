const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     PointsHistory:
 *       type: object
 *       required:
 *         - user
 *         - points
 *         - type
 *         - description
 *       properties:
 *         user:
 *           type: string
 *           description: 用户ID
 *         points:
 *           type: number
 *           description: 积分变动数量
 *         type:
 *           type: string
 *           description: 积分变动类型
 *           enum: [check_in, purchase, sale, admin, other]
 *         description:
 *           type: string
 *           description: 积分变动描述
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 记录创建时间
 *       example:
 *         user: "5d7a514b5d2c12c7449be042"
 *         points: 10
 *         type: "check_in"
 *         description: "第3天连续签到奖励"
 *         createdAt: "2023-06-15T08:00:00.000Z"
 */
const PointsHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['check_in', 'purchase', 'sale', 'admin', 'other'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PointsHistory', PointsHistorySchema); 