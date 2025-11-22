export function formatPrice(value) {
  if (value === null || value === undefined || value === '') return '0 đ';
  const num = Number(value);
  if (isNaN(num)) {
    console.warn('Giá trị không phải số:', value);
    return '0 đ';
  }
  return Math.round(num).toLocaleString('vi-VN') + ' đ';
}
