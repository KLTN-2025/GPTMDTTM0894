import React from "react";
import { Row, Col, Image, Form } from "react-bootstrap";
import Link from "next/link";
import { getCartItemImage } from "@/utils/imageUtils";

// Hàm định dạng tiền VND
const formatVND = (value) =>
  Number(value).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  });

export default function CartList({ items, onUpdateQuantity, onDeleteItem }) {
  return (
    <div className="cart-list mt-4">
      <Row className="fw-bold border-bottom pb-2 mb-3">
        <Col md={6}>Sản phẩm</Col>
        <Col md={2} className="text-center">
          Số lượng
        </Col>
        <Col md={2} className="text-end">
          Tổng
        </Col>
      </Row>

      {items.map((item) => {
        const image = getCartItemImage(item);
        const productName = item.product?.products_name || "Không rõ";

        return (
          <Row
            key={item.id_cart_items}
            className="align-items-center py-3 border-bottom"
          >
            {/* Sản phẩm */}
            <Col md={6} className="d-flex">
              <div key={item.product.id_products}>
                 <Link href={`/productDetail/${item.product.products_slug || item.product.id_products}`}>
                 
                <Image
                  src={image}
                  width={80}
                  height={80}
                  rounded
                  className="me-3"
                  alt="product-img"
                />

                 </Link>
              </div>
              
              <div>
                <div className="fw-semibold">{productName}</div>
                <div className="text-muted small">
                  {formatVND(item.price)}
                </div>

                {/* Option sản phẩm */}
                <div className="d-flex flex-wrap gap-2 mt-1">
                  {item.attribute_values?.map((attr, idx) => {
                      const attrValue = attr.attribute_value;
                      const attribute = attrValue?.attribute;

                      if (!attrValue || !attribute) {
                        console.warn("⚠️ Thiếu attrValue hoặc attribute", attr);
                        return null;
                      }

                      const type = Number(attribute?.type);

                      // Logging để bạn thấy rõ dữ liệu đang nhận
                      console.log(`[Option ${idx}]`, {
                        name: attribute?.name,
                        type: type,
                        value: attrValue?.value,
                        value_note: attrValue?.value_note,
                      });

                      const label = type === 2
                        ? attrValue?.value_note || "Không rõ"
                        : attrValue?.value || "Không rõ";


                      return (
                        <span
                          key={idx}
                          className="badge bg-light border text-dark px-2 py-1 d-flex align-items-center gap-1"
                          style={{ fontSize: "13px" }}
                        >
                          {type === 2
                            ? attrValue?.value_note || "Không rõ"
                            : attrValue?.value || "Không rõ"}
                        </span>
                      );
                    })}
                </div>
                {/* Xoá */}
                <div
                  className="text-primary mt-1"
                  style={{ cursor: "pointer", fontSize: "14px" }}
                  onClick={() => onDeleteItem(item.id_cart_items)}
                >
                  Bỏ
                </div>
              </div>
            </Col>

            {/* Số lượng */}
            <Col md={2} className="text-center">
              <Form.Control
                type="number"
                min={1}
                max={100}
                value={item.quantity}
                style={{ width: "80px", margin: "0 auto" }}
                onChange={(e) =>
                  onUpdateQuantity(item.id_cart_items, Number(e.target.value))
                }
              />
            </Col>

            {/* Tổng tiền */}
            <Col md={2} className="text-end fw-semibold">
              {formatVND(item.price * item.quantity)}
            </Col>
          </Row>
        );
      })}
    </div>
  );
}
