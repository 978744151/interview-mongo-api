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
  const mysteryBoxes = await MysteryBox.find({});

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
exports.createMysteryBox = async (req, res) => {
  try {
    const {
      name,
      description,
      imageUrl,
      price,
      totalQuantity,
      openLimit,
      status,
      items
    } = req.body;

    // 验证必填字段
    if (!name || !imageUrl || !price || !totalQuantity || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供所有必填字段'
      });
    }

    // 创建盲盒实例
    const editions = [];
    for (let i = 0; i < totalQuantity; i++) {
      const sub_id = String(i).padStart(3, '0');
      editions.push({
        sub_id: `${i + 1}`.padStart(3, '0'),  // 001, 002, 003...
        status: 3,
        statusStr: "锁定中",
        owner: req.user.id,
        price: price,
        blockchain_id: `${sub_id}-${Date.now()}`
      });
    }

    // 创建盲盒
    const mysteryBox = await MysteryBox.create({
      name,
      description,
      imageUrl,
      price,
      totalQuantity,
      soldQuantity: 0,
      openLimit: openLimit || 0,
      status: status || 1,
      items: items.map(item => ({
        nft: item.nft,
        weight: item.weight,
        quantity: item.quantity,
        remainingQuantity: item.quantity
      })),
      editions: editions,
      createdBy: req.user._id,
      owner: req.user.id // 初始拥有者是创建者
    });

    res.status(201).json({
      success: true,
      data: mysteryBox
    });
  } catch (error) {
    console.error('Error creating mystery box:', error);
    res.status(500).json({
      success: false,
      message: '创建盲盒失败',
      error: error.message
    });
  }
};

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
  if (mysteryBox.owner && mysteryBox.owner.toString() !== req.user.id && req.user.role !== 'admin') {
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
  if (mysteryBox.owner && mysteryBox.owner.toString() !== req.user.id && req.user.role !== 'admin') {
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
  
  // 找到一个可以购买的盲盒实例（状态为"已发布"的）
  const availableEditionIndex = mysteryBox.editions.findIndex(
    edition => edition.status === 5
  );
  
  if (availableEditionIndex === -1) {
    return next(new ErrorResponse('没有可购买的盲盒实例', 400));
  }
  
  // 更新盲盒实例的所有者
  const purchasedEdition = mysteryBox.editions[availableEditionIndex];
  
  // 记录交易历史
  purchasedEdition.transaction_history.push({
    date: Date.now(),
    from: mysteryBox.owner ? mysteryBox.owner.toString() : '系统',
    to: req.user.id,
    price: mysteryBox.price
  });
  
  // 更新所有者和状态
  purchasedEdition.owner = req.user.id;
  purchasedEdition.status = 1; // 设置为"未寄售"状态
  purchasedEdition.statusStr = "未寄售";
  
  // 创建用户盲盒记录
  const userMysteryBox = await UserMysteryBox.create({
    user: req.user.id,
    mysteryBox: mysteryBox._id,
    edition: purchasedEdition.sub_id
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
      edition: purchasedEdition,
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
    
    // 查找对应的盲盒实例
    const mysteryBoxFull = await MysteryBox.findById(mysteryBox._id);
    const editionIndex = mysteryBoxFull.editions.findIndex(
        edition => edition.sub_id === userMysteryBox.edition && edition.owner.toString() === req.user.id
    );
    
    if (editionIndex === -1) {
        return next(new ErrorResponse('找不到对应的盲盒实例', 404));
    }

    // 检查盲盒开启次数限制
    if (mysteryBoxFull.openLimit > 0 && mysteryBoxFull.openedCount >= mysteryBoxFull.openLimit) {
        return next(new ErrorResponse('此盲盒已达到开启次数上限', 400));
    }

    // 检查盲盒中是否有可用的NFT
    if (!mysteryBoxFull.items || mysteryBoxFull.items.length === 0) {
        return next(new ErrorResponse('该盲盒中没有可用的NFT', 400));
    }

    // 计算总权重
    let availableItems = mysteryBoxFull.items.filter(item => item.remainingQuantity > 0);
    
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
    
    // 更新盲盒实例状态 - 标记为已使用
    mysteryBoxFull.editions[editionIndex].status = 4; // 设置为已使用状态
    mysteryBoxFull.editions[editionIndex].statusStr = "已使用";
    
    // 更新盲盒开启记录
    userMysteryBox.opened = true;
    userMysteryBox.openedAt = Date.now();
    userMysteryBox.nftReceived = selectedNFT._id;
    userMysteryBox.editionReceived = edition.sub_id;
    await userMysteryBox.save();
    
    // 更新盲盒开启次数
    mysteryBoxFull.openedCount += 1;
    await mysteryBoxFull.save();

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

/**
 * @swagger
 * /mystery-boxes/{id}/editions/{editionId}:
 *   put:
 *     summary: 更新盲盒实例状态
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
 *       - in: path
 *         name: editionId
 *         schema:
 *           type: string
 *         required: true
 *         description: 盲盒实例ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: integer
 *                 enum: [1, 2, 3, 4, 5, 6, 7]
 *               price:
 *                 type: string
 *     responses:
 *       200:
 *         description: 成功更新盲盒实例状态
 *       404:
 *         description: 未找到盲盒或实例
 */
exports.updateMysteryBoxEdition = asyncHandler(async (req, res, next) => {
  const mysteryBox = await MysteryBox.findById(req.params.id);
  
  if (!mysteryBox) {
    return next(new ErrorResponse(`未找到ID为${req.params.id}的盲盒`, 404));
  }
  
  // 检查是否是创建者或管理员
  if (mysteryBox.owner && mysteryBox.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('没有权限更新此盲盒实例', 403));
  }
  
  // 查找对应的盲盒实例
  const editionIndex = mysteryBox.editions.findIndex(edition => 
    edition.sub_id === req.params.editionId
  );
  
  if (editionIndex === -1) {
    return next(new ErrorResponse(`未找到盲盒实例 ${req.params.editionId}`, 404));
  }
  
  // 更新状态
  if (req.body.status) {
    mysteryBox.editions[editionIndex].status = req.body.status;
    
    // 根据状态设置状态描述
    const statusMap = {
      1: '未寄售',
      2: '寄售中',
      3: '锁定中',
      4: '已售出',
      5: '已发布',
      6: '空投',
      7: '合成',
    };
    
    mysteryBox.editions[editionIndex].statusStr = statusMap[req.body.status] || '未知状态';
  }
  
  // 更新价格
  if (req.body.price) {
    mysteryBox.editions[editionIndex].price = req.body.price;
  }
  
  await mysteryBox.save();
  
  res.status(200).json({
    success: true,
    data: mysteryBox.editions[editionIndex]
  });
});

/**
 * @swagger
 * /mystery-boxes/{id}/status:
 *   put:
 *     summary: 更新盲盒状态
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
 *             type: object
 *             properties:
 *               status:
 *                 type: integer
 *                 enum: [1, 2, 3, 4, 5, 6, 7, 8]
 *     responses:
 *       200:
 *         description: 成功更新盲盒状态
 *       404:
 *         description: 未找到盲盒
 */
exports.updateMysteryBoxStatus = asyncHandler(async (req, res, next) => {
  let mysteryBox = await MysteryBox.findById(req.params.id);
  
  if (!mysteryBox) {
    return next(new ErrorResponse(`未找到ID为${req.params.id}的盲盒`, 404));
  }
  
  // 检查是否是创建者或管理员
  if (mysteryBox.owner && mysteryBox.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('没有权限更新此盲盒状态', 403));
  }
  
  // 仅更新状态
  if (!req.body.status || ![1, 2, 3, 4, 5, 6, 7, 8].includes(Number(req.body.status))) {
    return next(new ErrorResponse('请提供有效的状态值', 400));
  }
  
  mysteryBox.status = req.body.status;
  
  // 根据状态设置状态描述
  const statusMap = {
    1: '未发布',
    2: '已发布',
    3: '已售罄',
    4: '已下架',
    5: '限时发售',
    6: '预售',
    7: '热卖中',
    8: '即将售罄'
  };
  
  mysteryBox.statusStr = statusMap[req.body.status];
  
  // 如果盲盒状态设置为已发布(2)，则将所有editions的状态设置为已发布(5)
  if (Number(req.body.status) === 2 && mysteryBox.editions && mysteryBox.editions.length > 0) {
    mysteryBox.editions.forEach(edition => {
      // 只更新状态为未寄售(1)和锁定中(3)的实例
      if (edition.status === 1 || edition.status === 3) {
        edition.status = 5; // 设置为已发布状态
        edition.statusStr = '已发布';
      }
    });
  }
  
  // 如果盲盒状态设置为已下架(4)，则将所有已发布状态的editions改为未寄售(1)
  if (Number(req.body.status) === 1 && mysteryBox.editions && mysteryBox.editions.length > 0) {
    mysteryBox.editions.forEach(edition => {
      // 只更新状态为已发布(5)的实例
      if (edition.status === 5) {
        edition.status = 3; // 设置为未寄售状态
        edition.statusStr = '锁定中';
      }
    });
  }
  
  await mysteryBox.save();
  
  res.status(200).json({
    success: true,
    data: mysteryBox
  });
}); 