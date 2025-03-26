const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const morgan = require("morgan");
const colors = require("colors");
const errorHandler = require("./middleware/error.js");
const cookieParser = require("cookie-parser");
const http = require('http');
const cors = require('cors');
require('./utils/scheduler');
// 引入路由文件
const mscamps = require("./routes/mscamps.js");
const courses = require("./routes/courses.js");
const auth = require("./routes/auth.js");
const users = require("./routes/users.js");
const reviews = require("./routes/reviews.js");
const blogs = require("./routes/blogs.js");
const nftRoutes = require('./routes/nft');
const categoryRoutes = require('./routes/nftCategory');
const uploadRoutes = require('./routes/upload');
const theOneNewsRoutes = require('./routes/theOneNews');
const comment = require('./routes/comments');

const paths = require('path');

const path = process.env.NODE_ENV === 'production' ? "./config/config.prod.env" : './config/config.dev.env'
dotenv.config({
  path
});

// ./docgen build -i 米修在线api.postman_collection.json -o index.html

// 链接数据库
connectDB();

const app = express();

app.use(cors({
  origin: '*', // 允许所有域名访问，生产中可改为 'http://e5yue.cn'
}));
// 配置Body解析
app.use(express.json());

// 使用morgan中间件
app.use(morgan("dev"));

// app.use(logger);

// 使用cookie中间件
app.use(cookieParser());
app.get("", (req, res) => {
  res.status(200).json({ success: true, mes: "米修在线" });
});
// 挂载路由节点 http://localhost:5000/api/v1/mscamps
app.use("/api/v1/mscamps", mscamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);
app.use('/api/v1/nft-categories', categoryRoutes);
app.use("/api/v1/blogs", blogs);
app.use('/api/v1/nfts', nftRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/theone-news', theOneNewsRoutes);
app.use('/api/v1/comment', comment);
// 一定要写在路由挂载之前
app.use(errorHandler);
app.use('/uploads', express.static(paths.join(__dirname, 'public/uploads')));

// const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const port = process.env.SERVER_PORT || 5001;
const url = process.env.SERVER_IP
server.listen(port, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on ${process.env.SERVER_URL}`);
});
// const server = app.listen(
//   PORT, process.env.SERVER_IP,
// );

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red.bold);
  // 关闭服务器 & 退出进程
  server.close(() => {
    process.exit(1);
  });
});
