const db = require('../models/index.model');
const Banner = db.Banner;
const path = require('path');

//ghim banner
exports.toggleBanner = async (req, res) => {
  const { id } = req.params;

  try {
    const banner = await Banner.findByPk(id);

    if (!banner) {
      return res.status(404).json({ message: "Banner không tồn tại" });
    }

    if (banner.is_primary === 1) {
      // Nếu đang ghim → bỏ ghim
      banner.is_primary = 0;
      await banner.save();
      return res.json({ message: "Đã bỏ ghim banner", is_primary: 0 });
    } else {
      // Nếu chưa ghim → bỏ ghim các banner khác và ghim banner này
      await Banner.update({ is_primary: 0 }, { where: { is_primary: 1 } });
      banner.is_primary = 1;
      await banner.save();
      return res.json({ message: "Đã ghim banner thành công", is_primary: 1 });
    }
  } catch (error) {
    console.error("Lỗi khi toggle banner:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy tất cả banner
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({ order: [["id_banner", "DESC"]] });

    const bannersWithType = banners.map((banner) => {
      const ext = path.extname(banner.banner_img || "").toLowerCase();
      const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
      const isVideo = [".mp4", ".webm", ".ogg"].includes(ext);

      let type = "unknown";
      if (isImage) type = 1;
      else if (isVideo) type = 2;

      return {
        ...banner.toJSON(),
        type,
      };
    });

    res.json(bannersWithType);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách banner", detail: err.message });
  }
};


// Thêm banner
exports.createBanner = async (req, res) => {
  try {
    const file = req.file;
    const { is_primary } = req.body;

    if (!file) return res.status(400).json({ message: "Không có file nào được upload" });

    const ext = path.extname(file.filename || "").toLowerCase();
    const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
    const isVideo = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"].includes(ext);
    let type = "unknown";
    if (isImage) type = 1;
    else if (isVideo) type = 2;

    const newBanner = await Banner.create({
      banner_img: file.filename, // chỉ lưu tên file
      is_primary: is_primary || 0,
      type,
    });

    res.json({ message: "Tạo banner thành công", banner: newBanner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi tạo banner" });
  }
};


// Cập nhật banner
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByPk(id);
    if (!banner) return res.status(404).json({ error: 'Không tìm thấy banner' });

    const file = req.file;
    const newFilename = file ? file.filename : banner.banner_img;

    // Xác định type dựa vào extension
    const ext = path.extname(newFilename || "").toLowerCase();
    const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
    const isVideo = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"].includes(ext);
    let type = "unknown";
    if (isImage) type = 1;
    else if (isVideo) type = 2;

    await banner.update({
      banner_img: newFilename,
      type,
    });

    res.json({
      message: "Cập nhật banner thành công",
      banner: banner.toJSON(),
    });
  } catch (err) {
    console.error("Lỗi update banner:", err);
    res.status(500).json({ error: 'Lỗi khi cập nhật banner', detail: err.message });
  }
};

// Xóa banner
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByPk(id);
    if (!banner) return res.status(404).json({ error: 'Không tìm thấy banner' });

    await banner.destroy();
    res.json({ message: 'Đã xóa banner' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi xóa banner', detail: err.message });
  }
};
