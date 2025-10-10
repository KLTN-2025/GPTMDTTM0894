"use client";

import { useEffect, useState, Suspense } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import { useParams, useSearchParams } from "next/navigation";

import BannerCategory from "./bannerCategory";
import ProductFilter from "./productFilter";
import ProductGrid from "./productAll";
import { API_CONFIG } from "@/config/api";

function ProductListContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoryName = params?.slug;
  const subCategoryName = searchParams?.get('slug');

  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentFilters, setCurrentFilters] = useState({});
  const [currentSort, setCurrentSort] = useState("featured");

  useEffect(() => {
    if (!categoryName) return;

    const fetchCategoryDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          API_CONFIG.getApiUrl(`/categories/category-product/${categoryName}`)
        );
        console.log("Category data received:", res.data);
        console.log("Products:", res.data.products);
        if (res.data.products && res.data.products.length > 0) {
          console.log("Sample product structure:", {
            first_product: res.data.products[0],
            attributes: res.data.products[0]?.attributes,
            variants: res.data.products[0]?.variants
          });
        }
        setCategoryData(res.data);
        setFilteredProducts(res.data.products || []);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
        setError("Không thể tải dữ liệu danh mục. Vui lòng thử lại sau.");
        setCategoryData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetail();
  }, [categoryName]);

  useEffect(() => {
    if (!categoryData?.products) return;

    let filtered = [...categoryData.products];

    // Filter by subcategory if specified
    if (subCategoryName) {
      console.log("Filtering by subcategory:", subCategoryName);
      console.log("All products before filter:", filtered.map(p => ({
        name: p.products_name,
        category_name: p.category_name,
        subcategory_name: p.subcategory_name,
        Category: p.Category
      })));
      
      filtered = filtered.filter(product => {
        // Check if product belongs to the subcategory
        const matchesCategory = product.category_name === subCategoryName || 
               product.subcategory_name === subCategoryName ||
               (product.Category && product.Category.name === subCategoryName);
        
        console.log(`Product ${product.products_name} matches subcategory ${subCategoryName}:`, matchesCategory);
        return matchesCategory;
      });
      
      console.log("Filtered products:", filtered.length);
    }


    if (currentFilters["Mức giá"]?.length > 0) {
      filtered = filtered.filter(product => {
        const price = product.products_sale_price || product.market_price || 0;
        return currentFilters["Mức giá"].some(priceRange => {
          switch(priceRange) {
            case "under_10m": return price < 10000000;
            case "10m_20m": return price >= 10000000 && price < 20000000;
            case "20m_30m": return price >= 20000000 && price < 30000000;
            case "over_30m": return price >= 30000000;
            default: return true;
          }
        });
      });
    }

    Object.keys(currentFilters).forEach(filterKey => {
      if (filterKey === "Mức giá") return; 
      
      const selectedValues = currentFilters[filterKey];
      if (!selectedValues || selectedValues.length === 0) return;

      if (filterKey === "Danh mục") {
        console.log("Filtering by subcategory:", selectedValues);
        console.log("Available children:", categoryData.children);
        
        if (selectedValues.includes("all")) {
          return;
        }
        
   
        filtered = filtered.filter(product => {
          return selectedValues.some(subcategoryName => {
      
            const subcategory = categoryData.children?.find(child => child.name === subcategoryName);
            if (subcategory) {
          
              const matches = product.category_id === subcategory.category_id;
              console.log(`Product ${product.products_name} (category_id: ${product.category_id}) matches subcategory ${subcategoryName} (category_id: ${subcategory.category_id}):`, matches);
              return matches;
            }
            console.log(`Subcategory ${subcategoryName} not found in children`);
            return false;
          });
        });
        return;
      }

      filtered = filtered.filter(product => {

        let hasMatchingAttribute = false;
        
        if (product.attributes && Array.isArray(product.attributes)) {
          hasMatchingAttribute = product.attributes.some(attr => {
            const attributeName = attr.name; 
            if (attributeName === filterKey) {
              if (attr.values && Array.isArray(attr.values)) {
                return attr.values.some(value => {
                  let valueToCheck;
                  if (attr.type === 2) {
                   
                    valueToCheck = value.value_note;
                  } else {

                    valueToCheck = value.value;
                  }
                  
                  if (valueToCheck) {
                    const normalizedValue = valueToCheck.toLowerCase().replace(/\s+/g, '_');
                    return selectedValues.includes(normalizedValue);
                  }
                  return false;
                });
              }
            }
            return false;
          });
        }
        
        if (!hasMatchingAttribute && product.skus && Array.isArray(product.skus)) {
          hasMatchingAttribute = product.skus.some(sku => {
            if (sku.option_combo && Array.isArray(sku.option_combo)) {
              return sku.option_combo.some(option => {
                if (option.attribute === filterKey) {
                  let valueToCheck = option.value;
                       // For color attributes, try to get value_note instead of hex code
                  if (filterKey === "màu" || option.type === 2) {
                    const productAttr = product.attributes?.find(attr => attr.name === filterKey);
                    if (productAttr) {
                      const attrValue = productAttr.values?.find(val => val.value === option.value);
                      if (attrValue && attrValue.value_note) {
                        valueToCheck = attrValue.value_note; 
                      }
                    }
                  }
                  
                  const normalizedValue = valueToCheck.toLowerCase().replace(/\s+/g, '_');
                  return selectedValues.includes(normalizedValue);
                }
                return false;
              });
            }
            return false;
          });
        }
        
        if (!hasMatchingAttribute) {
          const productName = product.products_name?.toLowerCase() || "";
          hasMatchingAttribute = selectedValues.some(value => {
            const searchValue = value.replace(/_/g, ' ').toLowerCase();
            return productName.includes(searchValue);
          });
        }
        
        return hasMatchingAttribute;
      });
    });

    // Apply sorting
    switch (currentSort) {
      case "price_asc":
        filtered.sort((a, b) => (a.products_sale_price || a.market_price || 0) - (b.products_sale_price || b.market_price || 0));
        break;
      case "price_desc":
        filtered.sort((a, b) => (b.products_sale_price || b.market_price || 0) - (a.products_sale_price || a.market_price || 0));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [categoryData, currentFilters, currentSort, subCategoryName]);

  const handleFilterChange = (filters) => {
    setCurrentFilters(filters);
  };

  const handleSortChange = (sortBy) => {
    setCurrentSort(sortBy);
  };

  if (loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            <p className="mt-3 text-muted">Đang tải danh mục sản phẩm...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="danger" className="text-center">
              <Alert.Heading>Oops! Có lỗi xảy ra</Alert.Heading>
              <p>{error}</p>
              <hr />
              <div className="d-flex justify-content-center">
                <button 
                  className="btn btn-outline-danger"
                  onClick={() => window.location.reload()}
                >
                  Thử lại
                </button>
        </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!categoryData) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <h3>Không tìm thấy danh mục</h3>
            <p className="text-muted">Danh mục bạn đang tìm kiếm không tồn tại.</p>
            <a href="/" className="btn btn-primary">Về trang chủ</a>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <div className="category-page">
      <BannerCategory 
      bannerImg={categoryData.img} 
        title={subCategoryName || categoryData.name} 
        name={subCategoryName || categoryData.name}
        subText={subCategoryName ? `Danh mục con của ${categoryData.name}` : (categoryData.note || "Khám phá bộ sưu tập sản phẩm chính hãng")}
        productCount={filteredProducts.length}
      />

      {subCategoryName && (
        <Container className="py-3">
          <Row>
            <Col>
              <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap">
                <span className="text-muted">Đang xem:</span>
                <span className="fw-bold text-primary">{subCategoryName}</span>
                <a 
                  href={`/products/${categoryName}`} 
                  className="btn btn-outline-primary btn-sm rounded-pill"
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Xem tất cả {categoryData.name}
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      )}

      {/* Product Filters */}
      <ProductFilter 
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        productCount={filteredProducts.length}
        categoryName={subCategoryName || categoryData.name}
        products={categoryData.products || []}
        childrenCategories={categoryData.children || []}
      />

      {/* Product Grid */}
      <ProductGrid 
        products={filteredProducts} 
        loading={loading}
        categoryName={categoryData.name}
      />
    </div>
  );
}

// Loading component
function ProductListLoading() {
  return (
    <Container className="py-5">
      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
        <p className="mt-3">Đang tải danh sách sản phẩm...</p>
      </div>
    </Container>
  );
}

// Main component with Suspense wrapper
export default function ProductList() {
  return (
    <Suspense fallback={<ProductListLoading />}>
      <ProductListContent />
    </Suspense>
  );
}
