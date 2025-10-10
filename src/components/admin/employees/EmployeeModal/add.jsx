'use client';

import { useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
import API_CONFIG from "@/config/api";

export default function AddEmployeeModal({ show, onClose, onSuccess }) {
  const [form, setForm] = useState({
    employee_name: '',
    employee_gender: '1',
    employee_phone: '',
    employee_email: '',
    employee_password: '',
    employee_position: '',
    employee_role: '1',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    console.log('Input changed:', e.target.name, e.target.value);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    console.log('Submit bắt đầu, dữ liệu gửi:', form);
    try {
      setLoading(true);
      setErrorMsg('');

      const payload = {
        name: form.employee_name,
        gender: parseInt(form.employee_gender),
        phone: form.employee_phone,
        email: form.employee_email,
        password: form.employee_password,
        position: form.employee_position,
        role: parseInt(form.employee_role),
        block_reason: '',
      };

      console.log('Payload gửi đến API:', payload);
      const res = await axios.post(API_CONFIG.getApiUrl("/employees"), payload);
      console.log('Phản hồi API thêm nhân viên:', res.status, res.data);

      if (res.status === 201) {
        setForm({
          employee_name: '',
          employee_gender: '1',
          employee_phone: '',
          employee_email: '',
          employee_password: '',
          employee_position: '',
          employee_role: '2',
        });
        console.log('Gọi onSuccess (reload danh sách)');
        if (onSuccess) onSuccess();

        console.log('Gọi onClose (đóng modal)');
        if (onClose) onClose();
      } else {
        console.warn('Không thể thêm nhân viên, status không phải 201:', res.status);
        setErrorMsg('Không thể thêm nhân viên.');
      }
    } catch (err) {
      console.error('Lỗi khi thêm nhân viên:', err);
      setErrorMsg(err?.response?.data?.error || 'Lỗi không xác định');
    } finally {
      setLoading(false);
      console.log('Submit kết thúc, loading set false');
    }
  };

  console.log('Render AddEmployeeModal, show =', show);

  return (
    <Modal show={show} onHide={() => { console.log('Đóng modal qua nút X hoặc backdrop'); onClose && onClose(); }} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Thêm nhân viên</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Họ tên</Form.Label>
            <Form.Control
              name="employee_name"
              value={form.employee_name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Giới tính</Form.Label>
            <Form.Select
              name="employee_gender"
              value={form.employee_gender}
              onChange={handleChange}
            >
              <option value="1">Nam</option>
              <option value="2">Nữ</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Điện thoại</Form.Label>
            <Form.Control
              name="employee_phone"
              value={form.employee_phone}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="employee_email"
              type="email"
              value={form.employee_email}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Mật khẩu</Form.Label>
            <div className="input-group">
              <Form.Control
                name="employee_password"
                type={showPassword ? "text" : "password"}
                value={form.employee_password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Vị trí</Form.Label>
            <Form.Control
              name="employee_position"
              value={form.employee_position}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Quyền</Form.Label>
            <Form.Select
              name="employee_role"
              value={form.employee_role}
              onChange={handleChange}
            >
              <option value="1">Super Admin</option>
              <option value="2">Seller</option>
            </Form.Select>
          </Form.Group>

          {errorMsg && <p className="text-danger mt-2">{errorMsg}</p>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => { console.log('Click Hủy'); onClose && onClose(); }} disabled={loading}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Đang lưu...' : 'Thêm'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
