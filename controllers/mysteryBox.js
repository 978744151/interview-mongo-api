const MysteryBox = require('../models/MysteryBox');
const UserMysteryBox = require('../models/UserMysteryBox');
const NFT = require('../models/nft');
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
  const mysteryBoxes = await MysteryBox.find({ status: 2 });
  
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
  // 添加创建者ID
  req.body.creator = req.user.id;
  
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
  
  // 检查是否是创建者或管理员
  if (mysteryBox.creator.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('没有权限更新此盲盒', 403));
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
  
  // 检查是否是创建者或管理员
  if (mysteryBox.creator.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('没有权限删除此盲盒', 403));
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
  
  // 检查盲盒状态
  if (mysteryBox.status !== 2) {
    return next(new ErrorResponse('此盲盒未发布或已下架', 400));
  }
  
  // 检查盲盒数量
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

/**
 * @swagger
 * /mystery-boxes/{id}/open:
 *   post:
 *     summary: 开启盲盒
 *     tags: [盲盒]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 用户盲盒ID
 *     responses:
 *       200:
 *         description: 成功开启盲盒
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     nft:
 *                       $ref: '#/components/schemas/NFT'
 *                     edition:
 *                       $ref: '#/components/schemas/NFTEdition'
 *       400:
 *         description: 盲盒已开启
 *       404:
 *         description: 未找到盲盒
 */
exports.openMysteryBox = asyncHandler(async (req, res, next) => {
    // 查找用户盲盒
    const userMysteryBox = await UserMysteryBox.findById(req.params.id).populate('mysteryBox');
    
    if (!userMysteryBox) {
        return next(new ErrorResponse(`未找到ID为${req.params.id}的用户盲盒`, 404));
    }

    // 检查是否为当前用户的盲盒
    if (userMysteryBox.user.toString() !== req.user.id) {
        return next(new ErrorResponse('没有权限开启此盲盒', 403));
    }

    // 检查盲盒是否已开启
    if (userMysteryBox.opened) {
        return next(new ErrorResponse('此盲盒已开启', 400));
    }

    const mysteryBox = userMysteryBox.mysteryBox;
    
    // 检查盲盒中是否有可用的NFT
    if (!mysteryBox.items || mysteryBox.items.length === 0) {
        return next(new ErrorResponse('该盲盒中没有可用的NFT', 400));
    }

    // 计算总权重
    let availableItems = mysteryBox.items.filter(item => item.remainingQuantity > 0);
    
    if (availableItems.length === 0) {
        return next(new ErrorResponse('盲盒中所有NFT已售罄', 400));
    }
    
    const totalWeight = availableItems.reduce((sum, item) => sum + item.weight, 0);
    
    // 随机选择一个NFT
    let random = Math.random() * totalWeight;
    let selectedItem = null;
    
    for (const item of availableItems) {
        random -= item.weight;
        if (random <= 0) {
            selectedItem = item;
            break;
        }
    }

    if (!selectedItem) {
        return next(new ErrorResponse('选择NFT失败', 500));
    }

    // 获取选中的NFT
    const selectedNFT = await NFT.findById(selectedItem.nft);
    
    if (!selectedNFT) {
        return next(new ErrorResponse('未找到选中的NFT', 404));
    }

    // 创建新的NFT版本
    const edition = {
        sub_id: `${selectedNFT.editions.length + 1}`.padStart(3, '0'),
        status: 1,
        statusStr: '未寄售',
        owner: req.user.id
    };

    // 更新选中的NFT
    selectedNFT.editions.push(edition);
    await selectedNFT.save();

    // 减少盲盒中NFT的剩余数量
    selectedItem.remainingQuantity -= 1;
    await mysteryBox.save();

    // 更新盲盒开启记录
    userMysteryBox.opened = true;
    userMysteryBox.openedAt = Date.now();
    userMysteryBox.nftReceived = selectedNFT._id;
    userMysteryBox.editionReceived = edition.sub_id;
    await userMysteryBox.save();
    
    // 更新盲盒开启次数
    mysteryBox.openedCount += 1;
    await mysteryBox.save();

    res.status(200).json({
        success: true,
        data: {
            nft: selectedNFT,
            edition: edition
        }
    });
});

/**
 * @swagger
 * /mystery-boxes/user:
 *   get:
 *     summary: 获取用户的盲盒
 *     tags: [盲盒]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户盲盒列表
 */
exports.getUserMysteryBoxes = asyncHandler(async (req, res, next) => {
    const userMysteryBoxes = await UserMysteryBox.find({ user: req.user.id })
        .populate('mysteryBox')
        .populate('nftReceived');
    
    res.status(200).json({
        success: true,
        count: userMysteryBoxes.length,
        data: userMysteryBoxes
    });
}); 