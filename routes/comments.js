const express = require('express');
const {
    createComment,
    getBlogComments,
    replyToComment,
    deleteComment,
    likeComment
} = require('../controllers/comments');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
    .post(getBlogComments)
router.route('/create').post(protect, createComment);

router.route('/reply')
    .post(protect, replyToComment);

router.route('/:commentId')
    .delete(protect, deleteComment);

// 添加点赞路由
router.route('/like')
    .post(protect, likeComment);

module.exports = router;