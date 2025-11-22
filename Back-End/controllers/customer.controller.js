const db = require('../models/index.model');
const Customer = db.Customer;
const bcrypt = require('bcryptjs');
const generateToken = require('../middlewares/auth');
const { sendOTPByEmail } = require('../helper/sendMail');
const { sendOtpSms } = require('../helper/sendSMS');
const redisClient = require('../config/redisClient');
const { Op } = require('sequelize');

exports.getProfile = async (req, res) => {
  try {
    const id = req.customer.id_customer;

    const user = await Customer.findByPk(id, {
      attributes: ['id_customer', 'name', 'email', 'phone', 'status', 'block_reason']
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy danh sách tất cả khách hàng
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json({ customers });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách khách hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy khách hàng theo ID
exports.getCustomerById = async (req, res) => {
  const customerId = req.params.id;
  try {
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }
    res.json({ customer });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Cập nhật thông tin khách hàng
exports.updateCustomer = async (req, res) => {
  const id = req.params.id;
  const { name, last_name, given_name, phone, email } = req.body;

  if (!name || !last_name || !given_name || !phone || !email) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
  }

  try {
    // Kiểm tra email trùng với khách hàng khác
    const duplicateEmail = await Customer.findOne({
      where: {
        email,
        id_customer: { [Op.ne]: id }
      }
    });
    if (duplicateEmail) {
      return res.status(400).json({ message: 'Email đã được sử dụng bởi người khác' });
    }

    // Kiểm tra phone trùng với khách hàng khác
    const duplicatePhone = await Customer.findOne({
      where: {
        phone,
        id_customer: { [Op.ne]: id }
      }
    });
    if (duplicatePhone) {
      return res.status(400).json({ message: 'Số điện thoại đã được sử dụng bởi người khác' });
    }

    const [updated] = await Customer.update(
      { name, last_name, given_name, phone, email },
      { where: { id_customer: id } }
    );

    if (updated === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }

    res.json({ message: 'Cập nhật khách hàng thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật thông tin', error: error.message });
  }
};

// Chặn hoặc mở chặn khách hàng
exports.toggleCustomerStatus = async (req, res) => {
  const customerId = req.params.id;
  let { status, block_reason } = req.body;

  // Chuyển status string/number sang boolean
  if (status === 'true' || status === 1 || status === '1') status = true;
  else if (status === 'false' || status === 0 || status === '0') status = false;
  else if (typeof status !== 'boolean') {
    return res.status(400).json({
      message: 'Trạng thái không hợp lệ. Chỉ nhận true/false hoặc 1/0.'
    });
  }

  // Nếu status = true (1) => mở chặn => block_reason = null
  // Nếu status = false (0) => chặn => block_reason không null
  const updateData = {
    status,
    block_reason: status ? null : (block_reason || 'Không rõ lý do')
  };

  try {
    const [updated] = await Customer.update(updateData, {
      where: { id_customer: customerId }
    });

    if (updated === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }

    const message = status
      ? 'Khách hàng đã được mở chặn'
      : 'Khách hàng đã bị chặn';

    res.json({ message });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi khi cập nhật trạng thái khách hàng',
      error: error.message
    });
  }
};

// Đăng ký khách hàng
exports.register = async (req, res) => {
  const { name, last_name, given_name, phone, email, password } = req.body;

  if (!name || !phone || !email || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
  }

  try {
    // Kiểm tra trùng email hoặc điện thoại
    const existsEmail = await Customer.findOne({ where: { email } });
    if (existsEmail) return res.status(409).json({ message: 'Email đã tồn tại' });

    const existsPhone = await Customer.findOne({ where: { phone } });
    if (existsPhone) return res.status(409).json({ message: 'Số điện thoại đã tồn tại' });

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo khách hàng mới
    const newCustomer = await Customer.create({
      name,
      last_name,
      given_name,
      phone,
      email,
      password: hashedPassword,
      status: 1,  // Mặc định chưa chặn
    });

    const token = generateToken(newCustomer);

    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      customer: {
        id_customer: newCustomer.id_customer,
        name: newCustomer.name,
        last_name: newCustomer.last_name,
        given_name: newCustomer.given_name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        status: newCustomer.status,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Đăng ký thất bại', error: error.message });
  }
};

// Đăng nhập khách hàng
exports.login = async (req, res) => {
  const { phoneOrEmail, password } = req.body;

  if (!phoneOrEmail || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
  }

  try {
    // Tìm user theo email hoặc điện thoại
    let user = await Customer.findOne({ where: { email: phoneOrEmail } });
    if (!user) {
      user = await Customer.findOne({ where: { phone: phoneOrEmail } });
      if (!user) {
        return res.status(404).json({ message: 'Tài khoản không tồn tại' });
      }
    }

    // Kiểm tra trạng thái block
    if (user.status === false) {  // status=false => bị chặn
      return res.status(403).json({ 
        message: `Tài khoản của bạn đã bị chặn. Vui lòng liên hệ Admin` 
      });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Sai mật khẩu' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Đăng nhập thành công',
      token,
      customer: {
        id_customer: user.id_customer,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Gửi OTP cho email hoặc số điện thoại
exports.sendOTP = async (req, res) => {
  const { phoneOrEmail } = req.body;

  if (!phoneOrEmail) {
    return res.status(400).json({ message: 'Vui lòng nhập email hoặc số điện thoại' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000); // mã 6 số
  const expiresAt = Date.now() + 3 * 60 * 1000; // 5 phút

  try {
    let user = await Customer.findOne({ where: { email: phoneOrEmail } });

    if (!user) {
      // Nếu không có email, thử tìm theo số điện thoại
      user = await Customer.findOne({ where: { phone: phoneOrEmail } });

      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
      }

      // ✅ Gửi OTP qua SMS (Twilio)
      const toPhone = phoneOrEmail.startsWith("0")
        ? phoneOrEmail.replace("0", "+84")
        : phoneOrEmail;

      const isSent = await sendOtpSms(toPhone, otp);

      if (!isSent) {
        return res.status(500).json({ message: 'Gửi OTP qua SMS thất bại' });
      }

      await redisClient.set(toPhone, JSON.stringify({ otp, expiresAt }), { EX: 180 });

      return res.json({ message: 'OTP đã được gửi đến số điện thoại' });
    } else {
      // ✅ Gửi OTP qua Email
      await sendOTPByEmail(phoneOrEmail, otp, user.name);
      await redisClient.setEx(phoneOrEmail, 180, JSON.stringify({ otp, expiresAt }));

      return res.json({ message: 'OTP đã được gửi đến email' });
    }
  } catch (error) {
    console.error('❌ Lỗi khi gửi OTP:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xác thực OTP
exports.verifyOTP = async (req, res) => {
  const { phoneOrEmail, otp } = req.body;

  try {
    const data = await redisClient.get(phoneOrEmail);
    if (!data) return res.status(400).json({ message: 'Không tìm thấy mã OTP' });

    const { otp: savedOtp, expiresAt } = JSON.parse(data);

    if (Date.now() > expiresAt) {
      await redisClient.del(phoneOrEmail);
      return res.status(400).json({ message: 'Mã OTP đã hết hạn' });
    }

    if (!savedOtp || otp !== savedOtp.toString()) {
      return res.status(400).json({ message: 'Mã OTP không đúng' });
    }

    // Xác thực thành công -> set lại Redis với `verified: true`
    await redisClient.setEx(phoneOrEmail, 300, JSON.stringify({ verified: true }));

    res.json({ message: 'OTP hợp lệ. Bạn có thể đổi mật khẩu.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đổi mật khẩu sau khi xác thực OTP
exports.resetPassword = async (req, res) => {
  const { phoneOrEmail, newPassword } = req.body;

  try {
    const data = await redisClient.get(phoneOrEmail);
    if (!data) return res.status(400).json({ message: 'Vui lòng xác thực OTP trước' });

    const parsed = JSON.parse(data);
    if (!parsed.verified) return res.status(400).json({ message: 'Vui lòng xác thực OTP trước' });

    // Tìm user
    let user = await Customer.findOne({ where: { email: phoneOrEmail } });
    if (!user) {
      user = await Customer.findOne({ where: { phone: phoneOrEmail } });
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
      }
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu
    await Customer.update({ password: hashedPassword }, { where: { id_customer: user.id_customer } });

    // Xóa key redis sau khi đổi mật khẩu thành công
    await redisClient.del(phoneOrEmail);

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đổi mật khẩu khi user đã đăng nhập (có currentPassword)
exports.changePasswordById = async (req, res) => {
  try {
    const { id } = req.params; // Lấy id_customer từ URL
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới" });
    }

    // Tìm user theo id_customer
    const user = await Customer.findOne({ where: { id_customer: id } });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    // So sánh mật khẩu hiện tại với mật khẩu đã hash
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu mới
    await Customer.update({ password: hashedPassword }, { where: { id_customer: id } });

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
