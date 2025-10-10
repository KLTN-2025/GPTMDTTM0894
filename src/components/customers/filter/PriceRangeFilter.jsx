import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Dropdown } from 'react-bootstrap';

export default function PriceRangeFilter({ priceMin, priceMax, onPriceChange }) {
  const [localMin, setLocalMin] = useState(priceMin);
  const [localMax, setLocalMax] = useState(priceMax);

  useEffect(() => {
    setLocalMin(priceMin);
    setLocalMax(priceMax);
  }, [priceMin, priceMax]);

  const priceRanges = [
    { label: 'Dưới 10 triệu', min: '', max: '10000000' },
    { label: '10 - 20 triệu', min: '10000000', max: '20000000' },
    { label: '20 - 30 triệu', min: '20000000', max: '30000000' },
    { label: '30 - 50 triệu', min: '30000000', max: '50000000' },
    { label: 'Trên 50 triệu', min: '50000000', max: '' }
  ];

  const formatCurrency = (value) => {
    if (!value) return '';
    return parseInt(value).toLocaleString('vi-VN');
  };

  const handleApply = () => {
    // Validate min < max
    if (localMin && localMax && parseInt(localMin) >= parseInt(localMax)) {
      alert('Giá tối thiểu phải nhỏ hơn giá tối đa');
      return;
    }
    onPriceChange(localMin, localMax);
  };

  const handleQuickSelect = (min, max) => {
    setLocalMin(min);
    setLocalMax(max);
    onPriceChange(min, max);
  };

  const handleClear = () => {
    setLocalMin('');
    setLocalMax('');
    onPriceChange('', '');
  };

  const getCurrentRangeLabel = () => {
    if (!priceMin && !priceMax) return 'Tất cả giá';
    if (!priceMin) return `Dưới ${formatCurrency(priceMax)}đ`;
    if (!priceMax) return `Từ ${formatCurrency(priceMin)}đ`;
    return `${formatCurrency(priceMin)}đ - ${formatCurrency(priceMax)}đ`;
  };

  return (
    <Form.Group>
      <Form.Label className="fw-semibold">
        <i className="bi bi-currency-dollar me-2"></i>
        Khoảng giá
      </Form.Label>
      
      {/* Quick Select Dropdown */}
      <Dropdown className="mb-2">
        <Dropdown.Toggle variant="outline-success" size="sm" className="w-100 text-start">
          💰 {getCurrentRangeLabel()}
        </Dropdown.Toggle>
        <Dropdown.Menu className="w-100">
          <Dropdown.Item onClick={() => handleQuickSelect('', '')}>
            Tất cả giá
          </Dropdown.Item>
          <Dropdown.Divider />
          {priceRanges.map((range, index) => (
            <Dropdown.Item
              key={index}
              onClick={() => handleQuickSelect(range.min, range.max)}
              active={priceMin === range.min && priceMax === range.max}
            >
              {range.label}
            </Dropdown.Item>
          ))}
          <Dropdown.Divider />
          <Dropdown.ItemText>
            <strong>Tùy chỉnh:</strong>
          </Dropdown.ItemText>
        </Dropdown.Menu>
      </Dropdown>

      {/* Custom Range Inputs */}
      <Row className="g-2">
        <Col>
          <Form.Control
            type="number"
            placeholder="Giá từ"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            size="sm"
          />
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          <span className="text-muted">-</span>
        </Col>
        <Col>
          <Form.Control
            type="number"
            placeholder="Giá đến"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            size="sm"
          />
        </Col>
      </Row>

      {/* Action Buttons */}
      <div className="d-flex gap-2 mt-2">
        <Button 
          variant="primary" 
          size="sm" 
          onClick={handleApply}
          className="flex-fill"
        >
          Áp dụng
        </Button>
        {(priceMin || priceMax) && (
          <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={handleClear}
          >
            <i className="bi bi-x"></i>
          </Button>
        )}
      </div>

      {/* Current Range Display */}
      {(priceMin || priceMax) && (
        <small className="text-muted mt-1 d-block">
          {getCurrentRangeLabel()}
        </small>
      )}
    </Form.Group>
  );
}
