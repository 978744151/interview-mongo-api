const asyncHandler = require("../middleware/async");
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

exports.uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: '请选择要上传的图片'
        });
    }

    // 生成压缩后的文件名
    const filename = `compressed_${req.file.filename}`;
    const outputPath = path.join(__dirname, '../public/uploads', filename);

    try {
        // 使用sharp压缩图片
        await sharp(req.file.path)
            .resize(800) // 设置最大宽度
            .jpeg({ quality: 80 }) // JPEG压缩质量
            .toFile(outputPath);

        // 删除原文件
        await fs.unlink(req.file.path);

        const fileUrl = `${process.env.SERVER_URL}/uploads/${filename}`;
        const data = {
            filename: filename,
            url: fileUrl
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: '图片处理失败'
        });
    }
});