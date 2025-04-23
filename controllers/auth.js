const crypto = require("crypto");
const User = require("../models/User.js");
const ErrorResponse = require("../utils/errorResponse.js");
const asyncHandler = require("../middleware/async.js");
const sendEmail = require("../utils/sendEmail.js");

/**
 * @swagger
 * tags:
 *   name: 认证
 *   description: 用户认证相关API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: 用户名
 *         email:
 *           type: string
 *           description: 邮箱
 *         password:
 *           type: string
 *           description: 密码
 *         role:
 *           type: string
 *           description: 角色
 *           enum: [user, publisher, admin]
 *         avatar:
 *           type: string
 *           description: 头像URL
 *       example:
 *         name: "张三"
 *         email: "zhangsan@example.com"
 *         password: "123456"
 *         role: "user"
 *         avatar: "https://api.dicebear.com/9.x/avataaars/svg"
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: 用户注册
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, publisher]
 *     responses:
 *       200:
 *         description: 注册成功并返回token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, role, password } = req.body;
  // 注册用户
  const user = await User.create({ name, email, password, role });

  // 生成token
  sendTokenResponse(user, 200, res);
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 用户登录
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *                 description: 自动注册时使用的用户名
 *     responses:
 *       200:
 *         description: 登录成功并返回token
 *       400:
 *         description: 邮箱格式不正确或缺少必要字段
 *       401:
 *         description: 密码错误
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password, name } = req.body;

  // 验证邮箱和密码是否为空
  if (!email || !password) {
    return next(new ErrorResponse("请填写邮箱和密码", 400));
  }

  // 验证邮箱格式是否正确
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    return next(new ErrorResponse("邮箱格式不正确", 400));
  }

  // 获取用户信息
  let user = await User.findOne({ email }).select("+password");

  // 如果用户不存在，自动注册
  if (!user) {
    // 处理用户名：使用传入的name或邮箱前缀，并对中间部分进行星号替换
    let userName = name || email.split('@')[0];

    // 对用户名进行星号处理：保留首尾字符，中间用星号替换
    if (userName.length > 2) {
      const firstChar = userName.charAt(0);
      const lastChar = userName.charAt(userName.length - 1);
      const stars = '*'.repeat(userName.length - 2);
      userName = firstChar + stars + lastChar;
    }

    // 生成随机卡通头像
    const avatarStyles = ['adventurer', 'avataaars', 'big-ears', 'big-smile', 'glass', 'notionists-neutral', 'bottts', 'croodles', 'micah', 'miniavs', 'open-peeps', 'personas', 'pixel-art', 'fun-emoji', 'pixel-art-neutral'];
    const randomStyle = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
    const hair = ['long01', 'long02'
      ,
      'long03'
      ,
      'long04'
      ,
      'long05'
      ,
      'long06'
      ,
      'long07'
      ,
      'long08'
      ,
      'long09'
      ,
      'long10'
      ,
      'long11'
      ,
      'long12'
      ,
      'long13'
      ,
      'long14'
      ,
      'long15'
      ,
      'long16'
      ,
      'long17'
      ,
      'long18'
      ,
      'long19'
      ,
      'long20'
      ,
      'long21'
      ,
      'long22'
      ,
      'long23'
      ,
      'long24'
      ,
      'long25'
      ,
      'long26'
      ,
      'short01'
      ,
      'short02'
      ,
      'short03'
      ,
      'short04'
      ,
      'short05'
      ,
      'short06'
      ,
      'short07'
      ,
      'short08'
      ,
      'short09'
      ,
      'short10'
      ,
      'short11'
      ,
      'short12'
      ,
      'short13'
      ,
      'short14'
      ,
      'short15'
      ,
      'short16'
      ,
      'short17'
      ,
      'short18'
      ,
      'short19'
    ]
    console.log(hair)
    const hairStyle = hair[Math.floor(Math.random() * hair.length)];
    console.log('hairStyle', Math.floor(Math.random() * hair.length));
    const avatarUrl = `https://api.dicebear.com/9.x/${randomStyle}/svg`;

    try {
      // 创建新用户
      user = await User.create({
        name: userName,
        email,
        password,
        role: 'user', // 默认角色
        avatar: avatarUrl // 添加随机头像
      });

      // 生成token并返回
      return sendTokenResponse(user, 200, res);
    } catch (error) {
      return next(new ErrorResponse(`注册失败: ${error.message}`, 400));
    }
  }

  //  密码匹配
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse("密码错误", 401));
  }
  // 生成token;
  sendTokenResponse(user, 200, res);
});

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: 获取所有用户信息
 *     tags: [认证]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取所有用户
 */
exports.getAllUser = asyncHandler(async (req, res, next) => {
  //   console.log(req.user);
  const user = await User.find();
  res.status(200).json({ success: true, data: user });
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: 获取当前登录用户信息
 *     tags: [认证]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户信息
 *       404:
 *         description: 未找到用户信息
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorResponse("未找到用户信息", 404));
  }

  // 确保返回用户名
  const userData = user.toObject();

  res.status(200).json({
    success: true,
    data: userData
  });
});

/**
 * @desc    更新个人信息
 * @route   PUT /api/v1/auth/updatedetails
 * @access  Private
 */
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});

/**
 * @desc    更新密码
 * @route   PUT /api/v1/auth/updatepassword
 * @access  Private
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
  // 旧密码 新密码
  const user = await User.findById(req.user.id).select("+password");

  // 判断旧密码和数据库密码是否一致
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("密码错误", 401));
  }

  // 更新密码
  user.password = req.body.newPassword;

  // 存储
  await user.save();

  sendTokenResponse(user, 200, res);
});

/**
 * @desc    忘记密码
 * @route   POST /api/v1/auth/forgotpassword
 * @access  公开的
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  // 校验用户
  if (!user) {
    return next(new ErrorResponse("未找到该用户", 404));
  }

  const resetToken = user.getResetPasswordToken();
  // console.log(resetToken);

  await user.save({ validateBeforeSave: false });

  // 发送邮件 包含重置密码的网址
  // {{URL}}/api/v1/auth/resetpassword/imissu1217
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `收到该邮件的原因是你需要重置密码, 请点击链接${req.protocol
    }://${req.get("host")}/api/v1/auth/resetpassword/${resetToken}`;

  // 发送邮件
  try {
    await sendEmail({
      email: user.email,
      subject: "重置密码",
      message,
    });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("邮件发送失败", 500));
  }

  res.status(200).json({ success: true, data: user });
});

/**
 * @desc    重置密码
 * @route   POST /api/v1/auth/resetpassword/:resettoken
 * @access  公开的
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 获取resetPasswordToken
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("token不合法", 400));
  }

  // 重置密码
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  // 存储
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// 生成token并存储到cookie的方法
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV == "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
