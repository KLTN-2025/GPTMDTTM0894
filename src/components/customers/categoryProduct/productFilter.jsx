"use client";
import { useState, useRef, useEffect } from "react";
import { Container, Row, Col, Dropdown, DropdownButton, Form, Button, Badge } from "react-bootstrap";

export default function ProductFilter({ 
  onFilterChange, 
  onSortChange, 
  productCount = 0, 
  categoryName = "",
  products = [],
  childrenCategories = []
}) {
  const [sortBy, setSortBy] = useState("featured");
  const [selectedFilters, setSelectedFilters] = useState({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [dynamicFilters, setDynamicFilters] = useState([]);
  const dropdownRefs = useRef({});


  useEffect(() => {
    if (!products || products.length === 0) return;

    const attributeMap = new Map();
    
    products.forEach(product => {

      if (product.attributes && Array.isArray(product.attributes)) {
        product.attributes.forEach(attr => {
          const attributeName = attr.name; 
          if (attributeName) {
            if (!attributeMap.has(attributeName)) {
              attributeMap.set(attributeName, new Set());
            }
            
            if (attr.values && Array.isArray(attr.values)) {
              attr.values.forEach(value => {
                let displayValue;
                if (attr.type === 2) {
                
                  if (value.value_note) {
                    displayValue = value.value_note;
                  }
                } else {
                  displayValue = value.value; 
                }
                
                if (displayValue) {
                  attributeMap.get(attributeName).add(displayValue);
                }
              });
            }
          }
        });
      }
      
      if (product.skus && Array.isArray(product.skus)) {
        product.skus.forEach(sku => {
          if (sku.option_combo && Array.isArray(sku.option_combo)) {
            sku.option_combo.forEach(option => {
              const attributeName = option.attribute;
              let valueName = option.value;
              
              if (attributeName && valueName) {
                if (attributeName === "màu" || option.type === 2) {
                  const productAttr = product.attributes?.find(attr => attr.name === attributeName);
                  if (productAttr) {
                    const attrValue = productAttr.values?.find(val => val.value === valueName);
                    if (attrValue && attrValue.value_note) {
                      valueName = attrValue.value_note; 
                    }
                  }
                }
                
                if (!attributeMap.has(attributeName)) {
                  attributeMap.set(attributeName, new Set());
                }
                attributeMap.get(attributeName).add(valueName);
              }
            });
          }
        });
      }
    });

    const generatedFilters = [];
    
    // Add subcategory filter if there are child categories
    // if (childrenCategories && childrenCategories.length > 0) {
    //   generatedFilters.push({
    //     label: "Danh mục",
    //     icon: "bi-folder2-open",
    //     options: [
    //       { label: "Tất cả sản phẩm", value: "all" },
    //       ...childrenCategories.map(child => ({
    //         label: child.name,
    //         value: child.name
    //       }))
    //     ],
    //   });
    // }
    
    generatedFilters.push({
      label: "Mức giá",
      icon: "bi-cash-stack",
      options: [
        { label: "Dưới 10 triệu", value: "under_10m" },
        { label: "10-20 triệu", value: "10m_20m" },
        { label: "20-30 triệu", value: "20m_30m" },
        { label: "Trên 30 triệu", value: "over_30m" },
      ],
    });

    attributeMap.forEach((values, attributeName) => {
      const valuesArray = Array.from(values).filter(v => v).slice(0, 10); 
      
      if (valuesArray.length > 0) {
        let icon = "bi-tag";
        
        const lowerName = attributeName.toLowerCase();
        if (lowerName.includes("màu") || lowerName.includes("color")) {
          icon = "bi-palette";
        } else if (lowerName.includes("bộ nhớ") || lowerName.includes("dung lượng") || lowerName.includes("storage") || lowerName.includes("gb")) {
          icon = "bi-hdd-stack";
        } else if (lowerName.includes("ram") || lowerName.includes("memory")) {
          icon = "bi-memory";
        } else if (lowerName.includes("chip") || lowerName.includes("processor")) {
          icon = "bi-cpu";
        } else if (lowerName.includes("kích thước") || lowerName.includes("size")) {
          icon = "bi-aspect-ratio";
        } else if (lowerName.includes("camera")) {
          icon = "bi-camera";
        }

        generatedFilters.push({
          label: attributeName,
          icon: icon,
          options: valuesArray.map(value => ({
            label: value,
            value: value.toLowerCase().replace(/\s+/g, '_')
          }))
        });
      }
    });

    console.log("Generated filters from products:", generatedFilters);
    console.log("Attribute map:", Array.from(attributeMap.entries()));
    setDynamicFilters(generatedFilters);
  }, [products, childrenCategories]);

     const filters = dynamicFilters.length > 0 ? dynamicFilters : [
     ...(childrenCategories && childrenCategories.length > 0 ? [{
       label: "Danh mục",
       icon: "bi-folder2-open",
       options: [
         { label: "Tất cả sản phẩm", value: "all" },
         ...childrenCategories.map(child => ({
           label: child.name,
           value: child.name
         }))
       ],
     }] : []),
    {
      label: "Mức giá",
       icon: "bi-cash-stack",
       options: [
         { label: "Dưới 10 triệu", value: "under_10m" },
         { label: "10-20 triệu", value: "10m_20m" },
         { label: "20-30 triệu", value: "20m_30m" },
         { label: "Trên 30 triệu", value: "over_30m" },
       ],
     }
   ];

  const sortOptions = [
    { label: "Sản phẩm nổi bật", value: "featured", icon: "bi-star" },
    { label: "Giá thấp đến cao", value: "price_asc", icon: "bi-sort-numeric-up" },
    { label: "Giá cao đến thấp", value: "price_desc", icon: "bi-sort-numeric-down" },
    { label: "Mới nhất", value: "newest", icon: "bi-clock" },
    { label: "Bán chạy nhất", value: "bestseller", icon: "bi-graph-up" },
  ];

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(selectedFilters);
    }
  }, [selectedFilters, onFilterChange]);

  useEffect(() => {
    if (onSortChange) {
      onSortChange(sortBy);
    }
  }, [sortBy, onSortChange]);

  const handleCheckboxChange = (filterLabel, option) => {
    setSelectedFilters((prev) => {
      const currentOptions = prev[filterLabel] || [];
      const isSelected = currentOptions.includes(option);
      const updatedOptions = isSelected
        ? currentOptions.filter((o) => o !== option)
        : [...currentOptions, option];

      return {
        ...prev,
        [filterLabel]: updatedOptions,
      };
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
  };

  const getActiveFilterCount = () => {
    return Object.values(selectedFilters).reduce((count, options) => count + options.length, 0);
  };

  const getSelectedSort = () => {
    return sortOptions.find(option => option.value === sortBy) || sortOptions[0];
  };

  return (
    <section className="product-filter-section py-4 bg-white border-bottom">
      <Container>
        <Row className="align-items-center mb-2">
          <Col md={6}>
                          <div className="filter-header">
                <h5 className="mb-1 fw-bold">
                  <i className="bi bi-funnel me-2 text-primary"></i>
                  Bộ lọc sản phẩm
                </h5>
                <p className="text-muted mb-0">
                  Tìm thấy <span className="fw-semibold text-primary">{productCount}</span> sản phẩm trong danh mục <span className="fw-semibold">{categoryName}</span>
                </p>
              </div>
          </Col>
          <Col md={6} className="text-md-end">
            <Button
              variant="outline-primary"
              size="sm"
              className="d-md-none"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <i className="bi bi-sliders me-2"></i>
              Bộ lọc {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
            </Button>
          </Col>
        </Row>

        <div className={`filter-controls ${showMobileFilters ? 'd-block' : 'd-none d-md-block'}`}>
          <Row className="align-items-center">
            <Col lg={8}>
              <div className="d-flex flex-wrap gap-2 mb-3 mb-lg-0">
            {filters.map((filter) => (
                  <div key={filter.label} ref={(el) => (dropdownRefs.current[filter.label] = el)}>
                <DropdownButton
                  drop="down"
                      title={
                        <span>
                          <i className={`${filter.icon} me-2`}></i>
                          {filter.label}
                          {selectedFilters[filter.label]?.length > 0 && (
                            <Badge bg="primary" className="ms-2">
                              {selectedFilters[filter.label].length}
                            </Badge>
                          )}
                        </span>
                      }
                  variant="outline-secondary"
                      className="filter-dropdown"
                    >
                      <div className="p-3" style={{ minWidth: "250px" }}>
                        <div className="fw-semibold mb-2 text-dark">
                          <i className={`${filter.icon} me-2`}></i>
                          {filter.label}
                        </div>
                    {filter.options.map((option) => (
                      <Form.Check
                            key={option.value}
                        type="checkbox"
                            id={`${filter.label}-${option.value}`}
                            label={option.label}
                            checked={selectedFilters[filter.label]?.includes(option.value) || false}
                            onChange={() => handleCheckboxChange(filter.label, option.value)}
                            className="mb-2"
                      />
                    ))}
                  </div>
                </DropdownButton>
              </div>
            ))}
                
                {getActiveFilterCount() > 0 && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={clearAllFilters}
                    className="clear-filters-btn"
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Xóa bộ lọc
                  </Button>
                )}
          </div>
            </Col>

            <Col lg={4}>
              <div className="d-flex align-items-center justify-content-lg-end">
                <span className="me-3 text-muted small d-none d-lg-inline">Sắp xếp theo:</span>
                <DropdownButton
                  drop="down"
                  title={
                    <span>
                      <i className={`${getSelectedSort().icon} me-2`}></i>
                      {getSelectedSort().label}
                    </span>
                  }
                  variant="outline-primary"
                  className="sort-dropdown"
                >
                  {sortOptions.map((option) => (
                    <Dropdown.Item
                      key={option.value}
                      active={sortBy === option.value}
                      onClick={() => setSortBy(option.value)}
                    >
                      <i className={`${option.icon} me-2`}></i>
                      {option.label}
                    </Dropdown.Item>
                  ))}
                </DropdownButton>
              </div>
            </Col>
          </Row>
          </div>

        {getActiveFilterCount() > 0 && (
          <Row className="mt-3">
            <Col>
              <div className="active-filters">
                <span className="text-muted me-3 small">Bộ lọc đang áp dụng:</span>
                {Object.entries(selectedFilters).map(([filterLabel, options]) =>
                  options.map((option) => {
                    const filter = filters.find(f => f.label === filterLabel);
                    const optionObj = filter?.options.find(o => o.value === option);
                    return (
                      <Badge
                        key={`${filterLabel}-${option}`}
                        bg="secondary"
                        className="me-2 mb-2 active-filter-badge"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleCheckboxChange(filterLabel, option)}
                      >
                        {optionObj?.label || option}
                        <i className="bi bi-x ms-1"></i>
                      </Badge>
                    );
                  })
                )}
     </div>
            </Col>
          </Row>
        )}
      </Container>

      <style jsx>{`
        .filter-dropdown .btn,
        .sort-dropdown .btn {
          border-radius: 25px;
          padding: 8px 16px;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        
        .filter-dropdown .btn:hover,
        .sort-dropdown .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .clear-filters-btn {
          border-radius: 25px;
        }
        
        .active-filter-badge {
          transition: all 0.3s ease;
        }
        
        .active-filter-badge:hover {
          background-color: #dc3545 !important;
          transform: scale(1.05);
        }
        
        @media (max-width: 768px) {
          .filter-controls {
            border-top: 1px solid #dee2e6;
            padding-top: 1rem;
          }
          
          .filter-dropdown,
          .sort-dropdown {
            width: 100%;
            margin-bottom: 0.5rem;
          }
        }
      `}</style>
    </section>
  );
}
