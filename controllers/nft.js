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
 *         type:
 *           type: number
 *           enum: [1, 2]
 *           description: 主分类类型(1:普通NFT, 2:盲盒)
 *         typeStr:
 *           type: string
 *           description: 主分类类型描述
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
 *                 description: 状态码(1:未寄售, 2:寄售中, 3:锁定中, 4:已售出, 5:已发布, 6:空投, 7:合成)
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: number
 *           enum: [1, 2, 3, 4, 5, 6, 7, 8]
 *         description: 按状态筛选(1:未发布, 2:已发布, 3:已售罄, 4:已下架, 5:限时发售, 6:预售, 7:热卖中, 8:即将售罄)
 *       - in: query
 *         name: type
 *         schema:
 *           type: number
 *           enum: [1, 2]
 *         description: 按主分类筛选(1:普通NFT, 2:盲盒)
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
// 获取NFT列表（支持分类、状态和类型过滤）
exports.getNFTs = asyncHandler(async (req, res) => {
    try {
        const { category, status, type } = req.query;
        const query = {};

        // 只有当 category 有值且不为空字符串时才加到查询条件
        if (category && category !== "") {
            query.category = category;
        }

        // 如果指定了类型，添加到查询条件
        if (type && !isNaN(parseInt(type))) {
            query.type = parseInt(type);
        }

        // 如果指定了状态，添加到查询条件
        if (status && !isNaN(parseInt(status))) {
            const statusNum = parseInt(status);
            // 使用 $elemMatch 查询包含特定状态的版本
            query['editions'] = {
                $elemMatch: { status: statusNum }
            };
        }

        const nfts = await NFT.find(query)
            .populate('category', 'name')
            .populate('owner', 'name email');
        res.advancedResults.data = nfts
        res.status(200).json({
            success: true,
            data: res.advancedResults
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: '获取NFT列表失败'
        });
    }
});
// ... existing code ...
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
 *       400:
 *         description: 分类不存在
 */
