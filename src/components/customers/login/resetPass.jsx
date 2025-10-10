"use client";

import { useState, useEffect } from "react";
import { API_CONFIG } from "@/config/api";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [realtimeError, setRealtimeError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Regex mật khẩu mạnh: ít nhất 6 ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt
    const strongPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

        useEffect(() => {
        if (!newPassword || !confirmNewPassword) {
            setRealtimeError("");
            return;
        }

        if (!strongPasswordRegex.test(newPassword)) {
            setRealtimeError(
            "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt!"
            );
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setRealtimeError("Mật khẩu nhập lại không khớp!");
            return;
        }

        setRealtimeError("");
        }, [newPassword, confirmNewPassword]);

        const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Kiểm tra lại trước submit
        if (newPassword !== confirmNewPassword) {
            setError("Mật khẩu nhập lại không khớp!");
            return;
        }
        if (!strongPasswordRegex.test(newPassword)) {
            setError(
            "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt!"
            );
            return;
        }

        // ✅ Lấy phoneOrEmail đã lưu ở bước verify OTP
        const phoneOrEmail = localStorage.getItem("resetIdentity");
        if (!phoneOrEmail || phoneOrEmail === "undefined" || phoneOrEmail === "null") {
            setError("Không tìm thấy thông tin xác minh. Vui lòng thực hiện lại bước OTP.");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch(API_CONFIG.getApiUrl("/customers/forgot/reset-password"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phoneOrEmail, newPassword }),
            });

            if (res.ok) {
            setSuccess("Đặt lại mật khẩu thành công! Đang chuyển hướng...");
            localStorage.removeItem("resetIdentity");
            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);
            } else {
            const text = await res.text();
            try {
                const data = JSON.parse(text);
                setError(data.message || "Đặt lại mật khẩu thất bại!");
            } catch {
                console.error("Phản hồi không phải JSON:", text);
                setError("Máy chủ không phản hồi đúng định dạng. Vui lòng thử lại sau.");
            }
            }
        } catch (err) {
            console.error("Lỗi hệ thống:", err);
            setError("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false);
        }
    };


  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow p-4">
            <h3 className="text-center mb-4">Đặt Lại Mật Khẩu</h3>

            {/* Hiển thị lỗi realtime hoặc lỗi submit */}
            {(error || realtimeError) && (
              <div className="alert alert-danger">{error || realtimeError}</div>
            )}

            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit} noValidate>
              {/* Mật khẩu mới */}
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">
                  Mật khẩu mới:
                </label>
                <div className="input-group">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="form-control"
                    id="newPassword"
                    placeholder="Nhập mật khẩu mới"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <span
                    className="input-group-text"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    <i className={`fa ${showNewPassword ? "fa-eye" : "fa-eye-slash"}`}></i>
                  </span>
                </div>
              </div>

              {/* Nhập lại mật khẩu mới */}
              <div className="mb-3">
                <label htmlFor="confirmNewPassword" className="form-label">
                  Nhập lại mật khẩu mới:
                </label>
                <div className="input-group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control"
                    id="confirmNewPassword"
                    placeholder="Nhập lại mật khẩu"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <span
                    className="input-group-text"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`fa ${showConfirmPassword ? "fa-eye" : "fa-eye-slash"}`}></i>
                  </span>
                </div>
              </div>

              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting || realtimeError}>
                  {isSubmitting ? "Đang xử lý..." : "Đặt Lại Mật Khẩu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
