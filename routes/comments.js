const express = require('express');
const {
    createComment,
    getBlogComments,
    replyToComment,
    deleteComment
} = require('../controllers/comments');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
    .post(getBlogComments)
router.route('/create').post(protect, createComment);

router.route('/:commentId/reply')
    .post(protect, replyToComment);

router.route('/:commentId')
    .delete(protect, deleteComment);

module.exports = router;