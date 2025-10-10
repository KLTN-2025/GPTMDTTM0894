'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Modal, Spinner, Pagination, Card } from "react-bootstrap";
import { useRouter } from "next/navigation";
import API_CONFIG from "@/config/api";

export default function OrderList({ idCustomer }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
 
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 3;

  const router = useRouter();

  const goToOrderDetail = (orderId) => {
    router.push(`/profile/Order/detail?id=${orderId}`);
  };

  useEffect(() => {
    if (!idCustomer) return;

    setLoading(true);
    axios
      .get(API_CONFIG.getApiUrl(`/order/customer/${idCustomer}`))
      .then((res) => setOrders(res.data))
      .catch((err) => {
        console.error("Lỗi lấy đơn hàng:", err);
        alert("Lỗi lấy danh sách đơn hàng");
      })
      .finally(() => setLoading(false));
  }, [idCustomer]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatPaymentMethod = (method) => {
    switch (method) {
      case 1:
        return "Thanh toán khi nhận hàng (COD)";
      case 2:
        return "Thanh toán Online";
      default:
        return "Khác";
    }
  };

    const formatOrderStatus = (status) => {
        switch (status) {
            case 'pending':
                return <span className="badge bg-warning text-white">Đang chờ</span>;
            case 'processing':
                return <span className="badge bg-info text-white">Đang xử lý</span>;
            case 'confirmed':
                return <span className="badge bg-success text-white">Đã xác nhận</span>;
            case 'completed':
                return <span className="badge bg-primary text-white">Hoàn thành</span>;
            case 'cancelled':
                return <span className="badge bg-danger text-white">Đã hủy</span>;
            default:
                return <span className="badge bg-secondary text-white">Khác</span>;
        }
    };

    const formatPaymentStatus = (status) => {
        switch (status) {
            case 'pending':
                return <span className="badge bg-warning text-white">Chờ thanh toán</span>;
            case 'paid':
                return <span className="badge bg-success text-white">Đã thanh toán</span>;
            case 'failed':
                return <span className="badge bg-danger text-white">Thanh toán thất bại</span>;
            default:
                return <span className="badge bg-secondary text-white">Khác</span>;
        }
    };



  // Lấy orders hiển thị theo trang
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Tạo phân trang
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  // Tạo phân trang rút gọn
  const paginationItems = [];

  const pageNumbersToShow = 3; // số trang hiển thị ở giữa
  let startPage = Math.max(1, currentPage - 1);
  let endPage = Math.min(totalPages, currentPage + 1);

// Luôn có trang 1
  if (startPage > 1) {
    paginationItems.push(
      <Pagination.Item key={1} active={currentPage === 1} onClick={() => setCurrentPage(1)}>
        1
      </Pagination.Item>
    );
    if (startPage > 2) {
      paginationItems.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
    }
  }

  // Các trang ở giữa
  for (let number = startPage; number <= endPage; number++) {
    paginationItems.push(
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => setCurrentPage(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  // Luôn có trang cuối
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationItems.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
    }
    paginationItems.push(
      <Pagination.Item
        key={totalPages}
        active={currentPage === totalPages}
        onClick={() => setCurrentPage(totalPages)}
      >
        {totalPages}
      </Pagination.Item>
    );
  }


  return (
    <>
      {loading ? (
        <Spinner animation="border" />
      ) : orders.length === 0 ? (
        <p>Bạn chưa có đơn hàng nào.</p>
      ) : (
        <>
          {currentOrders.map((order) => (
            <Card key={order.id_order} className="mb-3 shadow-sm">
              <Card.Body>
                <Card.Title>Đơn hàng #{order.id_order}</Card.Title>
                <Card.Text>
                  <b>Ngày đặt:</b> {formatDate(order.order_date)} <br />
                  <b>Phương thức thanh toán:</b> {formatPaymentMethod(order.payment_method)} <br />
                  <b>Trạng thái đơn hàng:</b> {formatOrderStatus(order.order_status)} <br />
                  <b>Trạng thái thanh toán:</b> {formatPaymentStatus(order.payment_status)} <br />
                  <b>Tổng tiền:</b> {Number(order.total_amount).toLocaleString("vi-VN")} ₫
                </Card.Text>
                <Button 
                variant="primary" 
                size="sm"
                onClick={() =>goToOrderDetail(order.id_order)}
                >
                  Xem chi tiết
                </Button>
              </Card.Body>
            </Card>
          ))}

          <Pagination>{paginationItems}</Pagination>
        </>
      )}

      {/* Modal chi tiết đơn hàng */}
      
    </>
  );
}
