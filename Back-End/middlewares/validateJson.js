module.exports = function validateJsonMiddleware(fieldsToParse = []) {
  return (req, res, next) => {
    try {
      for (const field of fieldsToParse) {
        const value = req.body[field];

        if (!value) continue; // Bỏ qua nếu không có field

        if (typeof value === 'string') {
          try {
            req.body[field] = JSON.parse(value);
          } catch (err) {
            return res.status(400).json({
              message: `Trường '${field}' phải là JSON hợp lệ.`,
              error: err.message,
            });
          }
        } else if (typeof value === 'object') {
          // đã là object thì không cần làm gì
          continue;
        } else {
          return res.status(400).json({
            message: `Trường '${field}' không hợp lệ (phải là chuỗi JSON hoặc object).`,
          });
        }
      }

      next();
    } catch (error) {
      console.error("❌ Lỗi validateJsonMiddleware:", error);
      return res.status(500).json({
        message: "Lỗi server khi xử lý dữ liệu JSON",
        error: error.message,
      });
    }
  };
};