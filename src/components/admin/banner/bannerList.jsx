"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import BannerModal from "./bannerModal/add";
import { toast } from "react-toastify";
import API_CONFIG from "@/config/api";

export default function BannerManager() {
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editImageUrl, setEditImageUrl] = useState(null);

  const fetchBanners = async () => {
    try {
      const res = await axios.get(API_CONFIG.getApiUrl("/banner"));
      setBanners(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách banner:", error);
    }
  };

  const togglePrimary = async (id) => {
    try {
      await axios.put(API_CONFIG.getApiUrl(`/banner/toggle/${id}`));
      toast.success("Cập nhật ghim thành công");
      fetchBanners();
    } catch (error) {
      console.error("Lỗi toggle ghim:", error);
      toast.error("Không thể ghim banner");
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleAddClick = () => {
    setEditId(null);
    setEditImageUrl(null);
    setShowModal(true);
  };

  const handleEditClick = (banner) => {
    setEditId(banner.id_banner);
    setEditImageUrl(banner.banner_img); // Chỉnh lại nếu cần URL đầy đủ
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (selectedFile, type) => {
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", type);

      if (editId) {
        await axios.put(API_CONFIG.getApiUrl(`/banner/${editId}`), formData, { 
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Cập nhật thành công!");
      } else {
        await axios.post(API_CONFIG.getApiUrl("/banner"), formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Thêm thành công!");
      }
      setShowModal(false);
      fetchBanners();
    } catch (error) {
      console.error("Lỗi khi thêm/cập nhật banner:", error);
      toast.error("Có lỗi xảy ra!");
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa banner này?")) return;
    try {
      await axios.delete(API_CONFIG.getApiUrl(`/banner/${id}`));
      toast.success("Xóa thành công!");
      fetchBanners();
    } catch (error) {
      console.error("Lỗi khi xóa banner:", error);
      toast.error("Có lỗi khi xóa banner");
    }
  };

  return (
    <div className="container p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Danh sách Banner</h2>
        <button className="btn btn-primary" onClick={handleAddClick}>
          Thêm Banner
        </button>
      </div>

      <table className="table table-bordered table-hover">
        <thead className="table-secondary">
          <tr>
            <th>Phương tiện</th>
            <th>Loại</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {banners.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center">
                Không có banner nào.
              </td>
            </tr>
          ) : (
            banners.map((banner) => (
              <tr key={banner.id_banner}>
                <td className="text-center">
                  {banner.type === 2 ? (
                    <video
                      src={`${API_CONFIG.BACKEND_URL}/uploads/${banner.banner_img}`}  
                      width="200"
                      height="100"
                      controls
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <img
                      src={`${API_CONFIG.BACKEND_URL}/uploads/${banner.banner_img}`}
                      alt="Banner"
                      style={{ width: 200, height: 100, objectFit: "cover" }}
                    />
                  )}
                </td>
                <td className="text-center align-middle">
                  {banner.type === 1 ? "Ảnh" : banner.type === 2 ? "Video" : "Không rõ"}
                </td>
                <td className="align-middle">
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEditClick(banner)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteBanner(banner.id_banner)}
                  >
                    Xóa
                  </button>
                  {banner.is_primary === 1 ? (
                    <button
                      className="btn btn-success btn-sm me-2 ms-2"
                      onClick={() => togglePrimary(banner.id_banner)}
                    >
                      Bỏ ghim
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-primary btn-sm me-2 ms-2"
                      disabled={banners.some((b) => b.is_primary === 1)}
                      onClick={() => togglePrimary(banner.id_banner)}
                    >
                      Ghim
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <BannerModal
        show={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialImageUrl={editImageUrl}
        isEdit={Boolean(editId)}
      />
    </div>
  );
}
