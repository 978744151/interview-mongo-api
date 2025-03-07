const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogs');

// 博客路由
router.get('/getAllBlogs', blogController.getAllBlogs);
router.post('/', blogController.createBlog);
router.get('/:id', blogController.getBlogById);
router.put('/:id', blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);

module.exports = router;