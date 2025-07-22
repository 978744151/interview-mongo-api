const Blog = require('../models/blogs.js'); // 假设已存在博客模型
const asyncHandler = require("../middleware/async.js");
const Comment = require('../models/comments');

/**
 * @swagger
 * tags:
 *   name: 博客
 *   description: 博客管理相关API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Blog:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         title:
 *           type: string
 *           description: 博客标题
 *         content:
 *           type: string
 *           description: 博客内容
 *         blogImage:
 *           type: array
 *           description: 博客图片
 *           items:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *         user:
 *           type: string
 *           description: 用户ID
 *       example:
 *         title: "博客标题"
 *         content: "博客内容"
 *         blogImage: [{ image: "https://example.com/image.jpg" }]
 */

/**
 * @swagger
 * /blogs:
 *   get:
 *     summary: 获取所有博客
 *     tags: [博客]
 *     parameters:
 *       - in: query
 *         name: sortByLatest
 *         schema:
 *           type: boolean
 *         description: 是否按最新时间排序
 *     responses:
 *       200:
 *         description: 成功获取所有博客
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           content:
 *                             type: string
 *                           commentCount:
 *                             type: number
 *                             description: 博客评论数量
 *                           likeCount:
 *                             type: number
 *                             description: 博客点赞总数（所有评论的点赞数之和）
 *                           createName:
 *                             type: string
 *                             description: 创建者姓名
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                           defaultImage:
 *                             type: string
 *                     total:
 *                       type: number
 */
// 获取所有博客
exports.getAllBlogs = async (req, res) => {
    try {
        // 检查是否需要按最新时间排序
        const sortByLatest = req.query.sortByLatest === 'true';

        let query = Blog.find({})
            .populate({
                path: 'user',
                select: 'name email role avatar'
            });

        // 如果需要按最新时间排序，添加排序条件
        if (sortByLatest) {
            query = query.sort({ createdAt: -1 });
        }

        const blogs = await query;

        const data = await Promise.all(blogs.map(async (blog) => {
            const blogObj = blog.toObject();
            blogObj.createName = blog.user ? blog.user.name : '';
            // 直接获取图片URL数组
            blogObj.images = blog.blogImage.map(img => img.image);
            // 添加默认图片，取第一张图片，如果没有则为空字符串
            blogObj.defaultImage = blog.blogImage[0]?.image || '';

            // 获取博客评论数量
            const commentCount = await Comment.countDocuments({ blog: blog._id });
            blogObj.commentCount = commentCount;

            // 获取博客所有评论的点赞总数
            const comments = await Comment.find({ blog: blog._id });
            const totalLikes = comments.reduce((sum, comment) => sum + (comment.likeCount || 0), 0);
            blogObj.likeCount = totalLikes;

            return blogObj;
        }));

        return res.status(200).json({
            success: true,
            data: { ...res.advancedResults, data, total: data.length, },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

/**
 * @swagger
 * /blogs/{id}:
 *   get:
 *     summary: 获取单个博客
 *     tags: [博客]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 博客ID
 *     responses:
 *       200:
 *         description: 成功获取博客详情
 *       404:
 *         description: 博客未找到
 */
// 获取单个博客
exports.getBlogById = async (req, res) => {
    try {
        const blogId = req.params.id
        const blog = await Blog.findById(blogId).populate({
            path: 'user',
            select: 'name email role'
        });

        if (!blog) return res.status(404).json({ message: 'Blog not found' });

        const blogObj = blog.toObject();
        blogObj.images = blog.blogImage.map(img => img.image);
        blogObj.defaultImage = blog.blogImage[0]?.image || '';
        blogObj.createName = blog.user ? blog.user.name : '';

        // 获取博客评论数量
        const commentCount = await Comment.countDocuments({ blog: req.params.id });
        blogObj.commentCount = commentCount;

        // 修正：使用 Comment.find 而不是 Comment
        const commentList = await Comment.find({ blog: req.params.id }).populate({
            path: 'user',
            select: 'name avatar'
        }).sort({ createdAt: -1 });

        blogObj.commentList = commentList;

        res.status(200).json({
            success: true,
            data: blogObj
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * @swagger
 * /blogs:
 *   post:
 *     summary: 创建博客
 *     tags: [博客]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Blog'
 *     responses:
 *       200:
 *         description: 博客创建成功
 *       400:
 *         description: 请求错误
 *       401:
 *         description: 未授权，请先登录
 */
exports.createBlog = async (req, res) => {
    try {
        console.log(req)
        // 检查用户信息是否存在
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: '未授权，请先登录' });
        }
        const blogData = {
            ...req.body,
            user: req.user._id
        };
        const newBlog = new Blog(blogData);
        const savedBlog = await newBlog.save();
        res.status(200).json({
            success: true,
            id: savedBlog._id
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * @swagger
 * /blogs/{id}:
 *   put:
 *     summary: 更新博客
 *     tags: [博客]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 博客ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Blog'
 *     responses:
 *       200:
 *         description: 博客更新成功
 *       404:
 *         description: 博客未找到
 */
// 更新博客
exports.updateBlog = async (req, res) => {
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedBlog) return res.status(404).json({ message: 'Blog not found' });
        res.status(200).json(updatedBlog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * @swagger
 * /blogs/{id}:
 *   delete:
 *     summary: 删除博客
 *     tags: [博客]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 博客ID
 *     responses:
 *       200:
 *         description: 博客删除成功
 *       404:
 *         description: 博客未找到
 */
// 删除博客
exports.deleteBlog = async (req, res) => {
    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        if (!deletedBlog) return res.status(404).json({ message: 'Blog not found' });
        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
