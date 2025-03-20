const express = require('express');
const router = express.Router();
const nftController = require('../controllers/nft');
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require("../middleware/advancedResults.js");
const Nfts = require("../models/nft.js");

// 保持现有路由不变，确保完整路由配置如下：
router.route('/')
    .get(advancedResults(Nfts,'category'),nftController.getNFTs)
    .post(protect, authorize('admin', 'owner'),nftController.createNFT);

router.route('/:id')
    .get(nftController.getNFT)
    .put(protect, authorize('admin', 'owner'),nftController.updateNFT)
    .delete(protect, authorize('admin', 'owner'), nftController.deleteNFT);

module.exports = router;