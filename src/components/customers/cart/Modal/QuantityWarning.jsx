import React from 'react';
import { Modal, Button, Alert, Row, Col } from 'react-bootstrap';

export default function QuantityWarningModal({ show, onClose, totalQuantity }) {
  return (
    <Modal show={show} onHide={onClose} centered size="md">
      <Modal.Header closeButton className="bg-warning text-dark">
        <Modal.Title className="d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Cảnh báo Số lượng Giỏ hàng
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Alert variant="warning" className="mb-3">
          <Alert.Heading className="h6">
            <i className="bi bi-cart-x me-2"></i>
            Giỏ hàng của bạn đã vượt quá giới hạn!
          </Alert.Heading>
          <p className="mb-0">
            Hiện tại bạn có <strong>{totalQuantity} sản phẩm</strong> trong giỏ hàng. 
            Chúng tôi chỉ cho phép tối đa <strong>10 sản phẩm</strong> cho một đơn hàng thông thường.
          </p>
        </Alert>

        <div className="text-center mb-3">
          <i className="bi bi-cart-check text-primary" style={{ fontSize: '3rem' }}></i>
        </div>

        <Row>
          <Col md={6}>
            <div className="border rounded p-3 text-center h-100">
              <h6 className="text-primary">
                <i className="bi bi-telephone me-2"></i>
                Liên hệ Bán hàng
              </h6>
              <p className="mb-2">
                <strong>Hotline:</strong><br />
                <a href="tel:1900888999" className="text-decoration-none">
                  1900 888 999
                </a>
              </p>
              <small className="text-muted">
                Hỗ trợ 24/7
              </small>
            </div>
          </Col>
          
          <Col md={6}>
            <div className="border rounded p-3 text-center h-100">
              <h6 className="text-success">
                <i className="bi bi-envelope me-2"></i>
                Email Tư vấn
              </h6>
              <p className="mb-2">
                <strong>Email:</strong><br />
                <a href="mailto:sales@taobro.com" className="text-decoration-none">
                  sales@taobro.com
                </a>
              </p>
              <small className="text-muted">
                Phản hồi trong 2h
              </small>
            </div>
          </Col>
        </Row>

        <Alert variant="info" className="mt-3 mb-0">
          <i className="bi bi-info-circle me-2"></i>
          <strong>Lưu ý:</strong> Đối với đơn hàng lớn (trên 10 sản phẩm), 
          bộ phận bán hàng sẽ hỗ trợ bạn:
          <ul className="mt-2 mb-0">
            <li>Tư vấn sản phẩm phù hợp</li>
            <li>Báo giá ưu đãi cho số lượng lớn</li>
            <li>Hỗ trợ thanh toán và giao hàng</li>
            <li>Chính sách bảo hành mở rộng</li>
          </ul>
        </Alert>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="outline-primary" onClick={onClose}>
          <i className="bi bi-arrow-left me-2"></i>
          Quay lại giỏ hàng
        </Button>
        <Button variant="primary" href="tel:1900888999">
          <i className="bi bi-telephone me-2"></i>
          Gọi ngay
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
