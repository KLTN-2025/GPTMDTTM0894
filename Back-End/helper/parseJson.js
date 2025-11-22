// utils/json.helper.js

/**
 * Parse JSON an toàn không bị crash app nếu lỗi
 * @param {string} str - Chuỗi JSON cần parse
 * @param {any} fallback - Giá trị fallback nếu parse thất bại
 * @returns {any}
 */
function parseJSONSafe(str, fallback = []) {
  try {
    if (typeof str === 'object') return str; // đã là object thì trả về luôn
    return JSON.parse(str);
  } catch (err) {
    console.warn('⚠️ JSON parse failed:', str);
    return fallback;
  }
}

module.exports = {
  parseJSONSafe,
};
