const db = require('../models/index.model');
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');

// Lấy thống kê tổng quan
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Doanh thu hôm nay - chỉ tính đơn đã xác nhận (status = 2)
    const todayRevenue = await db.Order.sum('total_amount', {
      where: {
        order_date: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        },
        order_status: 2 // Chỉ tính đơn đã xác nhận
      }
    }) || 0;

    // Đơn hàng mới hôm nay
    const newOrdersToday = await db.Order.count({
      where: {
        order_date: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      }
    });

    // Tổng số khách hàng
    const totalCustomers = await db.Customer.count();

    // Tổng số sản phẩm
    const totalProducts = await db.Product.count();

    // Tổng số nhân viên
    const totalEmployees = await db.Employee.count({
      where: {
        status: '1' // Chỉ đếm nhân viên đang làm việc
      }
    });

    // Tổng số voucher
    const totalVouchers = await db.Voucher.count();

    // Tổng số hàng đổi trả (nếu có bảng returns)
    // Giả sử có bảng returns, nếu không có thì trả về 0
    let totalReturns = 0;
    try {
      if (db.Return) {
        totalReturns = await db.Return.count();
      }
    } catch (err) {
      // Bảng returns có thể không tồn tại
      totalReturns = 0;
    }

    res.json({
      todayRevenue: Number(todayRevenue),
      newOrdersToday,
      totalCustomers,
      totalProducts,
      totalEmployees,
      totalVouchers,
      totalReturns
    });
  } catch (error) {
    console.error('Lỗi khi lấy thống kê dashboard:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thống kê', error: error.message });
  }
};

// Lấy dữ liệu doanh thu theo tháng trong năm
exports.getRevenueByMonth = async (req, res) => {
  try {
    const { year } = req.query;
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    // Tạo mảng 12 tháng
    const monthlyRevenue = [];
    const monthLabels = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                         'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(selectedYear, month - 1, 1);
      const endDate = new Date(selectedYear, month, 1);

      const revenue = await db.Order.sum('total_amount', {
        where: {
          order_date: {
            [Op.gte]: startDate,
            [Op.lt]: endDate
          },
          order_status: 2 // Chỉ tính đơn đã xác nhận
        }
      }) || 0;

      monthlyRevenue.push({
        month: month,
        label: monthLabels[month - 1],
        revenue: Number(revenue)
      });
    }

    res.json({
      year: selectedYear,
      data: monthlyRevenue
    });
  } catch (error) {
    console.error('Lỗi khi lấy doanh thu theo tháng:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy doanh thu', error: error.message });
  }
};

