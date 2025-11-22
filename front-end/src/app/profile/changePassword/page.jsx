"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import ChangePassword from "@/components/customers/accounts/ChangePassword";

export default function ChangePasswordPage() {
  const [idCustomer, setIdCustomer] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const tokenLocal = localStorage.getItem("token"); // hoặc lấy token từ cookie
    if (tokenLocal) {
      try {
        const decoded = jwtDecode(tokenLocal);
        setIdCustomer(decoded.userId || decoded.id_customer || decoded.id); // tùy payload token
        setToken(tokenLocal);
      } catch (err) {
        console.error("Token không hợp lệ");
      }
    }
  }, []);

  if (!idCustomer || !token) {
    return <p>Vui lòng đăng nhập để đổi mật khẩu.</p>;
  }

  return (
    <>
      <h4>Đổi mật khẩu</h4>
      <ChangePassword userId={idCustomer} token={token} />
    </>
  );
}
