// 文件系统对象
const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");
const path =  process.env.NODE_ENV === 'production' ? "./config/config.prod.env" : './config/config.dev.env'

dotenv.config({
  path
});

const Mscamp = require("./models/Mscamp.js");
const Course = require("./models/Course.js");
const User = require("./models/User.js");
const Review = require("./models/Review.js");
const NFT = require("./models/nft.js");
const NFTConsignment = require("./models/NFTConsignment.js");
const NFTTransaction = require("./models/NFTTransaction.js");
const MysteryBox = require("./models/MysteryBox.js");
const UserMysteryBox = require("./models/UserMysteryBox.js");
const UserPoints = require("./models/UserPoints.js");
const PointsHistory = require("./models/PointsHistory.js");

// 链接数据库
mongoose.connect(process.env.NET_MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

// 读取本地json数据
const mscamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/mscamps.json`, "utf-8")
);

const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8")
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, "utf-8")
);

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/reviews.json`, "utf-8")
);

const mysteryBoxes = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/mysteryBoxes.json`, "utf-8")
);

// 生成100个NFT寄售记录
const generateNFTConsignments = async () => {
  try {
    // 获取所有NFT和用户
    const nfts = await NFT.find();
    const allUsers = await User.find();
    
    if (nfts.length === 0 || allUsers.length === 0) {
      console.log('请先确保有NFT和用户数据'.red);
      return [];
    }

    const consignments = [];
    
    // 生成100个寄售记录
    for (let i = 0; i < 100; i++) {
      // 随机选择NFT和卖家
      const randomNFT = nfts[Math.floor(Math.random() * nfts.length)];
      const randomSeller = allUsers[Math.floor(Math.random() * allUsers.length)];
      
      // 生成随机价格 (500-10000之间)
      const price = (Math.floor(Math.random() * 9500) + 500).toString();
      
      consignments.push({
        nft: randomNFT._id,
        seller: randomSeller._id,
        listingPrice: price,
        isAvailable: true,
        listedAt: new Date()
      });
    }
    
    return consignments;
  } catch (error) {
    console.log(error);
    return [];
  }
};

// 为每个用户生成积分数据
const generateUserPoints = async () => {
  try {
    const allUsers = await User.find();
    
    if (allUsers.length === 0) {
      console.log('请先确保有用户数据'.red);
      return [];
    }
    
    const userPoints = [];
    
    for (const user of allUsers) {
      // 生成随机积分 (0-1000之间)
      const points = Math.floor(Math.random() * 1000);
      // 生成随机连续签到天数 (0-30之间)
      const consecutiveCheckIns = Math.floor(Math.random() * 30);
      // 随机生成上次签到时间 (过去7天内的某一天)
      const lastCheckIn = new Date();
      lastCheckIn.setDate(lastCheckIn.getDate() - Math.floor(Math.random() * 7));
      
      userPoints.push({
        user: user._id,
        points,
        consecutiveCheckIns,
        lastCheckIn
      });
    }
    
    return userPoints;
  } catch (error) {
    console.log(error);
    return [];
  }
};

// 生成用户盲盒数据
const generateUserMysteryBoxes = async () => {
  try {
    const allUsers = await User.find();
    const boxes = await MysteryBox.find();
    
    if (allUsers.length === 0 || boxes.length === 0) {
      console.log('请先确保有用户和盲盒数据'.red);
      return [];
    }
    
    const userMysteryBoxes = [];
    
    // 为每个用户随机分配1-5个盲盒
    for (const user of allUsers) {
      const boxCount = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 0; i < boxCount; i++) {
        const randomBox = boxes[Math.floor(Math.random() * boxes.length)];
        const isOpened = Math.random() > 0.5; // 50%的概率已开启
        
        userMysteryBoxes.push({
          user: user._id,
          mysteryBox: randomBox._id,
          isOpened,
          purchasedAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)), // 过去30天内随机时间
          openedAt: isOpened ? new Date() : null
        });
      }
    }
    
    return userMysteryBoxes;
  } catch (error) {
    console.log(error);
    return [];
  }
};

// 导入数据到mongodb数据库
const importData = async () => {
  try {
    await Mscamp.create(mscamps);
    await Course.create(courses);
    await User.create(users);
    await Review.create(reviews);
    await MysteryBox.create(mysteryBoxes);
    
    // 生成并导入NFT寄售列表
    const nftConsignments = await generateNFTConsignments();
    if (nftConsignments.length > 0) {
      await NFTConsignment.create(nftConsignments);
      console.log(`成功生成 ${nftConsignments.length} 条NFT寄售数据`.green);
    }
    
    // 生成并导入用户积分数据
    const userPoints = await generateUserPoints();
    if (userPoints.length > 0) {
      await UserPoints.create(userPoints);
      console.log(`成功生成 ${userPoints.length} 条用户积分数据`.green);
    }
    
    // 生成并导入用户盲盒数据
    const userMysteryBoxes = await generateUserMysteryBoxes();
    if (userMysteryBoxes.length > 0) {
      await UserMysteryBox.create(userMysteryBoxes);
      console.log(`成功生成 ${userMysteryBoxes.length} 条用户盲盒数据`.green);
    }
    
    console.log("数据存储成功".green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// 删除数据库中的数据
const deleteData = async () => {
  try {
    await Mscamp.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    await NFTConsignment.deleteMany();
    await NFTTransaction.deleteMany();
    await MysteryBox.deleteMany();
    await UserMysteryBox.deleteMany();
    await UserPoints.deleteMany();
    await PointsHistory.deleteMany();
    console.log("数据删除成功".red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// console.log(process.argv);
if (process.argv[2] == "-i") {
  importData();
} else if (process.argv[2] == "-d") {
  deleteData();
}
