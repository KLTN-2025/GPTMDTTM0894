"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import API_CONFIG from "@/config/api";

export default function ViewAddressModal({ addressId, modalId }) {
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load chi tiết địa chỉ khi modal được mở
    useEffect(() => {
    const modalElement = document.getElementById(modalId);
    if (!modalElement) return;

    const handleShowWrapper = () => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const res = await axios.get(API_CONFIG.getApiUrl(`/address/${addressId}`));
          setAddress(res.data);
        } catch (error) {
          console.error("Lỗi khi lấy địa chỉ:", error);
          setAddress(null);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    };

    modalElement.addEventListener("show.bs.modal", handleShowWrapper);
    return () => modalElement.removeEventListener("show.bs.modal", handleShowWrapper);
  }, [addressId, modalId]);


  return (
    <div
      className="modal fade"
      id={modalId}
      tabIndex="-1"
      aria-labelledby={`${modalId}Label`}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id={`${modalId}Label`}>
              Chi tiết địa chỉ
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Đóng"
            ></button>
          </div>
          <div className="modal-body">
            {loading && <p>Đang tải...</p>}
            {!loading && address && (
              <dl className="row">
                <dt className="col-sm-4">Tên địa chỉ</dt>
                <dd className="col-sm-8">{address.address_label}</dd>

                <dt className="col-sm-4">Thành phố / Tỉnh</dt>
                <dd className="col-sm-8">{address.name_city}</dd>

                {/* <dt className="col-sm-4">Quận / Huyện</dt>
                <dd className="col-sm-8">{address.name_district}</dd> */}

                <dt className="col-sm-4">Phường / Xã</dt>
                <dd className="col-sm-8">{address.name_ward}</dd>

                <dt className="col-sm-4">Số nhà, tên đường</dt>
                <dd className="col-sm-8">{address.name_address}</dd>

                <dt className="col-sm-4">Địa chỉ mặc định</dt>
                <dd className="col-sm-8">{address.is_primary ? "Có" : "Không"}</dd>
              </dl>
            )}
            {!loading && !address && (
              <p className="text-danger">Không tìm thấy địa chỉ.</p>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
