const NFTTransaction = require('../models/NFTTransaction');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    获取所有交易记录
// @route   GET /api/v1/nft-transactions
// @access  Private/Admin
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

// @desc    获取单个交易记录
// @route   GET /api/v1/nft-transactions/:id
// @access  Private/Admin
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

// @desc    获取用户的购买记录
// @route   GET /api/v1/nft-transactions/my-purchases
// @access  Private
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

// @desc    获取用户的销售记录
// @route   GET /api/v1/nft-transactions/my-sales
// @access  Private
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