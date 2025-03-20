const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [false, '请输入分类名称'],
        trim: true
    },
    cover: {
        type: String,
        required: [false, "请上传分类图片"],
    }
});
// CategorySchema.set('toJSON', {
//     virtuals: true,
//     transform: function(doc, ret) {
//         ret.id = ret._id.toString();
//         delete ret._id;
//         delete ret.__v;
//         return ret;
//     }
// });

// CategorySchema.set('toObject', {
//     virtuals: true,
//     transform: function(doc, ret) {
//         ret.id = ret._id.toString();
//         delete ret._id;
//         delete ret.__v;
//         return ret;
//     }
// });
// 在模型定义后添加索引配置
// CategorySchema.index({ name: 1 }, { 
//     collation: {
//         locale: 'en',
//         strength: 2 // 不区分大小写
//     }
// });

module.exports = mongoose.model('NFTCategory', CategorySchema);