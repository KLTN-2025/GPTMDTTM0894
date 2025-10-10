import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import SortDropdown from './SortDropdown';
import PriceRangeFilter from './PriceRangeFilter';
import ProductTypeFilter from './ProductTypeFilter';

export default function ProductFilter({ onFilterChange, totalProducts = 0 }) {
  const [filters, setFilters] = useState({
    sort_by: 'created_at',
    sort_order: 'desc',
    price_min: '',
    price_max: '',
    product_type: '',
    is_sale: false,
    is_new: false,
    search: ''
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (filters.price_min || filters.price_max) count++;
    if (filters.product_type) count++;
    if (filters.is_sale) count++;
    if (filters.is_new) count++;
    if (filters.search) count++;
    
    setActiveFiltersCount(count);
    
    // Trigger filter change
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      sort_by: 'created_at',
      sort_order: 'desc',
      price_min: '',
      price_max: '',
      product_type: '',
      is_sale: false,
      is_new: false,
      search: ''
    });
  };

  const clearSpecificFilter = (filterKey) => {
    if (filterKey === 'price') {
      setFilters(prev => ({
        ...prev,
        price_min: '',
        price_max: ''
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [filterKey]: filterKey === 'is_sale' || filterKey === 'is_new' ? false : ''
      }));
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header className="bg-light">
        <Row className="align-items-center">
          <Col md={6}>
            <h6 className="mb-0">
              <i className="bi bi-funnel me-2"></i>
              Bộ lọc sản phẩm
              {activeFiltersCount > 0 && (
                <Badge bg="primary" className="ms-2">{activeFiltersCount}</Badge>
              )}
            </h6>
          </Col>
          <Col md={6} className="text-end">
            <small className="text-muted">
              Tìm thấy {totalProducts.toLocaleString()} sản phẩm
            </small>
            {activeFiltersCount > 0 && (
              <Button 
                variant="outline-danger" 
                size="sm" 
                className="ms-2"
                onClick={clearAllFilters}
              >
                <i className="bi bi-x-circle me-1"></i>
                Xóa bộ lọc
              </Button>
            )}
          </Col>
        </Row>
      </Card.Header>
      
      <Card.Body>
        {/* Search */}
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label className="fw-semibold">
                <i className="bi bi-search me-2"></i>
                Tìm kiếm
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên sản phẩm..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          {/* Sort */}
          <Col lg={3} md={6} className="mb-3">
            <SortDropdown
              sortBy={filters.sort_by}
              sortOrder={filters.sort_order}
              onSortChange={(sortBy, sortOrder) => {
                updateFilter('sort_by', sortBy);
                updateFilter('sort_order', sortOrder);
              }}
            />
          </Col>

          {/* Price Range */}
          <Col lg={3} md={6} className="mb-3">
            <PriceRangeFilter
              priceMin={filters.price_min}
              priceMax={filters.price_max}
              onPriceChange={(min, max) => {
                updateFilter('price_min', min);
                updateFilter('price_max', max);
              }}
            />
          </Col>

          {/* Product Type */}
          <Col lg={3} md={6} className="mb-3">
            <ProductTypeFilter
              productType={filters.product_type}
              onTypeChange={(type) => updateFilter('product_type', type)}
            />
          </Col>

          {/* Special Filters */}
          <Col lg={3} md={6} className="mb-3">
            <Form.Group>
              <Form.Label className="fw-semibold">
                <i className="bi bi-star me-2"></i>
                Đặc biệt
              </Form.Label>
              <div>
                <Form.Check
                  type="checkbox"
                  id="is_sale"
                  label="🏷️ Sản phẩm khuyến mãi"
                  checked={filters.is_sale}
                  onChange={(e) => updateFilter('is_sale', e.target.checked)}
                  className="mb-2"
                />
                <Form.Check
                  type="checkbox"
                  id="is_new"
                  label="🆕 Sản phẩm mới"
                  checked={filters.is_new}
                  onChange={(e) => updateFilter('is_new', e.target.checked)}
                />
              </div>
            </Form.Group>
          </Col>
        </Row>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <Row className="mt-3 pt-3 border-top">
            <Col>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <small className="text-muted me-2">Bộ lọc đang áp dụng:</small>
                
                {(filters.price_min || filters.price_max) && (
                  <Badge bg="info" className="d-flex align-items-center">
                    Giá: {filters.price_min ? `${parseInt(filters.price_min).toLocaleString()}đ` : '0đ'} - {filters.price_max ? `${parseInt(filters.price_max).toLocaleString()}đ` : '∞'}
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 ms-1 text-white"
                      onClick={() => clearSpecificFilter('price')}
                    >
                      <i className="bi bi-x"></i>
                    </Button>
                  </Badge>
                )}

                {filters.product_type && (
                  <Badge bg="info" className="d-flex align-items-center">
                    {filters.product_type === '1' ? 'Sản phẩm đơn giản' : 
                     filters.product_type === '2' ? 'Sản phẩm có options' : 
                     'Sản phẩm có variants'}
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 ms-1 text-white"
                      onClick={() => clearSpecificFilter('product_type')}
                    >
                      <i className="bi bi-x"></i>
                    </Button>
                  </Badge>
                )}

                {filters.is_sale && (
                  <Badge bg="info" className="d-flex align-items-center">
                    Khuyến mãi
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 ms-1 text-white"
                      onClick={() => clearSpecificFilter('is_sale')}
                    >
                      <i className="bi bi-x"></i>
                    </Button>
                  </Badge>
                )}

                {filters.is_new && (
                  <Badge bg="info" className="d-flex align-items-center">
                    Sản phẩm mới
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 ms-1 text-white"
                      onClick={() => clearSpecificFilter('is_new')}
                    >
                      <i className="bi bi-x"></i>
                    </Button>
                  </Badge>
                )}

                {filters.search && (
                  <Badge bg="info" className="d-flex align-items-center">
                    "{filters.search}"
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 ms-1 text-white"
                      onClick={() => clearSpecificFilter('search')}
                    >
                      <i className="bi bi-x"></i>
                    </Button>
                  </Badge>
                )}
              </div>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
}
