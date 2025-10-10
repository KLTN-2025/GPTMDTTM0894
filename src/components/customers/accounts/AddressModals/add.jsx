"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Toast } from "react-bootstrap";
import { toast } from "react-toastify";
import { API_CONFIG } from "@/config/api";

export default function AddAddressModal({ id_customer, onSuccess }) {
  const initialForm = {
    address_label: "",
    name_city: "",
    // name_district: "",
    name_ward: "",
    name_address: "",
    is_primary: false,
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Cập nhật trạng thái isValid dựa trên validateForm
    const valid = validateForm();
    setIsValid(valid);
  }, [form]);

  if (!id_customer) return <p>Đang tải thông tin khách hàng...</p>;

  // Validate từng trường
  const validateField = (name, value) => {
    if (
      ["address_label", "name_city", "name_district", "name_ward", "name_address"].includes(name)
    ) {
      if (!value || value.trim() === "") {
        return "Trường này không được để trống";
      }
    }
    return "";
  };

  // Validate toàn bộ form
  const validateForm = () => {
    const newErrors = {};
    for (const key in form) {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setForm((prev) => {
      const updated = { ...prev, [id]: newValue };
      setIsDirty(JSON.stringify(updated) !== JSON.stringify(initialForm));

      // Validate ngay khi người dùng nhập
      const error = validateField(id, newValue);
      setErrors((prevErrors) => ({
        ...prevErrors,
        [id]: error,
      }));

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id_customer) {
      alert("Chưa có ID khách hàng");
      return;
    }

    const valid = validateForm();
    if (!valid) return;

    try {
      await axios.post(API_CONFIG.getApiUrl("/address"), { ...form, id_customer });
      // alert("Thêm địa chỉ thành công!");
      toast.success("Thêm địa chỉ thành công!");
      // Reset form
      setForm(initialForm);
      setErrors({});
      setIsDirty(false);

      const modal = document.getElementById("modalAddAddress");
      const modalInstance = window.bootstrap.Modal.getInstance(modal);
      modalInstance.hide();

      if (onSuccess) onSuccess();
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div
      className="modal fade"
      id="modalAddAddress"
      tabIndex={-1}
      aria-labelledby="modalAddAddressLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg">
        <form className="modal-content" onSubmit={handleSubmit} noValidate>
          <div className="modal-header">
            <h5 className="modal-title" id="modalAddAddressLabel">
              Thêm địa chỉ
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Đóng"
            />
          </div>
          <div className="modal-body">
            {[
              { label: "Tên địa chỉ", id: "address_label" },
              { label: "Thành phố / Tỉnh", id: "name_city" },
              // { label: "Quận / Huyện", id: "name_district" },
              { label: "Phường / Xã", id: "name_ward" },
            ].map(({ label, id }) => (
              <div className="mb-3" key={id}>
                <label htmlFor={id} className="form-label">{label}</label>
                <input
                  type="text"
                  className={`form-control ${errors[id] ? "is-invalid" : ""}`}
                  id={id}
                  value={form[id]}
                  onChange={handleChange}
                  required
                />
                {errors[id] && <div className="invalid-feedback">{errors[id]}</div>}
              </div>
            ))}

            <div className="mb-3">
              <label htmlFor="name_address" className="form-label">Số nhà, tên đường</label>
              <textarea
                className={`form-control ${errors.name_address ? "is-invalid" : ""}`}
                id="name_address"
                rows="2"
                value={form.name_address}
                onChange={handleChange}
                required
              />
              {errors.name_address && (
                <div className="invalid-feedback">{errors.name_address}</div>
              )}
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="is_primary"
                checked={form.is_primary}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="is_primary">
                Địa chỉ mặc định
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isDirty || !isValid}
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
