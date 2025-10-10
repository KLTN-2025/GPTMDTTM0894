"use client";
import { useState, useEffect } from "react";
import { API_CONFIG } from "@/config/api";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Validate form
  const validate = () => {
    const newErrors = {};
    const nameNoSpaces = form.name.replace(/\s/g, "");

    if (nameNoSpaces.length < 7) {
      newErrors.name = "Tên phải có ít nhất 7 ký tự";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.phone)) {
      newErrors.phone = "Số điện thoại phải có 10 chữ số";
    }

    if (form.message.trim() === "") {
      newErrors.message = "Vui lòng nhập nội dung tin nhắn";
    }

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  };

  useEffect(() => {
    validate();
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  // ✅ Sửa lại đúng handleSubmit dùng async để gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      phone: true,
      message: true,
    });

    if (!isValid) return;

    try {
      const res = await fetch(API_CONFIG.getApiUrl("/contact"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          note: form.message, // match với key bên backend nếu khác
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMessage("✅ Gửi liên hệ thành công!");
        setForm({
          name: "",
          email: "",
          phone: "",
          message: "",
        });
        setTouched({});
      } else {
        setStatusMessage(`❌ Lỗi: ${data.error || "Không gửi được liên hệ"}`);
      }
    } catch (err) {
      setStatusMessage("❌ Lỗi kết nối máy chủ");
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Liên hệ với chúng tôi</h2>

      <form onSubmit={handleSubmit} noValidate>
        {statusMessage && (
          <div className="alert mt-3 alert-info text-center" role="alert">
            {statusMessage}
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="name" className="form-label">Họ tên</label>
          <input
            type="text"
            className={`form-control ${touched.name && errors.name ? "is-invalid" : ""}`}
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nhập họ tên"
          />
          {touched.name && errors.name && (
            <div className="invalid-feedback">{errors.name}</div>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className={`form-control ${touched.email && errors.email ? "is-invalid" : ""}`}
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nhập email"
          />
          {touched.email && errors.email && (
            <div className="invalid-feedback">{errors.email}</div>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="phone" className="form-label">Số điện thoại</label>
          <input
            type="text"
            className={`form-control ${touched.phone && errors.phone ? "is-invalid" : ""}`}
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nhập số điện thoại"
          />
          {touched.phone && errors.phone && (
            <div className="invalid-feedback">{errors.phone}</div>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="message" className="form-label">Nội dung</label>
          <textarea
            className={`form-control ${touched.message && errors.message ? "is-invalid" : ""}`}
            id="message"
            name="message"
            rows="5"
            value={form.message}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nhập nội dung..."
          />
          {touched.message && errors.message && (
            <div className="invalid-feedback">{errors.message}</div>
          )}
        </div>

        <div className="text-end">
          <button
            type="submit"
            className="btn btn-success btn-lg px-4"
            disabled={!isValid}
          >
            Gửi liên hệ
          </button>
        </div>
      </form>
    </div>
  );
}
