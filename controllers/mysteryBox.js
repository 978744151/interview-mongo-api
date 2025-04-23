const MysteryBox = require('../models/MysteryBox');
const UserMysteryBox = require('../models/UserMysteryBox');
const UserPoints = require('../models/UserPoints');
const PointsHistory = require('../models/PointsHistory');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * @swagger
 * tags:
 *   name: 盲盒
 *   description: 盲盒相关API
 */

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
 *           type: string
 *           description: 盲盒价格
 *         totalQuantity:
 *           type: number
 *           description: 总数量
 *         soldQuantity:
 *           type: number
 *           description: 已售数量
 *         isActive:
 *           type: boolean
 *           description: 是否上架
 */

/**
 * @swagger
 * /mystery-boxes:
 *   get:
 *     summary: 获取所有盲盒
 *     tags: [盲盒]
 *     responses:
 *       200:
 *         description: 成功获取盲盒列表
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
 *                     $ref: '#/components/schemas/MysteryBox'
 */
exports.getMysteryBoxes = asyncHandler(async (req, res, next) => {
  const mysteryBoxes = await MysteryBox.find({ isActive: true });
  
  res.status(200).json({
    success: true,
    count: mysteryBoxes.length,
    data: mysteryBoxes
  });
});

/**
 * @swagger
 * /mystery-boxes/{id}:
 *   get:
 *     summary: 获取单个盲盒
 *     tags: [盲盒]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 盲盒ID
 *     responses:
 *       200:
 *         description: 成功获取盲盒详情
 *       404:
 *         description: 未找到盲盒
 */
exports.getMysteryBox = asyncHandler(async (req, res, next) => {
  const mysteryBox = await MysteryBox.findById(req.params.id);
  
  if (!mysteryBox) {
    return next(new ErrorResponse(`未找到ID为${req.params.id}的盲盒`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: mysteryBox
  });
});

/**
 * @swagger
 * /mystery-boxes:
 *   post:
 *     summary: 创建盲盒
 *     tags: [盲盒]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MysteryBox'
 *     responses:
 *       201:
 *         description: 成功创建盲盒
 */
exports.createMysteryBox = asyncHandler(async (req, res, next) => {
  const mysteryBox = await MysteryBox.create(req.body);
  
  res.status(201).json({
    success: true,
    data: mysteryBox
  });
});

/**
 * @swagger
 * /mystery-boxes/{id}:
 *   put:
 *     summary: 更新盲盒
 *     tags: [盲盒]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 盲盒ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MysteryBox'
 *     responses:
 *       200:
 *         description: 成功更新盲盒
 *       404:
 *         description: 未找到盲盒
 */
exports.updateMysteryBox = asyncHandler(async (req, res, next) => {
  let mysteryBox = await MysteryBox.findById(req.params.id);
  
  if (!mysteryBox) {
    return next(new ErrorResponse(`未找到ID为${req.params.id}的盲盒`, 404));
  }
  
  mysteryBox = await MysteryBox.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: mysteryBox
  });
});

/**
 * @swagger
 * /mystery-boxes/{id}:
 *   delete:
 *     summary: 删除盲盒
 *     tags: [盲盒]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 盲盒ID
 *     responses:
 *       200:
 *         description: 成功删除盲盒
 *       404:
 *         description: 未找到盲盒
 */
exports.deleteMysteryBox = asyncHandler(async (req, res, next) => {
  const mysteryBox = await MysteryBox.findById(req.params.id);
  
  if (!mysteryBox) {
    return next(new ErrorResponse(`未找到ID为${req.params.id}的盲盒`, 404));
  }
  
  await mysteryBox.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @swagger
 * /mystery-boxes/{id}/purchase:
 *   post:
 *     summary: 购买盲盒
 *     tags: [盲盒]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 盲盒ID
 *     responses:
 *       200:
 *         description: 成功购买盲盒
 *       404:
 *         description: 未找到盲盒
 *       400:
 *         description: 盲盒已下架或售罄
 */
exports.purchaseMysteryBox = asyncHandler(async (req, res, next) => {
  const mysteryBox = await MysteryBox.findById(req.params.id);
  
  if (!mysteryBox) {
    return next(new ErrorResponse(`未找到ID为${req.params.id}的盲盒`, 404));
  }
  
  if (!mysteryBox.isActive) {
    return next(new ErrorResponse('此盲盒已下架', 400));
  }
  
  if (mysteryBox.soldQuantity >= mysteryBox.totalQuantity) {
    return next(new ErrorResponse('此盲盒已售罄', 400));
  }
  
  // 创建用户盲盒记录
  const userMysteryBox = await UserMysteryBox.create({
    user: req.user.id,
    mysteryBox: mysteryBox._id
  });
  
  // 更新盲盒售出数量
  mysteryBox.soldQuantity += 1;
  await mysteryBox.save();
  
  // 记录积分 (购买盲盒奖励积分)
  const pointsToAdd = 5;
  
  // 更新用户积分
  let pointsInfo = await UserPoints.findOne({ user: req.user.id });
  if (!pointsInfo) {
    pointsInfo = await UserPoints.create({ 
      user: req.user.id,
      points: pointsToAdd
    });
  } else {
    pointsInfo.points += pointsToAdd;
    await pointsInfo.save();
  }
  
  // 记录积分历史
  await PointsHistory.create({
    user: req.user.id,
    points: pointsToAdd,
    type: 'purchase',
    description: `购买盲盒 ${mysteryBox.name} 奖励`
  });
  
  res.status(200).json({
    success: true,
    data: {
      userMysteryBox,
      pointsAdded: pointsToAdd
    }
  });
}); 