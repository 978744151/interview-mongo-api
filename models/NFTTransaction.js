const mongoose = require('mongoose');

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