const mongoose = require('mongoose');

const NFTSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '请输入NFT名称'],
        trim: true
    },
    description: {
        type: String,
        required: [false, '请输入NFT描述']
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'NFTCategory',
        required: true
    },
    imageUrl: {
        type: String,
        required: [true, '请上传NFT图片']
    },
    price: {
        type: String,
        required: [true, '请输入NFT价格']
    },
    author: {
        type: String,
        required: [true, '请输入NFT作者']
    },
    likes: {
        type: String,
    },
    quantity: {
        type: String,
        required: [true, '请输入NFT数量']
    },
    soldQty: {
        type: String,
        required: [false, '请输入NFT流通数量']
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('NFT', NFTSchema);