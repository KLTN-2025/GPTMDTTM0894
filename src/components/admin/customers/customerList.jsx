"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import BlockUnblockModal from "./customerModal/BlockUnblock";
  import API_CONFIG from "@/config/api";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isBlocking, setIsBlocking] = useState(true);

  // Filter states
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all / blocked / unblocked

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(API_CONFIG.getApiUrl("/customers"));
      setCustomers(res.data.customers);
    } catch (err) {
      console.error("Lỗi khi tải khách hàng:", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Lọc danh sách khi filter thay đổi hoặc khi customers cập nhật
  useEffect(() => {
    let temp = [...customers];

    // Lọc theo tên (không phân biệt hoa thường)
    if (filterName.trim() !== "") {
      const nameLower = filterName.trim().toLowerCase();
      temp = temp.filter(cust =>
        cust.name && cust.name.toLowerCase().includes(nameLower)
      );
    }

    // Lọc theo trạng thái
    if (filterStatus === "blocked") {
      temp = temp.filter(cust => cust.status === false); // đang bị chặn
    } else if (filterStatus === "unblocked") {
      temp = temp.filter(cust => cust.status === true); // không chặn
    }

    setFilteredCustomers(temp);
  }, [filterName, filterStatus, customers]);

  const openModal = (customer, block) => {
    setSelectedCustomer(customer);
    setIsBlocking(block);
    setShowModal(true);
  };

  const confirmStatusChange = async (reason) => {
    try {
      await axios.put(
        API_CONFIG.getApiUrl(`/customers/status/${selectedCustomer.id_customer}`),
        {
          status: !isBlocking, // false = chặn, true = bỏ chặn
          block_reason: isBlocking ? reason : null,
        }
      );
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái khách hàng:", err);
    }
  };

  return (
    <div className="container p-3">
      <h2>Danh sách khách hàng</h2>

      {/* Bộ lọc */}
      <div className="row mb-3">
        <div className="col-md-6 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm theo tên khách hàng..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
        </div>
        <div className="col-md-6 mb-2">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="blocked">Đang bị chặn</option>
            <option value="unblocked">Không bị chặn</option>
          </select>
        </div>
      </div>

      <table className="table table-bordered table-hover mt-3">
        <thead className="table-secondary">
          <tr>
            <th>Tên</th>
            <th>SĐT</th>
            <th>Email</th>
            <th>Lý do chặn</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                Không có khách hàng.
              </td>
            </tr>
          ) : (
            filteredCustomers.map((customer) => (
              <tr key={customer.id_customer}>
                <td>{customer.name}</td>
                <td>{customer.phone}</td>
                <td>{customer.email}</td>
                <td>
                  {customer.status === false && customer.block_reason ? (
                    <span title={customer.block_reason}>⚠ {customer.block_reason}</span>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <button
                    className={`btn btn-sm ${
                      customer.status === false ? "btn-success" : "btn-danger"
                    }`}
                    onClick={() => openModal(customer, customer.status === true)}
                  >
                    {customer.status === false ? "Mở chặn" : "Chặn"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <BlockUnblockModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmStatusChange}
        customer={selectedCustomer}
        isBlocking={isBlocking}
      />
    </div>
  );
}
