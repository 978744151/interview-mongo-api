const NFT = require('../models/nft');
const NFTCategory = require('../models/nftCategory');
const asyncHandler = require("../middleware/async");

/**
 * @swagger
 * tags:
 *   name: NFT
 *   description: NFT管理相关API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     NFT:
 *       type: object
 *       required:
 *         - name
 *         - imageUrl
 *         - price
 *         - category
 *       properties:
 *         name:
 *           type: string
 *           description: NFT名称
 *         description:
 *           type: string
 *           description: NFT描述
 *         imageUrl:
 *           type: string
 *           description: 图片URL
 *         price:
 *           type: string
 *           description: 价格
 *         author:
 *           type: string
 *           description: 作者
 *         likes:
 *           type: string
 *           description: 喜欢数量
 *         quantity:
 *           type: string
 *           description: 总数量
 *         soldQty:
 *           type: string
 *           description: 已售数量
 *         category:
 *           type: string
 *           description: 分类ID
 *         owner:
 *           type: string
 *           description: 所有者ID
 *         editions:
 *           type: array
 *           description: NFT的多个版本
 *           items:
 *             type: object
 *             properties:
 *               sub_id:
 *                 type: string
 *                 description: 子ID/编号(如001, 002等)
 *               shop_id:
 *                 type: string
 *                 description: 商店ID
 *               status:
 *                 type: number
 *                 enum: [1, 2, 3, 4]
 *                 description: 状态码(1:未寄售, 2:寄售中, 3:锁定中, 4:已售出)
 *               statusStr:
 *                 type: string
 *                 description: 状态描述
 *               price:
 *                 type: string
 *                 description: 该版本价格
 *               blockchain_id:
 *                 type: string
 *                 description: 区块链编号
 */

/**
 * @swagger
 * /nfts:
 *   get:
 *     summary: 获取NFT列表
 *     tags: [NFT]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 按分类筛选
 *     responses:
 *       200:
 *         description: 成功获取NFT列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */
// 获取NFT列表（支持分类过滤）
exports.getNFTs = asyncHandler(async (req, res) => {
    const { category } = req.query;
    const query = {};

    if (category) {
        query.category = category;
    }

    const nfts = await NFT.find(query)
        .populate('category', 'name')
        .populate('owner', 'name email');

    res.status(200).json({
        success: true,
        data: { ...res.advancedResults }
    });
});

/**
 * @swagger
 * /nfts:
 *   post:
 *     summary: 创建NFT
 *     tags: [NFT]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NFT'
 *     responses:
 *       200:
 *         description: NFT创建成功
 *       404:
 *         description: 分类不存在
 */
// 创建NFT
exports.createNFT = asyncHandler(async (req, res) => {
    // 验证分类是否存在
    const category = await NFTCategory.findById(req.body.category);
    if (!category) {
        return res.status(404).json({
            success: false,
            message: '分类不存在'
        });
    }

    const { name, description, imageUrl, price, author, likes, quantity, category: categoryId, editions } = req.body;

    // 创建基本NFT
    const nftData = {
        name,
        description,
        imageUrl,
        price,
        author,
        likes,
        quantity,
        soldQty: '0',
        category: categoryId,
        owner: req.user.id
    };

    // 处理版本/编号数据
    if (editions && Array.isArray(editions)) {
        // 创建版本/子ID
        nftData.editions = editions.map((edition, index) => {
            // 如果未提供sub_id，则自动生成
            const sub_id = edition.sub_id || String(index + 1).padStart(3, '0');
            return {
                ...edition,
                sub_id,
                owner: req.user.id, // 初始拥有者是创建者
                status: edition.status || 1,  // 默认未寄售
                blockchain_id: edition.blockchain_id || `${name}-${sub_id}-${Date.now()}` // 默认生成区块链ID
            };
        });
    } else {
        // 如果未提供editions，则根据quantity自动生成
        const editionsCount = parseInt(quantity) || 1;
        nftData.editions = [];
        
        for (let i = 1; i <= editionsCount; i++) {
            const sub_id = String(i).padStart(3, '0');
            nftData.editions.push({
                sub_id,
                owner: req.user.id,
                status: 1, // 默认未寄售
                statusStr: '未寄售',
                price,
                blockchain_id: `${name}-${sub_id}-${Date.now()}`
            });
        }
    }

    const nft = await NFT.create(nftData);

    res.status(200).json({
        success: true,
        data: nft
    });
});

/**
 * @swagger
 * /nfts/{id}:
 *   get:
 *     summary: 获取单个NFT
 *     tags: [NFT]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: NFT ID
 *     responses:
 *       200:
 *         description: 成功获取NFT详情
 *       404:
 *         description: NFT未找到
 */
