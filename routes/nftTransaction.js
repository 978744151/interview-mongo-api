const express = require('express');
const {
  getTransactions,
  getTransaction,
  getMyPurchases,
  getMySales
} = require('../controllers/nftTransaction');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// 用户路由
router.get('/my-purchases', protect, getMyPurchases);
router.get('/my-sales', protect, getMySales);

// 管理员路由
router.get('/', protect, authorize('admin'), getTransactions);
router.get('/:id', protect, authorize('admin'), getTransaction);

module.exports = router; 