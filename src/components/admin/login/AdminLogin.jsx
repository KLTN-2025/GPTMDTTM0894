"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { API_CONFIG } from "@/config/api";

export default function AdminLogin() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(API_CONFIG.getApiUrl("/employees/login"), {
        identifier,
        password,
      });

      localStorage.setItem("admin_token", res.data.token);
      localStorage.setItem("admin_info", JSON.stringify(res.data.employee));
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Đăng nhập thất bại");
    }
  };

  return (

    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "100vh", backgroundColor: "#f8f9fa", padding: "1rem" }}
    >
      <div
        className="bg-white p-5 rounded shadow"
        style={{ width: "100%", width: "500px", border: "1px solid #dee2e6" }}
      >
        <h2 className="mb-4 text-center text-primary">Đăng nhập Admin</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="identifier" className="form-label">
              Email hoặc SĐT
            </label>
            <input
              id="identifier"
              type="text"
              className="form-control form-control-lg"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              placeholder="Nhập email hoặc số điện thoại"
            />
          </div>

          <div className="mb-4 position-relative">
            <label htmlFor="password" className="form-label">
              Mật khẩu
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="form-control form-control-lg pe-5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              
              placeholder="Nhập mật khẩu"
            />
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary position-absolute top-50 translate-middle-y"
              style={{
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 2,
              }}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-100">
            Đăng nhập
          </button>
        </form>
      </div>
    </div>


  );
}
