const User = require('../models/User');
const NFT = require('../models/nft');
const NFTTransaction = require('../models/NFTTransaction');
const NFTConsignment = require('../models/NFTConsignment');
const UserPoints = require('../models/UserPoints');
const PointsHistory = require('../models/PointsHistory');
const MysteryBox = require('../models/MysteryBox');
const UserMysteryBox = require('../models/UserMysteryBox');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * @swagger
 * tags:
 *   name: 用户中心
 *   description: 用户个人中心相关API
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: 获取用户个人资料和统计信息
 *     tags: [用户中心]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户资料
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     pointsInfo:
 *                       type: object
 *                     stats:
 *                       type: object
 */
exports.getUserProfile = asyncHandler(async (req, res, next) => {
  // 获取用户基本信息
  const user = await User.findById(req.user.id).select('-password');
  
  // 获取积分信息
  let pointsInfo = await UserPoints.findOne({ user: req.user.id });
  if (!pointsInfo) {
    // 如果用户没有积分记录，创建一个新的
    pointsInfo = await UserPoints.create({ user: req.user.id });
  }
  
  // 获取藏品数量
  const collectionsCount = await NFT.countDocuments({ owner: req.user.id });
  
  // 获取盲盒数量
  const mysteryBoxCount = await UserMysteryBox.countDocuments({ 
    user: req.user.id,
    isOpened: false
  });
  
  // 获取售出记录数量
  const salesCount = await NFTTransaction.countDocuments({ seller: req.user.id });
  
  // 获取当前寄售中的NFT数量
  const consignmentCount = await NFTConsignment.countDocuments({ 
    seller: req.user.id,
    isAvailable: true
  });
  
  res.status(200).json({
    success: true,
    data: {
      user,
      pointsInfo: {
        points: pointsInfo.points,
        consecutiveCheckIns: pointsInfo.consecutiveCheckIns,
        lastCheckIn: pointsInfo.lastCheckIn
      },
      stats: {
        collectionsCount,
        mysteryBoxCount,
        salesCount,
        consignmentCount
      }
    }
  });
});

/**
 * @swagger
 * /profile/check-in:
 *   post:
 *     summary: 用户每日签到
 *     tags: [用户中心]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 签到成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     points:
 *                       type: number
 *                       example: 100
 *                     pointsAdded:
 *                       type: number
 *                       example: 10
 *                     consecutiveCheckIns:
 *                       type: number
 *                       example: 5
 *       400:
 *         description: 今日已签到
 */
exports.checkIn = asyncHandler(async (req, res, next) => {
  // 获取用户积分信息
  let pointsInfo = await UserPoints.findOne({ user: req.user.id });
  if (!pointsInfo) {
    // 如果用户没有积分记录，创建一个新的
    pointsInfo = await UserPoints.create({ user: req.user.id });
  }
  
  // 检查用户今天是否已经签到
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastCheckIn = pointsInfo.lastCheckIn ? new Date(pointsInfo.lastCheckIn) : null;
  
  if (lastCheckIn && lastCheckIn >= today) {
    return next(new ErrorResponse('今天已经签到过了', 400));
  }
  
  // 计算连续签到天数和奖励积分
  let consecutiveCheckIns = pointsInfo.consecutiveCheckIns || 0;
  let pointsToAdd = 10; // 基础签到积分
  
  // 如果昨天也签到了，增加连续签到天数
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (lastCheckIn && lastCheckIn >= yesterday) {
    consecutiveCheckIns += 1;
    
    // 根据连续签到天数给予额外奖励
    if (consecutiveCheckIns % 7 === 0) {
      // 每连续签到7天额外奖励
      pointsToAdd += 30;
    } else if (consecutiveCheckIns % 30 === 0) {
      // 每连续签到30天额外奖励
      pointsToAdd += 100;
    }
  } else {
    // 重置连续签到天数
    consecutiveCheckIns = 1;
  }
  
  // 更新积分和签到信息
  pointsInfo.points += pointsToAdd;
  pointsInfo.lastCheckIn = new Date();
  pointsInfo.consecutiveCheckIns = consecutiveCheckIns;
  await pointsInfo.save();
  
  // 记录积分历史
  await PointsHistory.create({
    user: req.user.id,
    points: pointsToAdd,
    type: 'check_in',
    description: `第${consecutiveCheckIns}天连续签到奖励`
  });
  
  res.status(200).json({
    success: true,
    data: {
      points: pointsInfo.points,
      pointsAdded: pointsToAdd,
      consecutiveCheckIns,
      lastCheckIn: pointsInfo.lastCheckIn
    }
  });
});

/**
 * @swagger
 * /profile/points-history:
 *   get:
 *     summary: 获取用户积分历史
 *     tags: [用户中心]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取积分历史
 */
exports.getPointsHistory = asyncHandler(async (req, res, next) => {
  const history = await PointsHistory.find({ user: req.user.id })
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: history.length,
    data: history
  });
});

