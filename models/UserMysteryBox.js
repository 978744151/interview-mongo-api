const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     UserMysteryBox:
 *       type: object
 *       required:
 *         - user
 *         - mysteryBox
 *       properties:
 *         user:
 *           type: string
 *           description: 用户ID
 *         mysteryBox:
 *           type: string
 *           description: 盲盒ID
 *         isOpened:
 *           type: boolean
 *           description: 是否已开启
 *         receivedNFT:
 *           type: string
 *           description: 获得的NFT ID
 *         purchasedAt:
 *           type: string
 *           format: date-time
 *           description: 购买时间
 *         openedAt:
 *           type: string
 *           format: date-time
 *           description: 开启时间
 *       example:
 *         user: "5d7a514b5d2c12c7449be042"
 *         mysteryBox: "6d713995b721c3bb38c1f601"
 *         isOpened: false
 *         receivedNFT: null
 *         purchasedAt: "2023-06-15T08:00:00.000Z"
 *         openedAt: null
 */
const UserMysteryBoxSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    mysteryBox: {
        type: mongoose.Schema.ObjectId,
        ref: 'MysteryBox',
        required: true
    },
    isOpened: {
        type: Boolean,
        default: false
    },
    receivedNFT: {
        type: mongoose.Schema.ObjectId,
        ref: 'NFT',
        default: null
    },
    purchasedAt: {
        type: Date,
        default: Date.now
    },
    openedAt: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('UserMysteryBox', UserMysteryBoxSchema); 