// 创建NFT
exports.createNFT = asyncHandler(async (req, res) => {
    // 验证分类是否存在
    const category = await NFTCategory.findById(req.body.category);
    if (!category) {
        return res.status(400).json({
            success: false,
            message: '分类不存在'
        });
    }

    const { name, _id, description, imageUrl, price, author, likes, quantity, category: categoryId, editions, type } = req.body;
    // 确保状态码和状态描述同步更新
    if (req.body.status) {
        const statusMap = {
            1: "未发布",
            2: "已发布",
            3: "已售罄",
            4: "已下架",
            5: "限时发售",
            6: "预售",
            7: "热卖中",
            8: "即将售罄"
        };
        req.body.statusStr = statusMap[req.body.status] || "未知状态";
    }

    // 确保类型码和类型描述同步更新
    if (req.body.type) {
        const typeMap = {
            1: "普通NFT",
            2: "盲盒"
        };
        req.body.typeStr = typeMap[req.body.type] || "普通NFT";
    }

    // 确保类型码和类型描述同步更新
    const typeValue = type || 1; // 默认为普通NFT
    const typeMap = {
        1: "普通NFT",
        2: "盲盒"
    };
    const typeStrValue = typeMap[typeValue] || "普通NFT";

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
        type: typeValue,
        typeStr: typeStrValue,
        owner: req.user.id,
        _id
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
                blockchain_id: edition.blockchain_id || `${_id}-${sub_id}-${Date.now()}` // 默认生成区块链ID
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
                blockchain_id: `${_id}-${sub_id}-${Date.now()}`
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
 *       400:
 *         description: NFT未找到
 */
// 获取单个NFT
exports.getNFT = asyncHandler(async (req, res) => {
    const nft = await NFT.findById(req.params.id)
        .populate('category', 'name')
        .populate('owner', 'name email')
        .populate('editions.owner', 'name email');

    if (!nft) {
        return res.status(400).json({
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
 *       400:
 *         description: NFT未找到
 */
// 更新NFT
exports.updateNFT = asyncHandler(async (req, res) => {
    let nft = await NFT.findById(req.params.id);

    if (!nft) {
        return res.status(400).json({
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
    // 确保状态码和状态描述同步更新
    if (req.body.status) {
        const statusMap = {
            1: "未发布",
            2: "已发布",
            3: "已售罄",
            4: "已下架",
            5: "限时发售",
            6: "预售",
            7: "热卖中",
            8: "即将售罄"
        };
        req.body.statusStr = statusMap[req.body.status] || "未知状态";
    }

    // 确保类型码和类型描述同步更新
    if (req.body.type) {
        const typeMap = {
            1: "普通NFT",
            2: "盲盒"
        };
        req.body.typeStr = typeMap[req.body.type] || "普通NFT";
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
 *       400:
 *         description: NFT或版本未找到
 */
// 更新NFT版本状态
exports.updateNFTEdition = asyncHandler(async (req, res) => {
    let nft = await NFT.findById(req.params.id);

    if (!nft) {
        return res.status(400).json({
            success: false,
            message: 'NFT未找到'
        });
    }

    // 查找对应的版本
    const editionIndex = nft.editions.findIndex(
        edition => edition.sub_id === req.params.subId
    );

    if (editionIndex === -1) {
        return res.status(400).json({
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
 *       400:
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
        return res.status(400).json({
            success: false,
            message: 'NFT未找到'
        });
    }

    // 查找对应的版本
    const editionIndex = nft.editions.findIndex(
        edition => edition.sub_id === req.params.subId
    );

    if (editionIndex === -1) {
        return res.status(400).json({
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
 *       400:
 *         description: NFT未找到
 */
// 删除NFT
exports.deleteNFT = asyncHandler(async (req, res) => {
    const nft = await NFT.findById(req.params.id);

    if (!nft) {
        return res.status(400).json({
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
 *       - in: query
 *         name: type
 *         schema:
 *           type: number
 *           enum: [1, 2]
 *         description: 按主分类筛选(1:普通NFT, 2:盲盒)
 *     responses:
 *       200:
 *         description: 成功获取用户NFT列表
 */
// 获取用户拥有的NFT列表
exports.getUserNFTs = asyncHandler(async (req, res) => {
    // 获取查询参数
    const { type } = req.query;
    const userId = req.params?.userId || req.user.id;

    // 构建查询条件
    const query1 = { owner: userId };
    const query2 = { 'editions.owner': userId };

    // 如果指定了类型，添加到查询条件
    if (type && !isNaN(parseInt(type))) {
        const typeNum = parseInt(type);
        query1.type = typeNum;
        query2.type = typeNum;
    }

    // 方法一：查找主所有者为指定用户的NFT
    const ownedNFTs = await NFT.find(query1)
        .populate('category', 'name')
        .populate('owner', 'name email');

    // 方法二：查找任何版本所有者为指定用户的NFT
    const editionOwnedNFTs = await NFT.find(query2)
        .populate('category', 'name')
        .populate('owner', 'name email')
        .populate('editions.owner', 'name email');
    console.log('editionOwnedNFTs', editionOwnedNFTs)
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
            (edition) => {
                console.log(edition.owner._id == userId)
                return edition.owner._id == userId
            }
        );
        delete nftObj.editions;
        console.log('nftObj.userOwnedEditions', nftObj.userOwnedEditions)
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
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: number
 *           enum: [1, 2]
 *         description: 按主分类筛选(1:普通NFT, 2:盲盒)
 *     responses:
 *       200:
 *         description: 成功获取可购买的NFT列表
 */
// 获取所有可购买的NFT版本
exports.getAvailableNFTs = asyncHandler(async (req, res) => {
    // 获取查询参数
    const { type } = req.query;

    // 构建查询条件
    const query = { 'editions.status': 2 };

    // 如果指定了类型，添加到查询条件
    if (type && !isNaN(parseInt(type))) {
        query.type = parseInt(type);
    }

    // 查找包含寄售中(status=2)版本的NFT
    const availableNFTs = await NFT.find(query)
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

/**
 * @swagger
 * /nfts/{id}/publish:
 *   post:
 *     summary: 发布NFT供用户购买
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
 *             type: object
 *             properties:
 *               price:
 *                 type: string
 *                 description: 发布价格(可选，默认使用NFT基础价格)
 *               editionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 要发布的版本ID(可选，默认全部发布)
 *     responses:
 *       200:
 *         description: NFT发布成功
 *       403:
 *         description: 无权发布该NFT
 *       400:
 *         description: NFT未找到
 */
exports.publishNFT = asyncHandler(async (req, res) => {
    const { price, editionIds } = req.body;

    let nft = await NFT.findById(req.params.id);

    if (!nft) {
        return res.status(400).json({
            success: false,
            message: 'NFT未找到'
        });
    }

    // 验证操作者是管理员或所有者
    if (nft.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: '无权发布该NFT'
        });
    }

    // 确定要发布的版本
    let editionsToPublish = nft.editions;
    if (editionIds && Array.isArray(editionIds) && editionIds.length > 0) {
        editionsToPublish = nft.editions.filter(edition =>
            editionIds.includes(edition.sub_id) &&
            [1, 3].includes(edition.status) // 只能发布"未寄售"或"锁定中"的版本
        );
    } else {
        // 默认发布所有未售出的版本
        editionsToPublish = nft.editions.filter(edition =>
            [1, 3].includes(edition.status)
        );
    }

    if (editionsToPublish.length === 0) {
        return res.status(400).json({
            success: false,
            message: '没有可发布的NFT版本'
        });
    }

    // 更新版本状态为"已发布"
    editionsToPublish.forEach(edition => {
        const editionIndex = nft.editions.findIndex(e => e.sub_id === edition.sub_id);
        if (editionIndex !== -1) {
            nft.editions[editionIndex].status = 5; // 设置为已发布状态
            if (price) {
                nft.editions[editionIndex].price = price;
            }
        }
    });

    await nft.save();

    res.status(200).json({
        success: true,
        message: `成功发布 ${editionsToPublish.length} 个NFT版本`,
        data: nft
    });
});

/**
 * @swagger
 * /nfts/publish-batch:
 *   post:
 *     summary: 批量发布多个NFT
 *     tags: [NFT]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nftIds
 *             properties:
 *               nftIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 要发布的NFT ID列表
 *               price:
 *                 type: string
 *                 description: 发布价格(可选，默认使用各NFT基础价格)
 *     responses:
 *       200:
 *         description: NFT批量发布成功
 *       403:
 *         description: 无权发布某些NFT
 *       400:
 *         description: 部分NFT未找到
 */
exports.publishNFTBatch = asyncHandler(async (req, res) => {
    const { nftIds, price } = req.body;

    if (!nftIds || !Array.isArray(nftIds) || nftIds.length === 0) {
        return res.status(400).json({
            success: false,
            message: '需要提供要发布的NFT ID列表'
        });
    }

    const results = {
        success: [],
        failed: []
    };

    // 处理每个NFT
    for (const nftId of nftIds) {
        try {
            let nft = await NFT.findById(nftId);

            if (!nft) {
                results.failed.push({
                    id: nftId,
                    reason: 'NFT未找到'
                });
                continue;
            }

            // 验证操作者是管理员或所有者
            if (nft.owner.toString() !== req.user.id && req.user.role !== 'admin') {
                results.failed.push({
                    id: nftId,
                    reason: '无权发布该NFT'
                });
                continue;
            }

            // 筛选可发布的版本
            const editionsToPublish = nft.editions.filter(edition =>
                [1, 3].includes(edition.status) // 只能发布"未寄售"或"锁定中"的版本
            );

            if (editionsToPublish.length === 0) {
                results.failed.push({
                    id: nftId,
                    reason: '没有可发布的NFT版本'
                });
                continue;
            }

            // "已发布"(5)
            editionsToPublish.forEach(edition => {
                const editionIndex = nft.editions.findIndex(e => e.sub_id === edition.sub_id);
                if (editionIndex !== -1) {
                    nft.editions[editionIndex].status = 5; //
                    if (price) {
                        nft.editions[editionIndex].price = price;
                    }
                }
            });

            await nft.save();

            results.success.push({
                id: nftId,
                publishedCount: editionsToPublish.length
            });
        } catch (error) {
            results.failed.push({
                id: nftId,
                reason: error.message || '处理时发生错误'
            });
        }
    }

    return res.status(200).json({
        success: true,
        message: `成功发布 ${results.success.length} 个NFT，失败 ${results.failed.length} 个`,
        data: results
    });
});

/**
 * @swagger
 * /nfts/published:
 *   get:
 *     summary: 获取所有已发布供用户购买的NFT
 *     tags: [NFT]
 *     responses:
 *       200:
 *         description: 成功获取已发布的NFT列表
 */
exports.getPublishedNFTs = asyncHandler(async (req, res) => {
    // 查找包含已发布(status=5)版本的NFT
    const publishedNFTs = await NFT.find({ 'editions.status': 5 })
        .populate('category', 'name')
        .populate('owner', 'name email')
        .populate('editions.owner', 'name email');

    // 处理结果，只返回已发布的版本
    const processedNFTs = publishedNFTs.map(nft => {
        const nftObj = nft.toObject();

        // 筛选出已发布的版本
        nftObj.publishedEditions = nft.editions.filter(
            edition => edition.status === 5
        );

        return {
            _id: nft._id,
            name: nft.name,
            description: nft.description,
            imageUrl: nft.imageUrl,
            author: nft.author,
            category: nft.category,
            price: nft.price,
            publishedEditions: nftObj.publishedEditions
        };
    });

    res.status(200).json({
        success: true,
        count: processedNFTs.length,
        data: processedNFTs
    });
});

/**
 * @swagger
 * /nfts/{id}/editions/{subId}/purchase:
 *   post:
 *     summary: 用户购买已发布的NFT
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
 *     responses:
 *       200:
 *         description: NFT购买成功
 *       400:
 *         description: 该NFT不可购买或余额不足

 */
exports.purchaseNFT = asyncHandler(async (req, res) => {
    const nftId = req.body.id;
    const buyerId = req.user.id;

    let nft = await NFT.findById(nftId)
        .populate('owner', 'name email');

    if (!nft) {
        return res.status(400).json({
            success: false,
            message: 'NFT未找到'
        });
    }
    // 查找对应的版本
    const availableEditions = nft.editions.filter(edition => edition.status === 5);
    // const editionIndex = nft.editions.findIndex(
    //     edition => edition.sub_id === req.body.subId
    // );

    if (availableEditions.length === 0) {
        return res.status(403).json({
            success: false,
            message: '该NFT暂无可购买的版本'
        });
    }

    // 随机选择一个版本
    const randomIndex = Math.floor(Math.random() * availableEditions.length);
    const selectedEdition = availableEditions[randomIndex];

    // 检查是否为自己购买自己
    // if (selectedEdition.owner.toString() === buyerId) {
    //     return res.status(403).json({
    //         success: false,
    //         message: '不能购买自己拥有的NFT版本'
    //     });
    // }

    // 找到原数组中的索引
    const editionIndex = nft.editions.findIndex(edition => edition.sub_id === selectedEdition.sub_id);

    // 这里添加用户余额验证和扣款逻辑
    // const user = await User.findById(req.user.id);
    // if (user.balance < edition.price) {
    //     return res.status(400).json({
    //         success: false,
    //         message: '余额不足'
    //     });
    // }
    // 扣款逻辑...


    // 记录交易历史
    const history = {
        date: new Date(),
        from: nft.editions[editionIndex].owner.toString(),
        to: buyerId,
        price: nft.editions[editionIndex].price
    };
    if (!nft.editions[editionIndex].transaction_history) {
        nft.editions[editionIndex].transaction_history = [];
    }
    nft.editions[editionIndex].transaction_history.push(history);

    // 更新所有者和状态
    nft.editions[editionIndex].owner = buyerId;
    nft.editions[editionIndex].status = 1; // 为寄售

    // 更新售出数量
    nft.soldQty = (parseInt(nft.soldQty || '0') + 1).toString();

    await nft.save();

    res.status(200).json({
        success: true,
        message: 'NFT购买成功',
        data: nft.editions[editionIndex]
    });
});

/**
 * @swagger
 * /nfts/{id}/airdrop:
 *   post:
 *     summary: 向用户空投NFT
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
 *             type: object
 *             required:
 *               - userIds
 *               - editionIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 接收空投的用户ID列表
 *               editionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 要空投的版本ID列表
 *     responses:
 *       200:
 *         description: NFT空投成功
 *       403:
 *         description: 无权空投该NFT
 *       400:
 *         description: NFT未找到
 */
exports.airdropNFT = asyncHandler(async (req, res) => {
    const { userIds, editionIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
            success: false,
            message: '需要提供接收空投的用户ID'
        });
    }

    if (!editionIds || !Array.isArray(editionIds) || editionIds.length === 0) {
        return res.status(400).json({
            success: false,
            message: '需要提供要空投的NFT版本ID'
        });
    }

    let nft = await NFT.findById(req.params.id);

    if (!nft) {
        return res.status(400).json({
            success: false,
            message: 'NFT未找到'
        });
    }

    // 验证操作者是管理员或所有者
    if (nft.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: '无权空投该NFT'
        });
    }

    // 确定要空投的版本
    const editionsToAirdrop = nft.editions.filter(edition =>
        editionIds.includes(edition.sub_id) &&
        [1, 3, 5].includes(edition.status) // 只能空投未寄售、锁定中或已发布的版本
    );

    if (editionsToAirdrop.length === 0) {
        return res.status(400).json({
            success: false,
            message: '没有可空投的NFT版本'
        });
    }

    // 如果要空投的版本少于用户数量，返回错误
    if (editionsToAirdrop.length < userIds.length) {
        return res.status(400).json({
            success: false,
            message: `可空投的NFT版本(${editionsToAirdrop.length}个)少于用户数量(${userIds.length}个)`
        });
    }

    // 为每个用户分配NFT版本
    const airdropResults = [];
    for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i];
        const edition = editionsToAirdrop[i];

        const editionIndex = nft.editions.findIndex(e => e.sub_id === edition.sub_id);

        // 记录交易历史
        const history = {
            date: new Date(),
            from: edition.owner.toString(),
            to: userId,
            price: "0", // 空投价格为0
            type: "airdrop"
        };

        if (!nft.editions[editionIndex].transaction_history) {
            nft.editions[editionIndex].transaction_history = [];
        }

        nft.editions[editionIndex].transaction_history.push(history);

        // 更新所有者和状态
        nft.editions[editionIndex].owner = userId;
        nft.editions[editionIndex].status = 6; // 设置为空投状态

        airdropResults.push({
            user: userId,
            edition: edition.sub_id
        });
    }

    // 更新空投数量
    const soldQty = parseInt(nft.soldQty || '0') + airdropResults.length;
    nft.soldQty = soldQty.toString();

    await nft.save();

    res.status(200).json({
        success: true,
        message: `成功空投 ${airdropResults.length} 个NFT版本`,
        data: airdropResults
    });
});

/**
 * @swagger
 * /nfts/{id}/synthetic-airdrop:
 *   post:
 *     summary: 发布NFT的合成空投
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
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *                 description: 要生成的合成空投数量
 *               price:
 *                 type: number
 *                 description: 合成空投的价格
 *     responses:
 *       200:
 *         description: 合成空投发布成功
 *       403:
 *         description: 无权发布合成空投
 *       400:
 *         description: NFT未找到
 */
exports.syntheticAirdropNFT = asyncHandler(async (req, res) => {
    const { quantity, price } = req.body;

    if (!quantity || quantity <= 0) {
        return res.status(400).json({
            success: false,
            message: '需要提供有效的空投数量'
        });
    }

    let nft = await NFT.findById(req.params.id);

    if (!nft) {
        return res.status(400).json({
            success: false,
            message: 'NFT未找到'
        });
    }

    // 验证操作者是管理员或所有者
    if (nft.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: '无权发布该NFT的合成空投'
        });
    }

    // 获取当前最大版本号
    let maxSubId = 0;
    nft.editions.forEach(edition => {
        const currentSubId = parseInt(edition.sub_id);
        if (!isNaN(currentSubId) && currentSubId > maxSubId) {
            maxSubId = currentSubId;
        }
    });

    // 创建新的合成空投版本
    const syntheticEditions = [];
    for (let i = 1; i <= quantity; i++) {
        const newSubId = String(maxSubId + i).padStart(3, '0');

        const syntheticEdition = {
            sub_id: newSubId,
            status: 7, // 合成空投状态
            statusStr: '合成空投',
            price: price || nft.price,
            owner: nft.owner, // 初始所有者是NFT创建者
            blockchain_id: `${nft._id}-${newSubId}-synthetic-${Date.now()}`,
            created_at: new Date()
        };

        syntheticEditions.push(syntheticEdition);
        nft.editions.push(syntheticEdition);
    }

    // 更新NFT总量
    const totalQuantity = parseInt(nft.quantity || '0') + quantity;
    nft.quantity = totalQuantity.toString();

    await nft.save();

    res.status(200).json({
        success: true,
        message: `成功创建 ${quantity} 个合成空投版本`,
        data: {
            nftId: nft._id,
            syntheticEditions
        }
    });
});