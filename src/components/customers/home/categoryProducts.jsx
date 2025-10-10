"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import CompareButton from "../compare/CompareButton";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import Link from "next/link";
import { API_CONFIG } from "@/config/api";

export default function CategoryProduct() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios
      .get(API_CONFIG.getApiUrl("/categories/home"))
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Lỗi khi load homepage:", err));
  }, []);

  const formatVND = (number) => {
    const value = Number(number);
    if (isNaN(value)) return "0₫";
    return value.toLocaleString("vi-VN") + "₫";
  };

  const baseUrl = `${API_CONFIG.BACKEND_URL}`;

  return (
    <section className="category-products py-5">
      <div className="container">
        {categories.map((cat, index) => (
          <div key={cat.category_id} className={`category-section ${index > 0 ? 'mt-5 pt-5' : ''}`}>
            {/* Tiêu đề danh mục */}
            <div className="row text-center mb-5">
              <div className="col-lg-8 m-auto">
                <div className="category-header">
                  <h2 className="display-5 fw-bold mb-3">{cat.name}</h2>
                  <p className="text-muted lead">
                    Khám phá bộ sưu tập {cat.name} chính hãng với công nghệ tiên tiến nhất
                  </p>
                </div>
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            {cat.products && cat.products.length > 0 ? (
              <Row className="g-4">
                {cat.products.map((product, i) => {
                  // Lấy ảnh đại diện
                  const mainImage = product.images && product.images.length > 0
                    ? product.images[0].Img_url
                    : "/assets/image/no-image.jpg";
                  return (
                    <Col key={product.products_id || i} lg={3} md={4} sm={6}>
                      <Card className="h-100 border-0 shadow-sm product-card position-relative overflow-hidden">
                        {/* Product Image */}
                        <Link href={`/productDetail/${product.products_slug || product.id_products}`} className="text-decoration-none">
                          <div className="product-image-wrapper p-3">
                            <Image
                              src={mainImage}
                              alt={product.products_name}
                              width={300}
                              height={300}
                              className="card-img-top product-image rounded-3"
                              style={{ objectFit: "contain" }}
                              unoptimized
                            />
                          </div>
                        </Link>

                        <Card.Body className="text-center p-4">
                          {/* Product Name */}
                          <Card.Title className="h6 fw-bold mb-3 product-title">
                            <Link 
                              href={`/productDetail/${product.products_slug || product.id_products}`}
                              className="text-decoration-none text-dark"
                            >
                              {product.products_name}
                            </Link>
                          </Card.Title>

                          {/* Price Section */}
                          <div className="price-section mb-3">
                            <div className="current-price mb-1">
                              <span className="text-danger fw-bold fs-5">
                                {product.products_status == 4 ? "Giá dự kiến" : formatVND(product.products_sale_price || product.products_market_price)}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="product-actions d-flex justify-content-center">
                            <CompareButton 
                              product={product} 
                              size="sm" 
                              variant="outline-secondary"
                            />
                          </div>

                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            ) : (
              <div className="text-center py-5">
                <p className="text-muted">Chưa có sản phẩm nào được ghim cho danh mục này.</p>
              </div>
            )}

            {/* Nút xem thêm danh mục */}
            <div className="row mt-5">
              <div className="col text-center">
                <a 
                  href={`/products/${cat.name}`} 
                  className="btn btn-outline-primary btn-lg px-5 rounded-pill"
                >
                  <i className="bi bi-arrow-right me-2"></i>
                  Xem tất cả {cat.name}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .category-products {
          background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
        }
        
        .category-section:nth-child(even) {
          background: rgba(0,123,255,0.02);
          border-radius: 20px;
          padding: 2rem;
        }
        
        .product-card {
          transition: all 0.3s ease;
          background: white;
        }
        
        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important;
        }
        
        .product-card:hover .product-image {
          transform: scale(1.05);
        }
        
        .product-badges {
          z-index: 10;
        }
        
        .product-image-wrapper {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 15px;
          margin: 10px;
        }
        
        .price-section {
          border-top: 1px solid #f0f0f0;
          padding-top: 15px;
        }
        
        .product-actions .btn {
          transition: all 0.3s ease;
        }
        
        .product-actions .btn:hover {
          transform: translateY(-2px);
        }
        
        .category-header {
          position: relative;
        }
        
        .category-header::after {
          content: '';
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 3px;
          background: linear-gradient(135deg, #007bff, #6610f2);
          border-radius: 2px;
        }
      `}</style>
    </section>
  );
}
