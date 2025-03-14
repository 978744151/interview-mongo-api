const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/nftCategory');
const { protect, authorize } = require('../middleware/auth');

router.route('/').get(categoryController.getCategories)
router.post('/',protect, categoryController.createCategory);

router.route('/:id')
    .get(categoryController.getCategoryById)
    .put(protect,categoryController.updateCategory)
    .delete(protect, categoryController.deleteCategory);

module.exports = router;