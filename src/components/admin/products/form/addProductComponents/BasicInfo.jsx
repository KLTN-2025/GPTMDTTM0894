import { Form, Button, Modal } from "react-bootstrap";

export default function BasicInfo({
  productName,
  productSlug,
  setProductSlug,
  setProductName,
  salePrice,
  setSalePrice,
  productQuantity,
  setProductQuantity,
  productShorts,
  setProductShorts,
  touched,
  setTouched,
  errors,
}) {
  const formatCurrency = (value) => {
    const number = value.replace(/\D/g, ""); // chỉ giữ số
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // thêm dấu chấm
  };

  // Xử lý khi người dùng gõ giá bán
  const handleSalePriceChange = (e) => {
    const raw = e.target.value.replace(/\./g, "");
    setSalePrice(formatCurrency(raw));
  };

  return (
    <>
      <Form.Group controlId="productName">
        <Form.Label>Tên sản phẩm</Form.Label>
        <Form.Control
          type="text"
          placeholder="Nhập tên sản phẩm"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, productName: true }))}
          isInvalid={touched.productName && !!errors.productName}
        />
        {touched.productName && errors.productName && (
          <Form.Control.Feedback type="invalid">
            {errors.productName}
          </Form.Control.Feedback>
        )}
      </Form.Group>

      <Form.Group controlId="productName">
        <Form.Label>Đường dẫn</Form.Label>
        <Form.Control
          disabled
          type="text"
          placeholder="Đường dẫn tự nhập"
          value={productSlug}
          onChange={(e) => setProductSlug(e.target.value)}
          // onBlur={() => setTouched((prev) => ({ ...prev, productName: true }))}
          // isInvalid={touched.productName && !!errors.productName}
        />
        {/* {touched.productName && errors.productName && (
          <Form.Control.Feedback type="invalid">
            {errors.productName}
          </Form.Control.Feedback>
        )} */}
      </Form.Group>

      <Form.Group controlId="productShorts" className="mb-3">
        <Form.Label>Mô tả ngắn</Form.Label>
        <Form.Control
          type="text"
          placeholder="Nhập mô tả ngắn"
          value={productShorts}
          onChange={(e) => setProductShorts(e.target.value)}
          onBlur={() => setTouched(prev => ({ ...prev, productShorts: true }))}
          isInvalid={touched.productShorts && !!errors.productShorts}
        />
        {touched.productShorts && errors.productShorts && (
          <Form.Control.Feedback type="invalid">
            {errors.productShorts}
          </Form.Control.Feedback>
        )}
      </Form.Group>

      <Form.Group controlId="salePrice">
        <Form.Label>Giá bán</Form.Label>
        <Form.Control
          type="text"
          placeholder="Nhập giá bán"
          value={salePrice}
          onChange={handleSalePriceChange}
          onBlur={() => setTouched(prev => ({ ...prev, salePrice: true }))}
          isInvalid={touched.salePrice && !!errors.salePrice}
        />
        {touched.salePrice && errors.salePrice && (
          <Form.Control.Feedback type="invalid">
            {errors.salePrice}
          </Form.Control.Feedback>
        )}
      </Form.Group>

     <Form.Group controlId="productQuantity">
        <Form.Label>Số lượng</Form.Label>
        <Form.Control
          type="number"
          placeholder="Nhập số lượng"
          min={0}
          value={productQuantity}
          onChange={(e) => setProductQuantity(Number(e.target.value))}
        />
        {touched.productQuantity && errors.productQuantity && (
          <Form.Control.Feedback type="invalid">
            {errors.productQuantity}
          </Form.Control.Feedback>
        )}
      </Form.Group>
    </>
  );
}
