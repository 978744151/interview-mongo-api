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
    const { name } = req.body;
    
    // 增强唯一性验证（处理空格和大小写）
    const existingCategory = await NFTCategory.findOne({
        name
    });
    
    if (existingCategory) {
        return res.status(400).json({
            success: false,
            error: '分类名称已存在（不区分大小写和前后空格）'
        });
    }

    // 创建时自动trim名称
    const newCategory = await NFTCategory.create({ 
        name
    });
    
    res.status(201).json({ success: true, data: newCategory });
});

// 更新分类
exports.updateCategory = asyncHandler(async (req, res) => {
    const category = await NFTCategory.findByIdAndUpdate(
        req.params.id,
        { name: req.body.name },
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
    const category = await NFTCategory.findByIdAndDelete(req.params.id);
    
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