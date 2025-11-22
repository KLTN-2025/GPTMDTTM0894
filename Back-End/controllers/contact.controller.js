const { Contact } = require('../models/index.model');

// Thêm liên hệ
exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, note } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!name || !email || !phone || !note) {
      return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin" });
    }

    // Tạo liên hệ
    const contact = await Contact.create({
      name,
      email,
      phone,
      note,
      status: 1,            // ✅ Mặc định là "chưa xử lý"
      date: new Date(),     // ✅ Giờ tạo hiện tại (server)
    });

    res.status(201).json({
      message: "Liên hệ đã được gửi!",
      id_contact: contact.id_contact,
    });
  } catch (err) {
    res.status(500).json({
      error: "Lỗi khi tạo liên hệ",
      detail: err.message,
    });
  }
};


// Lấy tất cả liên hệ
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.findAll({ order: [['id_contact', 'DESC']] });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách liên hệ", detail: err.message });
  }
};

// Lấy liên hệ theo ID
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.status(404).json({ message: "Không tìm thấy liên hệ" });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy liên hệ", detail: err.message });
  }
};

//cập nhật 
exports.updateContact = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const contact = await Contact.findByPk(id);
    if (!contact) return res.status(404).json({ message: "Không tìm thấy liên hệ" });

    contact.status = status;
    await contact.save();

    res.json({ message: "Cập nhật thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
