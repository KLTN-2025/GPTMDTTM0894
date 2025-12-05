const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

// Lấy thống kê tổng quan
router.get('/stats', dashboardController.getDashboardStats);

// Lấy doanh thu theo tháng trong năm
router.get('/revenue', dashboardController.getRevenueByMonth);

module.exports = router;

