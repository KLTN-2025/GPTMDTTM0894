import React, { useState, useRef, useEffect } from "react";
import { Card, Form, Button } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";

const formatVND = (value) =>
  Number(value).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

export default function CartTotal({ items, onShowContactModal }) {
  const [discountCode, setDiscountCode] = useState("");
  const [voucherInfo, setVoucherInfo] = useState(null);
  const checkoutBtnRef = useRef(null); // Gắn ref vào nút thanh toán

  // Xóa voucher khi items thay đổi (thêm/bớt sản phẩm hoặc thay đổi số lượng)
  // Không đọc từ localStorage trong cart - chỉ dùng state local
  useEffect(() => {
    // Nếu giỏ hàng trống hoặc items thay đổi, xóa voucher (phải áp dụng lại)
    if (items.length === 0) {
      setVoucherInfo(null);
    } else if (voucherInfo) {
      // Validate lại voucher khi items thay đổi
      const validateVoucher = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          setVoucherInfo(null);
          return;
        }

        const totalBeforeDiscount = items.reduce(
          (sum, item) => sum + Number(item.price) * Number(item.quantity),
          0
        );

        const productIds = items.map((item) => {
          return item.id_product || item.product?.id_products;
        }).filter(Boolean);

        if (productIds.length === 0 || totalBeforeDiscount <= 0) {
          setVoucherInfo(null);
          return;
        }

        try {
          const res = await axios.post(
            "http://localhost:5000/api/voucher/apply",
            {
              code: voucherInfo.code,
              total: totalBeforeDiscount,
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
        } catch (err) {
          // Voucher không còn hợp lệ, xóa
          console.log("Voucher không còn hợp lệ:", err.response?.data?.message || err.message);
          setVoucherInfo(null);
        }
      };

      validateVoucher();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]); // Validate lại khi items thay đổi

  const totalBeforeDiscount = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  const applyVoucher = async () => {
    // Validate input
    const trimmedCode = discountCode.trim().toUpperCase();
    if (!trimmedCode) {
      toast.error("Vui lòng nhập mã giảm giá!");
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Lấy token khách hàng

      if (!token) {
        toast.error("Vui lòng đăng nhập để sử dụng mã giảm giá!");
        return;
      }

      // Lấy id_product từ cart item (có thể từ item.id_product hoặc item.product.id_products)
      const productIds = items.map((item) => {
        // Ưu tiên lấy từ item.id_product, nếu không có thì lấy từ item.product.id_products
        return item.id_product || item.product?.id_products;
      }).filter(Boolean); // Loại bỏ các giá trị null/undefined

      if (productIds.length === 0) {
        toast.error("Giỏ hàng trống, không thể áp dụng mã giảm giá!");
        return;
      }

      if (totalBeforeDiscount <= 0) {
        toast.error("Tổng tiền phải lớn hơn 0!");
        return;
      }

      const res = await axios.post(
        "http://localhost:5000/api/voucher/apply",
        {
          code: trimmedCode, // Sử dụng code đã được trim và uppercase
          total: totalBeforeDiscount,
          productIds: productIds,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,  // Gửi token trong header
          },
        }
      );

      setVoucherInfo(res.data.voucher);
      // KHÔNG lưu vào localStorage trong cart - chỉ lưu khi chuyển sang checkout
      setDiscountCode(""); // Xóa mã sau khi áp dụng thành công
      toast.success("Áp dụng mã giảm giá thành công!");
    } catch (err) {
      setVoucherInfo(null);
      const errorMessage = err.response?.data?.message || "Mã giảm giá không hợp lệ!";
      toast.error(errorMessage);
    }
  };

  const calculateFinalTotal = () => {
    if (!voucherInfo) return totalBeforeDiscount;
    return voucherInfo.discount_type === "percent"
      ? totalBeforeDiscount * (1 - voucherInfo.discount_value / 100)
      : totalBeforeDiscount - voucherInfo.discount_value;
  };

  const handleCheckout = () => {
    // Lưu voucher vào localStorage CHỈ KHI chuyển sang checkout
    if (voucherInfo) {
      localStorage.setItem("appliedVoucher", JSON.stringify(voucherInfo));
    } else {
      // Xóa voucher cũ nếu không có voucher mới
      localStorage.removeItem("appliedVoucher");
    }

    // Tính vị trí nút thanh toán
    const rect = checkoutBtnRef.current.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    // Hiệu ứng hoa giấy tại vị trí nút
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { x, y },
    });

    const hasLargeQuantity = items.some(item => Number(item.quantity) >= 10);
    if (hasLargeQuantity) {
      onShowContactModal();
    } else {
      setTimeout(() => {
        window.location.href = "/checkout";
      }, 1000);
    }
  };

  return (
    <Card className="p-4 shadow-sm border rounded-3">
      <h5 className="mb-3 border-bottom pb-2">Tạm tính</h5>

      <div className="mb-3 p-3 border rounded">
        <Form.Group controlId="discountCode">
          <Form.Label>Nhập mã giảm giá</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nhập mã..."
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applyVoucher();
              }
            }}
          />
          <Button
            variant="success"
            className="mt-2 w-100"
            onClick={applyVoucher}
            disabled={!discountCode.trim()}
          >
            Áp dụng mã
          </Button>
        </Form.Group>

        {voucherInfo && (
          <div className="mt-2 text-success small">
            ✅ Mã: <strong>{voucherInfo.code}</strong> - Giảm{" "}
            {voucherInfo.discount_type === "percent"
              ? `${voucherInfo.discount_value}%`
              : formatVND(voucherInfo.discount_value)}
          </div>
        )}
      </div>

      <div className="mt-3 p-3 border rounded bg-light">
        <div className="d-flex justify-content-between mb-2">
          <span>Tạm tính:</span>
          <span>{formatVND(totalBeforeDiscount)}</span>
        </div>
        {voucherInfo && (
          <div className="d-flex justify-content-between text-success mb-2">
            <span>Giảm giá ({voucherInfo.code}):</span>
            <span>
              -{formatVND(
                voucherInfo.discount_type === "percent"
                  ? totalBeforeDiscount * (voucherInfo.discount_value / 100)
                  : voucherInfo.discount_value
              )}
            </span>
          </div>
        )}
        <div className="d-flex justify-content-between fw-bold fs-5 mb-1 border-top pt-2">
          <span>Tổng tiền:</span>
          <span className="text-primary">{formatVND(calculateFinalTotal())}</span>
        </div>
      </div>

      <Button
        variant="success"
        className="mt-3 w-100"
        onClick={handleCheckout}
        ref={checkoutBtnRef}
      >
        Thanh toán
      </Button>
    </Card>
  );
}
