const db = require('../models/index.model');
const bcrypt = require('bcryptjs');
const Employee = db.Employee;
const employeeToken = require('../middlewares/tokenForStaff');
const { Op } =  require('sequelize'); 
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body; 
    // identifier có thể là email hoặc phone

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/Phone và mật khẩu là bắt buộc' });
      
    }

    // Tìm nhân viên theo email hoặc phone
    const employee = await Employee.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { email: identifier },
          { phone: identifier }
        ]
      }
    });

    console.log('Đang tìm với:', identifier);

    if (!employee) {
      return res.status(401).json({ error: 'Tài khoản không tồn tại' });
    }

    // Kiểm tra trạng thái block
    if (employee.block === true || employee.block === 1) {
        return res.status(403).json({ error: 'Tài khoản đã bị chặn vui lòng liên hệ với Admin' });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Mật khẩu không chính xác' });
    }

    // Tạo JWT token (ví dụ thời hạn 2 giờ)
    const payload = {
      id_employee: employee.id_employee,
      employee_name: employee.name,
      employee_email: employee.email,
      employee_role: employee.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', { expiresIn: '12h' });

    res.json({
      message: 'Đăng nhập thành công',
      token,
      employee: {
        id_employee: employee.id_employee,
        employee_name: employee.name,
        employee_email: employee.email,
        employee_phone: employee.phone,
        employee_role: employee.role,
        employee_status: employee.status,
        employee_block: employee.block,
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy danh sách nhân viên
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({ order: [['id_employee', 'DESC']] });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy nhân viên theo ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Thêm nhân viên
exports.createEmployee = async (req, res) => {
  try {
    const {
      name,
      gender,
      phone,
      email,
      password,
      position,
      status,
      role,
      block_reason
    } = req.body;

    // Check email đã tồn tại chưa
    const emailExists = await Employee.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ error: 'Email này đã được sử dụng' });
    }

    // Check phone đã tồn tại chưa
    const phoneExists = await Employee.findOne({ where: { phone } });
    if (phoneExists) {
      return res.status(400).json({ error: 'Số điện thoại này đã được sử dụng' });
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo mới nhân viên
    const newEmployee = await Employee.create({
      name,
      gender,
      phone,
      email,
      password: hashedPassword,
      position,
      status: '1',  // mặc định trạng thái '1'
      role,
      block: false,
      block_reason: block_reason || '',
      created_at: new Date(),
    });

    // Tạo token cho nhân viên mới
    const token = employeeToken(newEmployee);

    // Trả về nhân viên + token
    res.status(201).json({ employee: newEmployee, token });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: error.message });
  }
};


// Cập nhật nhân viên
exports.updateEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = { ...req.body };

    // Xoá không cho cập nhật các trường chặn
    delete updatedData.block;
    delete updatedData.block_reason;

    // Không cho cập nhật role (role chỉ được set ban đầu)
    // delete updatedData.role;

    // Kiểm tra trùng email hoặc phone (ngoại trừ chính nhân viên này)
    const existing = await Employee.findOne({
      where: {
        id_employee: { [Op.ne]: id },
        [Op.or]: [
          { email: updatedData.email },
          { phone: updatedData.phone }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'Email hoặc số điện thoại đã được sử dụng bởi nhân viên khác' });
    }

    // Nếu có mật khẩu mới thì hash lại
    if (updatedData.password || updatedData.employee_password) {
      // Tùy biến tên trường pass trên FE hay BE
      const passField = updatedData.password ? 'password' : 'employee_password';
      updatedData[passField] = await bcrypt.hash(updatedData[passField], 10);
    }

    // Cập nhật
    const [updated] = await Employee.update(updatedData, {
      where: { id_employee: id }
    });

    if (updated === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên để cập nhật' });
    }

    return res.json({ message: 'Cập nhật nhân viên thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật nhân viên:', error);
    return res.status(500).json({ error: error.message });
  }
};


// Block hoặc un-block nhân viên
exports.blockEmployee = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { block, reason } = req.body;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }

    // Không cho chặn Super Admin
    if (employee.role === 1) {
      return res.status(403).json({ message: 'Không thể chặn Super Admin' });
    }

    if (block === 1) {
      if (!reason || reason.trim() === '') {
        return res.status(400).json({ message: 'Vui lòng nhập lý do chặn' });
      }

      await Employee.update(
        { block: true, block_reason: reason.trim(), status: 3 },
        { where: { id_employee: id } }
      );
    } else if (block === 0 || block === 2) {
      await Employee.update(
        { block: false, block_reason: '', status: 1 },
        { where: { id_employee: id } }
      );
    } else {
      return res.status(400).json({ message: 'Giá trị block không hợp lệ' });
    }

    return res.json({ message: 'Cập nhật trạng thái chặn thành công' });
  } catch (error) {
    console.error('Lỗi khi chặn/bỏ chặn nhân viên:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
};

//check status
exports.checkEmployeeStatus = async (req, res) => {
  // console.log("✅ Đã gọi tới checkEmployeeStatus");
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      // console.log('Thiếu header Authorization');
      return res.status(401).json({ message: 'Thiếu token' });
    }
    
    const token = authHeader.split(' ')[1];
    // console.log('Token nhận được:', token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    // console.log('Decoded token:', decoded);

    const employee = await Employee.findByPk(decoded.id_employee);
    // console.log('Employee tìm được:', employee);

    if (!employee) {
      return res.status(404).json({ message: 'Nhân viên không tồn tại' });
    }

    if (employee.block === true || employee.block === 1) {
      return res.status(403).json({ message: 'Tài khoản đã bị chặn' });
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Lỗi trong checkEmployeeStatus:', err);
    return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn' });
  }
};

