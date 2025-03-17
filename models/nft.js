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