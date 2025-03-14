// const NFT = require('../models/nft');
// const NFTCategory = require('../models/nftCategory');
// const asyncHandler = require("../middleware/async");

// // 获取NFT列表（支持分类过滤）
// exports.getNFTs = asyncHandler(async (req, res) => {
//     const { category } = req.query;
//     const query = {};
    
//     if (category) {
//         query.category = category;
//     }

//     const nfts = await NFT.find(query)
//         .populate('category', 'name')
//         .populate('owner', 'name email');

//     res.status(200).json({
//         success: true,
//         count: nfts.length,
//         data: nfts
//     });
// });

// // 创建NFT
// exports.createNFT = asyncHandler(async (req, res) => {
//     // 验证分类是否存在
//     const category = await NFTCategory.findById(req.body.category);
//     if (!category) {
//         return res.status(404).json({
//             success: false,
//             message: '分类不存在'
//         });
//     }

//     const nft = await NFT.create({
//         ...req.body,
//         owner: req.user.id
//     });

//     res.status(201).json({
//         success: true,
//         data: nft
//     });
// });

// // 其他CRUD操作（更新、删除、获取单个NFT）...
// // [可根据需要添加剩余方法]