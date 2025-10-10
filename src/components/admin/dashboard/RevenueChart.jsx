"use client";

import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import axios from "axios";
import { API_CONFIG } from "@/config/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function RevenueChart({ startDate, endDate }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getChartTitle = () => {
    if (startDate && endDate) {
      const start = startDate.toLocaleDateString('vi-VN');
      const end = endDate.toLocaleDateString('vi-VN');
      return `Biểu đồ doanh thu từ ${start} đến ${end}`;
    }
    return "Biểu đồ doanh thu 6 tháng gần nhất";
  };

  useEffect(() => {
    fetchRevenueData();
  }, [startDate, endDate]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate && endDate) {
        params.startDate = startDate.toISOString().split('T')[0];
        params.endDate = endDate.toISOString().split('T')[0];
        
        // Tự động chọn period dựa vào khoảng thời gian
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 31) {
          params.period = 'day';
        } else {
          params.period = 'month';
        }
      }
      
      const response = await axios.get(API_CONFIG.getApiUrl("/analytics/revenue"), { params });
      if (response.data.success) {
        console.log('API Response Data:', response.data.data);
        console.log('Current params:', params);
        const data = response.data.data || [];
        setChartData(data);
      } else {
        throw new Error('API response indicates failure');
      }
    } catch (error) {
      console.error('Error fetching revenue chart data:', error);
      // Fallback mock data
      setChartData([
        { period: 'T1', totalRevenue: 50000000 },
        { period: 'T2', totalRevenue: 65000000 },
        { period: 'T3', totalRevenue: 45000000 },
        { period: 'T4', totalRevenue: 70000000 },
        { period: 'T5', totalRevenue: 80000000 },
        { period: 'T6', totalRevenue: 95000000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getAverageLabel = () => {
    if (startDate && endDate) {
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 31) {
        return "Trung bình/ngày";
      }
    }
    return "Trung bình/tháng";
  };

  const getMaxLabel = () => {
    if (startDate && endDate) {
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 31) {
        return "Ngày cao nhất";
      }
    }
    return "Tháng cao nhất";
  };

  const formatPeriod = (period) => {
    if (!period) return '';
    
    // Nếu là format ngày (YYYY-MM-DD)
    if (period.includes('-') && period.length === 10) {
      const date = new Date(period);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }
    
    // Nếu là format tháng (YYYY-MM)
    if (period.includes('-') && period.length === 7) {
      const [year, month] = period.split('-');
      return `T${month}`;
    }
    
    // Trả về period gốc nếu không match format nào
    return period;
  };

  const maxRevenue = chartData.length > 0 ? Math.max(...chartData.map(item => item.totalRevenue || item.total_revenue || item.revenue || 0), 1) : 1;

  // Cấu hình Chart.js
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return formatCurrency(context.parsed.y);
          }
        },
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 6,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          },
          color: '#6c757d',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(0,0,0,0.1)',
        }
      },
      x: {
        ticks: {
          color: '#6c757d',
          font: {
            size: 11,
            weight: '600'
          }
        },
        grid: {
          display: false,
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  const chartJsData = {
    labels: chartData.map(item => formatPeriod(item.period || item.month)),
    datasets: [
      {
        data: chartData.map(item => item.totalRevenue || item.total_revenue || item.revenue || 0),
        backgroundColor: 'rgba(13, 110, 253, 0.8)',
        borderColor: 'rgba(13, 110, 253, 1)',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(11, 94, 215, 0.9)',
        hoverBorderColor: 'rgba(11, 94, 215, 1)',
      },
    ],
  };

  return (
    <Card className="h-100 shadow-sm">
      <Card.Header className="bg-light">
        <h5 className="mb-0">
          {getChartTitle()}
        </h5>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Đang tải dữ liệu biểu đồ...</p>
          </div>
                 ) : chartData.length === 0 ? (
           <div className="text-center py-5">
             <h5 className="text-muted mt-3">Chưa có dữ liệu doanh thu</h5>
             <p className="text-muted">Dữ liệu sẽ hiển thị khi có đơn hàng thành công</p>
           </div>
         ) : (
           <div className="revenue-chart">
             <div className="chart-container" style={{ height: '350px', position: 'relative' }}>
               <Bar data={chartJsData} options={chartOptions} />
             </div>
             
             <div className="chart-summary mt-4">
               <div className="row text-center">
                 <div className="col-4">
                   <div className="text-primary fw-bold fs-6">
                     {formatCurrency(chartData.reduce((sum, item) => sum + (item.totalRevenue || item.total_revenue || item.revenue || 0), 0))}
                   </div>
                   <small className="text-muted">Tổng doanh thu</small>
                 </div>
                 <div className="col-4">
                   <div className="text-success fw-bold fs-6">
                     {chartData.length > 0 ? formatCurrency(chartData.reduce((sum, item) => sum + (item.totalRevenue || item.total_revenue || item.revenue || 0), 0) / chartData.length) : '0 ₫'}
                   </div>
                   <small className="text-muted">{getAverageLabel()}</small>
                 </div>
                 <div className="col-4">
                   <div className="text-info fw-bold fs-6">
                     {chartData.length > 0 ? formatCurrency(Math.max(...chartData.map(item => item.totalRevenue || item.total_revenue || item.revenue || 0))) : '0 ₫'}
                   </div>
                   <small className="text-muted">{getMaxLabel()}</small>
                 </div>
               </div>
             </div>
           </div>
        )}
      </Card.Body>
    </Card>
  );
}
