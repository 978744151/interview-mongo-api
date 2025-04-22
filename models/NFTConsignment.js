const mongoose = require('mongoose');

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