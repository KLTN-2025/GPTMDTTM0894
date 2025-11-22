const db = require('../models/index.model');
const Voucher = db.Voucher;
const VoucherUsage = db.VoucherUsage
const Product = db.Product;
const VoucherProduct = db.VoucherProduct;
const { sequelize } = db;
 
//create voucher
exports.createVoucher = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    let {
      name,
      code,
      description,
      discount_type,
      discount_value,
      min_order_value,
      user_limit,
      usage_limit,
      start_date,
      end_date,
      status,
    } = req.body;

    if (!name || !code || !discount_type || !discount_value) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin bắt buộc." });
    }

    if (!["percent", "fixed"].includes(discount_type)) {
      return res.status(400).json({ message: "Loại giảm giá không hợp lệ." });
    }

    const discountVal = parseFloat(discount_value);
    if (isNaN(discountVal) || discountVal <= 0) {
      return res.status(400).json({ message: "Giá trị giảm giá không hợp lệ." });
    }
    if (discount_type === 'percent' && discountVal > 100) {
      return res.status(400).json({ message: "Giá trị giảm giá phần trăm không được vượt quá 100." });
    }

    const existing = await Voucher.findOne({ where: { code } });
    if (existing) {
      return res.status(400).json({ message: "Mã voucher đã tồn tại." });
    }

    min_order_value = min_order_value ? parseFloat(min_order_value) : null;
    user_limit = user_limit ? parseInt(user_limit) : null;
    usage_limit = usage_limit ? parseInt(usage_limit) : null;
    status = status !== undefined ? parseInt(status) : 1;

    const newVoucher = await Voucher.create({
      name,
      code,
      description: description || '',
      discount_type,
      discount_value: discountVal,
      min_order_value,
      user_limit,
      usage_limit,
      start_date: start_date ? new Date(start_date) : null,
      end_date: end_date ? new Date(end_date) : null,
      status,
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: "Tạo voucher thành công", voucher: newVoucher });
  } catch (error) {
    console.error("Lỗi khi tạo voucher:", error.message || error);
    await t.rollback();
    res.status(500).json({ message: "Đã xảy ra lỗi khi tạo voucher." });
  }
};


//get list all 
exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.findAll({
      order: [['create_date', 'DESC']], // sắp xếp mới nhất trước
    });

    res.status(200).json({ vouchers });
  } catch (error) {
    console.error('Lỗi lấy danh sách voucher:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách voucher' });
  }
};

//get detail voucher
exports.getVoucherById = async (req, res) => {
  const id = req.params.id;

  try {
    const voucher = await Voucher.findByPk(id);

    if (!voucher) {
      return res.status(404).json({ message: 'Voucher không tồn tại' });
    }

    // Trả dữ liệu voucher
    res.json(voucher);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết voucher:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy chi tiết voucher' });
  }
};

//update voucher
exports.updateVoucher = async (req, res) => {
  const id = req.params.id;

  try {
    const {
      name,
      code,
      description,
      discount_type,
      discount_value,
      min_order_value,
      user_limit,
      usage_limit,
      start_date,
      end_date,
      status,
    } = req.body;

    const voucher = await Voucher.findByPk(id);
    if (!voucher) return res.status(404).json({ message: 'Voucher không tồn tại' });

    // Kiểm tra mã code đã tồn tại ở voucher khác chưa
    const existing = await Voucher.findOne({
      where: {
        code,
        id_voucher: { [db.Sequelize.Op.ne]: id }, // khác id hiện tại
      },
    });

    if (existing) {
      return res.status(400).json({ message: 'Mã voucher đã tồn tại' });
    }

    // Cập nhật dữ liệu voucher
    await voucher.update({
      name,
      code,
      description,
      discount_type,
      discount_value: Number(discount_value) || 0,
      min_order_value: Number(min_order_value) || 0,
      user_limit,
      usage_limit,
      start_date,
      end_date,
      status,
    });

    return res.json({ message: 'Cập nhật thành công', voucher });
  } catch (err) {
    console.error('❌ Lỗi update voucher:', err);
    return res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật voucher' });
  }
};


//apply voucher
exports.applyVoucher = async (req, res) => {
  const { code, total, productIds } = req.body;
  const userId = req.user?.id_customer;

  if (!userId) {
    return res.status(401).json({ message: 'Bạn cần đăng nhập để sử dụng voucher' });
  }

  try {
    const voucher = await Voucher.findOne({
      where: { code, status: 2 }
    });

    if (!voucher) {
      return res.status(404).json({ message: 'Mã giảm giá không tồn tại hoặc không còn hiệu lực' });
    }

    const now = new Date();
    if (voucher.start_date && new Date(voucher.start_date) > now) {
      return res.status(400).json({ message: 'Voucher chưa bắt đầu sử dụng' });
    }
    if (voucher.end_date && new Date(voucher.end_date) < now) {
      return res.status(400).json({ message: 'Voucher đã hết hạn' });
    }

    if (voucher.min_order_value && Number(total) < Number(voucher.min_order_value)) {
      return res.status(400).json({ message: `Đơn hàng tối thiểu phải từ ${Number(voucher.min_order_value).toLocaleString()}₫` });
    }

    if (voucher.usage_limit && voucher.usage_count >= voucher.usage_limit) {
      return res.status(400).json({ message: 'Voucher đã hết lượt sử dụng' });
    }

    if (voucher.user_limit) {
      const usedCount = await VoucherUsage.count({
        where: {
          id_voucher: voucher.id_voucher,
          id_customer: userId,
        }
      });

      if (usedCount >= voucher.user_limit) {
        return res.status(400).json({ message: 'Bạn đã dùng mã này vượt giới hạn cho phép' });
      }
    }

    const voucherProducts = await VoucherProduct.findAll({
      where: { id_voucher: voucher.id_voucher }
    });
    if (voucherProducts.length > 0) {
      const validProductIds = voucherProducts.map(vp => vp.id_product);
      const hasValidProduct = productIds.some(pid => validProductIds.includes(pid));
      if (!hasValidProduct) {
        return res.status(400).json({ message: 'Voucher không áp dụng cho sản phẩm trong đơn hàng' });
      }
    }

    let discountAmount = 0;
    if (voucher.discount_type === 'percent') {
      discountAmount = Number(total) * (Number(voucher.discount_value) / 100);
    } else if (voucher.discount_type === 'fixed') {
      discountAmount = Number(voucher.discount_value);
    }
    if (discountAmount > Number(total)) discountAmount = Number(total);

    return res.json({
      message: 'Áp dụng voucher thành công',
      discountAmount,
      voucher: {
        code: voucher.code,
        discount_type: voucher.discount_type,
        discount_value: voucher.discount_value,
        min_order_value: voucher.min_order_value
      }
    });
  } catch (error) {
    console.error('Lỗi khi áp dụng voucher:', error);
    return res.status(500).json({ message: 'Lỗi server khi áp dụng voucher' });
  }
};
