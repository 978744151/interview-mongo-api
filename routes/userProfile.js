const express = require('express');
const {
  getUserProfile,
  checkIn,
  getPointsHistory,
  getUserCollections,
  getUserMysteryBoxes,
  openMysteryBox,
  getUserSales,
  getUserConsignments
} = require('../controllers/userProfile');

const router = express.Router();

const { protect } = require('../middleware/auth');

// 所有路由都需要登录
router.use(protect);

router.get('/', getUserProfile);
router.post('/check-in', checkIn);
router.get('/points-history', getPointsHistory);
router.get('/collections', getUserCollections);
router.get('/mystery-boxes', getUserMysteryBoxes);
router.post('/mystery-boxes/:id/open', openMysteryBox);
router.get('/sales', getUserSales);
router.get('/consignments', getUserConsignments);

module.exports = router; 