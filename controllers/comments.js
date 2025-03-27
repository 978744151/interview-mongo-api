const Comment = require('../models/comments');
const Blog = require('../models/blogs.js');
const asyncHandler = require("../middleware/async.js");
const User = require("../models/User.js");
const jwt = require("jsonwebtoken");

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
    // 处理评论数据，添加当前用户是否点赞的信息
    const processedComments = comments.map(comment => {
        const commentObj = comment.toObject();
        // 初始化 likes 数组（如果不存在）
        if (!comment.likes) {
            comment.likes = [];
        }
        // 检查用户是否登录并处理点赞状态
        const userId = req.user ? req.user._id.toString() : null;
        commentObj.isLiked = userId ? comment.likes.some(like => like.toString() === userId) : false;
        commentObj.likeCount = comment.likes.length || 0;

        return commentObj;
    });
    res.status(200).json({
        success: true,
        count: processedComments.length,
        data: processedComments
    });
});

// 回复评论
exports.replyToComment = asyncHandler(async (req, res) => {
    // 添加用户ID到请求体
    req.body.user = req.user._id;
    console.log("用户ID:", req.body.commentId);
    // 检查父评论是否存在
    const parentComment = await Comment.findById(req.body.commentId);
    if (!parentComment) {
        return res.status(400).json({
            success: false,
            message: '父评论不存在'
        });
    }

    // 添加博客ID和父评论ID到请求体
    req.body.blog = parentComment.blog;
    req.body.parentId = req.body.commentId;

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
// 点赞评论
exports.likeComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.body.commentId);

    if (!comment) {
        return res.status(404).json({
            success: false,
            message: '评论不存在'
        });
    }

    // 检查用户是否已经点赞
    const likeIndex = comment.likes.indexOf(req.user._id);

    if (likeIndex === -1) {
        // 未点赞，添加点赞
        comment.likes.push(req.user._id);
        comment.likeCount = comment.likes.length;
        await comment.save();

        res.status(200).json({
            success: true,
            message: '点赞成功',
            likeCount: comment.likeCount
        });
    } else {
        // 已点赞，取消点赞
        comment.likes.splice(likeIndex, 1);
        comment.likeCount = comment.likes.length;
        await comment.save();

        res.status(200).json({
            success: true,
            message: '取消点赞成功',
            likeCount: comment.likeCount
        });
    }
});