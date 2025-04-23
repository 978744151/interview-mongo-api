const NFTCategory = require('../models/nftCategory');
const asyncHandler = require("../middleware/async");

/**
 * @swagger
 * tags:
 *   name: NFT分类
 *   description: NFT分类管理相关API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     NFTCategory:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: 分类名称
 *         cover:
 *           type: string
 *           description: 分类封面图URL
 *       example:
 *         name: "艺术品"
 *         cover: "https://example.com/art.jpg"
 */

/**
 * @swagger
 * /nft-categories:
 *   get:
 *     summary: 获取全部分类
 *     tags: [NFT分类]
 *     responses:
 *       200:
 *         description: 成功获取全部分类
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NFTCategory'
 */
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

/**
 * @swagger
 * /nft-categories/{id}:
 *   get:
 *     summary: 获取单个分类
 *     tags: [NFT分类]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 分类ID
 *     responses:
 *       200:
 *         description: 成功获取分类详情
 *       404:
 *         description: 分类未找到
 */
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

/**
 * @swagger
 * /nft-categories:
 *   post:
 *     summary: 创建分类
 *     tags: [NFT分类]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: 分类名称
 *               cover:
 *                 type: string
 *                 description: 分类封面图URL
 *     responses:
 *       200:
 *         description: 分类创建成功
 *       400:
 *         description: 分类名称已存在
 */
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

/**
 * @swagger
 * /nft-categories:
 *   put:
 *     summary: 更新分类
 *     tags: [NFT分类]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *             properties:
 *               id:
 *                 type: string
 *                 description: 分类ID
 *               name:
 *                 type: string
 *                 description: 分类名称
 *               cover:
 *                 type: string
 *                 description: 分类封面图URL
 *     responses:
 *       200:
 *         description: 分类更新成功
 *       404:
 *         description: 分类未找到
 */
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

/**
 * @swagger
 * /nft-categories:
 *   delete:
 *     summary: 删除分类
 *     tags: [NFT分类]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: 分类ID
 *     responses:
 *       200:
 *         description: 分类已删除
 *       404:
 *         description: 分类未找到
 */
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