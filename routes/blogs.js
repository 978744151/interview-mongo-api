const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogs');

// 博客路由
router.get('/getAllBlogs', blogController.getAllBlogs);
router.post('/blogs', blogController.createBlog);
router.get('/blogs/:id', blogController.getBlogById);
router.put('/blogs/:id', blogController.updateBlog);
router.delete('/blogs/:id', blogController.deleteBlog);

module.exports = router;