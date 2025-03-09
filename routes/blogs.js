const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogs');
const { protect } = require('../middleware/auth');  // 假设你的认证中间件在这个位置
// 博客路由
router.get('/getAllBlogs', blogController.getAllBlogs);
router.post('/',protect, blogController.createBlog);
router.get('/:id', blogController.getBlogById);
router.put('/:id', blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);

module.exports = router;