"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { API_CONFIG } from "@/config/api";

export default function AdminHeader() {
  const [employeeName, setEmployeeName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // console.log("Decoded token:", decoded); 
        setEmployeeName(decoded.employee_name || "Admin - He");
      } catch {
        setEmployeeName("Admin");
      }
    } else {
      setEmployeeName("Admin");
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      // console.log("Đang kiểm tra token:", token); // ✅ check token gửi đi

      axios.get(API_CONFIG.getApiUrl("/employees/check-status"), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).catch((err) => {
        if (err.response?.status === 403 || err.response?.status === 401) {
          alert("Phiên đăng nhập của bạn đã hết hạn hoặc bạn đã bị chặn.");
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_info");
          window.location.href = "/login-admin/login";
        }
      });
    }, 10000); // mỗi 10s

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Bạn có chắc chắn muốn đăng xuất?");
    if (confirmLogout) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_info");
      window.location.href = "/login-admin/login"; // chuyển về trang login admin
    }
  };

  return (
    <header className="d-flex justify-content-between align-items-center p-3 bg-white border-bottom shadow-sm">
      <div className="d-flex align-items-center gap-3">
        <div
          className="border rounded-circle p-2 d-flex align-items-center justify-content-center"
          style={{ width: "40px", height: "40px" }}
        >
          <i className="bi bi-bell fs-5 text-primary"></i>
        </div>
        <h1 className="h4 m-0">Bảng điều khiển</h1>
      </div>

      <div className="d-flex align-items-center gap-3">
        <span className="text-muted">
          Xin chào, <strong>{employeeName}</strong>
        </span>
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={handleLogout}
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
