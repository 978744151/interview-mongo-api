const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/nftCategory');
const { protect, authorize } = require('../middleware/auth');

router.route('/').get(categoryController.getCategories)
router.post('/',protect, authorize('admin', 'owner'),categoryController.createCategory).put(protect,authorize('admin', 'owner'),categoryController.updateCategory)
.delete(protect, authorize('admin', 'owner'),categoryController.deleteCategory);

router.route('/:id').get(categoryController.getCategoryById)
    

module.exports = router;