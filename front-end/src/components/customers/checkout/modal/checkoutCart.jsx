"use client";
import React, { useState, useEffect } from "react";
import { Row, Col, Image, Button } from "react-bootstrap";
import { useRouter } from "next/navigation";
import axios from "axios";

// Hàm định dạng tiền VND
const formatVND = (value) =>
  Number(value).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  });

export default function CheckoutCart({ cartItems, onCheckout, submitting, onTotalChange }) {
  const [voucherInfo, setVoucherInfo] = useState(null);

  // Validate lại voucher từ localStorage khi component mount hoặc cartItems thay đổi
  useEffect(() => {
    const validateVoucher = async () => {
      if (typeof window === "undefined") {
        return;
      }

      // Nếu giỏ hàng trống, xóa voucher
      if (cartItems.length === 0) {
        setVoucherInfo(null);
        localStorage.removeItem("appliedVoucher");
        return;
      }

      const savedVoucher = localStorage.getItem("appliedVoucher");
      if (!savedVoucher) {
        setVoucherInfo(null);
        return;
      }

      try {
        const voucher = JSON.parse(savedVoucher);
        const token = localStorage.getItem("token");

        if (!token) {
          setVoucherInfo(null);
          localStorage.removeItem("appliedVoucher");
          return;
        }

        // Validate lại voucher với backend
        const totalPrice = cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        const productIds = cartItems.map((item) => {
          return item.id_product || item.product?.id_products;
        }).filter(Boolean);

        if (productIds.length === 0 || totalPrice <= 0) {
          setVoucherInfo(null);
          localStorage.removeItem("appliedVoucher");
          return;
        }

        const res = await axios.post(
          "http://localhost:5000/api/voucher/apply",
          {
            code: voucher.code,
            total: totalPrice,
            productIds: productIds,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Voucher vẫn hợp lệ, cập nhật lại thông tin
        setVoucherInfo(res.data.voucher);
        localStorage.setItem("appliedVoucher", JSON.stringify(res.data.voucher));
      } catch (err) {
        // Voucher không còn hợp lệ, xóa khỏi localStorage
        console.log("Voucher không còn hợp lệ:", err.response?.data?.message || err.message);
        setVoucherInfo(null);
        localStorage.removeItem("appliedVoucher");
      }
    };

    validateVoucher();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]); // Validate lại khi cartItems thay đổi

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Tính tổng tiền sau khi giảm giá
  const calculateFinalTotal = () => {
    if (!voucherInfo) return totalPrice;
    if (voucherInfo.discount_type === "percent") {
      return totalPrice * (1 - voucherInfo.discount_value / 100);
    } else {
      return Math.max(0, totalPrice - voucherInfo.discount_value);
    }
  };

  const finalTotal = calculateFinalTotal();
  const discountAmount = totalPrice - finalTotal;

  React.useEffect(() => {
    onTotalChange(finalTotal);
  }, [finalTotal, onTotalChange]);

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
      <div className="mt-3 border-top pt-3">
        <div className="d-flex justify-content-between mb-2">
          <span>Tạm tính:</span>
          <span>{formatVND(totalPrice)}</span>
        </div>
        {voucherInfo && discountAmount > 0 && (
          <div className="d-flex justify-content-between text-success mb-2">
            <span>Giảm giá ({voucherInfo.code}):</span>
            <span>-{formatVND(discountAmount)}</span>
          </div>
        )}
        <div className="d-flex justify-content-between fw-bold fs-5 border-top pt-2">
          <span>Tổng cộng:</span>
          <span className="text-primary">{formatVND(finalTotal)}</span>
        </div>
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
