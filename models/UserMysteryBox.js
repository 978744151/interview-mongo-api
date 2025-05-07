const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     UserMysteryBox:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *           description: 用户ID
 *         mysteryBox:
 *           type: string
 *           description: 盲盒ID
 *         edition:
 *           type: string
 *           description: 拥有的盲盒实例ID
 *         opened:
 *           type: boolean
 *           description: 是否已开启
 *         nftReceived:
 *           type: string
 *           description: 获得的NFT ID
 *         editionReceived:
 *           type: string
 *           description: 获得的NFT版本ID
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
    edition: {
        type: String,
        description: '拥有的盲盒实例ID',
        required: true
    },
    opened: {
        type: Boolean,
        default: false
    },
    nftReceived: {
        type: mongoose.Schema.ObjectId,
        ref: 'NFT'
    },
    editionReceived: {
        type: String
    },
    purchasedAt: {
        type: Date,
        default: Date.now
    },
    openedAt: {
        type: Date
    }
});

module.exports = mongoose.model('UserMysteryBox', UserMysteryBoxSchema); 