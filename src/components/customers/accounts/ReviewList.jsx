'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import API_CONFIG from "@/config/api";

export default function CustomerReviewPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const id_customer = localStorage.getItem('id_customer');

  useEffect(() => {
    if (!id_customer) return;

    axios
      .get(API_CONFIG.getApiUrl(`/reviews/customer/${id_customer}`))
      .then((res) => setReviews(res.data))
      .catch((err) => console.error('Lỗi khi lấy đánh giá:', err))
      .finally(() => setLoading(false));
  }, [id_customer]);

  const renderStatusBadge = (status) => {
    let colorClass = "secondary";
    if (status === "Approved") colorClass = "success";
    else if (status === "Rejected") colorClass = "danger";
    else if (status === "Pending") colorClass = "warning";

    return (
      <span className={`badge bg-${colorClass}`} style={{ fontSize: "0.9rem" }}>
        {status}
      </span>
    );
  };

  if (!id_customer) return <p className="text-danger">Vui lòng đăng nhập để xem đánh giá của bạn.</p>;

  return (
    <div>
      {loading ? (
        <p>Đang tải đánh giá...</p>
      ) : reviews.length === 0 ? (
        <p className="text-muted">Bạn chưa đánh giá sản phẩm nào.</p>
      ) : (
        <div className="row">
          {reviews.map((r) => (
            <div key={r.id_review} className="col-md-6 mb-4">
              <div className="border rounded p-3 shadow-sm h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                <Link
                    href={`/productDetail/${r.product?.slug || r.product?.id_products}`}
                    className="text-decoration-none text-primary fw-bold"
                    >
                    {r.product?.products_name}
                </Link>
                  {renderStatusBadge(r.approved)}
                </div>

                <div className="text-warning mb-1" style={{ fontSize: "1.1rem" }}>
                  {'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}
                </div>

                <h6 className="mb-1">{r.title}</h6>
                <p className="mb-2" style={{ whiteSpace: "pre-line" }}>{r.comment}</p>

                <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                  <i className="bi bi-clock me-1"></i>
                  {new Date(r.date).toLocaleString("vi-VN")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
