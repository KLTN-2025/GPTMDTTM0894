"use client";
import { useEffect, useState } from "react";
import { Modal, Button, Spinner, Form, Row, Col } from "react-bootstrap";
import axios from "axios";

export default function OrderDetailModal({ show, onClose, orderId, refreshOrders }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");

  const orderStatusMap = {
    0: "Chọn",
    2: "Xác nhận",
    3: "Hủy",
  };

  // Lấy chi tiết đơn hàng
  useEffect(() => {
    if (!orderId || !show) return;

    const fetchOrderDetail = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/order/${orderId}`);
        setOrder(res.data);
        setOrderStatus(String(res.data.order_status)); // Ép kiểu string
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, show]);

  // Cập nhật trạng thái đơn
  const handleUpdateStatus = async () => {
    if (!orderId) return;
    setUpdating(true);
    try {
      await axios.patch(`http://localhost:5000/api/order/order/${orderId}`, {
        order_status: Number(orderStatus),
      });
      await refreshOrders();
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
    } finally {
      setUpdating(false);
    }
  };

  const isDisabledSelect = order?.order_status === 2 || order?.order_status === 3;

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Chi tiết đơn hàng</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: "150px" }}>
            <Spinner animation="border" />
          </div>
        ) : order ? (
          <>
            {/* Thông tin khách hàng */}
            <Row className="mb-3">
              <Col md={6}>
                <strong>Tên tài khoản:</strong> {order.customer.last_name} {order.customer.given_name}
              </Col>
              <Col md={6}>
                <strong>Người đặt:</strong> {order.name || "Chưa có"}
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <strong>Số điện thoại:</strong> {order.phone || "Chưa có"}
              </Col>
              <Col md={6}>
                <strong>Email:</strong> {order.email || "Chưa có"}
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={12}>
                <strong>Địa chỉ:</strong> {order.address || "Chưa có"}
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <strong>Ngày đặt:</strong>{" "}
                {new Date(order.order_date).toLocaleDateString("vi-VN")}
              </Col>
              <Col md={6}>
                <strong>Tổng tiền:</strong>{" "}
                {Number(order.total_amount).toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </Col>
            </Row>
            <Row className="mb-3">
                <Col md={12}>
                
                <strong>Ghi chú:</strong> {order.note || "Chưa có"}

                </Col>
            </Row>

            {/* Trạng thái đơn */}
            <Form.Group className="mb-3">
              <Form.Label>Trạng thái đơn hàng</Form.Label>
              <Form.Select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                disabled={isDisabledSelect}
              >
                {Object.entries(orderStatusMap).map(([key, text]) => {
                  if (order?.order_status === 2 && Number(key) === 3) return null; // Đã xác nhận -> ẩn hủy
                  if (order?.order_status === 3 && Number(key) !== 3) return null; // Đã hủy -> chỉ hiện hủy
                  return (
                    <option key={key} value={key}>
                      {text}
                    </option>
                  );
                })}
              </Form.Select>
            </Form.Group>

            {/* Sản phẩm */}
            <h5>Sản phẩm</h5>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Tên sản phẩm</th>
                  <th>Phân loại</th>
                  <th>Số lượng</th>
                  <th>Giá</th>
                </tr>
              </thead>
              <tbody>
                {order.order_details?.map((item, i) => (
                  <tr key={i}>
                    <td>{item.product_name}</td>
                    <td>{item.products_item || "Không có"}</td>
                    <td>{item.quantity}</td>
                    <td>
                      {Number(item.final_price).toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p>Không tìm thấy đơn hàng</p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
        <Button
          variant="primary"
          onClick={handleUpdateStatus}
          disabled={updating || orderStatus === String(order?.order_status)}
        >
          {updating ? <Spinner size="sm" animation="border" /> : "Cập nhật"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
