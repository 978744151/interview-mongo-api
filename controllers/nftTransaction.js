const NFTTransaction = require('../models/NFTTransaction');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * @swagger
 * tags:
 *   name: NFT交易
 *   description: NFT交易记录相关API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     NFTTransaction:
 *       type: object
 *       properties:
 *         nft:
 *           type: string
 *           description: NFT的ID
 *         consignment:
 *           type: string
 *           description: 寄售记录ID
 *         seller:
 *           type: string
 *           description: 卖家ID
 *         buyer:
 *           type: string
 *           description: 买家ID
 *         price:
 *           type: string
 *           description: 成交价格
 *         transactionDate:
 *           type: string
 *           format: date-time
 *           description: 交易时间
 */

/**
 * @swagger
 * /nft-transactions:
 *   get:
 *     summary: 获取所有交易记录
 *     tags: [NFT交易]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取交易记录
 */
exports.getTransactions = asyncHandler(async (req, res, next) => {
  const transactions = await NFTTransaction.find()
    .populate({
      path: 'nft',
      select: 'name imageUrl price'
    })
    .populate({
      path: 'seller',
      select: 'name'
    })
    .populate({
      path: 'buyer',
      select: 'name'
    });

  res.status(200).json({
    success: true,
    count: transactions.length,
    data: transactions
  });
});

/**
 * @swagger
 * /nft-transactions/{id}:
 *   get:
 *     summary: 获取单个交易记录
 *     tags: [NFT交易]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 交易记录ID
 *     responses:
 *       200:
 *         description: 成功获取交易记录
 *       404:
 *         description: 未找到交易记录
 */
exports.getTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await NFTTransaction.findById(req.params.id)
    .populate({
      path: 'nft',
      select: 'name description imageUrl price author'
    })
    .populate({
      path: 'seller',
      select: 'name'
    })
    .populate({
      path: 'buyer',
      select: 'name'
    });

  if (!transaction) {
    return next(new ErrorResponse(`未找到ID为${req.params.id}的交易记录`, 404));
  }

  res.status(200).json({
    success: true,
    data: transaction
  });
});

/**
 * @swagger
 * /nft-transactions/my-purchases:
 *   get:
 *     summary: 获取用户的购买记录
 *     tags: [NFT交易]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取购买记录
 */
exports.getMyPurchases = asyncHandler(async (req, res, next) => {
  const transactions = await NFTTransaction.find({ buyer: req.user.id })
    .populate({
      path: 'nft',
      select: 'name imageUrl price'
    })
    .populate({
      path: 'seller',
      select: 'name'
    });

  res.status(200).json({
    success: true,
    count: transactions.length,
    data: transactions
  });
});

/**
 * @swagger
 * /nft-transactions/my-sales:
 *   get:
 *     summary: 获取用户的销售记录
 *     tags: [NFT交易]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取销售记录
 */
exports.getMySales = asyncHandler(async (req, res, next) => {
  const transactions = await NFTTransaction.find({ seller: req.user.id })
    .populate({
      path: 'nft',
      select: 'name imageUrl price'
    })
    .populate({
      path: 'buyer',
      select: 'name'
    });

  res.status(200).json({
    success: true,
    count: transactions.length,
    data: transactions
  });
}); 