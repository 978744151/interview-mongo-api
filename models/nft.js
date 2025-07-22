const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     NFTEdition:
 *       type: object
 *       properties:
 *         sub_id:
 *           type: string
 *           description: NFT子ID/编号(如001, 002等)
 *         shop_id:
 *           type: string
 *           description: 商店ID
 *         status:
 *           type: number
 *           enum: [1, 2, 3, 4, 5, 6, 7]
 *           description: 状态码(1:未寄售, 2:寄售中, 3:锁定中, 4:已售出, 5:已发布, 6:空投, 7:合成)
 *         statusStr:
 *           type: string
 *           description: 状态描述
 *         price:
 *           type: string
 *           description: 该版本的价格
 *         owner:
 *           type: string
 *           description: 拥有者ID
 *         blockchain_id:
 *           type: string
 *           description: 区块链上的唯一标识
 *         transaction_history:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: date
 *               from:
 *                 type: string
 *               to:
 *                 type: string
 *               price:
 *                 type: string
 */

// NFT子项(版本)模式
const NFTEditionSchema = new mongoose.Schema({
    sub_id: {
        type: String,
        required: true
    },
    shop_id: {
        type: String
    },
    
    status: {
        type: Number,
        enum: [1, 2, 3, 4, 5, 6, 7],
        default: 1
    },
    statusStr: {
        type: String,
        default: "未寄售"
    },
    price: {
        type: String
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    blockchain_id: {
        type: String
    },
    transaction_history: [
        {
            date: {
                type: Date,
                default: Date.now
            },
            from: {
                type: String
            },
            to: {
                type: String
            },
            price: {
                type: String
            }
        }
    ]
}, { timestamps: true });

// 盲盒包含的NFT项
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
    }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     NFT:
 *       type: object
 *       required:
 *         - name
 *         - imageUrl
 *         - price
 *         - category
 *       properties:
 *         name:
 *           type: string
 *           description: NFT名称
 *         description:
 *           type: string
 *           description: NFT描述
 *         imageUrl:
 *           type: string
 *           description: 图片URL
 *         price:
 *           type: string
 *           description: 基础价格
 *         author:
 *           type: string
 *           description: 作者
 *         likes:
 *           type: string
 *           description: 喜欢数量
 *         quantity:
 *           type: string
 *           description: 总数量
 *         soldQty:
 *           type: string
 *           description: 已售数量
 *         category:
 *           type: string
 *           description: 分类ID
 *         type:
 *           type: number
 *           enum: [1, 2]
 *           description: 主分类类型(1:普通NFT, 2:盲盒)
 *         typeStr:
 *           type: string
 *           description: 主分类类型描述
 *         status:
 *           type: number
 *           enum: [1, 2, 3, 4, 5, 6, 7, 8]
 *           description: NFT整体状态码(1:未发布, 2:已发布, 3:已售罄, 4:已下架, 5:限时发售, 6:预售, 7:热卖中, 8:即将售罄)
 *         statusStr:
 *           type: string
 *           description: NFT整体状态描述
 *         editions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/NFTEdition'
 *           description: NFT的不同版本/编号
 *         mysteryBoxItems:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nft:
 *                 type: string
 *                 description: 盲盒包含的NFT ID
 *               weight:
 *                 type: number
 *                 description: 该NFT的权重/概率
 *               quantity:
 *                 type: number
 *                 description: 该NFT的数量
 *           description: 盲盒包含的NFT列表(仅当type=2时有效)
 *         openLimit:
 *           type: number
 *           description: 盲盒开启次数限制(仅当type=2时有效)
 *         openedCount:
 *           type: number
 *           description: 已开启次数(仅当type=2时有效)
 */

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
        required: false
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
    type: {
        type: Number,
        enum: [1, 2],
        default: 1,
        description: '主分类类型(1:普通NFT, 2:盲盒)'
    },
    typeStr: {
        type: String,
        enum: ["普通NFT", "盲盒"],
        default: "普通NFT"
    },
    status: {
        type: Number,
        enum: [1, 2, 3, 4, 5, 6, 7, 8],
        default: 1
    },
    statusStr: {
        type: String,
        enum: ["未发布", "已发布", "已售罄", "已下架", "限时发售", "预售", "热卖中", "即将售罄", "未知状态"],
        default: "未发布"
    },
    // 主要NFT拥有者，通常是最初的创建者
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    // NFT的不同版本(子ID)
    editions: [NFTEditionSchema],
    // 盲盒相关字段
    mysteryBoxItems: [MysteryBoxItemSchema],
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 方法：根据状态值自动设置状态描述
NFTSchema.pre('save', function (next) {
    console.log('this.status', this.status)

    // 设置NFT类型描述
    switch (this.type) {
        case 1:
            this.typeStr = "普通NFT";
            break;
        case 2:
            this.typeStr = "盲盒";
            break;
        default:
            this.typeStr = "普通NFT";
    }

    // 设置NFT整体状态描述
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
        case 5:
            this.statusStr = "限时发售";
            break;
        case 6:
            this.statusStr = "预售";
            break;
        case 7:
            this.statusStr = "热卖中";
            break;
        case 8:
            this.statusStr = "即将售罄";
            break;
        default:
            this.statusStr = "未知状态";
    }

    // 确保editions数组中的每一项都有正确的statusStr
    if (this.editions && this.editions.length > 0) {
        this.editions.forEach(edition => {
            switch (edition.status) {
                case 1:
                    edition.statusStr = "未寄售";
                    break;
                case 2:
                    edition.statusStr = "寄售中";
                    break;
                case 3:
                    edition.statusStr = "锁定中";
                    break;
                case 4:
                    edition.statusStr = "已售出";
                    break;
                case 5:
                    edition.statusStr = "已发布";
                    break;
                case 6:
                    edition.statusStr = "空投";
                    break;
                case 7:
                    edition.statusStr = "合成";
                    break;
                default:
                    edition.statusStr = "未知状态";
            }


        });
    }

    next();
});

module.exports = mongoose.model('NFT', NFTSchema);