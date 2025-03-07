const mongoose = require("mongoose");

const blogsSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "请添加博客名称"],
  },
  description: {
    type: String,
    required: [false, "请填写博客的描述"],
  },
  weeks: {
    type: String,
    required: [false, "请添加学习周期"],
  },
  tuition: {
    type: String,
    required: [false, "请添加博客费用"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
 
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

// 配置virtual
blogsSchema.virtual("blogs", {
    ref: "blogs",
    localField: "_id",
    foreignField: "mscamp",
    justOne: false,
  });
module.exports = mongoose.model("blogs", blogsSchema);
