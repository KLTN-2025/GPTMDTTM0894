"use client";
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { API_CONFIG } from "@/config/api";

export default function RelatedProducts({ categoryId, currentProductId }) {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!categoryId) return;
      
      try {
        setLoading(true);
        const response = await axios.get(API_CONFIG.getApiUrl("/products"), {
          params: {
            category_id: categoryId,
            status: "2", // Sản phẩm đang hoạt động
            limit: 8 // Giới hạn 8 sản phẩm liên quan
          }
        });
        
        // Lọc bỏ sản phẩm hiện tại
        const products = (response.data.products || []).filter(
          product => product.id_products !== currentProductId
        );
        
        setRelatedProducts(products.slice(0, 4)); // Chỉ lấy 4 sản phẩm
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm liên quan:", error);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [categoryId, currentProductId]);

  const formatVND = (number) => {
    const value = Number(number);
    if (isNaN(value)) return "0₫";
    return value.toLocaleString("vi-VN") + "₫";
  };

  const baseUrl = `${API_CONFIG.BACKEND_URL}`;

  if (loading) {
    return (
      <section className="related-products py-5">
        <Container>
          <h3 className="text-center mb-4">Sản phẩm liên quan</h3>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (relatedProducts.length === 0) {
    return null; // Không hiển thị gì nếu không có sản phẩm liên quan
  }

  return (
    <section className="related-products py-5 bg-light">
      <Container>
        <Row className="text-center mb-5">
          <Col lg={8} className="mx-auto">
            <h3 className="display-6 fw-bold mb-3">Sản phẩm liên quan</h3>
            <p className="text-muted">
              Khám phá thêm những sản phẩm tương tự có thể bạn quan tâm
            </p>
          </Col>
        </Row>

        <Row className="g-4">
          {relatedProducts.map((product) => {
            // Lấy ảnh đại diện
            const mainImage = product.images?.find((img) => img.is_main) || product.images?.[0];
            const imageUrl = mainImage ? baseUrl + mainImage.Img_url : "/assets/image/no-image.jpg";
            
            return (
              <Col key={product.id_products} lg={3} md={6} className="mb-4">
                <Card className="h-100 border-0 shadow-sm product-card position-relative overflow-hidden">
                  {/* Product Image */}
                  <div className="product-image-container p-3 text-center bg-white">
                    <Link href={`/productDetail/${product.products_slug || product.id_products}`} className="text-decoration-none">
                      <Image
                        src={imageUrl}
                        alt={product.products_name}
                        width={200}
                        height={200}
                        className="product-image rounded-3"
                        style={{ objectFit: "contain", transition: "transform 0.3s ease" }}
                      />
                    </Link>
                  </div>

                  <Card.Body className="text-center p-4">
                    {/* Product Name */}
                    <Card.Title className="h6 fw-bold mb-3">
                      <Link 
                        href={`/productDetail/${product.products_slug || product.id_products}`}
                        className="text-decoration-none text-dark"
                      >
                        {product.products_name}
                      </Link>
                    </Card.Title>

                    {/* Price */}
                    <div className="price-section mb-3">
                      <div className="current-price mb-1">
                        <span className="text-danger fw-bold fs-6">
                          {formatVND(product.products_sale_price)}
                        </span>
                      </div>
                      {product.products_market_price > product.products_sale_price && (
                        <div className="original-price">
                          <span className="text-muted text-decoration-line-through small">
                            {formatVND(product.products_market_price)}
                          </span>
                          <Badge bg="danger" className="ms-2 rounded-pill">
                            -{Math.round(((product.products_market_price - product.products_sale_price) / product.products_market_price) * 100)}%
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="product-actions">
                      <Link
                        href={`/productDetail/${product.products_slug || product.id_products}`}
                        className="btn btn-outline-primary btn-sm rounded-pill"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>

      <style jsx>{`
        .product-card {
          transition: all 0.3s ease;
        }
        
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
        }
        
        .product-card:hover .product-image {
          transform: scale(1.05);
        }
        
        .product-image-container {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 15px;
          margin: 10px;
        }
      `}</style>
    </section>
  );
}
