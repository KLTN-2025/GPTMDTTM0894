'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem('admin_token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          // console.log("Decoded token:", decoded); // Kiểm tra payload
          const userRole = Number(decoded.employee_role); // sửa đúng theo backend
          if (!isNaN(userRole)) {
            // console.log("Đã set role:", userRole);
            setRole(userRole);
          } else {
            setRole(null);
          }
        } catch (error) {
          console.error("Token decode error:", error);
          setRole(null);
        }
      } else {
        setRole(null);
      }
    }
  }, []);


  const links = [
    { href: "/admin/dashboard", label: "Tổng quan", roles: [1, 2] },
    { href: "/admin/banner", label: "Quảng cáo", roles: [1] },
    { href: "/admin/categories", label: "Danh mục", roles: [1, 2] },
    { href: "/admin/order", label: "Đơn hàng", roles: [1, 2] },
    { href: "/admin/products", label: "Sản phẩm", roles: [1, 2] },
    { href: "/admin/reviews", label: "Bình luận", roles: [1, 2] },
    { href: "/admin/voucher", label: "Mã giảm giá", roles: [1] },
    { href: "/admin/customers", label: "Khách hàng", roles: [1] },
    { href: "/admin/employee", label: "Nhân viên", roles: [1] },
    { href: "/admin/contact", label: "Liên hệ", roles: [1, 2] },
  ];

  // Nếu chưa xác định quyền → chưa render
  if (role === null) {
    // console.log("Role vẫn là null → không render sidebar");
    return null;
  }

  return (
    <aside
      className="d-flex flex-column flex-shrink-0 p-3 bg-light"
      style={{ width: "250px", height: "100vh" }}
    >
      <a
        href="/admin/dashboard"
        className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-decoration-none"
      >
        <span className="fs-4 fw-bold">Admin</span>
      </a>
      <hr />
      <nav className="nav nav-pills flex-column">
        {links
          .filter((link) => link.roles.includes(role))
          .map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${
                pathname === link.href ? "active" : "text-dark"
              }`}
            >
              {link.label}
            </Link>
          ))}
      </nav>
    </aside>
  );
}
