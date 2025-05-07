const express = require('express');
const {
  getMysteryBoxes,
  getMysteryBox,
  createMysteryBox,
  updateMysteryBox,
  deleteMysteryBox,
  purchaseMysteryBox,
  openMysteryBox,
  getUserMysteryBoxes,
  updateMysteryBoxEdition,
  updateMysteryBoxStatus
} = require('../controllers/mysteryBox');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// 公开路由
router.get('/', getMysteryBoxes);
router.get('/:id', getMysteryBox);

// 登录用户路由
router.post('/:id/purchase', protect, purchaseMysteryBox);
router.post('/:id/open', protect, openMysteryBox);
router.get('/user/boxes', protect, getUserMysteryBoxes);

// 管理员路由
router.post('/', protect, authorize('admin', 'publisher'), createMysteryBox);
router.put('/:id', protect, authorize('admin', 'publisher'), updateMysteryBox);
router.put('/:id/status', protect, authorize('admin', 'publisher'), updateMysteryBoxStatus);
router.put('/:id/editions/:editionId', protect, authorize('admin', 'publisher'), updateMysteryBoxEdition);
router.delete('/:id', protect, authorize('admin', 'publisher'), deleteMysteryBox);

module.exports = router; 