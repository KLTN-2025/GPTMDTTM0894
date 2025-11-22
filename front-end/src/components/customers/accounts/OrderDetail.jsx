// app/profile/Order/detail/page.js
"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Table, Badge } from "react-bootstrap";

export default function OrderDetailPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!id) return;
    axios.get(`http://localhost:5000/api/order/${id}`)
      .then(res => setOrder(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!order) return <p className="text-center mt-4">Đang tải...</p>;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const formatStatus = (status) => {
    switch (status) {
      case 1:
        return <Badge bg="warning">Đang xử lý</Badge>;
      case 2:
        return <Badge bg="success">Đã xác nhận</Badge>;
      case 3:
        return <Badge bg="danger">Đã hủy</Badge>;
      default:
        return <Badge bg="secondary">Khác</Badge>;
    }
  };

  const formatPaymentMethod = (status) => {

    switch (status) {

        case 1:
            return <Badge bg="info">COD</Badge>
        
        case 2:
            return <Badge bg="info">Chuyển khoản</Badge>

    }

  }

  return (
    <Container className="mt-2">

      {/* Tầng 1: Thông tin khách hàng */}
      <Card className="mb-3 border-primary shadow-sm">
        <Card.Header as="h5" className="bg-primary text-white">
          Thông tin khách hàng
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}><strong>Họ và tên:</strong> {order.name}</Col>
            <Col md={6}><strong>Email:</strong> {order.email}</Col>
          </Row>
          <Row className="mt-2">
            <Col md={6}><strong>Số điện thoại:</strong> {order.phone}</Col>
            <Col md={6}><strong>Ngày đặt:</strong> {formatDate(order.order_date)}</Col>
          </Row>
          <Row className="mt-2">
            <Col md={6}><strong>Trạng thái:</strong> {formatStatus(order.order_status)}</Col>
            <Col md={6}><strong>Thanh toán:</strong> {formatPaymentMethod(order.payment_method)}</Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tầng 2: Thông tin địa chỉ */}
      <Card className="mb-3 border-success shadow-sm">
        <Card.Header as="h5" className="bg-success text-white">
          Thông tin địa chỉ
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={12}><strong>Địa chỉ giao hàng:</strong> {order.address}</Col>
          </Row>
          
        </Card.Body>
      </Card>

      {/* Tầng 3: Thông tin đơn hàng & sản phẩm */}
      <Card className="border-info shadow-sm">
        <Card.Header as="h5" className="bg-info text-white">
          Thông tin sản phẩm
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Tên sản phẩm</th>
                <th>Phân loại</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
                {order.order_details && order.order_details.length > 0 ? (
                    order.order_details.map((item, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.product_name}</td>
                        <td>{item.products_item || "Không có"}</td>
                        <td>{item.quantity}</td>
                        <td>{Number(item.final_price).toLocaleString("vi-VN")} ₫</td>
                        <td>{(item.final_price * item.quantity).toLocaleString("vi-VN")} ₫</td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan="6" className="text-center">Không có sản phẩm</td>
                    </tr>
                )}
                </tbody>

          </Table>
          <div className="text-end mt-3">
            <h5><strong>Tổng cộng:</strong> {Number(order.total_amount).toLocaleString("vi-VN")} ₫</h5>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
