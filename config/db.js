const mongoose = require('mongoose');
const dotenv = require("dotenv");

// mongoose.connect('mongodb://admin:你的密码@8.155.53.210:27017/yourdb?authSource=admin');
const path =  process.env.NODE_ENV === 'production' ? "./config/config.prod.env" : './config/config.dev.env'
dotenv.config({
  path
});
const connectDB = async () => {
  const conn = await mongoose.connect(
    process.env.SERVER_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true
  });
  mongoose.connection.on("error", function (error) {
    console.log("数据库连接失败：" + error)
  });

  mongoose.connection.on("open", function () {
    console.log("------数据库连接成功！------");
  });


  console.log(`MongoDB Connected: ${conn.connection.host}`);
}
module.exports = connectDB