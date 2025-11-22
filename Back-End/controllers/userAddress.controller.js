const { Address, Customer } = require('../models/index.model');
const { Op } = require('sequelize');

// Thêm địa chỉ mới
exports.createAddress = async (req, res) => {
  try {
    const {
      id_customer,
      address_label,
      name_city,
      // name_district,
      name_ward,
      name_address,
      is_primary
    } = req.body;

    // Kiểm tra xem khách hàng có tồn tại không
    const customer = await Customer.findByPk(id_customer);
    if (!customer) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng.' });
    }

    // Nếu là địa chỉ mặc định (is_primary = true), reset các địa chỉ mặc định cũ
    if (is_primary) {
      await Address.update(
        { is_primary: false },
        { where: { id_customer } }
      );
    }

    // Tạo địa chỉ mới
    const newAddress = await Address.create({
      id_customer,
      address_label,
      name_city,
      // name_district,
      name_ward,
      name_address,
      is_primary: !!is_primary // Chuyển về boolean
    });

    return res.status(201).json({
      message: 'Tạo địa chỉ mới thành công.',
      data: newAddress
    });
  } catch (error) {
    console.error('Lỗi khi thêm địa chỉ:', error);
    return res.status(500).json({
      message: 'Đã có lỗi xảy ra khi thêm địa chỉ.',
      error: error.message
    });
  }
};

// updateAddress ở backend (Node.js)
exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    console.log('UpdateAddress:', { id, data });

    const address = await Address.findByPk(id);
    if (!address) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ." });
    }
    console.log('Address found:', address.toJSON());

    const isPrimary = data.is_primary === true || data.is_primary === 'true' || data.is_primary === 1 || data.is_primary === '1';

    if (isPrimary) {
      await Address.update(
        { is_primary: false },
        {
          where: {
            id_customer: address.id_customer,
            id_address: { [Op.ne]: id },
          },
        }
      );
    }

    const updatedAddress = await address.update({
      ...data,
      is_primary: isPrimary,
    });

    return res.json({
      message: "Cập nhật địa chỉ thành công.",
      data: updatedAddress,
    });
  } catch (error) {
    console.error("Lỗi cập nhật địa chỉ:", error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi cập nhật địa chỉ.",
      error: error.message,
    });
  }
};

// Xóa địa chỉ
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra địa chỉ có tồn tại không
    const address = await Address.findByPk(id);
    if (!address) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ.' });
    }

    // Xoá địa chỉ
    await address.destroy();
    res.json({ message: 'Xóa địa chỉ thành công.' });

  } catch (error) {
    res.status(500).json({
      message: 'Đã xảy ra lỗi khi xóa địa chỉ.',
      error: error.message
    });
  }
};

// Lấy tất cả địa chỉ theo id
exports.getAddressesByCustomerId = async (req, res) => {
  try {
    const { id } = req.params;

    const addresses = await Address.findAll({
      where: { id_customer: id }
    });

    if (addresses.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ nào cho khách hàng này.' });
    }

    res.json({
      message: 'Lấy danh sách địa chỉ thành công.',
      data: addresses
    });

  } catch (error) {
    res.status(500).json({
      message: 'Đã có lỗi xảy ra khi lấy danh sách địa chỉ.',
      error: error.message
    });
  }
};

//xem địa chỉ riêng
exports.getAddressById = async (req, res) => {
  const { id } = req.params;

  try {
    const address = await Address.findOne({
      where: { id_address: id },
      attributes: [
        "id_address",
        "address_label",
        "name_city",
        // "name_district",
        "name_ward",
        "name_address",
        "is_primary"
      ]
    });

    if (!address) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
    }

    return res.json(address);
  } catch (error) {
    console.error("Lỗi khi lấy địa chỉ:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};