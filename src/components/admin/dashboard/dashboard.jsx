"use client"

import { useEffect, useRef, useState } from "react";
import { Row, Col, Card, Button, Form, InputGroup } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/styles/datepicker.css";
import "@/styles/dashboard.css";
import { registerLocale } from "react-datepicker";
import { vi } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import RevenueChart from "../dashboard/RevenueChart";
import TopProducts from "../dashboard/TopProducts";
import { API_CONFIG } from "@/config/api";

registerLocale('vi', vi);

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    thisMonth: { revenue: 0, orders: 0, avgOrder: 0 },
    growth: { revenue: 0, orders: 0 },
    totals: { customers: 0, products: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date());
  const [filteredData, setFilteredData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (customStartDate = null, customEndDate = null) => {
    setLoading(true);
    try {
      const params = {};
      if (customStartDate && customEndDate) {
        params.startDate = customStartDate.toISOString().split('T')[0];
        params.endDate = customEndDate.toISOString().split('T')[0];
      }
      
      const response = await axios.get(API_CONFIG.getApiUrl("/analytics/dashboard"), { params });
      console.log('Dashboard API response:', response.data);
      
      if (response.data.success) {
        const data = response.data.data;
        setDashboardData(data);
        if (customStartDate && customEndDate) {
          setFilteredData(data);
        }
      } else {
        throw new Error(response.data.message || 'API response indicates failure');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Lỗi khi tải dữ liệu dashboard: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = () => {
    if (startDate && endDate) {
      if (startDate > endDate) {
        toast.error('Ngày bắt đầu không thể sau ngày kết thúc');
        return;
      }
      setFilteredData(true); // Đánh dấu đang trong chế độ filter
      fetchDashboardData(startDate, endDate);
    } else {
      toast.error('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc');
    }
  };

  const resetDateFilter = () => {
    setStartDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    setEndDate(new Date());
    setFilteredData(null);
    fetchDashboardData();
  };

  const exportToExcel = async () => {
    try {
      setLoading(true);
      
      // Lấy dữ liệu chi tiết để xuất Excel
      const params = {};
      if (filteredData && startDate && endDate) {
        params.startDate = startDate.toISOString().split('T')[0];
        params.endDate = endDate.toISOString().split('T')[0];
      }
      
      const [dashboardResponse, revenueResponse, topProductsResponse] = await Promise.all([
        axios.get(API_CONFIG.getApiUrl("/analytics/dashboard"), { params }),
        axios.get(API_CONFIG.getApiUrl("/analytics/revenue"), { params: { ...params, period: 'day' } }),
        axios.get(API_CONFIG.getApiUrl("/analytics/top-products"), { params })
      ]);

      const currentData = filteredData || dashboardData;
      const revenueData = revenueResponse.data.data || [];
      const topProducts = topProductsResponse.data.data || [];

      // Tạo workbook Excel
      const wb = XLSX.utils.book_new();

      // Sheet 1: Tổng quan
      const summaryData = [
        ['BÁO CÁO TỔNG QUAN THU NHẬP'],
        [''],
        ['Thời gian:', filteredData ? `${startDate.toLocaleDateString('vi-VN')} - ${endDate.toLocaleDateString('vi-VN')}` : 'Tháng hiện tại'],
        ['Ngày xuất:', new Date().toLocaleString('vi-VN')],
        [''],
        ['TỔNG QUAN'],
        ['Doanh thu', currentData.thisMonth.revenue.toLocaleString('vi-VN') + ' VNĐ'],
        ['Số đơn hàng', currentData.thisMonth.orders.toLocaleString('vi-VN')],
        ['Giá trị đơn hàng trung bình', currentData.thisMonth.avgOrder.toLocaleString('vi-VN') + ' VNĐ'],
        ['Tăng trưởng doanh thu (%)', currentData.growth.revenue + '%'],
        ['Tăng trưởng đơn hàng (%)', currentData.growth.orders + '%'],
        [''],
        ['THỐNG KÊ TỔNG'],
        ['Tổng khách hàng', currentData.totals.customers.toLocaleString('vi-VN')],
        ['Tổng sản phẩm', currentData.totals.products.toLocaleString('vi-VN')]
      ];
      
      const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWS, 'Tổng quan');

      // Sheet 2: Chi tiết doanh thu theo ngày
      if (revenueData.length > 0) {
        const revenueHeaders = ['Ngày', 'Doanh thu (VNĐ)', 'Số đơn hàng', 'Tăng trưởng (%)'];
        const revenueRows = revenueData.map(item => [
          item.period,
          parseFloat(item.total_revenue || 0).toLocaleString('vi-VN'),
          parseInt(item.total_orders || 0).toLocaleString('vi-VN'),
          (item.growth_rate || 0) + '%'
        ]);
        
        const revenueWS = XLSX.utils.aoa_to_sheet([revenueHeaders, ...revenueRows]);
        XLSX.utils.book_append_sheet(wb, revenueWS, 'Chi tiết doanh thu');
      }

      // Sheet 3: Top sản phẩm bán chạy
      if (topProducts.length > 0) {
        const productHeaders = ['STT', 'Tên sản phẩm', 'Số lượng bán', 'Doanh thu (VNĐ)'];
        const productRows = topProducts.map((product, index) => [
          index + 1,
          product.name,
          product.sales.toLocaleString('vi-VN'),
          product.revenue.toLocaleString('vi-VN')
        ]);
        
        const productWS = XLSX.utils.aoa_to_sheet([productHeaders, ...productRows]);
        XLSX.utils.book_append_sheet(wb, productWS, 'Top sản phẩm');
      }

      // Xuất file
      const fileName = filteredData 
        ? `bao-cao-doanh-thu-${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}.xlsx`
        : `bao-cao-doanh-thu-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      XLSX.writeFile(wb, fileName);
      toast.success('Xuất báo cáo Excel thành công!');
      
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Lỗi khi xuất báo cáo Excel: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const currentData = filteredData || dashboardData;

  return (
    <div className="dashboard container-fluid">
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Bộ lọc thời gian</h5>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" onClick={exportToExcel} disabled={loading}>
                Xuất Excel
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <Row className="align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Từ ngày:</Form.Label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  dateFormat="dd/MM/yyyy"
                  className="form-control"
                  placeholderText="Chọn ngày bắt đầu"
                  locale="vi"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Đến ngày:</Form.Label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  dateFormat="dd/MM/yyyy"
                  className="form-control"
                  placeholderText="Chọn ngày kết thúc"
                  locale="vi"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <div className="d-flex gap-2">
                <Button variant="primary" onClick={handleDateFilter} disabled={loading}>
                  Lọc dữ liệu
                </Button>
                <Button variant="outline-secondary" onClick={resetDateFilter} disabled={loading}>
                  Đặt lại
                </Button>
              </div>
            </Col>
            <Col md={3}>
              {filteredData && (
                <div className="text-end">
                  <small className="text-muted">
                    Dữ liệu từ {startDate.toLocaleDateString('vi-VN')} đến {endDate.toLocaleDateString('vi-VN')}
                  </small>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Đang tải dữ liệu dashboard...</p>
        </div>
      ) : (
        <>

          <Row className="g-3 mb-4">
            <Col xs={6} md={3}>
              <Card className="text-center shadow-sm bg-success text-white h-100">
                <Card.Body>
                  <h6 className="card-title">
                    {filteredData ? 'Doanh thu kỳ được chọn' : 'Doanh thu tháng này'}
                  </h6>
                  <p className="fs-5 fw-bold mb-1">{formatCurrency(currentData.thisMonth.revenue)}</p>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={6} md={3}>
              <Card className="text-center shadow-sm bg-primary text-white h-100">
                <Card.Body>
                  <h6 className="card-title">
                    {filteredData ? 'Đơn hàng kỳ được chọn' : 'Đơn hàng tháng này'}
                  </h6>
                  <p className="fs-4 fw-bold mb-1">{currentData.thisMonth.orders.toLocaleString()}</p>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={6} md={3}>
              <Card className="text-center shadow-sm bg-info text-white h-100">
                <Card.Body>
                  <h6 className="card-title">Tổng khách hàng</h6>
                  <p className="fs-4 fw-bold mb-1">{currentData.totals.customers.toLocaleString()}</p>
                  <small>Khách hàng đang hoạt động</small>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={6} md={3}>
              <Card className="text-center shadow-sm bg-warning text-dark h-100">
                <Card.Body>
                  <h6 className="card-title">Tổng sản phẩm</h6>
                  <p className="fs-4 fw-bold mb-1">{currentData.totals.products.toLocaleString()}</p>
                  <small>Sản phẩm đang bán</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Row mới cho tăng trưởng và giá trị đơn hàng trung bình */}
          <Row className="g-3 mb-4">
            <Col xs={6} md={3}>
              <Card className={`text-center shadow-sm h-100 ${currentData.growth.revenue >= 0 ? 'bg-success' : 'bg-danger'} text-white`}>
                <Card.Body>
                  <h6 className="card-title">Tăng trưởng doanh thu (%)</h6>
                  <p className="fs-4 fw-bold mb-1">
                    {currentData.growth.revenue >= 0 ? '+' : ''}{currentData.growth.revenue}%
                  </p>
                  <small>So với kỳ trước</small>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={6} md={3}>
              <Card className={`text-center shadow-sm h-100 ${currentData.growth.orders >= 0 ? 'bg-success' : 'bg-danger'} text-white`}>
                <Card.Body>
                  <h6 className="card-title">Tăng trưởng đơn hàng (%)</h6>
                  <p className="fs-4 fw-bold mb-1">
                    {currentData.growth.orders >= 0 ? '+' : ''}{currentData.growth.orders}%
                  </p>
                  <small>So với kỳ trước</small>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={6} md={3}>
              <Card className="text-center shadow-sm bg-secondary text-white h-100">
                <Card.Body>
                  <h6 className="card-title">Đơn hàng trung bình</h6>
                  <p className="fs-5 fw-bold mb-1">{formatCurrency(currentData.thisMonth.avgOrder)}</p>
                  <small>Giá trị trung bình/đơn</small>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={6} md={3}>
              <Card className="text-center shadow-sm bg-dark text-white h-100">
                <Card.Body>
                  <h6 className="card-title">Tỷ lệ chuyển đổi</h6>
                  <p className="fs-4 fw-bold mb-1">
                    {currentData.totals.customers > 0 
                      ? ((currentData.thisMonth.orders / currentData.totals.customers) * 100).toFixed(1)
                      : 0}%
                  </p>
                  <small>Đơn hàng/Khách hàng</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4">
            <Col lg={12}>
              <RevenueChart startDate={filteredData ? startDate : null} endDate={filteredData ? endDate : null} />
            </Col>
            <Col lg={12}>
              <TopProducts startDate={filteredData ? startDate : null} endDate={filteredData ? endDate : null} />
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
