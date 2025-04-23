const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     NFTConsignmentFull:
 *       type: object
 *       required:
 *         - nft
 *         - seller
 *         - listingPrice
 *       properties:
 *         nft:
 *           type: string
 *           description: NFT ID
 *         seller:
 *           type: string
 *           description: 卖家ID
 *         listingPrice:
 *           type: string
 *           description: 寄售价格
 *         isAvailable:
 *           type: boolean
 *           description: 是否可购买
 *         listedAt:
 *           type: string
 *           format: date-time
 *           description: 寄售时间
 *       example:
 *         nft: "5d713995b721c3bb38c1f5d1"
 *         seller: "5d7a514b5d2c12c7449be042"
 *         listingPrice: "1000"
 *         isAvailable: true
 *         listedAt: "2023-06-15T08:00:00.000Z"
 */
const NFTConsignmentSchema = new mongoose.Schema({
    nft: {
        type: mongoose.Schema.ObjectId,
        ref: 'NFT',
        required: true
    },
    seller: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    listingPrice: {
        type: String,
        required: [true, '请输入寄售价格']
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    listedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('NFTConsignment', NFTConsignmentSchema); 