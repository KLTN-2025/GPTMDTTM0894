"use client";
import { useEffect, useState } from "react";
import { Modal, Button, Spinner, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import API_CONFIG from "@/config/api";

export default function OrderDetailModal({ show, onClose, orderId, refreshOrders }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const orderStatusMap = {
    pending: "Đang chờ",
    processing: "Đang xử lý", 
    confirmed: "Xác nhận",
    completed: "Hoàn thành",
    cancelled: "Hủy"
  };

  const paymentStatusMap = {
    pending: "Đang chờ",
    paid: "Thành công",
    failed: "Thất bại"
  };

  // Lấy chi tiết đơn hàng
  useEffect(() => {
    if (!orderId || !show) return;

    const fetchOrderDetail = async () => {
      setLoading(true);
      try {
        const res = await axios.get(API_CONFIG.getApiUrl(`/order/${orderId}`));
        setOrder(res.data);
        setOrderStatus(res.data.order_status);
        setPaymentStatus(res.data.payment_status);
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
        toast.error("Không thể tải chi tiết đơn hàng");
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
      await axios.patch(API_CONFIG.getApiUrl(`/order/${orderId}`), {
        order_status: orderStatus,
        payment_status: paymentStatus
      });
      await refreshOrders();
      toast.success("Cập nhật trạng thái đơn hàng thành công");
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

  // Lấy tất cả trạng thái có thể chọn
  const getAllOrderStatuses = () => {
    return Object.keys(orderStatusMap);
  };

  const getAllPaymentStatuses = () => {
    return Object.keys(paymentStatusMap);
  };

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
              >
                {getAllOrderStatuses().map(status => (
                  <option key={status} value={status}>
                    {orderStatusMap[status]}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Trạng thái thanh toán */}
            <Form.Group className="mb-3">
              <Form.Label>Trạng thái thanh toán</Form.Label>
              <Form.Select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
              >
                {getAllPaymentStatuses().map(status => (
                  <option key={status} value={status}>
                    {paymentStatusMap[status]}
                  </option>
                ))}
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
          disabled={
            updating || 
            (orderStatus === order?.order_status && 
             paymentStatus === order?.payment_status)
          }
        >
          {updating ? <Spinner size="sm" animation="border" /> : "Cập nhật"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
