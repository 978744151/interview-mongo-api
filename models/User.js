const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// require('dotenv').config()
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "请添加名字"],
  },
  // phone: {
  //   type: String,
  //   required: [true, "请添加手机号"],
  // },
  email: {
    type: String,
    unique: true,
    required: [true, "请填写邮箱"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "请填写正确的邮箱地址",
    ],
  },
  password: {
    type: String,
    required: [true, "请添加密码"],
    minlength: 6,
    select: false,
  },
  avatar: {
    type: String,
    required: [false, "请上传logo"],
  },
  role: {
    type: String,
    enum: ["admin", "user", "visitor"],
    default: "user",
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // 关注的用户
  following: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],

  // 粉丝
  followers: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.getSignedJwtToken = function () {
  console.log(process.env.JWT_EXPIRE)
  return jwt.sign({ id: this._id, name: this.name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// 密码匹配方法
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  // 给resetPasswordToken赋值
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 设置过期时间
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
module.exports = mongoose.model("User", UserSchema);
