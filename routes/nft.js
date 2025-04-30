const express = require('express');
const router = express.Router();
const nftController = require('../controllers/nft');
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require("../middleware/advancedResults.js");
const Nfts = require("../models/nft.js");

// 保持现有路由不变，确保完整路由配置如下：
router.route('/')
    .get(advancedResults(Nfts, 'category'), nftController.getNFTs)
    .post(protect, authorize('admin', 'owner'), nftController.createNFT);

router.route('/:id')
    .get(nftController.getNFT)
    .put(protect, authorize('admin', 'owner'), nftController.updateNFT)
    .delete(protect, authorize('admin', 'owner'), nftController.deleteNFT);

// 获取特定用户的NFT
router.route('/user/collect')
    .get(protect, nftController.getUserNFTs);

// 获取可用于购买的NFT
router.route('/available-list')
    .get(nftController.getAvailableNFTs);

// 发布NFT到市场
router.route('/:id/publish')
    .post(protect, authorize('admin', 'owner'), nftController.publishNFT);

// 批量发布NFT到市场
router.route('/publish-batch')
    .post(protect, authorize('admin', 'owner'), nftController.publishNFTBatch);

// 发布NFT合成空投
router.route('/:id/synthetic-airdrop')
    .post(protect, authorize('admin', 'owner'), nftController.syntheticAirdropNFT);

// 更新NFT版本状态
router.route('/:id/editions/:subId')
    .put(protect, authorize('admin', 'owner'), nftController.updateNFTEdition);

// 转移NFT版本所有权
router.route('/:id/editions/:subId/transfer')
    .post(protect, authorize('admin', 'owner'), nftController.transferNFTEdition);

router.route('/purchaseNFT')
    .post(protect, nftController.purchaseNFT);

module.exports = router;