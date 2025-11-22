"use client";
import React from "react";
import { Row, Col, Image, Button } from "react-bootstrap";
import { useRouter } from "next/navigation";

// Hàm định dạng tiền VND
const formatVND = (value) =>
  Number(value).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  });

export default function CheckoutCart({ cartItems, onCheckout, submitting, onTotalChange }) {

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  React.useEffect(() => {
    onTotalChange(totalPrice);
  }, [totalPrice, onTotalChange]);

  const router = useRouter();

  const handleCancel = () => {
    router.push("/cart");
  }

  return (
    <div className="checkout-cart mt-3">
      <Row className="fw-bold border-bottom pb-2 mb-3">
        <Col md={8}>Sản phẩm</Col>
        <Col md={4} className="text-end">
          Tổng
        </Col>
      </Row>

      {cartItems.map((item) => {
        const image =
          item.attribute_values?.find(
            (val) => val.attribute_value?.images?.length > 0
          )?.attribute_value.images[0]?.img_url || "/no-image.png";

        const productName = item.product?.products_name || "Không rõ";

        return (
          <Row
            key={item.id_cart_items}
            className="align-items-center py-3 border-bottom"
          >
            {/* Sản phẩm */}
            <Col md={8} className="d-flex">
              <div style={{ position: "relative", width: 60, height: 60 }}>
                <Image
                  src={image}
                  width={60}
                  height={60}
                  rounded
                  alt="product-img"
                />
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    background: "rgba(0, 0, 0, 0.6)", // nền tối với opacity 60%
                    color: "#fff",
                    fontSize: "11px",
                    width: "20px",
                    height: "20px",
                    lineHeight: "20px",
                    textAlign: "center",
                    borderRadius: "50%", // hình tròn
                    fontWeight: "bold",
                  }}
                >
                  {item.quantity}
                </span>
              </div>
              <div className="ms-3" style={{ flex: 1 }}>
                <div
                  className="fw-semibold text-truncate"
                  style={{ maxWidth: "100%" }}
                >
                  {productName}
                </div>
                <div
                  className="text-muted small"
                  style={{ whiteSpace: "nowrap" }}
                >
                  {formatVND(item.price)}
                </div>
                <div className="d-flex flex-wrap gap-2 mt-1">
                  {item.attribute_values?.map((attr, idx) => {
                    const attrValue = attr.attribute_value;
                    const attribute = attrValue?.attribute;
                    if (!attrValue || !attribute) return null;
                    const type = Number(attribute.type);

                    return (
                      <span
                        key={idx}
                        className="badge bg-light border text-dark px-2 py-1"
                        style={{ fontSize: "12px" }}
                      >
                        {type === 2
                          ? attrValue?.value_note || "Không rõ"
                          : attrValue?.value || "Không rõ"}
                      </span>
                    );
                  })}
                </div>
              </div>
            </Col>

            {/* Tổng tiền */}
            <Col
              md={4}
              className="text-end fw-semibold"
              style={{ whiteSpace: "nowrap" }}
            >
              {formatVND(item.price * item.quantity)}
            </Col>
          </Row>
        );
      })}

      {/* Tổng tiền */}
      <div className="text-end fw-bold mt-3 fs-5">
        Tổng cộng: {formatVND(totalPrice)}
      </div>

      <div className="d-flex gap-2 mt-3">
        <Button
          variant="secondary"
          className="flex-grow-0"
          style={{
            width: "50%",
            backgroundColor: "#f0f0f0",
            color: "#333",
            borderColor: "#ccc",
          }}
          onClick={handleCancel}
        >
          Hủy
        </Button>

        <Button 
        className="flex-grow-0" 
        style={{ width: "50%" }} 
        variant="primary"
        onClick={onCheckout}
        >
          {submitting ? "Đang xử lý..." : "Đặt hàng"}
        </Button>
      </div>

    </div>
  );
}
