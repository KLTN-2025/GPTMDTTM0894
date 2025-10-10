"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_CONFIG } from "@/config/api";

export default function SignIn() {
  const router = useRouter();

  const [form, setForm] = useState({
    phoneOrEmail: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const togglePassword = () => setShowPassword(!showPassword);

  // Validate email format
  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  // Validate phone format (simple)
  const validatePhone = (phone) => {
    const re = /^[0-9]{9,11}$/;
    return re.test(phone);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.phoneOrEmail || !form.password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const isEmail = validateEmail(form.phoneOrEmail);
    const isPhone = validatePhone(form.phoneOrEmail);

    if (!isEmail && !isPhone) {
      setError("Vui lòng nhập đúng định dạng Email hoặc Số điện thoại");
      return;
    }

    try {
      const res = await fetch(API_CONFIG.getApiUrl("/customers/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneOrEmail: form.phoneOrEmail,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Hiển thị lỗi riêng biệt khi bị chặn
        if (res.status === 403) {
          setError(data.message || "Tài khoản của bạn đã bị chặn");
        } else {
          setError(data.message || "Đăng nhập thất bại");
        }
        return;
      }

      localStorage.setItem("token", data.token);
      router.push("/");
    } catch (err) {
      setError("Lỗi mạng, vui lòng thử lại sau");
    }
  };


  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow p-4">
            <h3 className="text-center mb-4">Đăng Nhập</h3>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email hoặc SĐT */}
              <div className="mb-3">
                <label htmlFor="phoneOrEmail" className="form-label">
                  Email hoặc Số điện thoại:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="phoneOrEmail"
                  name="phoneOrEmail"
                  value={form.phoneOrEmail}
                  onChange={handleChange}
                  placeholder="Nhập email hoặc số điện thoại"
                  required
                />
              </div>

              {/* Mật khẩu có con mắt */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Mật khẩu:
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu"
                    required
                  />
                  <span
                    className="input-group-text"
                    style={{ cursor: "pointer" }}
                    onClick={togglePassword}
                  >
                    <i
                      className={`fa ${
                        showPassword ? "fa-eye" : "fa-eye-slash"
                      }`}
                    ></i>
                  </span>
                </div>
              </div>

              {/* Ghi nhớ + Quên mật khẩu */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="remember"
                    name="remember"
                  />
                  <label className="form-check-label" htmlFor="remember">
                    Ghi nhớ
                  </label>
                </div>
                <a href="/forgot-pass" className="text-decoration-none">
                  Quên mật khẩu?
                </a>
              </div>

              {/* Nút Đăng nhập */}
              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-primary">
                  Đăng Nhập
                </button>
              </div>

              {/* Chưa có tài khoản */}
              <p className="text-center mb-0">
                Chưa có tài khoản?{" "}
                <a href="/register" className="text-primary text-decoration-none">
                  Đăng ký
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
