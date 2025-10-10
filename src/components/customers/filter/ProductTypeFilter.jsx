import React from 'react';
import { Form, Button, ButtonGroup } from 'react-bootstrap';

export default function ProductTypeFilter({ productType, onTypeChange }) {
  const productTypes = [
    { value: '', label: 'Tất cả', icon: '📱', description: 'Tất cả sản phẩm' },
    { value: '1', label: 'Đơn giản', icon: '🔸', description: 'Sản phẩm cơ bản' },
    { value: '2', label: 'Có options', icon: '⚙️', description: 'Có tùy chọn màu sắc, bộ nhớ' },
    { value: '3', label: 'Có variants', icon: '🔀', description: 'Nhiều phiên bản khác nhau' }
  ];

  const getCurrentTypeLabel = () => {
    const type = productTypes.find(t => t.value === productType);
    return type ? `${type.icon} ${type.label}` : '📱 Tất cả';
  };

  return (
    <Form.Group>
      <Form.Label className="fw-semibold">
        <i className="bi bi-diagram-3 me-2"></i>
        Loại sản phẩm
      </Form.Label>
      
      {/* Button Group for Type Selection */}
      <div className="d-grid gap-2">
        {productTypes.map((type) => (
          <Button
            key={type.value}
            variant={productType === type.value ? "primary" : "outline-primary"}
            size="sm"
            onClick={() => onTypeChange(type.value)}
            className="text-start d-flex align-items-center justify-content-between"
          >
            <span>
              {type.icon} {type.label}
            </span>
            {productType === type.value && (
              <i className="bi bi-check-circle-fill"></i>
            )}
          </Button>
        ))}
      </div>

      {/* Current Selection Description */}
      {productType && (
        <small className="text-muted mt-2 d-block">
          {productTypes.find(t => t.value === productType)?.description}
        </small>
      )}

      {/* Quick Toggle Buttons */}
      <div className="mt-2">
        <ButtonGroup size="sm" className="w-100">
          <Button
            variant={productType === '' ? "secondary" : "outline-secondary"}
            onClick={() => onTypeChange('')}
            className="flex-fill"
          >
            Tất cả
          </Button>
          <Button
            variant={productType === '2' ? "info" : "outline-info"}
            onClick={() => onTypeChange('2')}
            className="flex-fill"
          >
            Có options
          </Button>
          <Button
            variant={productType === '3' ? "warning" : "outline-warning"}
            onClick={() => onTypeChange('3')}
            className="flex-fill"
          >
            Variants
          </Button>
        </ButtonGroup>
      </div>
    </Form.Group>
  );
}
