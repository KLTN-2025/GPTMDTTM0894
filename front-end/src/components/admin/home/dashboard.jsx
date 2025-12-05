"use client"

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import axios from "axios";
import { Form } from "react-bootstrap";

const formatVND = (value) => {
  return Number(value).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  });
};

export default function Dashboard() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  const [stats, setStats] = useState({
    todayRevenue: 0,
    newOrdersToday: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalEmployees: 0,
    totalVouchers: 0,
    totalReturns: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [revenueData, setRevenueData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);

  // Lấy danh sách năm có dữ liệu
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push(i);
  }

  // Fetch thống kê tổng quan
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/dashboard/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy thống kê:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch dữ liệu doanh thu theo năm
  useEffect(() => {
    const fetchRevenue = async () => {
      setLoadingChart(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/dashboard/revenue?year=${selectedYear}`);
        setRevenueData(res.data.data);
      } catch (err) {
        console.error("Lỗi khi lấy doanh thu:", err);
      } finally {
        setLoadingChart(false);
      }
    };

    fetchRevenue();
  }, [selectedYear]);

  // Vẽ biểu đồ khi có dữ liệu
  useEffect(() => {
    if (!chartRef.current || revenueData.length === 0) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Hủy biểu đồ cũ nếu có
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels = revenueData.map(item => item.label);
    const data = revenueData.map(item => item.revenue / 1000000); // Chuyển sang triệu đồng

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Doanh thu (triệu đồng)",
            data: data,
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            fill: true,
            tension: 0.3,
            pointRadius: 5,
            pointBackgroundColor: "rgba(54, 162, 235, 1)",
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value + ' triệu';
              }
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Doanh thu: ${formatVND(context.parsed.y * 1000000)}`;
              }
            }
          }
        }
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [revenueData]);


  if (loading) {
    return (
      <div className="dashboard container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard container-fluid">
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card text-center shadow-sm bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Doanh thu hôm nay</h5>
              <p className="card-text fs-4 fw-bold">{formatVND(stats.todayRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card text-center shadow-sm bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Đơn hàng mới</h5>
              <p className="card-text fs-4 fw-bold">{stats.newOrdersToday}</p>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card text-center shadow-sm bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Khách hàng</h5>
              <p className="card-text fs-4 fw-bold">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card text-center shadow-sm bg-warning text-dark">
            <div className="card-body">
              <h5 className="card-title">Sản phẩm</h5>
              <p className="card-text fs-4 fw-bold">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card text-center shadow-sm bg-secondary text-white">
            <div className="card-body">
              <h5 className="card-title">Nhân viên</h5>
              <p className="card-text fs-4 fw-bold">{stats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card text-center shadow-sm bg-danger text-white">
            <div className="card-body">
              <h5 className="card-title">Voucher</h5>
              <p className="card-text fs-4 fw-bold">{stats.totalVouchers}</p>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card text-center shadow-sm bg-dark text-white">
            <div className="card-body">
              <h5 className="card-title">Hàng đổi trả</h5>
              <p className="card-text fs-4 fw-bold">{stats.totalReturns}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="growth-chart-container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Tăng trưởng doanh thu năm {selectedYear}</h2>
          <Form.Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{ width: "150px" }}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </Form.Select>
        </div>
        {loadingChart ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải biểu đồ...</span>
            </div>
          </div>
        ) : (
          <div style={{ height: "400px", position: "relative" }}>
            <canvas ref={chartRef} style={{ width: "100%", height: "100%" }} />
          </div>
        )}
      </section>
    </div>
  );
}
