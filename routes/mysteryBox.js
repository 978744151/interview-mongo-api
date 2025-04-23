const express = require('express');
const {
  getMysteryBoxes,
  getMysteryBox,
  createMysteryBox,
  updateMysteryBox,
  deleteMysteryBox,
  purchaseMysteryBox
} = require('../controllers/mysteryBox');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// 公开路由
router.get('/', getMysteryBoxes);
router.get('/:id', getMysteryBox);

// 登录用户路由
router.post('/:id/purchase', protect, purchaseMysteryBox);

// 管理员路由
router.post('/', protect, authorize('admin', 'publisher'), createMysteryBox);
router.put('/:id', protect, authorize('admin', 'publisher'), updateMysteryBox);
router.delete('/:id', protect, authorize('admin', 'publisher'), deleteMysteryBox);

module.exports = router; 