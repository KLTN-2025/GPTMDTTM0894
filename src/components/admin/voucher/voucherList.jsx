"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Badge,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import AddVoucherModal from "./form/addVoucher";
import EditVoucherModal from "./form/updateVoucher";
import { API_CONFIG } from "@/config/api";

export default function VoucherList() {
  const [voucherList, setVoucherList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);

  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
    createDate: "",
    startDate: "",
    endDate: "",
  });

  const fetchVouchers = async () => {
    try {
      const res = await axios.get(API_CONFIG.getApiUrl("/voucher"));
      setVoucherList(res.data.vouchers || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách voucher:", err);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("vi-VN") : "-";

  const formatDiscount = (type, value) =>
    type === "percent"
      ? `${parseInt(value)}%`
      : `${Number(value).toLocaleString("vi-VN")}đ`;

  const formatStatus = (status, endDate) => {
    const currentDate = new Date();
    const voucherEndDate = new Date(endDate);
    const isExpired = voucherEndDate < currentDate;

    if (isExpired) {
      return <Badge bg="danger">Hết hạn sử dụng</Badge>;
    }

    switch (status) {
      case 1:
        return <Badge bg="warning">Chờ duyệt</Badge>;
      case 2:
        return <Badge bg="success">Hoạt động</Badge>;
      case 3:
        return <Badge bg="secondary">Đã ẩn</Badge>;
      default:
        return <Badge bg="dark">Không xác định</Badge>;
    }
  };

  // Hàm kiểm tra voucher có hết hạn không
  const isVoucherExpired = (endDate) => {
    const currentDate = new Date();
    const voucherEndDate = new Date(endDate);
    return voucherEndDate < currentDate;
  };

  // Bộ lọc client-side
  const filteredVouchers = voucherList.filter((voucher) => {
    const keyword = filters.keyword?.toLowerCase() || '';

    const matchesKeyword = keyword
      ? voucher.name.toLowerCase().includes(keyword) ||
        voucher.code.toLowerCase().includes(keyword)
      : true;

    const isExpired = isVoucherExpired(voucher.end_date);
    const matchesStatus = filters.status
      ? (filters.status === "expired" 
          ? isExpired 
          : (!isExpired && voucher.status === parseInt(filters.status))
        )
      : true;

    const matchesCreateDate = filters.createDate
      ? new Date(voucher.create_date).toISOString().slice(0, 10) ===
        filters.createDate
      : true;

    const matchesStartDate = filters.startDate
      ? new Date(voucher.start_date).toISOString().slice(0, 10) ===
        filters.startDate
      : true;

    const matchesEndDate = filters.endDate
      ? new Date(voucher.end_date).toISOString().slice(0, 10) ===
        filters.endDate
      : true;

    return (
      matchesKeyword &&
      matchesStatus &&
      matchesCreateDate &&
      matchesStartDate &&
      matchesEndDate
    );
  });

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Danh sách Mã Giảm Giá</h2>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Tạo mã voucher
        </Button>
      </div>

      {/* Bộ lọc */}
      <Form className="mb-3">
        <Row className="g-2 align-items-end">
          <Col md={2}>
            <Form.Label>Tìm kiếm tên hoặc mã</Form.Label>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm"
              value={filters.keyword}
              onChange={(e) =>
                setFilters({ ...filters, keyword: e.target.value })
              }
            />
          </Col>

          <Col md={2}>
            <Form.Label>Ngày tạo</Form.Label>
            <Form.Control
              type="date"
              value={filters.createDate}
              onChange={(e) =>
                setFilters({ ...filters, createDate: e.target.value })
              }
            />
          </Col>

          <Col md={2}>
            <Form.Label>Ngày bắt đầu</Form.Label>
            <Form.Control
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          </Col>

          <Col md={2}>
            <Form.Label>Ngày kết thúc</Form.Label>
            <Form.Control
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </Col>

          <Col md={2}>
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="">Tất cả</option>
              <option value="1">Chờ duyệt</option>
              <option value="2">Hoạt động</option>
              <option value="3">Đã ẩn</option>
              <option value="expired">Hết hạn sử dụng</option>
            </Form.Select>
          </Col>

          <Col md={2}>
            <Button
              variant="secondary"
              onClick={() =>
                setFilters({
                  keyword: "",
                  status: "",
                  createDate: "",
                  startDate: "",
                  endDate: "",
                })
              }
            >
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Bảng danh sách */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Tên mã</th>
            <th>Mã giảm giá</th>
            <th>Ngày tạo</th>
            <th>Ngày bắt đầu</th>
            <th>Ngày kết thúc</th>
            <th>Giảm</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredVouchers.map((voucher) => (
            <tr key={voucher.id_voucher}>
              <td>{voucher.name}</td>
              <td>
                <Badge bg="primary">{voucher.code}</Badge>
              </td>
              <td>{formatDate(voucher.create_date)}</td>
              <td>{formatDate(voucher.start_date)}</td>
              <td>{formatDate(voucher.end_date)}</td>
              <td>
                {formatDiscount(voucher.discount_type, voucher.discount_value)}
              </td>
              <td>{formatStatus(voucher.status, voucher.end_date)}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  disabled={isVoucherExpired(voucher.end_date)}
                  onClick={() => {
                    setSelectedVoucherId(voucher.id_voucher);
                    setShowEditModal(true);
                  }}
                >
                  Chi tiết
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal Thêm */}
      <AddVoucherModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        onSuccess={fetchVouchers}
      />

      {/* Modal Sửa */}
      {showEditModal && (
        <EditVoucherModal
          show={showEditModal}
          handleClose={() => setShowEditModal(false)}
          voucherId={selectedVoucherId}
          onSuccess={fetchVouchers}
        />
      )}
    </div>
  );
}
