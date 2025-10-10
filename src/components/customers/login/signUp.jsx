"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toast } from "react-bootstrap";
import { toast } from "react-toastify";
import { API_CONFIG } from "@/config/api";

export default function SignUp() {
  const [form, setForm] = useState({
    name: "",
    last_name: "",
    given_name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const router = useRouter();

  const capitalizeWords = (str) =>
    str
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  const validateName = (fieldLabel, value) => {
    const label = {
      last_name: "Họ",
      given_name: "Tên",
      name: "Biệt danh",
    }[fieldLabel];

    if (value.trim() === "") return `${label} không được bỏ trống.`;
    if (/\s{2,}/.test(value)) return `${label} không được chứa khoảng trắng liên tiếp.`;
    if (/^\s|\s$/.test(value)) return `${label} không được bắt đầu/kết thúc bằng khoảng trắng.`;
    if (/\d/.test(value)) return `${label} không được chứa số.`;
    if (value.replace(/\s/g, "").length < 2)
      return `${label} phải có ít nhất 2 ký tự (không tính khoảng trắng).`;

    return "";
  };


  const validateField = (name, value) => {
    switch (name) {
      case "phone":
        if (value === "") return "";
        if (!/^\d{10}$/.test(value)) return "Số điện thoại phải đúng 10 chữ số.";
        return "";

      case "email":
        if (value === "") return "";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Email không hợp lệ.";
        return "";

      case "password":
        if (value === "") return "";
        const firstChar = value.charAt(0);
        if (firstChar !== firstChar.toUpperCase())
          return "Mật khẩu phải viết hoa chữ cái đầu.";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value))
          return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt.";
        if (!/\d/.test(value)) return "Mật khẩu phải có ít nhất 1 số.";
        return "";

      case "confirmPassword":
        if (value === "") return "";
        if (value !== form.password) return "Mật khẩu nhập lại không khớp.";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (["name", "last_name", "given_name"].includes(name)) {
      setErrors((prev) => ({ ...prev, [name]: validateName(name, value) }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleNameBlur = (field) => {
    const capitalized = capitalizeWords(form[field]);
    setForm((prev) => ({ ...prev, [field]: capitalized }));
    setErrors((prev) => ({ ...prev, [field]: validateName(field, capitalized) }));
  };

  useEffect(() => {
    const noErrors = Object.values(errors).every((e) => e === "");
    const allFilled = Object.values(form).every((v) => v.trim() !== "");
    setCanSubmit(noErrors && allFilled);
  }, [errors, form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      await axios.post(API_CONFIG.getApiUrl("/customers/register"), {
        name: form.name,
        last_name: form.last_name,
        given_name: form.given_name,
        phone: form.phone,
        email: form.email,
        password: form.password,
      });

      // alert("Đăng ký thành công!");
      toast.success("Đăng ký thành công!");
      router.push("/login");
    } catch (error) {
      const msg = error.response?.data?.message || "";

      // Xoá lỗi cũ
      setErrors({});

      if (msg.includes("Email")) {
        setErrors((prev) => ({ ...prev, email: msg }));
      } else if (msg.includes("Số điện thoại")) {
        setErrors((prev) => ({ ...prev, phone: msg }));
      } else if (msg.includes("Vui lòng nhập")) {
        setErrors((prev) => ({ ...prev, name: msg }));
      } else {
        toast.error("Đăng ký thất bại");
      }
    }
  };

  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow p-4">
            <h3 className="text-center mb-4">Đăng Ký</h3>
            <form onSubmit={handleSubmit} noValidate>
              {[
                { label: "Họ", name: "last_name" },
                { label: "Tên", name: "given_name" },
                { label: "Biệt danh", name: "name" },
              ].map(({ label, name }) => (
                <div className="mb-3" key={name}>
                  <label className="form-label">{label}</label>
                  <input
                    type="text"
                    className={`form-control ${errors[name] ? "is-invalid" : ""}`}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    onBlur={() => handleNameBlur(name)}
                    placeholder={`Nhập ${label.toLowerCase()}`}
                    autoComplete="off"
                  />
                  {errors[name] && <div className="invalid-feedback">{errors[name]}</div>}
                </div>
              ))}

              {/* Phone, Email, Password, Confirm */}
              {/* ... Giữ nguyên như bạn đã làm ... */}

              <div className="mb-3">
                <label className="form-label">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                  placeholder="Nhập số điện thoại"
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  placeholder="Nhập email"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Mật khẩu</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                    placeholder="Nhập mật khẩu"
                  />
                  <span
                    className="input-group-text"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{ cursor: "pointer" }}
                  >
                    <i className={`fa ${showPassword ? "fa-eye" : "fa-eye-slash"}`}></i>
                  </span>
                </div>
                {errors.password && (
                  <div className="invalid-feedback d-block">{errors.password}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Nhập lại mật khẩu</label>
                <div className="input-group">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                    placeholder="Nhập lại mật khẩu"
                  />
                  <span
                    className="input-group-text"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    style={{ cursor: "pointer" }}
                  >
                    <i className={`fa ${showConfirm ? "fa-eye" : "fa-eye-slash"}`}></i>
                  </span>
                </div>
                {errors.confirmPassword && (
                  <div className="invalid-feedback d-block">{errors.confirmPassword}</div>
                )}
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={!canSubmit}>
                Đăng Ký
              </button>

              <p className="text-center mt-3">
                Đã có tài khoản?{" "}
                <a href="/login" className="text-decoration-none text-primary">
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

