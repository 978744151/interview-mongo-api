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
    // 填充用户信息后返回
    const populatedComment = await Comment.findById(comment._id)
        .populate({
            path: 'user',
            select: 'name avatar'
        });

    res.status(201).json({
        success: true,
        data: populatedComment
    });
});


// 回复评论
exports.replyToComment = asyncHandler(async (req, res) => {
    // 添加用户ID到请求体
    req.body.user = req.user._id;

    // 检查要回复的评论是否存在
    const parentComment = await Comment.findById(req.body.commentId);
    if (!parentComment) {
        return res.status(400).json({
            success: false,
            message: '要回复的评论不存在'
        });
    }

    // 获取当前用户和被回复用户的信息
    const [currentUser, replyToUser] = await Promise.all([
        User.findById(req.user._id).select('name'),
        User.findById(req.body.replyTo || parentComment.user).select('name')
    ]);
    // 构建回复数据
    const replyData = {
        content: req.body.content,
        user: req.user._id,
        blog: parentComment.blog,
        parentId: parentComment.parentId || parentComment._id,
        replyTo: req.body.replyTo || parentComment.user,
        fromUserName: currentUser.name,          // 记录评论者用户名
        toUserName: replyToUser.name,           // 记录被回复者用户名
        // fromUserAvatar: currentUser.avatar,    // 添加评论者头像
        // toUserAvatar: replyToUser.avatar      // 添加被回复者头像
    };

    const reply = await Comment.create(replyData);
    console.log(reply)
    // 填充用户信息后返回
    const populatedReply = await Comment.findById(reply._id)
        .populate({
            path: 'user',
            select: 'name avatar'
        })
        .populate({
            path: 'replyTo',
            select: 'name avatar'
        });

    res.status(201).json({
        success: true,
        data: populatedReply
    });
});

// 获取博客的所有评论
exports.getBlogComments = asyncHandler(async (req, res) => {
    const blogId = req.body.blogId;
    const blog = await Blog.findById(blogId);
    if (!blog) {
        return res.status(400).json({
            success: false,
            message: '博客不存在'
        });
    }

    // 获取顶级评论及其回复
    const comments = await Comment.find({
        blog: blogId,
        parentId: null
    }).populate({
        path: 'user',
        select: 'name avatar'
    }).populate({
        path: 'replies',
        populate: [
            {
                path: 'user',
                select: 'name avatar'
            },
            {
                path: 'replyTo',
                select: 'name avatar'
            }
        ],
        options: { sort: { createdAt: 1 } }
    }).sort({ createdAt: -1 });

    // 处理评论数据
    const processedComments = comments.map(comment => {
        const commentObj = comment.toObject();
        // 处理点赞信息
        if (!comment.likes) comment.likes = [];
        const userId = req.user ? req.user._id.toString() : null;
        commentObj.isLiked = userId ? comment.likes.some(like => like.toString() === userId) : false;
        commentObj.likeCount = comment.likes.length || 0;

        // 处理回复的点赞信息和用户名信息
        if (commentObj.replies) {
            commentObj.replies = commentObj.replies.map(reply => {
                if (!reply.likes) reply.likes = [];
                reply.isLiked = userId ? reply.likes.some(like => like.toString() === userId) : false;
                reply.likeCount = reply.likes.length || 0;

                // 保留fromUserName和toUserName
                reply.fromUserName = reply.fromUserName || reply.user?.name || '';
                reply.toUserName = reply.toUserName || reply.replyTo?.name || '';

                return reply;
            });
        }

        return commentObj;
    });

    res.status(200).json({
        success: true,
        count: processedComments.length,
        data: processedComments
    });
});

// 删除评论
exports.deleteComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
        return res.status(400).json({
            success: false,
            message: '评论不存在'
        });
    }

    // 检查是否是评论作者或管理员
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(400).json({
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