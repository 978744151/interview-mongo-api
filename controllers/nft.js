const NFT = require('../models/nft');
const NFTCategory = require('../models/nftCategory');
const asyncHandler = require("../middleware/async");

// 获取NFT列表（支持分类过滤）
exports.getNFTs = asyncHandler(async (req, res) => {
    const { category } = req.query;
    const query = {};

    if (category) {
        query.category = category;
    }

    const nfts = await NFT.find(query)
        .populate('category', 'name')
        .populate('owner', 'name email');

    res.status(200).json({
        success: true,

        data: { ...res.advancedResults }
    });
});

// 创建NFT
exports.createNFT = asyncHandler(async (req, res) => {
    // 验证分类是否存在
    const category = await NFTCategory.findById(req.body.category);
    if (!category) {
        return res.status(404).json({
            success: false,
            message: '分类不存在'
        });
    }

    const nft = await NFT.create({
        ...req.body,
        owner: req.user.id
    });

    res.status(200).json({
        success: true,
        data: nft
    });
});

// 获取单个NFT
exports.getNFT = asyncHandler(async (req, res) => {
    const nft = await NFT.findById(req.params.id)
        .populate('category', 'name')
        .populate('owner', 'name email');

    if (!nft) {
        return res.status(404).json({
            success: false,
            message: 'NFT未找到'
        });
    }

    res.status(200).json({
        success: true,
        data: nft
    });
});

// 更新NFT
exports.updateNFT = asyncHandler(async (req, res) => {
    let nft = await NFT.findById(req.params.id);

    if (!nft) {
        return res.status(404).json({
            success: false,
            message: 'NFT未找到'
        });
    }

    // 验证操作者是所有者
    if (nft.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: '无权修改该NFT'
        });
    }

    nft = await NFT.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: nft
    });
});

// 删除NFT
exports.deleteNFT = asyncHandler(async (req, res) => {
    const nft = await NFT.findById(req.params.id);

    if (!nft) {
        return res.status(404).json({
            success: false,
            message: 'NFT未找到'
        });
    }

    // 验证操作权限
    if (nft.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: '无权删除该NFT'
        });
    }

    await nft.remove();

    res.status(200).json({
        success: true,
        message: 'NFT已删除'
    });
});