'use client';

import { useEffect, useState } from 'react';
import { Badge } from 'react-bootstrap';
import axios from 'axios';
import AddEmployeeModal from './EmployeeModal/add';
import EmployeeDetailModal from './EmployeeModal/view';
import UpdateEmployeeModal from './EmployeeModal/update';
import API_CONFIG from "@/config/api";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const [filter, setFilter] = useState({
    name: '',
    status: '',
    block: '',
    role: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(API_CONFIG.getApiUrl("/employees"));
      setEmployees(res.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhân viên:', error);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchName = emp.name.toLowerCase().includes(filter.name.toLowerCase());
    const matchStatus = filter.status ? String(emp.status) === filter.status : true;
    const matchBlock = filter.block !== '' ? String(emp.block) === filter.block : true;
    const matchRole = filter.role ? String(emp.role) === filter.role : true;

    return matchName && matchStatus && matchBlock && matchRole;
  });


  const handleOpenDetail = (id) => {
    setSelectedEmployeeId(id);
    setShowDetailModal(true);
  };

  const handleOpenUpdate = (id) => {
    setSelectedEmployeeId(id);
    setShowUpdateModal(true);
  };

  const handleCloseDetail = () => {
    setSelectedEmployeeId(null);
    setShowDetailModal(false);
  };

  const handleCloseUpdate = () => {
    setSelectedEmployeeId(null);
    setShowUpdateModal(false);
  };

  const roleMap = {
    1: <Badge bg="success">Super Admin</Badge>,
    2: <Badge bg="secondary">Seller</Badge>,
  };

  const statusMap = {
    1: <Badge bg="success">Đang đi làm</Badge>,
    2: <Badge bg="warning" text="dark">Đang nghỉ phép</Badge>,
    3: <Badge bg="secondary">Đã nghỉ làm</Badge>,
  };

  return (
    <div className="container p-3">
      <h2 className="d-flex justify-content-between align-items-center">
        Danh sách nhân viên
        <button className="btn btn-success btn-sm" onClick={() => setShowAddModal(true)}>
          Thêm nhân viên
        </button>
      </h2>

      {/* Bộ lọc */}
      <div className="row mb-3">
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo tên"
            value={filter.name}
            onChange={(e) => setFilter({ ...filter, name: e.target.value })}
          />
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="">-- Lọc trạng thái --</option>
            <option value="1">Đang đi làm</option>
            <option value="2">Nghỉ phép</option>
            <option value="3">Đã nghỉ</option>
          </select>
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={filter.block}
            onChange={(e) => setFilter({ ...filter, block: e.target.value })}
          >
            <option value="">-- Lọc chặn --</option>
            <option value="false">Hoạt động</option>
            <option value="true">Bị chặn</option>
          </select>
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={filter.role}
            onChange={(e) => setFilter({ ...filter, role: e.target.value })}
          >
            <option value="">-- Lọc vai trò --</option>
            <option value="1">Super Admin</option>
            <option value="2">Seller</option>
          </select>
        </div>
      </div>

      {/* Bảng danh sách */}
      <table className="table table-bordered table-hover mt-3">
        <thead className="table-secondary">
          <tr>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Trạng thái</th>
            <th>Chặn</th>
            <th>Vai trò</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                Không có nhân viên nào.
              </td>
            </tr>
          ) : (
            filteredEmployees.map((emp) => (
              <tr key={emp.id_employee}>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.phone}</td>
                <td>{statusMap[emp.status] || 'Không rõ'}</td>
                <td>
                  {emp.block ? (
                    <span className="badge bg-danger">Bị chặn</span>
                  ) : (
                    <span className="badge bg-success">Hoạt động</span>
                  )}
                </td>
                <td>{roleMap[emp.role] || 'Không rõ'}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary me-1"
                    onClick={() => handleOpenDetail(emp.id_employee)}
                  >
                    Xem thêm
                  </button>

                  {!emp.block && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleOpenUpdate(emp.id_employee)}
                    >
                      Sửa
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal chi tiết */}
      {showDetailModal && (
        <EmployeeDetailModal
          show={showDetailModal}
          onClose={handleCloseDetail}
          employeeId={selectedEmployeeId}
          onBlocked={() => {
            fetchEmployees();       // ✅ Load lại danh sách
            setShowDetailModal(false); // ✅ Đóng modal luôn sau chặn/bỏ chặn
          }}
        />
      )}

      {/* Modal thêm */}
      <AddEmployeeModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchEmployees();
          setShowAddModal(false);
        }}
      />

      {/* Modal cập nhật */}
      <UpdateEmployeeModal
        show={showUpdateModal}
        onClose={handleCloseUpdate}
        employeeId={selectedEmployeeId}
        onUpdated={fetchEmployees}
        
      />
    </div>
  );
}
