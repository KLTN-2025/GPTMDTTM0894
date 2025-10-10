"use client";
import React from "react";
import { Container, Row, Col, Card, Badge, Button, Spinner } from "react-bootstrap";
import Image from "next/image";
import Link from "next/link";
import CompareButton from "../compare/CompareButton";
import  API_CONFIG from "@/config/api";

function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function ProductGrid({ products = [], loading = false, categoryName = "" }) {
  
  const formatVND = (number) => {
    const value = Number(number);
    if (isNaN(value)) return "0₫";
    return value.toLocaleString("vi-VN") + "₫";
  };

  const getImageUrl = (img) => {
    if (!img) return "/assets/image/no-image-available.jpg";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/uploads/")) {
      return `${API_CONFIG.BACKEND_URL}${img}`;
    }
    return `${API_CONFIG.BACKEND_URL}/uploads/${img}`;
  };


  if (loading) {
    return (
      <Container className="py-5">
        <Row>
          {[...Array(8)].map((_, i) => (
            <Col key={i} lg={3} md={4} sm={6} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <div className="placeholder-glow">
                  <div className="placeholder bg-light" style={{ height: "250px" }}></div>
                  <Card.Body>
                    <div className="placeholder bg-light w-75 mb-2" style={{ height: "20px" }}></div>
                    <div className="placeholder bg-light w-50 mb-2" style={{ height: "16px" }}></div>
                    <div className="placeholder bg-light w-100" style={{ height: "36px" }}></div>
                  </Card.Body>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <div className="empty-state py-5">
              <i className="bi bi-inbox display-1 text-muted mb-3"></i>
              <h4 className="text-muted">Không có sản phẩm nào</h4>
              <p className="text-muted">
                Không tìm thấy sản phẩm nào trong danh mục <strong>{categoryName}</strong>.
                <br />Vui lòng thử điều chỉnh bộ lọc hoặc tìm kiếm sản phẩm khác.
              </p>
              <Link href="/" className="btn btn-primary mt-3">
                <i className="bi bi-house me-2"></i>
                Về trang chủ
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <section className="product-grid-section py-5">
      <Container>
        <Row className="g-4">
          {products.map((product, i) => {
            const mainImg =
              product?.images?.find((img) => img.is_main)?.Img_url ||
              product?.images?.[0]?.Img_url ||
              null;

            const imgUrl = getImageUrl(mainImg);
            const productSlug = product.products_slug || toSlug(product.products_name);
            return (
              <Col key={product.id_products || i} lg={3} md={4} sm={6}>
                <Card className="h-100 border-0 shadow-sm product-card position-relative overflow-hidden">
                  <Link href={`/productDetail/${productSlug}`} className="text-decoration-none">
                    <div className="product-image-wrapper p-3">
                      <Image
                        src={imgUrl}
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

                    <Card.Title className="h6 fw-bold mb-3 product-title">
                      <Link 
                        href={`/productDetail/${productSlug}`}
                        className="text-decoration-none text-dark"
                      >
                        {product.products_name}
                      </Link>
                    </Card.Title>

                    <div className="product-rating mb-2">
                      <div className="d-flex justify-content-center align-items-center">
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i}
                            className={`bi bi-star${i < 4 ? '-fill' : ''} text-warning me-1`}
                            style={{ fontSize: "12px" }}
                          ></i>
                        ))}
                        <span className="text-muted ms-2 small">(4.0)</span>
                      </div>
                    </div>

                    <div className="price-section mb-3">
                      <div className="current-price mb-1">
                        <span className="text-danger fw-bold fs-5">
                         {product.products_status == 4 ? "Giá dự kiến" : formatVND(product.products_sale_price || product.products_market_price)}
                        </span>
                      </div>
                    </div>


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

        {products.length >= 12 && (
          <Row className="mt-5">
            <Col className="text-center">
              <Button variant="outline-primary" size="lg" className="rounded-pill px-5">
                <i className="bi bi-arrow-down-circle me-2"></i>
                Xem thêm sản phẩm
              </Button>
            </Col>
          </Row>
        )}
      </Container>

      <style jsx>{`
        .product-card {
          transition: all 0.3s ease;
          background: white;
        }
        
        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.15) !important;
        }
        
        .product-card:hover .product-image {
          transform: scale(1.05);
        }
        
        .product-image-wrapper {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 15px;
          margin: 10px;
          overflow: hidden;
        }
        
        .product-image {
          transition: transform 0.3s ease;
        }
        
        .product-title {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 3em;
        }
        
        .price-section {
          border-top: 1px solid #f0f0f0;
          border-bottom: 1px solid #f0f0f0;
          padding: 15px 0;
        }
        
        .product-actions .btn {
          transition: all 0.3s ease;
        }
        
        .product-actions .btn:hover {
          transform: translateY(-2px);
        }
        
        .z-index-3 {
          z-index: 3;
        }
        
        .empty-state {
          animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
