"use client";
import { Container, Row, Col, Card } from "react-bootstrap";
import Link from "next/link";

export default function CategoryChildren({ childrenCategories = [], categoryName }) {
  if (childrenCategories.length === 0) return null;
    const categorySlug = categoryName.toLowerCase().replace(/ /g, '-');
  return (
    <section className="subcategories-section py-4 bg-light">
      <Container>
        <Row className="mb-2">
          <Col>
            <p className="text-muted text-center">Khám phá các dòng sản phẩm chi tiết</p>
          </Col>
        </Row>
        
        <Row className="g-3 justify-content-center">
          {childrenCategories.map((child) => (
            <Col key={child.category_id} xs={6} sm={4} md={3} lg={2}>
              <Link href={`/products/${categoryName}?categoryName=${encodeURIComponent(child.name)}`} className="text-decoration-none">
                <Card className="h-100 border-0 shadow-sm subcategory-card text-center">
                  <Card.Body className="p-3 d-flex flex-column align-items-center justify-content-center">
                    <div className="subcategory-icon mb-2">
                      <i className="bi bi-folder2-open text-primary fs-3"></i>
                    </div>
                    <Card.Title className="h6 mb-0 text-dark fw-semibold">
                      {child.name}
                    </Card.Title>
                    {child.productCount && (
                      <small className="text-muted">
                        {child.productCount} sản phẩm
                      </small>
                    )}
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </Container>
      
      <style jsx>{`
        .subcategory-card {
          transition: all 0.3s ease;
          background: white;
          min-height: 120px;
        }
        
        .subcategory-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
        }
        
        .subcategory-card:hover .subcategory-icon i {
          color: #ffc107 !important;
          transform: scale(1.1);
        }
        
        .subcategory-icon i {
          transition: all 0.3s ease;
        }
        
        @media (max-width: 576px) {
          .subcategory-card {
            min-height: 100px;
          }
          
          .subcategory-icon i {
            font-size: 1.5rem !important;
          }
        }
      `}</style>
    </section>
  );
}
