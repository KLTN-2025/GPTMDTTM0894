const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banner.controller');
const upload = require('../helper/upload');

//ghim
router.put('/toggle/:id', bannerController.toggleBanner);

// lấy tất cả danh sách banner
router.get('/', bannerController.getAllBanners);

//tạo banner
router.post('/', upload.single('file'), bannerController.createBanner);

//cập nhật banner
router.put('/:id', upload.single('file'), bannerController.updateBanner);

//xóa banner
router.delete('/:id', bannerController.deleteBanner);

module.exports = router;
