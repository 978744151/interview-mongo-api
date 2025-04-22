const express = require('express');
const {
  getNFTConsignments,
  getNFTConsignment,
  createNFTConsignment,
  updateNFTConsignment,
  deleteNFTConsignment,
  purchaseNFT
} = require('../controllers/nftConsignment');

const router = express.Router();

const { protect } = require('../middleware/auth');

// 公开路由
router.get('/', getNFTConsignments);
router.get('/:id', getNFTConsignment);

// 需要登录的路由
router.post('/', protect, createNFTConsignment);
router.put('/:id', protect, updateNFTConsignment);
router.delete('/:id', protect, deleteNFTConsignment);
router.post('/:id/purchase', protect, purchaseNFT);

module.exports = router; 