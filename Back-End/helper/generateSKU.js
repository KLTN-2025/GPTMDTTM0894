function generateSKU(baseName, values) {
  const normalize = (str) =>
    str
      .normalize("NFD")                    // Loại bỏ dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, "")    // Loại bỏ ký tự kết hợp
      .replace(/\s+/g, '')                // Loại bỏ khoảng trắng
      .replace(/[^a-zA-Z0-9]/g, '')       // Loại bỏ ký tự đặc biệt
      .toUpperCase();                     // Viết hoa

  const base = normalize(baseName).slice(0, 8); // Ví dụ: IPHONE15
  const combo = Object.values(values)
    .map((val) => normalize(val).slice(0, 6))   // Ví dụ: DEN-128GB
    .join('-');

  return `${base}-${combo}`;
}

module.exports = generateSKU;
