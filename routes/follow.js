const express = require('express');
const { protect } = require('../middleware/auth');
const {
    followUser,
    unfollowUser,
    getFollowInfo,
    checkFollowStatus
} = require('../controllers/follow');

const router = express.Router();

router.post('/follow', protect, followUser);
router.post('/unfollow', protect, unfollowUser);
router.get('/follow-info/:userId?', getFollowInfo);
router.get('/check', protect, checkFollowStatus);

module.exports = router;