const Comment = require('../models/comments');
const Blog = require('../models/blogs.js');
const asyncHandler = require("../middleware/async.js");

// 创建评论
exports.createComment = asyncHandler(async (req, res) => {
    // 添加用户ID到请求体
    req.body.user = req.user._id;

    // 检查博客是否存在
    const blog = await Blog.findById(req.body.blogId);
    if (!blog) {
        return res.status(404).json({
            success: false,
            message: '博客不存在'
        });
    }

    // 添加博客ID到请求体
    req.body.blog = req.body.blogId;

    const comment = await Comment.create(req.body);

    res.status(201).json({
        success: true,
        data: comment
    });
});

// 获取博客的所有评论
exports.getBlogComments = asyncHandler(async (req, res) => {
    // 先检查博客是否存在
    const blogId = req.body.blogId;
    const blog = await Blog.findById(blogId);
    if (!blog) {
        return res.status(400).json({
            success: false,
            message: '博客不存在'
        });
    }

    // 查询所有与该博客相关的评论，不限制parentId
    const allComments = await Comment.find({ blog: blogId });
    console.log(`博客ID ${blogId} 的所有评论数量:`, allComments.length);

    // 获取顶级评论（没有parentId的评论）
    const comments = await Comment.find({
        blog: blogId,
        parentId: null
    }).populate({
        path: 'user',
        select: 'name avatar'
    }).populate({
        path: 'replies',
        populate: {
            path: 'user',
            select: 'name avatar'
        }
    });

    console.log(`博客ID ${blogId} 的顶级评论数量:`, comments.length);

    res.status(200).json({
        success: true,
        count: comments.length,
        data: comments
    });
});

// 回复评论
exports.replyToComment = asyncHandler(async (req, res) => {
    // 添加用户ID到请求体
    req.body.user = req.user._id;

    // 检查父评论是否存在
    const parentComment = await Comment.findById(req.params.commentId);
    if (!parentComment) {
        return res.status(404).json({
            success: false,
            message: '父评论不存在'
        });
    }

    // 添加博客ID和父评论ID到请求体
    req.body.blog = parentComment.blog;
    req.body.parentId = req.params.commentId;

    const reply = await Comment.create(req.body);

    res.status(201).json({
        success: true,
        data: reply
    });
});

// 删除评论
exports.deleteComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
        return res.status(404).json({
            success: false,
            message: '评论不存在'
        });
    }

    // 检查是否是评论作者或管理员
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({
            success: false,
            message: '没有权限删除此评论'
        });
    }

    // 删除评论及其所有回复
    await Comment.deleteMany({
        $or: [
            { _id: req.params.commentId },
            { parentId: req.params.commentId }
        ]
    });

    res.status(200).json({
        success: true,
        message: '评论已删除'
    });
});