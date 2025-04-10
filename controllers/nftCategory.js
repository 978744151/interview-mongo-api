const NFTCategory = require('../models/nftCategory');
const asyncHandler = require("../middleware/async");

// 获取全部分类
exports.getCategories = asyncHandler(async (req, res) => {
    const categories = await NFTCategory.find().sort({ createdAt: -1 });
    console.log(categories)
    res.status(200).json({
        success: true,
        count: categories.length,
        data: categories
    });
});

// 获取单个分类
exports.getCategoryById = asyncHandler(async (req, res) => {
    const category = await NFTCategory.findById(req.params.id);
    if (!category) {
        return res.status(404).json({
            success: false,
            error: '分类未找到'
        });
    }
    res.status(200).json({ success: true, data: category });
});

// 创建分类
exports.createCategory = asyncHandler(async (req, res) => {
    const { name, cover } = req.body; // 新增cover参数

    const existingCategory = await NFTCategory.findOne({ name });
    if (existingCategory) {
        return res.status(400).json({
            success: false,
            error: '分类名称已存在'
        });
    }

    const newCategory = await NFTCategory.create({
        name,
        cover // 新增封面字段
    });

    res.status(200).json({ success: true, data: newCategory });
});

// 更新分类
exports.updateCategory = asyncHandler(async (req, res) => {
    const category = await NFTCategory.findByIdAndUpdate(
        req.body.id,
        {
            name: req.body.name,
            cover: req.body.cover // 新增封面更新
        },
        { new: true, runValidators: true }
    );

    if (!category) {
        return res.status(404).json({
            success: false,
            message: '分类未找到'
        });
    }
    res.status(200).json({ success: true, data: category });
});

// 删除分类
exports.deleteCategory = asyncHandler(async (req, res) => {
    const category = await NFTCategory.findByIdAndDelete(req.body.id);

    if (!category) {
        return res.status(404).json({
            success: false,
            message: '分类未找到'
        });
    }

    // 检查是否有NFT关联该分类
    // const nftCount = await NFT.countDocuments({ category: req.params.id });
    // if (nftCount > 0) {
    //     return res.status(400).json({
    //         success: false,
    //         message: '该分类下存在NFT，无法删除'
    //     });
    // }

    res.status(200).json({
        success: true,
        message: '分类已删除'
    });
});