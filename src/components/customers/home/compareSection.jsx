"use client";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import Link from "next/link";
import { useCompare } from "@/contexts/CompareContext";

export default function CompareSection() {
  const { compareProducts, getCompareCount } = useCompare();

  return (
    <section className="compare-section py-5 bg-dark text-white position-relative overflow-hidden">
      <Container>
        <Row className="align-items-center">
          <Col lg={6}>
            <div className="compare-content">
              <div className="badge bg-warning text-dark mb-3 px-3 py-2 rounded-pill">
                🆚 So sánh thông minh
              </div>
              
              <h2 className="display-5 fw-bold mb-4">
                So sánh sản phẩm
                <span className="text-warning d-block">Chọn đúng - Mua ngay</span>
              </h2>
              
              <p className="lead mb-4 opacity-90">
                Không biết chọn iPhone nào phù hợp? Hãy sử dụng tính năng so sánh để 
                xem thông số, giá cả và tính năng của 2 sản phẩm cùng lúc.
              </p>
              
              <div className="compare-features mb-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="feature-bullet bg-warning rounded-circle me-3 d-flex align-items-center justify-content-center">
                    <i className="bi bi-check-lg text-dark"></i>
                  </div>
                  <span>So sánh thông số kỹ thuật chi tiết</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div className="feature-bullet bg-warning rounded-circle me-3 d-flex align-items-center justify-content-center">
                    <i className="bi bi-check-lg text-dark"></i>
                  </div>
                  <span>Hiển thị giá và chương trình khuyến mãi</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div className="feature-bullet bg-warning rounded-circle me-3 d-flex align-items-center justify-content-center">
                    <i className="bi bi-check-lg text-dark"></i>
                  </div>
                  <span>Tư vấn sản phẩm phù hợp nhất</span>
                </div>
              </div>
              
              <div className="compare-buttons d-flex flex-wrap gap-3">
                {getCompareCount() > 0 ? (
                  <Link href="/compare" className="btn btn-warning btn-lg rounded-pill px-4">
                    <i className="bi bi-arrow-left-right me-2"></i>
                    Xem so sánh ({getCompareCount()})
                  </Link>
                ) : (
                  <Link href="/products" className="btn btn-warning btn-lg rounded-pill px-4">
                    <i className="bi bi-plus-circle me-2"></i>
                    Chọn sản phẩm để so sánh
                  </Link>
                )}
                
                <Button variant="outline-light" size="lg" className="rounded-pill px-4">
                  <i className="bi bi-chat-dots me-2"></i>
                  Tư vấn miễn phí
                </Button>
              </div>
            </div>
          </Col>
          
          <Col lg={6}>
            <div className="compare-visual text-center">
              <Card className="border-0 shadow-lg bg-gradient-light p-4 rounded-4">
                <div className="compare-mockup position-relative">
                  {/* Compare Visual */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="product-placeholder bg-gradient-primary rounded-3 p-3 text-white text-center" style={{width: "45%", height: "200px"}}>
                      <i className="bi bi-phone display-4 mb-2"></i>
                      <p className="mb-0 fw-bold">iPhone 16 Pro</p>
                      <small className="opacity-75">Từ 28.990.000đ</small>
                    </div>
                    
                    <div className="vs-divider text-warning">
                      <i className="bi bi-arrow-left-right display-4"></i>
                      <div className="fw-bold">VS</div>
                    </div>
                    
                    <div className="product-placeholder bg-gradient-success rounded-3 p-3 text-white text-center" style={{width: "45%", height: "200px"}}>
                      <i className="bi bi-phone display-4 mb-2"></i>
                      <p className="mb-0 fw-bold">iPhone 16 Pro Max</p>
                      <small className="opacity-75">Từ 34.990.000đ</small>
                    </div>
                  </div>
                  
                  {/* Compare Features */}
                  <div className="compare-table mt-4">
                    <div className="row text-center small">
                      <div className="col-5 fw-bold">6.3" Super Retina XDR</div>
                      <div className="col-2 text-muted">Màn hình</div>
                      <div className="col-5 fw-bold">6.9" Super Retina XDR</div>
                    </div>
                    <hr className="my-2" />
                    <div className="row text-center small">
                      <div className="col-5 fw-bold">A18 Pro chip</div>
                      <div className="col-2 text-muted">Chip</div>
                      <div className="col-5 fw-bold">A18 Pro chip</div>
                    </div>
                    <hr className="my-2" />
                    <div className="row text-center small">
                      <div className="col-5 fw-bold">3x Telephoto</div>
                      <div className="col-2 text-muted">Camera</div>
                      <div className="col-5 fw-bold">5x Telephoto</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
      
      {/* Background Pattern */}
      <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10">
        <div className="pattern-dots"></div>
      </div>
      
      <style jsx>{`
        .compare-section {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
        }
        
        .feature-bullet {
          width: 30px;
          height: 30px;
          font-size: 14px;
        }
        
        .bg-gradient-light {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          color: #333;
        }
        
        .bg-gradient-primary {
          background: linear-gradient(135deg, #007bff, #6610f2);
        }
        
        .bg-gradient-success {
          background: linear-gradient(135deg, #28a745, #20c997);
        }
        
        .vs-divider {
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: pulse 2s infinite;
        }
        
        .pattern-dots {
          background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 20px 20px;
          width: 100%;
          height: 100%;
        }
        
        .product-placeholder {
          transition: transform 0.3s ease;
          cursor: pointer;
        }
        
        .product-placeholder:hover {
          transform: scale(1.05);
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @media (max-width: 768px) {
          .compare-mockup .d-flex {
            flex-direction: column;
            gap: 20px;
          }
          
          .product-placeholder {
            width: 100% !important;
          }
          
          .vs-divider {
            transform: rotate(90deg);
          }
        }
      `}</style>
    </section>
  );
}