// 获取单个NFT
exports.getNFT = asyncHandler(async (req, res) => {
    const nft = await NFT.findById(req.params.id)
        .populate('category', 'name')
        .populate('owner', 'name email')
        .populate('editions.owner', 'name email');

    if (!nft) {
        return res.status(404).json({
            success: false,
            message: 'NFT未找到'
        });
    }
    
    const nftObj = nft.toObject();
    nftObj.id = nft._id;

    res.status(200).json({
        success: true,
        data: nftObj
    });
});

/**
 * @swagger
 * /nfts/{id}:
 *   put:
 *     summary: 更新NFT
 *     tags: [NFT]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: NFT ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NFT'
 *     responses:
 *       200:
 *         description: NFT更新成功
 *       403:
 *         description: 无权修改该NFT
 *       404:
 *         description: NFT未找到
 */
// 更新NFT
exports.updateNFT = asyncHandler(async (req, res) => {
    let nft = await NFT.findById(req.params.id);

    if (!nft) {
        return res.status(404).json({
            success: false,
            message: 'NFT未找到'
        });
    }

    // 验证操作者是所有者
    if (nft.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: '无权修改该NFT'
        });
    }

    // 只允许更新基本信息，不允许直接更新editions
    const { editions, ...updateData } = req.body;
    
    nft = await NFT.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: nft
    });
});

/**
 * @swagger
 * /nfts/{id}/editions/{subId}:
 *   put:
 *     summary: 更新NFT版本状态
 *     tags: [NFT]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: NFT ID
 *       - in: path
 *         name: subId
 *         schema:
 *           type: string
 *         required: true
 *         description: NFT子ID/编号
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: number
 *                 enum: [1, 2, 3, 4]
 *                 description: 新状态
 *               price:
 *                 type: string
 *                 description: 更新价格
 *               shop_id:
 *                 type: string
 *                 description: 商店ID
 *     responses:
 *       200:
 *         description: NFT版本更新成功
 *       403:
 *         description: 无权修改
 *       404:
 *         description: NFT或版本未找到
 */
// 更新NFT版本状态
exports.updateNFTEdition = asyncHandler(async (req, res) => {
    let nft = await NFT.findById(req.params.id);

    if (!nft) {
        return res.status(404).json({
            success: false,
            message: 'NFT未找到'
        });
    }

    // 查找对应的版本
    const editionIndex = nft.editions.findIndex(
        edition => edition.sub_id === req.params.subId
    );

    if (editionIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'NFT版本未找到'
        });
    }

    // 验证操作者是此版本的所有者
    const edition = nft.editions[editionIndex];
    if (edition.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: '无权修改该NFT版本'
        });
    }

    // 更新状态和其他可修改的字段
    const { status, price, shop_id } = req.body;
    
    if (status !== undefined) {
        nft.editions[editionIndex].status = status;
        // statusStr会通过pre-save钩子自动更新
    }
    
    if (price !== undefined) {
        nft.editions[editionIndex].price = price;
    }
    
    if (shop_id !== undefined) {
        nft.editions[editionIndex].shop_id = shop_id;
    }

    // 如果更改为已售出状态，可以记录交易历史
    if (status === 4) {
        const history = {
            date: new Date(),
            from: nft.editions[editionIndex].owner.toString(),
            to: req.body.buyer || "Unknown",
            price: price || nft.editions[editionIndex].price
        };
        
        if (!nft.editions[editionIndex].transaction_history) {
            nft.editions[editionIndex].transaction_history = [];
        }
        
        nft.editions[editionIndex].transaction_history.push(history);
    }

    await nft.save();

    res.status(200).json({
        success: true,
        data: nft.editions[editionIndex]
    });
});

/**
 * @swagger
 * /nfts/{id}/editions/{subId}/transfer:
 *   post:
 *     summary: 转移NFT版本所有权
 *     tags: [NFT]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: NFT ID
 *       - in: path
 *         name: subId
 *         schema:
 *           type: string
 *         required: true
 *         description: NFT子ID/编号
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newOwnerId
 *             properties:
 *               newOwnerId:
 *                 type: string
 *                 description: 新所有者ID
 *               price:
 *                 type: string
 *                 description: 交易价格
 *     responses:
 *       200:
 *         description: NFT转移成功
 *       403:
 *         description: 无权转移
 *       404:
 *         description: NFT或版本未找到
 */
