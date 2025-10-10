"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { API_CONFIG } from "@/config/api";

const EyeIcon = ({ open = true }) => (
  open ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
      style={{ width: 20, height: 20 }}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
      style={{ width: 20, height: 20 }}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 9.879a3 3 0 104.242 4.242" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5c4.477 0 8.268 2.943 9.542 7a10.46 10.46 0 01-1.672 3.163M3.05 8.868A10.45 10.45 0 012.458 12c1.274 4.057 5.065 7 9.542 7 1.713 0 3.29-.506 4.605-1.374" />
    </svg>
  )
);

export default function ChangePassword({ userId, token }) {
  // Nếu thiếu userId hoặc token thì không cho đổi mật khẩu
  if (!userId || !token) {
    return <p>Không có thông tin người dùng để đổi mật khẩu.</p>;
  }

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Hàm validate mật khẩu theo yêu cầu độ mạnh
  const validate = () => {
    const tempErrors = {};

    if (!currentPassword) {
      tempErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (newPassword.length < 8) {
      tempErrors.newPassword = "Mật khẩu mới phải có ít nhất 8 ký tự";
    } else if (!/[A-Z]/.test(newPassword)) {
      tempErrors.newPassword = "Mật khẩu mới phải có ít nhất 1 chữ hoa";
    } else if (!/[a-z]/.test(newPassword)) {
      tempErrors.newPassword = "Mật khẩu mới phải có ít nhất 1 chữ thường";
    } else if (!/[0-9]/.test(newPassword)) {
      tempErrors.newPassword = "Mật khẩu mới phải có ít nhất 1 số";
    } else if (!/[^A-Za-z0-9]/.test(newPassword)) {
      tempErrors.newPassword = "Mật khẩu mới phải có ít nhất 1 ký tự đặc biệt";
    }

    if (confirmPassword !== newPassword) {
      tempErrors.confirmPassword = "Mật khẩu nhập lại không khớp";
    }

    return tempErrors;
  };

  // Khi input thay đổi, set giá trị và bật dirty
  const handleChange = (field, setter) => (e) => {
    setter(e.target.value);
    setDirty(true);
  };

  // Khi blur input, đánh dấu touched để hiện lỗi
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Cập nhật lỗi khi input thay đổi hoặc blur
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      setErrors(validate());
    }
  }, [currentPassword, newPassword, confirmPassword, touched]);

  // Xử lý submit form đổi mật khẩu
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Đánh dấu đã touched tất cả để show lỗi nếu có
    setTouched({ currentPassword: true, newPassword: true, confirmPassword: true });

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.put(
        `${API_CONFIG.getApiUrl("/customers/${userId}/change-password")}`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message || "Cập nhật mật khẩu thành công!");

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTouched({});
      setDirty(false);

    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra, vui lòng thử lại!";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Disable nút submit khi chưa thay đổi hoặc còn lỗi
  const isDisabled = !dirty || Object.keys(errors).length > 0;

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate>
        {/* Mật khẩu hiện tại */}
        <div className="mb-3 position-relative">
          <label htmlFor="currentPassword" className="form-label">
            Mật khẩu hiện tại
          </label>
          <input
            type={showCurrent ? "text" : "password"}
            className={`form-control ${touched.currentPassword && errors.currentPassword ? "is-invalid" : ""}`}
            id="currentPassword"
            placeholder="Nhập mật khẩu hiện tại"
            value={currentPassword}
            onChange={handleChange("currentPassword", setCurrentPassword)}
            onBlur={() => handleBlur("currentPassword")}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            style={{
              position: "absolute",
              top: "38px",
              right: "10px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
              color: "#555",
            }}
            aria-label={showCurrent ? "Ẩn mật khẩu hiện tại" : "Hiện mật khẩu hiện tại"}
          >
            <EyeIcon open={showCurrent} />
          </button>
          {touched.currentPassword && errors.currentPassword && (
            <div className="invalid-feedback">{errors.currentPassword}</div>
          )}
        </div>

        {/* Mật khẩu mới */}
        <div className="mb-3 position-relative">
          <label htmlFor="newPassword" className="form-label">
            Mật khẩu mới
          </label>
          <input
            type={showNew ? "text" : "password"}
            className={`form-control ${touched.newPassword && errors.newPassword ? "is-invalid" : ""}`}
            id="newPassword"
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onChange={handleChange("newPassword", setNewPassword)}
            onBlur={() => handleBlur("newPassword")}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            style={{
              position: "absolute",
              top: "38px",
              right: "10px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
              color: "#555",
            }}
            aria-label={showNew ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"}
          >
            <EyeIcon open={showNew} />
          </button>
          {touched.newPassword && errors.newPassword && (
            <div className="invalid-feedback">{errors.newPassword}</div>
          )}
        </div>

        {/* Nhập lại mật khẩu mới */}
        <div className="mb-3 position-relative">
          <label htmlFor="confirmPassword" className="form-label">
            Nhập lại mật khẩu mới
          </label>
          <input
            type={showConfirm ? "text" : "password"}
            className={`form-control ${touched.confirmPassword && errors.confirmPassword ? "is-invalid" : ""}`}
            id="confirmPassword"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChange={handleChange("confirmPassword", setConfirmPassword)}
            onBlur={() => handleBlur("confirmPassword")}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            style={{
              position: "absolute",
              top: "38px",
              right: "10px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
              color: "#555",
            }}
            aria-label={showConfirm ? "Ẩn xác nhận mật khẩu" : "Hiện xác nhận mật khẩu"}
          >
            <EyeIcon open={showConfirm} />
          </button>
          {touched.confirmPassword && errors.confirmPassword && (
            <div className="invalid-feedback">{errors.confirmPassword}</div>
          )}
        </div>

        <button type="submit" className="btn btn-success" disabled={isDisabled || isSubmitting}>
          {isSubmitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
        </button>
      </form>
    </div>
  );
}
