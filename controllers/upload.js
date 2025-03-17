const asyncHandler = require("../middleware/async");

exports.uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: '请选择要上传的图片'
        });
    }

    const fileUrl = `${process.env.SERVER_URL}/uploads/${req.file.filename}`;
    const data = {
        filename: req.file.filename,
        url: fileUrl
    }
    res.status(200).json({
        success: true,
        data
    });
});