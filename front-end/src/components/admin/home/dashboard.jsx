"use client"

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function Dashboard() {
  const chartRef = useRef(null);
const chartInstance = useRef(null); // đúng tên rồi

useEffect(() => {
  const ctx = chartRef.current?.getContext("2d");
  if (!ctx) return;

  // ✅ Kiểm tra và hủy biểu đồ cũ nếu có
  if (chartInstance.current) {
    chartInstance.current.destroy();
  }

  chartInstance.current = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Tháng 12", "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5"],
      datasets: [
        {
          label: "Doanh thu (triệu đồng)",
          data: [120, 150, 180, 170, 210, 230],
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
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 20,
          },
        },
      },
    },
  });

  // 🧹 Dọn khi unmount
  return () => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }
  };
}, []);


  return (
    <div className="dashboard container-fluid">
        <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
            <div className="card text-center shadow-sm bg-success text-white">
              <div className="card-body">
                <h5 className="card-title">Doanh thu hôm nay</h5>
                <p className="card-text fs-4 fw-bold">12.500.000đ</p>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="card text-center shadow-sm bg-primary text-white">
              <div className="card-body">
                <h5 className="card-title">Đơn hàng mới</h5>
                <p className="card-text fs-4 fw-bold">25</p>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="card text-center shadow-sm bg-info text-white">
              <div className="card-body">
                <h5 className="card-title">Khách hàng</h5>
                <p className="card-text fs-4 fw-bold">8</p>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="card text-center shadow-sm bg-warning text-dark">
              <div className="card-body">
                <h5 className="card-title">Sản phẩm</h5>
                <p className="card-text fs-4 fw-bold">134</p>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="card text-center shadow-sm bg-secondary text-white">
              <div className="card-body">
                <h5 className="card-title">Nhân viên</h5>
                <p className="card-text fs-4 fw-bold">4</p>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="card text-center shadow-sm bg-danger text-white">
              <div className="card-body">
                <h5 className="card-title">Voucher</h5>
                <p className="card-text fs-4 fw-bold">10</p>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="card text-center shadow-sm bg-dark text-white">
              <div className="card-body">
                <h5 className="card-title">Hàng đổi trả</h5>
                <p className="card-text fs-4 fw-bold">14</p>
              </div>
            </div>
          </div>

        </div>

        <section className="growth-chart-container" style={{ height: "600px" }}>
          <h2>Tăng trưởng doanh thu (6 tháng gần nhất)</h2>
          <canvas ref={chartRef} style={{ width: "100%", height: "100%" }} />
        </section>
    </div>

  );
}
