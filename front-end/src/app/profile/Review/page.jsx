"use client";
import { useEffect, useState } from "react";
import CustomerReviewPage from "@/components/customers/accounts/ReviewList";
import { jwtDecode } from "jwt-decode";

export default function ReviewListPage() {
  const [idCustomer, setIdCustomer] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIdCustomer(decoded.id_customer);
      } catch (err) {
        console.error("Lỗi khi decode token:", err);
      }
    }
  }, []);

  if (!idCustomer) return <p>Đang tải thông tin đánh giá...</p>;

  return (
    <>
      <h4>Thông tin sản phẩm được đánh giá</h4>
      <CustomerReviewPage idCustomer={idCustomer} />
    </>
  );
}
