const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// 关注用户
exports.followUser = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    // 不能关注自己
    if (userId === req.user.id) {
        return res.status(400).json({
            success: false,
            message: '不能关注自己'
        });
    }

    // 查找要关注的用户
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
        return res.status(400).json({
            success: false,
            message: '用户不存在'
        });
    }

    // 检查是否已经关注
    const currentUser = await User.findById(req.user.id);
    if (currentUser.following.includes(userId)) {
        return res.status(400).json({
            success: false,
            message: '已经关注该用户'
        });
    }

    // 添加关注关系
    await User.findByIdAndUpdate(req.user.id, {
        $push: { following: userId }
    });
    await User.findByIdAndUpdate(userId, {
        $push: { followers: req.user.id }
    });

    res.status(200).json({
        success: true,
        message: '关注成功'
    });
});

// 取消关注
exports.unfollowUser = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    // 查找要取消关注的用户
    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
        return res.status(400).json({
            success: false,
            message: '用户不存在'
        });
    }

    // 检查是否已经关注
    const currentUser = await User.findById(req.user.id);
    if (!currentUser.following.includes(userId)) {
        return res.status(400).json({
            success: false,
            message: '未关注该用户'
        });
    }

    // 移除关注关系
    await User.findByIdAndUpdate(req.user.id, {
        $pull: { following: userId }
    });
    await User.findByIdAndUpdate(userId, {
        $pull: { followers: req.user.id }
    });

    res.status(200).json({
        success: true,
        message: '取消关注成功'
    });
});

// 获取用户关注信息
exports.getFollowInfo = asyncHandler(async (req, res) => {
    const userId = req.params.userId || req.user.id;

    const user = await User.findById(userId)
        .populate('following', 'name avatar')
        .populate('followers', 'name avatar');

    res.status(200).json({
        success: true,
        data: {
            followingCount: user.following.length,
            followersCount: user.followers.length,
            following: user.following,
            followers: user.followers,
            isFollowing: req.user ? user.followers.includes(req.user.id) : false
        }
    });
});

// 检查是否关注
exports.checkFollowStatus = asyncHandler(async (req, res) => {
    const { userId, followId } = req.query;
    // 查找用户的关注列表
    const user = await User.findById(userId);
    if (!user) {
        return res.status(400).json({
            success: false,
            message: '用户不存在'
        });
    }

    // 检查是否关注
    const isFollowing = user.following.includes(followId);

    res.status(200).json({
        success: true,
        data: {
            isFollowing
        }
    });
});