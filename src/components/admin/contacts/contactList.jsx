"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";

// Plugins
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/vi";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("vi");

import ViewContactDetail from "./contactModal/view";
import { API_CONFIG } from "@/config/api";

export default function ContactList() {
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);

  // Filter states
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Load contacts
  const fetchContacts = async () => {
    try {
      const response = await axios.get(API_CONFIG.getApiUrl("/contact"));
      setContacts(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách liên hệ:", error);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Format ngày giờ theo timezone VN
  const formatDateTime = (datetimeStr) => {
    if (!datetimeStr) return "";
    // Nếu datetimeStr không có offset, giả sử là UTC, convert về Asia/Ho_Chi_Minh
    return dayjs.utc(datetimeStr).tz("Asia/Ho_Chi_Minh").format("D/M/YYYY [lúc] HH:mm");
  };

  // Hàm render trạng thái
  const renderStatus = (status) => {
    switch (status) {
      case 1:
        return <span className="badge bg-warning text-dark">Chưa xử lý</span>;
      case 2:
        return <span className="badge bg-success">Đã xử lý</span>;
      default:
        return <span className="badge bg-secondary">Không xác định</span>;
    }
  };

  // Lọc danh sách theo trạng thái và ngày tạo
  const filteredContacts = contacts.filter((contact) => {
    // Lọc trạng thái
    const matchStatus = filterStatus ? contact.status === Number(filterStatus) : true;

    // Lọc ngày tạo (chỉ so sánh ngày, bỏ giờ)
    const contactDate = contact.date
      ? dayjs.utc(contact.date).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD")
      : null;
    const matchDate = filterDate ? contactDate === filterDate : true;

    return matchStatus && matchDate;
  });

  return (
    <div className="container p-3">
      <h2>Danh sách liên hệ</h2>

      {/* Bộ lọc */}
      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">Lọc theo trạng thái</label>
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="1">Chưa xử lý</option>
            <option value="2">Đã xử lý</option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Lọc theo ngày tạo</label>
          <input
            type="date"
            className="form-control"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      <table className="table table-bordered table-hover mt-3">
        <thead className="table-secondary">
          <tr>
            <th>Tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Ngày tạo</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredContacts.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                Không có liên hệ nào.
              </td>
            </tr>
          ) : (
            filteredContacts.map((contact) => (
              <tr key={contact.id_contact}>
                <td>{contact.name}</td>
                <td>{contact.email || "Không có"}</td>
                <td>{contact.phone}</td>
                <td>{contact.date ? formatDateTime(contact.date) : "Không rõ thời gian"}</td>
                <td>{renderStatus(contact.status)}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setSelectedContactId(contact.id_contact)}
                  >
                    Xem thêm
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {selectedContactId && (
        <ViewContactDetail
          contactId={selectedContactId}
          onClose={() => setSelectedContactId(null)}
          onUpdated={fetchContacts}
        />
      )}
    </div>
  );
}
