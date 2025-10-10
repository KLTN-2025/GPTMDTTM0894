"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_CONFIG } from "@/config/api";

export default function ForgotPass() {
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch(API_CONFIG.getApiUrl("/customers/forgot/send-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneOrEmail }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gửi OTP thất bại");

      setMessage(data.message);

      // ✅ Điều hướng sang trang xác thực OTP, gửi kèm phone/email nếu cần
      setTimeout(() => {
        router.push(`/verify-otp?phoneOrEmail=${encodeURIComponent(phoneOrEmail)}`);
      }, 1000); // đợi 1s để hiển thị thông báo
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow p-4">
            <h3 className="text-center mb-4">Quên Mật Khẩu</h3>

            <form onSubmit={handleSendOTP}>
              <div className="mb-3">
                <label htmlFor="emailOrPhone" className="form-label">
                  Email:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="emailOrPhone"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  required
                  placeholder="Nhập email"
                />
              </div>

              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-primary">
                  Gửi mã OTP
                </button>
              </div>

              {message && <div className="alert alert-success">{message}</div>}
              {error && <div className="alert alert-danger">{error}</div>}

              <p className="text-center mb-0">
                Quay lại{" "}
                <a href="/login" className="text-primary text-decoration-none">
                  Đăng nhập
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
