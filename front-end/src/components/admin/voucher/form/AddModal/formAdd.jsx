import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';

export default function FormAdd({ form, handleChange, formatVND }) {
  const [minEndDate, setMinEndDate] = useState(new Date().toISOString().slice(0, 16));
  const [dateError, setDateError] = useState('');
  const [minOrderError, setMinOrderError] = useState('');

  // Validate ngày kết thúc dựa trên ngày bắt đầu
  useEffect(() => {
    if (form.start_date) {
      const start = new Date(form.start_date);
      start.setDate(start.getDate() + 1); // kết thúc phải sau ít nhất 1 ngày
      const minEnd = start.toISOString().slice(0, 16);
      setMinEndDate(minEnd);

      if (form.end_date && new Date(form.end_date) < start) {
        setDateError('Ngày kết thúc phải sau ngày bắt đầu ít nhất 1 ngày.');
      } else {
        setDateError('');
      }
    }
  }, [form.start_date, form.end_date]);

  // Validate giá trị giảm cố định so với đơn hàng tối thiểu
  useEffect(() => {
    if (form.discount_type === 'fixed') {
      const discount = parseFloat(form.discount_value.toString().replace(/\./g, '')) || 0;
      const minOrder = parseFloat(form.min_order_value.toString().replace(/\./g, '')) || 0;

      if (discount > minOrder) {
        setMinOrderError('Đơn hàng tối thiểu phải lớn hơn giá trị giảm.');
      } else {
        setMinOrderError('');
      }
    } else {
      setMinOrderError('');
    }
  }, [form.discount_type, form.discount_value, form.min_order_value]);

  return (
    <>
      {/* Tên voucher và mã */}
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

      {/* Loại giảm, giá trị giảm, đơn hàng tối thiểu */}
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
                  : form.discount_value
              }
              onChange={handleChange}
              placeholder={form.discount_type === 'fixed' ? 'VNĐ' : '%'}
              max={form.discount_type === 'percent' ? 100 : undefined}
            />
            <Form.Text>{form.discount_type === 'fixed' ? 'VNĐ' : '%'}</Form.Text>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Đơn hàng giá tối thiểu</Form.Label>
            <Form.Control
              type="text"
              name="min_order_value"
              value={formatVND(form.min_order_value)}
              onChange={handleChange}
            />
            <Form.Text>VNĐ</Form.Text>
            {minOrderError && <Form.Text style={{ color: 'red' }}>{minOrderError}</Form.Text>}
          </Form.Group>
        </Col>
      </Row>

      {/* Số lượt dùng, tổng số voucher */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Số lượt dùng mỗi người</Form.Label>
            <Form.Control
              type="number"
              name="user_limit"
              value={form.user_limit}
              onChange={handleChange}
              min={0}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Tổng số voucher</Form.Label>
            <Form.Control
              type="number"
              name="usage_limit"
              value={form.usage_limit}
              onChange={handleChange}
              min={0}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Ngày bắt đầu & kết thúc */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Ngày bắt đầu</Form.Label>
            <Form.Control
              type="datetime-local"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
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
              min={minEndDate}
            />
            {dateError && <Form.Text style={{ color: 'red' }}>{dateError}</Form.Text>}
          </Form.Group>
        </Col>
      </Row>

      {/* Mô tả */}
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
