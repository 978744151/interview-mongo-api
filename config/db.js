const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(
    "mongodb://127.0.0.1:27017/admin", {
    useNewUrlParser: true,
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