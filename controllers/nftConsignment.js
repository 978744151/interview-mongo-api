const NFTConsignment = require('../models/NFTConsignment');
const NFTTransaction = require('../models/NFTTransaction');
const NFT = require('../models/nft');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * @swagger
 * tags:
 *   name: NFT寄售
 *   description: NFT寄售相关API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     NFTConsignment:
 *       type: object
 *       properties:
 *         nft:
 *           type: string
 *           description: NFT的ID
 *         seller:
 *           type: string
 *           description: 卖家ID
 *         listingPrice:
 *           type: string
 *           description: 寄售价格
 *         isAvailable:
 *           type: boolean
 *           description: 是否可购买
 */

/**
 * @swagger
 * /nft-consignments:
 *   get:
 *     summary: 获取所有NFT寄售列表
 *     tags: [NFT寄售]
 *     responses:
 *       200:
 *         description: 成功获取寄售列表
 */
exports.getNFTConsignments = asyncHandler(async (req, res, next) => {
  const consignments = await NFTConsignment.find({ isAvailable: true })
    .populate({
      path: 'nft',
      select: 'name imageUrl price author'
    })
    .populate({
      path: 'seller',
      select: 'name'
    });

  res.status(200).json({
    success: true,
    count: consignments.length,
    data: consignments
  });
});

/**
 * @swagger
 * /nft-consignments/{id}:
 *   get:
 *     summary: 获取单个NFT寄售信息
 *     tags: [NFT寄售]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 寄售记录ID
 *     responses:
 *       200:
 *         description: 成功获取寄售信息
 *       404:
 *         description: 未找到寄售记录
 */
exports.getNFTConsignment = asyncHandler(async (req, res, next) => {
  const consignment = await NFTConsignment.findById(req.params.id)
    .populate({
      path: 'nft',
      select: 'name description imageUrl price author quantity'
    })
    .populate({
      path: 'seller',
      select: 'name'
    });

  if (!consignment) {
    return next(new ErrorResponse(`未找到ID为${req.params.id}的寄售NFT`, 404));
  }

  res.status(200).json({
    success: true,
    data: consignment
  });
});

/**
 * @swagger
 * /nft-consignments:
 *   post:
 *     summary: 创建NFT寄售
 *     tags: [NFT寄售]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nft
 *               - listingPrice
 *             properties:
 *               nft:
 *                 type: string
 *                 description: 要寄售的NFT ID
 *               listingPrice:
 *                 type: string
 *                 description: 寄售价格
 *     responses:
 *       201:
 *         description: 成功创建寄售
 *       401:
 *         description: 无权寄售此NFT
 *       404:
 *         description: 未找到NFT
 */
exports.createNFTConsignment = asyncHandler(async (req, res, next) => {
  // 添加用户到请求体
  req.body.seller = req.user.id;

  // 检查NFT是否存在
  const nft = await NFT.findById(req.body.nft);

  if (!nft) {
    return next(new ErrorResponse(`未找到ID为${req.body.nft}的NFT`, 404));
  }

  // 确认用户是NFT所有者
  if (nft.owner.toString() !== req.user.id) {
    return next(new ErrorResponse(`用户${req.user.id}无权寄售此NFT`, 401));
  }

  const consignment = await NFTConsignment.create(req.body);

  res.status(201).json({
    success: true,
    data: consignment
  });
});

/**
 * @swagger
 * /nft-consignments/{id}:
 *   put:
 *     summary: 更新NFT寄售信息
 *     tags: [NFT寄售]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 寄售记录ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               listingPrice:
 *                 type: string
 *                 description: 新的寄售价格
 *     responses:
 *       200:
 *         description: 成功更新寄售信息
 *       401:
 *         description: 无权更新此寄售
 *       404:
 *         description: 未找到寄售记录
 */
exports.updateNFTConsignment = asyncHandler(async (req, res, next) => {
  let consignment = await NFTConsignment.findById(req.params.id);

  if (!consignment) {
    return next(new ErrorResponse(`未找到ID为${req.params.id}的寄售NFT`, 404));
  }

  // 确认用户是寄售NFT的所有者
  if (consignment.seller.toString() !== req.user.id) {
    return next(new ErrorResponse(`用户${req.user.id}无权更新此寄售NFT`, 401));
  }

  consignment = await NFTConsignment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: consignment
  });
});

/**
 * @swagger
 * /nft-consignments/{id}:
 *   delete:
 *     summary: 删除NFT寄售
 *     tags: [NFT寄售]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 寄售记录ID
 *     responses:
 *       200:
 *         description: 成功删除寄售
 *       401:
 *         description: 无权删除此寄售
 *       404:
 *         description: 未找到寄售记录
 */
exports.deleteNFTConsignment = asyncHandler(async (req, res, next) => {
  const consignment = await NFTConsignment.findById(req.params.id);

  if (!consignment) {
    return next(new ErrorResponse(`未找到ID为${req.params.id}的寄售NFT`, 404));
  }

  // 确认用户是寄售NFT的所有者
  if (consignment.seller.toString() !== req.user.id) {
    return next(new ErrorResponse(`用户${req.user.id}无权删除此寄售NFT`, 401));
  }

  await consignment.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @swagger
 * /nft-consignments/{id}/purchase:
 *   post:
 *     summary: 购买NFT
 *     tags: [NFT寄售]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 寄售记录ID
 *     responses:
 *       200:
 *         description: 成功购买NFT
 *       400:
 *         description: NFT已被购买或不能购买自己的NFT
 *       404:
 *         description: 未找到寄售记录或NFT
 */
exports.purchaseNFT = asyncHandler(async (req, res, next) => {
  const consignment = await NFTConsignment.findById(req.params.id);

  if (!consignment) {
    return next(new ErrorResponse(`未找到ID为${req.params.id}的寄售NFT`, 404));
  }

  // 检查NFT是否仍然可购买
  if (!consignment.isAvailable) {
    return next(new ErrorResponse(`此NFT已被购买`, 400));
  }

  // 检查买家不是卖家
  if (consignment.seller.toString() === req.user.id) {
    return next(new ErrorResponse(`您不能购买自己寄售的NFT`, 400));
  }

  // 获取NFT信息
  const nft = await NFT.findById(consignment.nft);

  if (!nft) {
    return next(new ErrorResponse(`未找到相关NFT信息`, 404));
  }

  // 创建交易记录
  const transaction = await NFTTransaction.create({
    nft: consignment.nft,
    consignment: consignment._id,
    seller: consignment.seller,
    buyer: req.user.id,
    price: consignment.listingPrice
  });

  // 更新寄售状态
  consignment.isAvailable = false;
  await consignment.save();

  // 更新NFT所有者
  nft.owner = req.user.id;
  // 更新已售数量
  const soldQty = parseInt(nft.soldQty || '0') + 1;
  nft.soldQty = soldQty.toString();
  await nft.save();

  res.status(200).json({
    success: true,
    data: transaction
  });
}); 