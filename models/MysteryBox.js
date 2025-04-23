const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     MysteryBoxFull:
 *       type: object
 *       required:
 *         - name
 *         - imageUrl
 *         - price
 *         - totalQuantity
 *       properties:
 *         name:
 *           type: string
 *           description: 盲盒名称
 *         description:
 *           type: string
 *           description: 盲盒描述
 *         imageUrl:
 *           type: string
 *           description: 盲盒图片URL
 *         price:
 *           type: string
 *           description: 盲盒价格
 *         totalQuantity:
 *           type: number
 *           description: 总数量
 *         soldQuantity:
 *           type: number
 *           description: 已售数量
 *         isActive:
 *           type: boolean
 *           description: 是否上架
 *         possibleNFTs:
 *           type: array
 *           description: 可能获得的NFT列表
 *           items:
 *             type: object
 *             properties:
 *               nft:
 *                 type: string
 *                 description: NFT ID
 *               probability:
 *                 type: number
 *                 description: 获得概率 (0-100)
 *       example:
 *         name: "限量潮玩盲盒"
 *         description: "限量发售的潮流NFT盲盒，可能获得稀有藏品"
 *         imageUrl: "https://example.com/mysterybox1.jpg"
 *         price: "1000"
 *         totalQuantity: 500
 *         soldQuantity: 50
 *         isActive: true
 *         possibleNFTs: [
 *           { nft: "5d713995b721c3bb38c1f5d1", probability: 70 },
 *           { nft: "5d713995b721c3bb38c1f5d2", probability: 25 },
 *           { nft: "5d713995b721c3bb38c1f5d3", probability: 5 }
 *         ]
 */
const MysteryBoxSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '请输入盲盒名称'],
        trim: true
    },
    description: {
        type: String,
        required: [false, '请输入盲盒描述']
    },
    imageUrl: {
        type: String,
        required: [true, '请上传盲盒图片']
    },
    price: {
        type: String,
        required: [true, '请输入盲盒价格']
    },
    totalQuantity: {
        type: Number,
        required: [true, '请输入盲盒总数量']
    },
    soldQuantity: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    possibleNFTs: [{
        nft: {
            type: mongoose.Schema.ObjectId,
            ref: 'NFT',
            required: true
        },
        probability: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MysteryBox', MysteryBoxSchema); 