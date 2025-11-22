import React, { useState, useRef } from "react";
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

  const totalBeforeDiscount = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  const applyVoucher = async () => {
    try {
      const token = localStorage.getItem("token"); // Lấy token khách hàng

      const res = await axios.post(
        "http://localhost:5000/api/voucher/apply",
        {
          code: discountCode,
          total: totalBeforeDiscount,
          productIds: items.map((item) => item.id_product),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,  // Gửi token trong header
          },
        }
      );

      setVoucherInfo(res.data.voucher);
      toast.success("Áp dụng mã giảm giá thành công!");
    } catch (err) {
      setVoucherInfo(null);
      toast.error(err.response?.data?.message || "Mã giảm giá không hợp lệ!");
    }
  };

  const calculateFinalTotal = () => {
    if (!voucherInfo) return totalBeforeDiscount;
    return voucherInfo.discount_type === "percent"
      ? totalBeforeDiscount * (1 - voucherInfo.discount_value / 100)
      : totalBeforeDiscount - voucherInfo.discount_value;
  };

  const handleCheckout = () => {
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
            onChange={(e) => setDiscountCode(e.target.value)}
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
        <div className="d-flex justify-content-between fw-bold fs-5 mb-1">
          <span>Tổng tiền:</span>
          <span>{formatVND(calculateFinalTotal())}</span>
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
