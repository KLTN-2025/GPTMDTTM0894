"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Spinner } from "react-bootstrap";
import OrderDetailModal from "./modal/orderDetail";

export default function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [orderDate, setOrderDate] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 7;

  //modal detail
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const paymentMethodMap = {
    1: "COD",
    2: "Online",
  };

  const paymentStatusMap = {
    1: { text: "Đang chờ", class: "badge bg-warning text-dark" },
    2: { text: "Thành công", class: "badge bg-success" },
    3: { text: "Thất bại", class: "badge bg-danger" },
  };

  const orderStatusMap = {
    1: { text: "Đang chờ", class: "badge bg-secondary" },
    2: { text: "Xác nhận", class: "badge bg-primary" },
    3: { text: "Hủy", class: "badge bg-dark" },
  };

  const formatVND = (value) =>
    Number(value).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  // Hàm gọi API với filter + phân trang
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pageSize,
      };
      if (paymentMethod) params.payment_method = paymentMethod;
      if (paymentStatus) params.payment_status = paymentStatus;
      if (orderStatus) params.order_status = orderStatus;
      if (orderDate) params.order_date = orderDate;

      const res = await axios.get("http://localhost:5000/api/order", { params });
      setOrders(res.data.data);
      setTotal(res.data.total);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tải lại data khi filter hoặc page thay đổi
  useEffect(() => {
    fetchOrders();
  }, [page, paymentMethod, paymentStatus, orderStatus, orderDate]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Danh sách đơn hàng</h2>

      {/* Bộ lọc */}
      <div className="row g-3 mb-4">
        <div className="col-md-2">
          <label>Ngày đặt đơn:</label>
          <input
            type="date"
            className="form-control"
            value={orderDate}
            onChange={(e) => {
              setOrderDate(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="col-md-2">
          <label>Hình thức thanh toán:</label>
          <select
            className="form-select"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="1">COD</option>
            <option value="2">Online</option>
          </select>
        </div>
        <div className="col-md-2">
          <label>Trạng thái thanh toán:</label>
          <select
            className="form-select"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="1">Đang chờ</option>
            <option value="2">Thành công</option>
            <option value="3">Thất bại</option>
          </select>
        </div>
        <div className="col-md-2">
          <label>Trạng thái đơn hàng:</label>
          <select
            className="form-select"
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="1">Đang chờ</option>
            <option value="2">Xác nhận</option>
            <option value="3">Hủy</option>
          </select>
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <button
            className="btn btn-secondary w-100"
            onClick={() => {
              setPaymentMethod("");
              setPaymentStatus("");
              setOrderStatus("");
              setOrderDate("");
              setPage(1);
            }}
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover table-bordered align-middle">
              <thead className="table-secondary">
                <tr>
                  <th>Mã</th>
                  <th>Tên người đặt</th>
                  <th>Ngày đặt</th>
                  <th>Thanh toán</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái thanh toán</th>
                  <th>Trạng thái đơn hàng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      Không có đơn hàng
                    </td>
                  </tr>
                ) : (
                  orders.map((order, index) => (
                    <tr key={order.id ?? index}>
                      <td>#{order.id}</td>
                      <td>{order.given_name ? order.given_name : order.customer_name}</td>
                      <td>{new Date(order.order_date).toLocaleDateString("vi-VN")}</td>
                      <td>{paymentMethodMap[order.payment_method]}</td>
                      <td className="fw-bold">{formatVND(order.total_amount)}</td>
                      <td>
                        <span
                          className={
                            order.payment_method === 1
                              ? paymentStatusMap[1].class
                              : paymentStatusMap[order.payment_status]?.class
                          }
                        >
                          {order.payment_method === 1
                            ? paymentStatusMap[1].text
                            : paymentStatusMap[order.payment_status]?.text}
                        </span>
                      </td>
                      <td>
                        <span className={orderStatusMap[order.order_status]?.class}>
                          {orderStatusMap[order.order_status]?.text}
                        </span>
                      </td>
                      <td>

                        <button
                          className="btn btn-sm btn-info fw-bold"
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setShowModal(true);
                          }}
                        >
                          Chi tiết
                        </button>

                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              Tổng: {total} đơn - Trang {page} / {totalPages}
            </div>
            <div>
              <button
                className="btn btn-outline-primary me-2"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Prev
              </button>
              <button
                className="btn btn-outline-primary"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <OrderDetailModal
        show={showModal}
        onClose={() => setShowModal(false)}
        orderId={selectedOrderId}
        refreshOrders={fetchOrders}
      />

    </div>

    
  );

  
}
