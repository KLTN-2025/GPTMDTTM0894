"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import UserDetailForm from "@/components/customers/accounts/UserDetailForm";

export default function UserDetailPage() {
  const [idCustomer, setIdCustomer] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIdCustomer(decoded.id_customer || decoded.id || decoded.userId);
      } catch (error) {
        console.error("Lỗi decode token:", error);
      }
    }
  }, []);

  if (!idCustomer) return <p>Đang tải thông tin người dùng...</p>;

  return (
    <>
      <h4>Thông tin tài khoản</h4>
      <UserDetailForm idCustomer={idCustomer} />
    </>
  );
}
