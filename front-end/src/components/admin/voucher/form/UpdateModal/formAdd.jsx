import React, { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

// Format phần trăm
function formatPercent(value) {
  const num = Number(value);
  if (isNaN(num)) return '';
  return Number.isInteger(num) ? `${num}%` : `${num.toFixed(2)}%`;
}

// Format tiền VND
function formatVND(value) {
  const num = Number(value);
  if (isNaN(num)) return '';
  return num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 });
}

function formatDatetimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}


export default function FormAdd({ form, setForm }) {
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Chuyển đổi discount_type
    if (name === 'discount_type') {
      setForm(prev => ({
        ...prev,
        discount_type: value,
        discount_value: '',
      }));
      setErrorMsg('');
      return;
    }

    // Xử lý giá trị giảm
    if (name === 'discount_value') {
      let numericValue = form.discount_type === 'percent'
        ? value.replace(/\D/g, '')
        : value.replace(/\./g, '');

      numericValue = numericValue === '' ? '' : Number(numericValue);

      if (form.discount_type === 'percent') {
        if (numericValue > 100) {
          setErrorMsg('Phần trăm giảm tối đa 100%');
          return;
        }
      } else {
        if (numericValue > 10000000) {
          setErrorMsg('Số tiền giảm tối đa 10.000.000 VNĐ');
          return;
        }
        const minOrder = Number(form.min_order_value.replace(/\./g, '') || 0);
        if (minOrder && numericValue >= minOrder) {
          setErrorMsg('Đơn hàng tối thiểu phải lớn hơn số tiền giảm');
          return;
        }
      }

      setErrorMsg('');
      setForm(prev => ({ ...prev, discount_value: numericValue.toString() }));
      return;
    }

    // Xử lý min_order_value
    if (name === 'min_order_value') {
      const numericValue = value.replace(/\./g, '');
      if (numericValue !== '' && Number(numericValue) > 50000000) {
        setErrorMsg('Đơn hàng tối đa 50.000.000 VNĐ');
        return;
      }
      if (form.discount_type === 'fixed' && Number(form.discount_value) >= Number(numericValue)) {
        setErrorMsg('Đơn hàng tối thiểu phải lớn hơn số tiền giảm');
        return;
      }

      setErrorMsg('');
      setForm(prev => ({ ...prev, min_order_value: numericValue }));
      return;
    }

    // Validate ngày bắt đầu và ngày kết thúc
    if (name === 'start_date') {
      const startDate = new Date(value);
      const now = new Date();
      if (startDate < now) {
        setErrorMsg('Ngày bắt đầu không được nhỏ hơn hiện tại');
        return;
      }
      if (form.end_date && new Date(form.end_date) < startDate) {
        setErrorMsg('Ngày kết thúc phải sau ngày bắt đầu');
        return;
      }
      setErrorMsg('');
      setForm(prev => ({ ...prev, start_date: value }));
      return;
    }

    if (name === 'end_date') {
      if (form.start_date && new Date(value) < new Date(form.start_date)) {
        setErrorMsg('Ngày kết thúc phải sau ngày bắt đầu');
        return;
      }
      setErrorMsg('');
      setForm(prev => ({ ...prev, end_date: value }));
      return;
    }

    // Các input khác
    setForm(prev => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  return (
    <>
      {errorMsg && <div className="text-danger mb-2">{errorMsg}</div>}

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Tên mã</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Mã Voucher</Form.Label>
            <Form.Control
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Loại giảm</Form.Label>
            <Form.Select
              name="discount_type"
              value={form.discount_type}
              onChange={handleChange}
            >
              <option value="percent">% Phần trăm</option>
              <option value="fixed">Số tiền cố định</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Giá trị giảm</Form.Label>
            <Form.Control
              type="text"
              name="discount_value"
              value={
                form.discount_type === 'fixed'
                  ? formatVND(form.discount_value)
                  : formatPercent(form.discount_value)
              }
              onChange={handleChange}
              placeholder={form.discount_type === 'fixed' ? 'VNĐ' : '%'}
            />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Đơn hàng giá tối thiểu</Form.Label>
            <Form.Control
              type="text"
              name="min_order_value"
              value={form.min_order_value ? formatVND(form.min_order_value) : ''}
              onChange={(e) => {
                const raw = e.target.value.replace(/\./g, ''); // bỏ dấu chấm
                if (!isNaN(raw)) setForm(prev => ({ ...prev, min_order_value: Number(raw) }));
              }}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Ngày bắt đầu</Form.Label>
            <Form.Control
              type="datetime-local"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              min={formatDatetimeLocal(new Date())}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Ngày kết thúc</Form.Label>
            <Form.Control
              type="datetime-local"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              min={formatDatetimeLocal(form.start_date || new Date())}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Số lượt đã dùng</Form.Label>
            <Form.Control
              type="text"
              name="usage_count"
              value={form.usage_count}
              disabled
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value={1}>Chờ duyệt</option>
              <option value={2}>Hiển thị</option>
              <option value={3}>Ẩn</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Mô tả</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="description"
          value={form.description}
          onChange={handleChange}
        />
      </Form.Group>
    </>
  );
}
