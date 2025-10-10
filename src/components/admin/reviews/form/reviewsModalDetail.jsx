"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import API_CONFIG from "@/config/api";

export default function ReviewDetailModal({ show, onClose, review, onUpdated }) {
  const [approvedStatus, setApprovedStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (review) {
        console.log("Review in modal:", review);
      setApprovedStatus(review.approved || "");
      setError(null);
    }
  }, [review]);

  if (!show) return null;

  const handleApproveChange = (e) => {
    setApprovedStatus(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!approvedStatus) return;

    setLoading(true);
    setError(null);
    try {
        
      await axios.put(API_CONFIG.getApiUrl(`/reviews/${review.id_review}/approve`), {
        approved: approvedStatus,
      });
      alert("Cập nhật trạng thái duyệt thành công");
      onUpdated(); // gọi callback reload danh sách
      onClose();
    } catch (err) {
      setError("Cập nhật trạng thái duyệt thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
      role="dialog"
    >
      <div className="modal-dialog" role="document">
        <form className="modal-content" onSubmit={handleSubmit}>
          <div className="modal-header">
            <h5 className="modal-title">Chi tiết Bình luận</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
                {review ? (
                    <>
                    <p><strong>Tiêu đề:</strong> {review.title}</p>
                    <p><strong>Đánh giá:</strong> {review.rating} ⭐</p>
                    <p><strong>Nội dung:</strong> {review.comment || "N/A"}</p>
                    <p><strong>Khách hàng:</strong> {review.customer?.name || "N/A"}</p>
                    <p><strong>Sản phẩm:</strong> {review.product?.products_name || "N/A"}</p>
                    <p><strong>Ngày:</strong> {new Date(review.date).toLocaleString()}</p>

                    <label htmlFor="approved" className="form-label">
                        Trạng thái duyệt
                    </label>
                    <select
                        id="approved"
                        className="form-select"
                        value={approvedStatus}
                        onChange={handleApproveChange}
                        required
                    >
                        <option value="">-- Chọn trạng thái --</option>
                        <option value="Approved">Duyệt</option>
                        <option value="Rejected">Từ chối</option>
                    </select>

                    {error && <p className="text-danger mt-2">{error}</p>}
                    </>
                ) : (
                    <p>Không có dữ liệu</p>
                )}
                </div>
                <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                    Đóng
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading || !approvedStatus}>
                    {loading ? "Đang cập nhật..." : "Cập nhật trạng thái"}
                </button>
                </div>
        </form>
      </div>
    </div>
  );
}