/**
 * @swagger
 * /profile/collections:
 *   get:
 *     summary: 获取用户收藏的NFT
 *     tags: [用户中心]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户藏品
 */
exports.getUserCollections = asyncHandler(async (req, res, next) => {
  const collections = await NFT.find({ owner: req.user.id })
    .populate({
      path: 'category',
      select: 'name'
    });
  
  res.status(200).json({
    success: true,
    count: collections.length,
    data: collections
  });
});

/**
 * @swagger
 * /profile/mystery-boxes:
 *   get:
 *     summary: 获取用户的盲盒
 *     tags: [用户中心]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户盲盒
 */
exports.getUserMysteryBoxes = asyncHandler(async (req, res, next) => {
  const mysteryBoxes = await UserMysteryBox.find({ 
    user: req.user.id,
    isOpened: false
  }).populate({
    path: 'mysteryBox',
    select: 'name imageUrl description price'
  });
  
  res.status(200).json({
    success: true,
    count: mysteryBoxes.length,
    data: mysteryBoxes
  });
});

/**
 * @swagger
 * /profile/mystery-boxes/{id}/open:
 *   post:
 *     summary: 打开盲盒
 *     tags: [用户中心]
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
 *         description: 成功打开盲盒
 *       404:
 *         description: 未找到盲盒或已被打开
 */
exports.openMysteryBox = asyncHandler(async (req, res, next) => {
  // 查找用户的盲盒
  const userMysteryBox = await UserMysteryBox.findOne({ 
    _id: req.params.id,
    user: req.user.id,
    isOpened: false
  });
  
  if (!userMysteryBox) {
    return next(new ErrorResponse('未找到此盲盒或已被打开', 404));
  }
  
  // 获取盲盒详情
  const mysteryBox = await MysteryBox.findById(userMysteryBox.mysteryBox)
    .populate({
      path: 'possibleNFTs.nft',
      select: 'name imageUrl description price'
    });
  
  if (!mysteryBox) {
    return next(new ErrorResponse('盲盒信息不存在', 404));
  }
  
  // 随机选择NFT
  const possibleNFTs = mysteryBox.possibleNFTs;
  let totalProbability = 0;
  
  // 计算总概率
  possibleNFTs.forEach(item => {
    totalProbability += item.probability;
  });
  
  // 确保总概率为100
  if (totalProbability !== 100) {
    totalProbability = 100;
  }
  
  // 随机数生成
  const random = Math.random() * totalProbability;
  let cumulativeProbability = 0;
  let selectedNFT = null;
  
  // 根据概率选择NFT
  for (const item of possibleNFTs) {
    cumulativeProbability += item.probability;
    if (random <= cumulativeProbability) {
      selectedNFT = item.nft;
      break;
    }
  }
  
  // 如果出现意外，使用第一个NFT
  if (!selectedNFT && possibleNFTs.length > 0) {
    selectedNFT = possibleNFTs[0].nft;
  }
  
  if (!selectedNFT) {
    return next(new ErrorResponse('盲盒内没有可用的NFT', 400));
  }
  
  // 为用户创建新的NFT
  const newNFT = await NFT.create({
    name: selectedNFT.name,
    description: selectedNFT.description,
    category: selectedNFT.category,
    imageUrl: selectedNFT.imageUrl,
    price: selectedNFT.price,
    author: selectedNFT.author,
    quantity: '1',
    soldQty: '0',
    owner: req.user.id
  });
  
  // 更新用户盲盒状态
  userMysteryBox.isOpened = true;
  userMysteryBox.receivedNFT = newNFT._id;
  userMysteryBox.openedAt = new Date();
  await userMysteryBox.save();
  
  res.status(200).json({
    success: true,
    data: {
      mysteryBox: {
        _id: userMysteryBox._id,
        name: mysteryBox.name
      },
      receivedNFT: newNFT
    }
  });
});

/**
 * @swagger
 * /profile/sales:
 *   get:
 *     summary: 获取用户售出记录
 *     tags: [用户中心]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取售出记录
 */
exports.getUserSales = asyncHandler(async (req, res, next) => {
  const sales = await NFTTransaction.find({ seller: req.user.id })
    .populate({
      path: 'nft',
      select: 'name imageUrl price'
    })
    .populate({
      path: 'buyer',
      select: 'name'
    })
    .sort({ transactionDate: -1 });
  
  res.status(200).json({
    success: true,
    count: sales.length,
    data: sales
  });
});

/**
 * @swagger
 * /profile/consignments:
 *   get:
 *     summary: 获取当前寄售中的NFT
 *     tags: [用户中心]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取寄售中的NFT
 */
exports.getUserConsignments = asyncHandler(async (req, res, next) => {
  const consignments = await NFTConsignment.find({ 
    seller: req.user.id,
    isAvailable: true
  }).populate({
    path: 'nft',
    select: 'name imageUrl price'
  });
  
  res.status(200).json({
    success: true,
    count: consignments.length,
    data: consignments
  });
}); 