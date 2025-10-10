"use client";



import { useState } from "react";
import axios from "axios";

import { toast } from "react-toastify";
import API_CONFIG from "@/config/api";

export default function UpdateAddressModal({ address, modalId, onUpdateSuccess }) {
  const [form, setForm] = useState({
    address_label: address.address_label || "",
    name_city: address.name_city || "",
    name_ward: address.name_ward || "",
    name_address: address.name_address || "",
    is_primary: address.is_primary || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'is_primary' && checked && !form.is_primary) {
      if (!window.confirm('Bạn có chắc muốn đặt địa chỉ này làm mặc định? Địa chỉ mặc định cũ sẽ bị thay thế.')) {
        return; // hủy toggle
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(API_CONFIG.getApiUrl(`/address/${address.id_address}`), {
        ...form,
      });
      toast.success("Cập nhật thành công!");
      // Close modal manually (Bootstrap 5)
      const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
      modal.hide();

      if (onUpdateSuccess) onUpdateSuccess();
    } catch (error) {
      // alert("Cập nhật thất bại: " + (error.response?.data?.message || error.message));
      toast.error(`${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div
      className="modal fade"
      id={modalId}
      tabIndex="-1"
      aria-labelledby={`${modalId}Label`}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg">
        <form onSubmit={handleSubmit} className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id={`${modalId}Label`}>Sửa địa chỉ</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Đóng"></button>
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Tên địa chỉ</label>
              <input
                type="text"
                className="form-control"
                name="address_label"
                maxLength="50"
                value={form.address_label}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Thành phố / Tỉnh</label>
              <input
                type="text"
                className="form-control"
                name="name_city"
                value={form.name_city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Phường / Xã</label>
              <input
                type="text"
                className="form-control"
                name="name_ward"
                value={form.name_ward}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Số nhà, tên đường</label>
              <textarea
                className="form-control"
                name="name_address"
                rows="2"
                value={form.name_address}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                name="is_primary"
                checked={form.is_primary}
                onChange={handleChange}
                id={`is_primary_edit${address.id_address}`}
              />
              <label className="form-check-label" htmlFor={`is_primary_edit${address.id_address}`}>
                Địa chỉ mặc định
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
