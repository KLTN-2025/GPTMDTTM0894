"use client";
import { useEffect, useState } from "react";
import AddressList from "@/components/customers/accounts/AddressList";
import { jwtDecode } from "jwt-decode";

export default function AddressListPage() {
  const [idCustomer, setIdCustomer] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIdCustomer(decoded.id_customer); // Hoặc decoded._id tùy JWT của bạn
      } catch (err) {
        console.error("Lỗi khi decode token:", err);
      }
    }
  }, []);

  if (!idCustomer) return <p>Đang tải thông tin khách hàng...</p>;

  return (
    <>
      <h4>Thông tin địa chỉ</h4>
      <AddressList id_customer={idCustomer} />
    </>
  );
}
