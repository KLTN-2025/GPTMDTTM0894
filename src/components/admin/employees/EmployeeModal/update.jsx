'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import API_CONFIG from "@/config/api";

export default function UpdateEmployeeModal({ show, onClose, employeeId, onUpdated }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    position: '',
    status: '',
    role: '', // ✅ Thêm role vào đây
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (employeeId && show) {
      axios.get(API_CONFIG.getApiUrl(`/employees/${employeeId}`))
        .then((res) => {
          const emp = res.data;
          setFormData({
            name: emp.name || '',
            phone: emp.phone || '',
            email: emp.email || '',
            password: '',
            position: emp.position || '',
            status: String(emp.status || ''),
            role: String(emp.role || ''),
          });
        })
        .catch(() => setError('Không thể tải dữ liệu nhân viên'));
    }
  }, [employeeId, show]);

  const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = { ...formData };

      // ❗ Nếu không nhập mật khẩu → xóa khỏi dữ liệu gửi
      if (!formData.password || formData.password.trim() === "") {
        delete formDataToSend.password;
      }

      await axios.put(API_CONFIG.getApiUrl(`/employees/${employeeId}`), formDataToSend);
      alert('Cập nhật nhân viên thành công!');
      onUpdated?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  if (!show) return null;

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Cập nhật nhân viên</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="mb-3">
                <label className="form-label">Họ tên</label>
                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Số điện thoại</label>
                <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Mật khẩu mới (bỏ qua nếu không đổi)</label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Vị trí</label>
                <input type="text" className="form-control" name="position" value={formData.position} onChange={handleChange} />
              </div>

              <div className="mb-3">
                <label className="form-label">Trạng thái</label>
                <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                  <option value="1">Đang đi làm</option>
                  <option value="2">Đang nghỉ phép</option>
                  {/* <option value="3">Đã nghỉ làm</option> */}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Vai trò</label>
                <select className="form-select" name="role" value={formData.role} onChange={handleChange}>
                  <option value="1">Super Admin</option>
                  <option value="2">Nhân viên</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
