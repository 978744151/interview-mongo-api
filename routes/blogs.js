const express = require('express');
const {
    getAllBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog
} = require('../controllers/blogs');
const { protect } = require('../middleware/auth');
const advancedResults = require("../middleware/advancedResults.js");
const blogs = require("../models/blogs.js");

// 引入评论路由
const commentRouter = require('./comments');

const router = express.Router();

// 重定向评论相关路由
router.use('/:blogId/comments', commentRouter);

router.route('/')
    .get(advancedResults(blogs), getAllBlogs)
    .post(protect, createBlog);

router.route('/:id')
    .get(getBlogById)
    .put(protect, updateBlog)
    .delete(protect, deleteBlog);

module.exports = router;