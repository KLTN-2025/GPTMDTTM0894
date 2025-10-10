"use client";
import { Container, Row, Col, Badge } from "react-bootstrap";
import Image from "next/image";
import  API_CONFIG  from "@/config/api";

export default function BannerCategory({ bannerImg, title, subText, name, productCount = 0 }) {
  const imageSrc = bannerImg
    ? `${API_CONFIG.BACKEND_URL}/uploads/${bannerImg}`
    : `/assets/image/default-category-banner.jpg`;

  return (
    <section className="category-banner position-relative overflow-hidden">
      {/* Background Image */}
      <div className="banner-bg position-absolute top-0 start-0 w-100 h-100">
        <Image
          src={imageSrc}
          alt={title || `Banner ${name}`}
          fill
          className="object-cover"
          style={{ objectFit: "cover", filter: "brightness(0.3)" }}
          unoptimized
        />
      </div>
      
      {/* Overlay Content */}
      <div className="banner-overlay position-relative text-white py-5">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <div className="banner-content py-5">
                
                <h1 className="display-4 fw-bold mb-3 text-shadow">
                  {name}
                </h1>
                
                <p className="lead mb-4 opacity-90">
                  {subText}
                </p>
                
                <div className="banner-stats d-flex justify-content-center align-items-center gap-4 flex-wrap">
                  <div className="stat-item">
                    <i className="bi bi-collection me-2"></i>
                    <span className="fw-semibold">{productCount} sản phẩm</span>
                  </div>
                  <div className="stat-item">
                    <i className="bi bi-shield-check me-2"></i>
                    <span className="fw-semibold">Chính hãng 100%</span>
                  </div>
                  <div className="stat-item">
                    <i className="bi bi-truck me-2"></i>
                    <span className="fw-semibold">Miễn phí vận chuyển</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      
      {/* Decorative Elements */}
      <div className="banner-decoration">
        <div className="floating-element floating-1">
          <i className="bi bi-phone text-warning opacity-20"></i>
        </div>
        <div className="floating-element floating-2">
          <i className="bi bi-laptop text-info opacity-20"></i>
        </div>
        <div className="floating-element floating-3">
          <i className="bi bi-tablet text-success opacity-20"></i>
        </div>
      </div>
      
      <style jsx>{`
        .category-banner {
          min-height: 400px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .text-shadow {
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        
        .stat-item {
          padding: 10px 20px;
          background: rgba(255,255,255,0.1);
          border-radius: 50px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          transition: all 0.3s ease;
        }
        
        .stat-item:hover {
          background: rgba(255,255,255,0.2);
          transform: translateY(-2px);
        }
        
        .floating-element {
          position: absolute;
          font-size: 3rem;
          pointer-events: none;
        }
        
        .floating-1 {
          top: 20%;
          right: 10%;
          animation: float 6s ease-in-out infinite;
        }
        
        .floating-2 {
          bottom: 20%;
          left: 10%;
          animation: float 6s ease-in-out infinite 2s;
        }
        
        .floating-3 {
          top: 60%;
          right: 20%;
          animation: float 6s ease-in-out infinite 4s;
        }
        
        .opacity-20 {
          opacity: 0.2;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @media (max-width: 768px) {
          .category-banner {
            min-height: 300px;
          }
          
          .banner-stats {
            flex-direction: column !important;
            gap: 15px !important;
          }
          
          .floating-element {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
