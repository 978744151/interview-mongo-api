const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     MysteryBoxItem:
 *       type: object
 *       properties:
 *         nft:
 *           type: string
 *           description: NFT ID
 *         weight:
 *           type: number
 *           description: 权重/概率
 *         quantity:
 *           type: number
 *           description: 数量限制
 *         remainingQuantity:
 *           type: number
 *           description: 剩余数量
 */
const MysteryBoxItemSchema = new mongoose.Schema({
    nft: {
        type: mongoose.Schema.ObjectId,
        ref: 'NFT',
        required: true
    },
    weight: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    remainingQuantity: {
        type: Number,
        required: true,
        min: 0
    }
});

// 设置mongoose中间件，确保remainingQuantity初始值等于quantity
MysteryBoxItemSchema.pre('save', function(next) {
    if (this.isNew && this.remainingQuantity === undefined) {
        this.remainingQuantity = this.quantity;
    }
    next();
});

/**
 * @swagger
 * components:
 *   schemas:
 *     MysteryBox:
 *       type: object
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
 *           type: number
 *           description: 盲盒价格
 *         totalQuantity:
 *           type: number
 *           description: 总数量
 *         soldQuantity:
 *           type: number
 *           description: 已售数量
 *         openLimit:
 *           type: number
 *           description: 开启次数限制，0表示无限制
 *         openedCount:
 *           type: number
 *           description: 已开启次数
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MysteryBoxItem'
 *           description: 盲盒包含的NFT列表
 *         status:
 *           type: number
 *           enum: [1, 2, 3, 4]
 *           description: 状态(1:未发布, 2:已发布, 3:已售罄, 4:已下架)
 *         statusStr:
 *           type: string
 *           description: 状态描述
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
        type: Number,
        required: [true, '请输入盲盒价格']
    },
    totalQuantity: {
        type: Number,
        required: [true, '请输入盲盒总数量'],
        default: 1000
    },
    soldQuantity: {
        type: Number,
        default: 0
    },
    openLimit: {
        type: Number,
        default: 0,
        description: '盲盒开启次数限制，0表示无限制'
    },
    openedCount: {
        type: Number,
        default: 0,
        description: '已开启次数'
    },
    items: [MysteryBoxItemSchema],
    status: {
        type: Number,
        enum: [1, 2, 3, 4],
        default: 1
    },
    statusStr: {
        type: String,
        enum: ["未发布", "已发布", "已售罄", "已下架"],
        default: "未发布"
    },
    // 创建者
    creator: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 方法：根据状态值自动设置状态描述
MysteryBoxSchema.pre('save', function (next) {
    // 设置盲盒状态描述
    switch (this.status) {
        case 1:
            this.statusStr = "未发布";
            break;
        case 2:
            this.statusStr = "已发布";
            break;
        case 3:
            this.statusStr = "已售罄";
            break;
        case 4:
            this.statusStr = "已下架";
            break;
        default:
            this.statusStr = "未知状态";
    }

    // 检查是否售罄
    if (this.soldQuantity >= this.totalQuantity && this.status !== 4) {
        this.status = 3;
        this.statusStr = "已售罄";
    }

    next();
});

module.exports = mongoose.model('MysteryBox', MysteryBoxSchema); 