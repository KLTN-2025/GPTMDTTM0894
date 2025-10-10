"use client";
import { Container, Row, Col, Button } from "react-bootstrap";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="hero-section bg-gradient-primary text-white py-5 mb-4 position-relative overflow-hidden">
      <Container>
        <Row className="align-items-center min-vh-50">
          <Col lg={6}>
            <div className="hero-content">
              <div className="badge bg-warning text-dark mb-3 px-3 py-2 rounded-pill">
                🍎 Apple Chính Hãng
              </div>
              
              <h1 className="display-4 fw-bold mb-4 text-shadow">
                Táo Bro
                <span className="d-block text-warning">Apple Store</span>
              </h1>
              
              <p className="lead mb-4 opacity-90">
                Trải nghiệm công nghệ Apple đỉnh cao với bộ sưu tập iPhone, iPad, Mac, 
                Apple Watch và phụ kiện chính hãng. Cam kết chất lượng - Giá tốt nhất thị trường.
              </p>
              
              <div className="hero-features mb-4">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-shield-check text-success me-2"></i>
                  <span>Bảo hành chính hãng Apple</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-truck text-info me-2"></i>
                  <span>Giao hàng miễn phí toàn quốc</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-arrow-repeat text-warning me-2"></i>
                  <span>Đổi trả trong 7 ngày</span>
                </div>
              </div>
              
              <div className="hero-buttons d-flex flex-wrap gap-3">
                <Link href="/products" className="btn btn-warning btn-lg rounded-pill px-4">
                  <i className="bi bi-collection me-2"></i>
                  Khám phá sản phẩm
                </Link>
                <Link href="/compare" className="btn btn-outline-light btn-lg rounded-pill px-4">
                  <i className="bi bi-arrow-left-right me-2"></i>
                  So sánh sản phẩm
                </Link>
              </div>
            </div>
          </Col>
          
          <Col lg={6}>
            <div className="hero-image text-center position-relative">
              <div className="floating-devices">
                <div className="device-card floating-1">
                  <img 
                    src="/assets/image/Apple-iPhone-16-Pro-hero-240909.webp" 
                    alt="iPhone 16 Pro" 
                    className="img-fluid rounded-4 shadow-lg"
                    style={{ maxHeight: "300px", objectFit: "contain" }}
                  />
                  <div className="device-badge">
                    <span className="badge bg-danger">Hot</span>
                  </div>
                </div>
                
                <div className="device-card floating-2">
                  <img 
                    src="/assets/image/iphone-16-pro-max-sa-mac-thumb-1.png" 
                    alt="iPhone 16 Pro Max" 
                    className="img-fluid rounded-4 shadow-lg"
                    style={{ maxHeight: "250px", objectFit: "contain" }}
                  />
                  <div className="device-badge">
                    <span className="badge bg-success">New</span>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      
      {/* Background Elements */}
      <div className="hero-bg-elements">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>
      
      <style jsx>{`
        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
        }
        
        .min-vh-50 {
          min-height: 50vh;
        }
        
        .text-shadow {
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .floating-devices {
          position: relative;
          height: 400px;
        }
        
        .device-card {
          position: absolute;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 15px;
          border: 1px solid rgba(255,255,255,0.2);
          transition: transform 0.3s ease;
        }
        
        .device-card:hover {
          transform: translateY(-10px);
        }
        
        .floating-1 {
          top: 0;
          right: 50px;
          animation: float 6s ease-in-out infinite;
        }
        
        .floating-2 {
          top: 100px;
          left: 30px;
          animation: float 6s ease-in-out infinite reverse;
        }
        
        .device-badge {
          position: absolute;
          top: -5px;
          right: -5px;
        }
        
        .bg-circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          z-index: -1;
        }
        
        .bg-circle-1 {
          width: 200px;
          height: 200px;
          top: 10%;
          right: 10%;
          animation: pulse 4s ease-in-out infinite;
        }
        
        .bg-circle-2 {
          width: 150px;
          height: 150px;
          bottom: 20%;
          left: 5%;
          animation: pulse 4s ease-in-out infinite 2s;
        }
        
        .bg-circle-3 {
          width: 100px;
          height: 100px;
          top: 60%;
          right: 30%;
          animation: pulse 4s ease-in-out infinite 1s;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.1; transform: scale(1.1); }
        }
        
        @media (max-width: 768px) {
          .floating-devices {
            height: 250px;
          }
          
          .device-card {
            position: relative !important;
            display: inline-block;
            margin: 10px;
          }
          
          .floating-1, .floating-2 {
            top: auto !important;
            left: auto !important;
            right: auto !important;
          }
        }
      `}</style>
    </section>
  );
}
