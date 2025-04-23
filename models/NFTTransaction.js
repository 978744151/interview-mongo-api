const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     NFTTransactionFull:
 *       type: object
 *       required:
 *         - nft
 *         - consignment
 *         - seller
 *         - buyer
 *         - price
 *       properties:
 *         nft:
 *           type: string
 *           description: NFT ID
 *         consignment:
 *           type: string
 *           description: 寄售记录ID
 *         seller:
 *           type: string
 *           description: 卖家ID
 *         buyer:
 *           type: string
 *           description: 买家ID
 *         price:
 *           type: string
 *           description: 成交价格
 *         transactionDate:
 *           type: string
 *           format: date-time
 *           description: 交易时间
 *       example:
 *         nft: "5d713995b721c3bb38c1f5d1"
 *         consignment: "5d713995b721c3bb38c1f5d0"
 *         seller: "5d7a514b5d2c12c7449be042"
 *         buyer: "5d7a514b5d2c12c7449be043"
 *         price: "1000"
 *         transactionDate: "2023-06-15T08:00:00.000Z"
 */
const NFTTransactionSchema = new mongoose.Schema({
    nft: {
        type: mongoose.Schema.ObjectId,
        ref: 'NFT',
        required: true
    },
    consignment: {
        type: mongoose.Schema.ObjectId,
        ref: 'NFTConsignment',
        required: true
    },
    seller: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    buyer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    price: {
        type: String,
        required: true
    },
    transactionDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('NFTTransaction', NFTTransactionSchema); 