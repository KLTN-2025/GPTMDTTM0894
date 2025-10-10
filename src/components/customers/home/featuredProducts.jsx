"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import Link from "next/link";
import axios from "axios";
import CompareButton from "../compare/CompareButton";
import { API_CONFIG } from "@/config/api";

export default function TopProduct() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch featured products from API
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_CONFIG.getApiUrl("/products"), {
          params: {
            featured: "true", // Lấy sản phẩm nổi bật
            status: 2, // Sản phẩm đang hoạt động
            status_v2: 4,
            limit: 8 // Giới hạn 8 sản phẩm nổi bật
          }
        });

        const products = response.data.products || [];
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm nổi bật:", error);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);


  const formatVND = (number) => {
    const value = Number(number);
    if (isNaN(value)) return "0₫";
    return value.toLocaleString("vi-VN") + "₫";
  };

  if (loading) {
    return (
      <section className="featured-section py-5 bg-light">
        <Container>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Đang tải sản phẩm nổi bật...</p>
          </div>
        </Container>
      </section>
    );
  }

  if (featuredProducts.length === 0) {
    return (
      <section className="featured-section py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col lg={8} className="mx-auto">
              <div className="section-header">
                <h2 className="display-5 fw-bold mb-3">
                  Top sản phẩm
                  <span className="text-primary d-block">Được yêu thích nhất</span>
                </h2>
                <p className="lead text-muted">
                  Hiện tại chưa có sản phẩm nổi bật nào được ghim.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    );
  }

  return (
    <section className="featured-section py-5 bg-light">
      <Container>
        {/* Section Header */}
        <Row className="text-center mb-5">
          <Col lg={8} className="mx-auto">
            <div className="section-header">
              <h2 className="display-5 fw-bold mb-3">
                Top sản phẩm
                <span className="text-primary d-block">Được yêu thích nhất</span>
              </h2>
              <p className="lead text-muted">
                Những sản phẩm Apple được khách hàng đánh giá cao và mua nhiều nhất
              </p>
            </div>
          </Col>
        </Row>

        {/* Products Grid */}
        <Row className="g-4">
          {featuredProducts.map((product, i) => {
            return (
              <Col key={product.products_id || i} lg={3} md={4} sm={6}>
                <Card className="h-100 border-0 shadow-sm product-card position-relative overflow-hidden">
                  {/* Product Image */}
                  <Link href={`/productDetail/${product.products_slug}`} className="text-decoration-none">
                    <div className="product-image-wrapper p-3">
                      <Image
                        src={product.main_image_url}
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
      </Container>

      <style jsx>{`
        .featured-section {
          background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
        }
        
        .section-header {
          position: relative;
        }
        
        .section-header::after {
          content: '';
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 4px;
          background: linear-gradient(135deg, #007bff, #6610f2);
          border-radius: 2px;
        }
        
        .featured-card {
          transition: all 0.3s ease;
          background: white;
        }
        
        .featured-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
        }
        
        .featured-card:hover .product-image {
          transform: scale(1.1);
        }
        
        .product-image-container {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 20px;
          margin: 15px;
        }
        
        .bg-gradient-light {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
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
        
        .rating .bi-star-fill {
          color: #ffc107 !important;
        }
      `}</style>
    </section>
  );
}