// 转移NFT版本所有权
exports.transferNFTEdition = asyncHandler(async (req, res) => {
    const { newOwnerId, price } = req.body;
    
    if (!newOwnerId) {
        return res.status(400).json({
            success: false,
            message: '需要提供新所有者ID'
        });
    }

    let nft = await NFT.findById(req.params.id);

    if (!nft) {
        return res.status(404).json({
            success: false,
            message: 'NFT未找到'
        });
    }

    // 查找对应的版本
    const editionIndex = nft.editions.findIndex(
        edition => edition.sub_id === req.params.subId
    );

    if (editionIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'NFT版本未找到'
        });
    }

    // 验证操作者是此版本的所有者
    const edition = nft.editions[editionIndex];
    if (edition.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: '无权转移该NFT版本'
        });
    }

    // 记录交易历史
    const history = {
        date: new Date(),
        from: edition.owner.toString(),
        to: newOwnerId,
        price: price || edition.price
    };
    
    if (!nft.editions[editionIndex].transaction_history) {
        nft.editions[editionIndex].transaction_history = [];
    }
    
    nft.editions[editionIndex].transaction_history.push(history);
    
    // 更新所有者
    nft.editions[editionIndex].owner = newOwnerId;
    
    // 更新状态为"已售出"
    nft.editions[editionIndex].status = 4;
    
    // 更新售出数量
    const soldQty = parseInt(nft.soldQty || '0') + 1;
    nft.soldQty = soldQty.toString();
    
    await nft.save();

    res.status(200).json({
        success: true,
        message: 'NFT版本转移成功',
        data: nft.editions[editionIndex]
    });
});

/**
 * @swagger
 * /nfts/{id}:
 *   delete:
 *     summary: 删除NFT
 *     tags: [NFT]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: NFT ID
 *     responses:
 *       200:
 *         description: NFT已删除
 *       403:
 *         description: 无权删除该NFT
 *       404:
 *         description: NFT未找到
 */
// 删除NFT
exports.deleteNFT = asyncHandler(async (req, res) => {
    const nft = await NFT.findById(req.params.id);

    if (!nft) {
        return res.status(404).json({
            success: false,
            message: 'NFT未找到'
        });
    }

    // 验证操作权限
    if (nft.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: '无权删除该NFT'
        });
    }

    await nft.remove();

    res.status(200).json({
        success: true,
        message: 'NFT已删除'
    });
});

/**
 * @swagger
 * /nfts/user/{userId}:
 *   get:
 *     summary: 获取用户拥有的NFT列表
 *     tags: [NFT]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 成功获取用户NFT列表
 */
// 获取用户拥有的NFT列表
exports.getUserNFTs = asyncHandler(async (req, res) => {
    // 方法一：查找主所有者为指定用户的NFT
    const ownedNFTs = await NFT.find({ owner: req.params.userId })
        .populate('category', 'name')
        .populate('owner', 'name email');

    // 方法二：查找任何版本所有者为指定用户的NFT
    const editionOwnedNFTs = await NFT.find({ 'editions.owner': req.params.userId })
        .populate('category', 'name')
        .populate('owner', 'name email')
        .populate('editions.owner', 'name email');

    // 合并结果并去重
    const allNFTs = [...ownedNFTs];
    
    // 只添加未包含在ownedNFTs中的NFT
    editionOwnedNFTs.forEach(nft => {
        if (!allNFTs.find(n => n._id.toString() === nft._id.toString())) {
            allNFTs.push(nft);
        }
    });

    // 处理结果
    const processedNFTs = allNFTs.map(nft => {
        const nftObj = nft.toObject();
        
        // 筛选出该用户拥有的版本
        nftObj.userOwnedEditions = nft.editions.filter(
            edition => edition.owner.toString() === req.params.userId
        );
        
        return nftObj;
    });

    res.status(200).json({
        success: true,
        count: processedNFTs.length,
        data: processedNFTs
    });
});

/**
 * @swagger
 * /nfts/available:
 *   get:
 *     summary: 获取所有可购买的NFT版本
 *     tags: [NFT]
 *     responses:
 *       200:
 *         description: 成功获取可购买的NFT列表
 */
// 获取所有可购买的NFT版本
exports.getAvailableNFTs = asyncHandler(async (req, res) => {
    // 查找包含寄售中(status=2)版本的NFT
    const availableNFTs = await NFT.find({ 'editions.status': 2 })
        .populate('category', 'name')
        .populate('owner', 'name email')
        .populate('editions.owner', 'name email');

    // 处理结果，只返回寄售中的版本
    const processedNFTs = availableNFTs.map(nft => {
        const nftObj = nft.toObject();
        
        // 筛选出寄售中的版本
        nftObj.availableEditions = nft.editions.filter(
            edition => edition.status === 2
        );
        
        return {
            _id: nft._id,
            name: nft.name,
            description: nft.description,
            imageUrl: nft.imageUrl,
            author: nft.author,
            category: nft.category,
            availableEditions: nftObj.availableEditions
        };
    });

    res.status(200).json({
        success: true,
        count: processedNFTs.length,
        data: processedNFTs
    });
});