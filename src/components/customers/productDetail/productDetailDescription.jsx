'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import API_CONFIG from "@/config/api";

export default function ProductDetailDescription({
  products_description = "",
  specs = [],
  faq = "",
  id_products, // nhớ truyền prop này vào
}) {
  const [activeTab, setActiveTab] = useState("description");

  // Form đánh giá
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [selectedStar, setSelectedStar] = useState(0);
  const [reviewMessage, setReviewMessage] = useState("");

  // Dữ liệu review thật từ backend
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Hàm lấy review theo sản phẩm
  const fetchReviews = async () => {
    if (!id_products) return;
    setLoadingReviews(true);
    try {
      const res = await axios.get(API_CONFIG.getApiUrl(`/reviews/product/${id_products}`));
      setReviews(res.data.reviews || []);
    } catch (error) {
      console.error("Lỗi khi lấy đánh giá:", error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Tự động load reviews khi id_products thay đổi
  useEffect(() => {
    fetchReviews();
  }, [id_products]);

  // Gửi đánh giá mới
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    const id_customer = localStorage.getItem("id_customer"); // bạn lưu id_customer khi login

    if (!id_customer || !id_products) {
      alert("Thiếu thông tin người dùng hoặc sản phẩm.");
      return;
    }
    if (!title.trim() || !comment.trim() || selectedStar === 0) {
      alert("Vui lòng điền đầy đủ tiêu đề, nội dung và chọn số sao.");
      return;
    }

    try {
      const res = await axios.post(API_CONFIG.getApiUrl("/reviews/"), {
        id_customer,
        id_products,
        rating: selectedStar,
        title,
        comment,
        approved: "Pending",
      });

      if (res.status === 201) {
        setReviewMessage("✅ Gửi đánh giá thành công!");
        setTitle("");
        setComment("");
        setSelectedStar(0);

        // Reload lại danh sách review
        fetchReviews();
      } else {
        setReviewMessage("❌ Gửi đánh giá thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi gửi đánh giá:", err);
      setReviewMessage("❌ Lỗi khi kết nối đến máy chủ.");
    }
  };

  return (
    <div className="tab-container mt-4">
      <div className="tab-buttons text-center mb-3">
        <button
          className={`tab-btn ${activeTab === "description" ? "active" : ""}`}
          onClick={() => setActiveTab("description")}
        >
          Mô tả sản phẩm
        </button>
        <button
          className={`tab-btn ${activeTab === "specs" ? "active" : ""}`}
          onClick={() => setActiveTab("specs")}
        >
          Thông số kỹ thuật
        </button>
        <button
          className={`tab-btn ${activeTab === "review" ? "active" : ""}`}
          onClick={() => setActiveTab("review")}
        >
          Đánh giá sản phẩm
        </button>
      </div>

      {/* Mô tả */}
      <div
        className="tab-content"
        style={{ display: activeTab === "description" ? "block" : "none" }}
      >
        <div dangerouslySetInnerHTML={{ __html: products_description }} />
      </div>

      {/* Thông số kỹ thuật */}
      <div
        className="tab-content"
        style={{ display: activeTab === "specs" ? "block" : "none" }}
      >
        {specs.length === 0 ? (
          <p>Chưa có thông số kỹ thuật</p>
        ) : (
          <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 15px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {specs.map(({ id_spec, spec_name, spec_value }) => (
                  <tr key={id_spec} style={{ borderBottom: "1px solid #ddd" }}>
                    <td
                      style={{
                        padding: "8px",
                        fontWeight: "600",
                        width: "40%",
                        textTransform: "capitalize",
                      }}
                    >
                      {spec_name}
                    </td>
                    <td style={{ padding: "8px" }}>{spec_value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Đánh giá */}
      <div
        className={`tab-content ${activeTab === "review" ? "active" : ""}`}
        style={{ display: activeTab === "review" ? "block" : "none" }}
      >
        <div className="row">
          {/* Form đánh giá bên trái */}
          <div className="col-md-6 mb-4">
            <h5 className="mb-3">Gửi đánh giá của bạn</h5>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-3">
                <label className="form-label">Tiêu đề</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập tiêu đề đánh giá"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Nội dung đánh giá</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label d-block">Đánh giá sao</label>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="btn btn-outline-warning me-1"
                    onClick={() => setSelectedStar(star)}
                    style={{ userSelect: "none" }}
                  >
                    {selectedStar >= star ? "★" : "☆"}
                  </button>
                ))}
              </div>

              <button type="submit" className="btn btn-success mt-2">
                Gửi đánh giá
              </button>

              {reviewMessage && (
                <div className="alert alert-info mt-2">{reviewMessage}</div>
              )}
            </form>
          </div>

          {/* Hiển thị đánh giá bên phải */}
          <div className="col-md-6">
            <h5 className="mb-3">Đánh giá của khách hàng</h5>

            {loadingReviews ? (
              <p>Đang tải đánh giá...</p>
            ) : reviews.length === 0 ? (
              <p className="text-muted">Chưa có đánh giá nào.</p>
            ) : (
              <div
                className="review-list"
                style={{ maxHeight: 400, overflowY: "auto", paddingRight: 10 }}
              >
                {reviews.map((review, index) => (
                  <div
                    key={index}
                    className="border rounded p-3 mb-3 bg-light"
                  >
                    <h6 className="mb-1">{review.customer_name || review.name || "Khách hàng"}</h6>
                    <h6 className="mb-1">{review.title}</h6>
                    <div className="text-warning mb-1">
                      {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
                    </div>
                    <p className="mb-0">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
