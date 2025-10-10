"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API_CONFIG from "@/config/api";

export default function UserDetailForm({ idCustomer }) {
  const [fullName, setFullName] = useState("");
  const [givenname, setGivenname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy dữ liệu khách hàng khi component mount
  useEffect(() => {
    async function fetchCustomer() {
      try {
        const res = await axios.get(API_CONFIG.getApiUrl(`/customers/${idCustomer}`));
        const customer = res.data.customer;
        setFullName(customer.name || "");
        setGivenname(customer.given_name || "");
        setLastname(customer.last_name || "");
        setEmail(customer.email || "");
        setPhone(customer.phone || "");
      } catch (err) {
        // console.error("Fetch error:", err.response || err.message);
        toast.error(`Fetch error:", ${err.response} || ${err.message}`);
        // alert("Lỗi khi tải thông tin khách hàng");
        toast.err("Lỗi tải thông tin");
      } finally {
        setLoading(false);
      }
    }
    fetchCustomer();
  }, [idCustomer]);

  const handleChange = (setter) => (e) => {
    setter(e.target.value);
    setDirty(true);
  };

  const validate = () => {
    const tempErrors = {};

    if (fullName.replace(/\s/g, "").length < 7) {
      tempErrors.fullName = "Tên phải từ 7 ký tự trở lên (không tính khoảng trắng)";
    }

    if (lastname.replace(/\s/g, "").length <= 1) {
      tempErrors.lastName = "Tên phải từ 2 ký tự trở lên (không tính khoảng trắng)";
    }

    if (givenname.replace(/\s/g, "").length <= 1) {
      tempErrors.givenName = "Tên phải từ 2 ký tự trở lên (không tính khoảng trắng)";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      tempErrors.email = "Email không hợp lệ";
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      tempErrors.phone = "Số điện thoại phải đủ 10 số";
    }

    return tempErrors;
  };

  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      setErrors(validate());
    }
  }, [fullName, lastname, givenname, email, phone, touched]);

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({ 
      fullName: true, 
      lastname: true,
      givenname: true,
      email: true, 
      phone: true });

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await axios.put(API_CONFIG.getApiUrl(`/customers/${idCustomer}`), {
        name: fullName,
        last_name: lastname,
        given_name: givenname,
        email,
        phone,
      });
      // alert("Cập nhật thông tin thành công!");
      toast.success('Cập nhật thông tin thành công!');
      setDirty(false); // reset dirty sau khi submit thành công
    } catch (err) {
      const message = err.response?.data?.message || "Cập nhật thất bại!";
      const tempErrors = {};

      if (message.includes("Email đã được sử dụng")) {
        tempErrors.email = message;
      }
      if (message.includes("Số điện thoại đã được sử dụng")) {
        tempErrors.phone = message;
      }
      if (!tempErrors.email && !tempErrors.phone) {
        alert(message);
      } else {
        setErrors(tempErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p>Đang tải thông tin khách hàng...</p>;

  return (
    <form onSubmit={handleSubmit} noValidate>

      <div className="mb-3">
        <label htmlFor="lastName" className="form-label">
          Họ
        </label>
        <input
          type="text"
          className={`form-control ${touched.lastName && errors.lastName ? "is-invalid" : ""}`}
          id="lastName"
          value={lastname}
          onChange={handleChange(setLastname)}
          onBlur={() => handleBlur("lastName")}
        />
        {touched.lastName && errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="givenName" className="form-label">
          Tên
        </label>
        <input
          type="text"
          className={`form-control ${touched.givenName && errors.givenName ? "is-invalid" : ""}`}
          id="givenName"
          value={givenname}
          onChange={handleChange(setGivenname)}
          onBlur={() => handleBlur("givenName")}
        />
        {touched.fullName && errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="fullName" className="form-label">
          Biệt Danh
        </label>
        <input
          type="text"
          className={`form-control ${touched.fullName && errors.fullName ? "is-invalid" : ""}`}
          id="fullName"
          value={fullName}
          onChange={handleChange(setFullName)}
          onBlur={() => handleBlur("fullName")}
        />
        {touched.fullName && errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          type="email"
          className={`form-control ${touched.email && errors.email ? "is-invalid" : ""}`}
          id="email"
          value={email}
          onChange={handleChange(setEmail)}
          onBlur={() => handleBlur("email")}
        />
        {touched.email && errors.email && <div className="invalid-feedback">{errors.email}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="phone" className="form-label">
          Số điện thoại
        </label>
        <input
          type="tel"
          className={`form-control ${touched.phone && errors.phone ? "is-invalid" : ""}`}
          id="phone"
          value={phone}
          onChange={handleChange(setPhone)}
          onBlur={() => handleBlur("phone")}
        />
        {touched.phone && errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
      </div>

      <button
        type="submit"
        className="btn btn-success"
        disabled={!dirty || isSubmitting || Object.keys(errors).length > 0}
      >
        {isSubmitting ? "Đang cập nhật..." : "Cập nhật thông tin"}
      </button>
    </form>
  );
}
