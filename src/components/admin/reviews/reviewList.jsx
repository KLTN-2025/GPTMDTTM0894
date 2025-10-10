"use client";
import React, { useEffect, useState } from "react";
import ReviewDetailModal from "./form/reviewsModalDetail";
import axios from "axios";
import { toast } from "react-toastify";
import API_CONFIG from "@/config/api";

export default function ReviewList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterRating, setFilterRating] = useState("");

  const handleDeleteReview = async (id_review) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này không?")) return;

    try {
      await axios.delete(API_CONFIG.getApiUrl(`/reviews/${id_review}`));
      toast.success("Xóa bình luận thành công!");
      fetchReviews(); // Cập nhật lại danh sách
    } catch (error) {
      toast.error("Lỗi khi xóa bình luận!");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_CONFIG.getApiUrl("/reviews"));
      setReviews(res.data);
    } catch (err) {
      setError("Lỗi khi tải bình luận");
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = async (reviewSummary) => {
    try {
      const res = await axios.get(
        API_CONFIG.getApiUrl(`/reviews/${reviewSummary.id_review}`)
      );
      setSelectedReview(res.data);
      setShowDetailModal(true);
    } catch {
      alert("Lỗi tải chi tiết bình luận");
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedReview(null);
  };

  const handleReviewUpdated = () => {
    fetchReviews(); // reload khi cập nhật
  };

  const filteredReviews = reviews.filter((r) => {
    const statusMatch =
      !filterStatus || filterStatus === "" || r.approved === filterStatus;
    const ratingMatch =
      !filterRating || filterRating === "" || r.rating === parseInt(filterRating);
    return statusMatch && ratingMatch;
  });

  return (
    <div className="container mt-3">
      <h2>Quản lý Bình luận Sản phẩm</h2>

      {/* Bộ lọc trạng thái + đánh giá sao */}
      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="filterStatus" className="form-label">
            Lọc theo trạng thái
          </label>
          <select
            id="filterStatus"
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="Pending">Chờ duyệt</option>
            <option value="Approved">Đã duyệt</option>
            <option value="Rejected">Từ chối</option>
          </select>
        </div>

        <div className="col-md-6">
          <label htmlFor="filterRating" className="form-label">
            Lọc theo số sao
          </label>
          <select
            id="filterRating"
            className="form-select"
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
        </div>
      </div>

      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <>
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Tiêu đề</th>
                <th>Đánh giá</th>
                <th>Ngày</th>
                <th>Sản phẩm</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    Không có bình luận nào
                  </td>
                </tr>
              ) : (
                filteredReviews.map((r) => (
                  <tr key={r.id_review}>
                    <td>{r.name || "(Ẩn danh)"}</td>
                    <td>{r.title || "(Không có tiêu đề)"}</td>
                    <td>{r.rating} ⭐</td>
                    <td>{new Date(r.date).toLocaleString()}</td>
                    <td>{r.products_name || "N/A"}</td>
                    <td>
                      {r.approved === "Pending" && (
                        <span className="badge bg-warning text-dark">
                          Chờ duyệt
                        </span>
                      )}
                      {r.approved === "Approved" && (
                        <span className="badge bg-success">Đã duyệt</span>
                      )}
                      {r.approved === "Rejected" && (
                        <span className="badge bg-danger">Từ chối</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openDetailModal(r)}
                      >
                        Chi tiết
                      </button>

                      <button
                        className="btn btn-danger btn-sm ms-2"
                        onClick={() => handleDeleteReview(r.id_review)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <ReviewDetailModal
            show={showDetailModal}
            onClose={closeDetailModal}
            review={selectedReview}
            onUpdated={handleReviewUpdated}
          />
        </>
      )}
    </div>
  );
}
