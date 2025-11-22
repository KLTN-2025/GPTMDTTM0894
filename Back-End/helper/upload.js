const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Tạo thư mục upload nếu chưa có
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// Lọc định dạng & MIME
const fileFilter = function (req, file, cb) {
  const allowedExt = /\.(mp4|mov|avi|mkv|webm|jpeg|jpg|png|gif|webp)$/;
  const allowedMime = [
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExt.test(ext) && allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ hỗ trợ ảnh và video hợp lệ!"), false);
  }
};

// Multer config
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // tối đa 10MB
    files: 10,
  },
});

module.exports = upload;
