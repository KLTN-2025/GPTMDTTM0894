const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categories.controller');
const upload = require('../helper/upload');

router.get('/home', categoryController.getHomepageData); // lấy danh sach danh mục và snr phẩm được ghim

router.get('/', categoryController.getCategories); // Lấy tất cả

router.get('/parent', categoryController.getParentCategories); //lấy danh mục cha cho trang khách

router.get('/category-product/:name', categoryController.getCategoryDetail);

router.get('/parent/:parentId', categoryController.getChildrenByParentId); // Lấy theo parent_id

router.get('/:id', categoryController.getCategoryById); // Lấy theo ID

router.post('/', upload.single('image'), categoryController.createCategory); // Thêm mới

router.put('/:id', upload.single('image'), categoryController.updateCategory); // Sửa danh mục

router.delete('/:id', categoryController.deleteCategory); // Xóa

router.patch('/:id/is_primary', categoryController.togglePrimary); // Ghim danh mục

router.patch('/:id/is_active', categoryController.toggleActive); // Ẩn/hiện danh mục

module.exports = router;
