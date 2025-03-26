const Blog = require('../models/blogs.js'); // 假设已存在博客模型
const asyncHandler = require("../middleware/async.js");
const Comment = require('../models/comments');

// 获取所有博客
// 获取所有博客
exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({})
            .populate({
                path: 'user',
                select: 'name email role'
            });

        // 处理返回数据，添加 createName 字段
        const data = blogs.map(blog => {
            const blogObj = blog.toObject();
            blogObj.createName = blog.user ? blog.user.name : '';
            return blogObj;
        });
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
// ... existing code ...


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
        res.status(201).json({
            success: true,
            id: savedBlog._id
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// ... existing code ...
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