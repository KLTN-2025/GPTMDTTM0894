/**
 * Utility function để lấy ảnh từ cart item theo thứ tự ưu tiên:
 * 1. SKU/Variant images (ưu tiên main image)
 * 2. Attribute images 
 * 3. Product main images
 * 4. No-image placeholder
 */

const baseURL = "http://localhost:5000";

export function getCartItemImage(item) {
  // 1. Lấy ảnh từ variant/SKU trước (ưu tiên main image)
  if (item.images && item.images.length > 0) {
    const mainImage = item.images.find(img => img.is_main);
    const imageUrl = mainImage ? mainImage.Img_url : item.images[0].Img_url;
    return imageUrl.startsWith("http") ? imageUrl : `${baseURL}${imageUrl}`;
  }
  
  // 2. Fallback về ảnh attribute nếu không có ảnh SKU
  if (item.attribute_values?.some(val => val.attribute_value?.images?.length > 0)) {
    const attrImage = item.attribute_values.find(
      (val) => val.attribute_value?.images?.length > 0
    )?.attribute_value.images[0];
    
    if (attrImage?.Img_url) {
      return attrImage.Img_url.startsWith("http") 
        ? attrImage.Img_url 
        : `${baseURL}${attrImage.Img_url}`;
    }
  }
  
  // 3. Fallback về ảnh sản phẩm chính nếu có
  if (item.product?.images && item.product.images.length > 0) {
    const productImage = item.product.images[0];
    return productImage.Img_url.startsWith("http") 
      ? productImage.Img_url 
      : `${baseURL}${productImage.Img_url}`;
  }
  
  // 4. Default placeholder
  return "/no-image.png";
}
