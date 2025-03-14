const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [false, '请输入分类名称'],
        trim: true
    },
    
});

// 在模型定义后添加索引配置
// CategorySchema.index({ name: 1 }, { 
//     collation: {
//         locale: 'en',
//         strength: 2 // 不区分大小写
//     }
// });

module.exports = mongoose.model('NFTCategory', CategorySchema);