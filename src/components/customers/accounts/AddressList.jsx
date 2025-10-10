"use client";
import { useState, useEffect } from "react";
import AddAddressModal from "./AddressModals/add";
import ViewAddressModal from "./AddressModals/view";
import UpdateAddress from "./AddressModals/update";
import axios from "axios";
import API_CONFIG from "@/config/api";

export default function AddressList({ id_customer }) {
  const [addresses, setAddresses] = useState([]);

  // Lấy danh sách địa chỉ theo id_customer
  const fetchAddresses = async () => {
    if (!id_customer) return;

    try {
      const res = await axios.get(API_CONFIG.getApiUrl(`/address/customer/${id_customer}`));
      console.log("Fetch addresses:", res.data);
      // Nếu API trả về mảng địa chỉ, set vào state
      setAddresses(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Trường hợp không có địa chỉ → không phải lỗi thực sự
        console.warn("Không có địa chỉ nào cho khách hàng.");
        setAddresses([]); // Gán danh sách rỗng
      } else {
        console.error("Lỗi khi lấy địa chỉ:", error);
        toast.error("Đã xảy ra lỗi khi tải địa chỉ.");
        setAddresses([]);
      }
    }
  };

  // Load danh sách khi id_customer thay đổi
  useEffect(() => {
    fetchAddresses();
  }, [id_customer]);

  // Reload danh sách (sau thêm/sửa/xóa)
  const reloadAddresses = () => {
    fetchAddresses();
  };

  // Xóa địa chỉ
  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

    try {
      await axios.delete(API_CONFIG.getApiUrl(`/address/${id}`));
      reloadAddresses();
    } catch (error) {
      alert("Xóa thất bại: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h5>Danh sách địa chỉ</h5>
        <button
          type="button"
          className="btn btn-success"
          data-bs-toggle="modal"
          data-bs-target="#modalAddAddress"
        >
          + Thêm địa chỉ
        </button>
      </div>

      <ul className="list-group" style={{ maxHeight: "300px", overflowY: "auto" }}>
        {Array.isArray(addresses) && addresses.length > 0 ? (
          addresses.map((address) => (
            <li
              key={address.id_address}
              className="list-group-item d-flex justify-content-between align-items-start"
            >
              <div>
                <div>
                  <strong>{address.address_label}</strong>
                  {address.is_primary && (
                    <span className="badge bg-success ms-2">Mặc định</span>
                  )}
                </div>
                <div>
                  {address.name_address}, {address.name_ward},{" "}
                  {address.name_city}
                </div>
              </div>

              <div>
                <button
                  className="btn btn-sm btn-info me-1"
                  data-bs-toggle="modal"
                  data-bs-target={`#modalViewAddress${address.id_address}`} // ✅ trùng khớp
                >
                  Xem
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-warning me-1"
                  data-bs-toggle="modal"
                  data-bs-target={`#modalEditAddress${address.id_address}`}
                >
                  Sửa
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(address.id_address)}
                >
                  Xóa
                </button>
              </div>

              <ViewAddressModal
                key={`modal-${address.id_address}`}
                addressId={address.id_address}
                modalId={`modalViewAddress${address.id_address}`}
              />
              <UpdateAddress
                key={`edit-modal-${address.id_address}`}
                address={address}
                modalId={`modalEditAddress${address.id_address}`}
                onUpdateSuccess={reloadAddresses} // reload sau khi sửa
              />
            </li>
          ))
        ) : (
          <li className="list-group-item text-center">Chưa có địa chỉ nào.</li>
        )}
      </ul>

      <AddAddressModal
        id_customer={id_customer}
        onSuccess={reloadAddresses} // reload sau khi thêm
      />
    </div>
  );
}
