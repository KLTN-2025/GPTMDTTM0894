import React from 'react';
import { Form, Dropdown, ButtonGroup } from 'react-bootstrap';

export default function SortDropdown({ sortBy, sortOrder, onSortChange }) {
  const sortOptions = [
    { value: 'created_at', label: 'Thời gian', icon: '🕒' },
    { value: 'price', label: 'Giá bán', icon: '💰' },
    { value: 'name', label: 'Tên sản phẩm', icon: '📝' },
    { value: 'popular', label: 'Phổ biến', icon: '🔥' }
  ];

  const getCurrentSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === sortBy);
    return option ? `${option.icon} ${option.label}` : '📅 Thời gian';
  };

  const getOrderLabel = () => {
    if (sortBy === 'price') {
      return sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần';
    } else if (sortBy === 'name') {
      return sortOrder === 'asc' ? 'A → Z' : 'Z → A';
    } else {
      return sortOrder === 'asc' ? 'Cũ nhất' : 'Mới nhất';
    }
  };

  return (
    <Form.Group>
      <Form.Label className="fw-semibold">
        <i className="bi bi-sort-down me-2"></i>
        Sắp xếp theo
      </Form.Label>
      <div className="d-flex gap-2">
        {/* Sort By Dropdown */}
        <Dropdown as={ButtonGroup} className="flex-fill">
          <Dropdown.Toggle variant="outline-primary" size="sm" className="w-100 text-start">
            {getCurrentSortLabel()}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {sortOptions.map((option) => (
              <Dropdown.Item
                key={option.value}
                active={sortBy === option.value}
                onClick={() => onSortChange(option.value, sortOrder)}
              >
                {option.icon} {option.label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        {/* Sort Order Dropdown */}
        <Dropdown as={ButtonGroup}>
          <Dropdown.Toggle variant="outline-secondary" size="sm">
            {sortOrder === 'asc' ? '⬆️' : '⬇️'}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              active={sortOrder === 'desc'}
              onClick={() => onSortChange(sortBy, 'desc')}
            >
              ⬇️ {sortBy === 'price' ? 'Giảm dần' : sortBy === 'name' ? 'Z → A' : 'Mới nhất'}
            </Dropdown.Item>
            <Dropdown.Item
              active={sortOrder === 'asc'}
              onClick={() => onSortChange(sortBy, 'asc')}
            >
              ⬆️ {sortBy === 'price' ? 'Tăng dần' : sortBy === 'name' ? 'A → Z' : 'Cũ nhất'}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      
      <small className="text-muted mt-1 d-block">
        {getOrderLabel()}
      </small>
    </Form.Group>
  );
}
