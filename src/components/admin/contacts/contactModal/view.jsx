"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import API_CONFIG from "@/config/api";

export default function ViewContactDetail({ contactId, onClose, onUpdated }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!contactId) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_CONFIG.getApiUrl(`/contact/${contactId}`));
        setDetail(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết liên hệ:", error);
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();

    return () => setDetail(null);
  }, [contactId]);

  const handleStatusChange = async (e) => {
    const newStatus = parseInt(e.target.value);
    setUpdating(true);
    try {
      await axios.put(API_CONFIG.getApiUrl(`/contact/${contactId}`), {
        status: newStatus,
      });
      setDetail((prev) => ({ ...prev, status: newStatus }));
      if (onUpdated) onUpdated();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmProcessed = async () => {
    if (detail?.status === 2) return;
    setUpdating(true);
    try {
      await axios.put(API_CONFIG.getApiUrl(`/contact/${contactId}`), {
        status: 2,
      });
      setDetail((prev) => ({ ...prev, status: 2 }));
      if (onUpdated) onUpdated();
      onClose(); // đóng modal
    } catch (error) {
      console.error("Lỗi khi xác nhận xử lý:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (!contactId) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      onClick={onClose}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="modal-dialog"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Chi tiết liên hệ</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {loading ? (
              <p>Đang tải...</p>
            ) : (
              detail && (
                <>
                  <p><strong>Tên:</strong> {detail.name}</p>
                  <p><strong>Email:</strong> {detail.email || "Không có"}</p>
                  <p><strong>Số điện thoại:</strong> {detail.phone}</p>
                  <p><strong>Lời nhắn:</strong> {detail.message || detail.note || "Không có"}</p>

                  {/* DROPLIST TRẠNG THÁI */}
                  <div className="mb-3">
                    <label className="form-label"><strong>Trạng thái:</strong></label>
                    <select
                      className="form-select"
                      value={detail.status}
                      onChange={handleStatusChange}
                      disabled={updating}
                    >
                      <option value={1}>Chưa xử lý</option>
                      <option value={2}>Đã xử lý</option>
                    </select>
                  </div>
                </>
              )
            )}
          </div>
          <div className="modal-footer">
            {detail?.status !== 2 && (
              <button
                className="btn btn-success"
                onClick={handleConfirmProcessed}
                disabled={updating}
              >
                {updating ? "Đang xử lý..." : "Xác nhận đã xử lý"}
              </button>
            )}
            <button className="btn btn-secondary" onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
