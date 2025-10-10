'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Spinner, Form } from 'react-bootstrap';
import API_CONFIG from "@/config/api";

export default function EmployeeDetailModal({ show, onClose, employeeId, onBlocked }) {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (show && employeeId) {
      fetchEmployeeDetail(employeeId);
      setBlockReason('');
      setErrorMsg('');
    }
  }, [show, employeeId]);

  const fetchEmployeeDetail = async (id) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await axios.get(API_CONFIG.getApiUrl(`/employees/${id}`));
      setEmployee(res.data);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết nhân viên:', error);
      setErrorMsg('Không thể tải thông tin nhân viên.');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!blockReason.trim()) return;

    try {
      setProcessing(true);
      setErrorMsg('');

      await axios.put(API_CONFIG.getApiUrl(`/employees/block/${employeeId}`), {
        block: 1,
        reason: blockReason.trim(),
      });

      if (onBlocked) onBlocked();
      onClose();
    } catch (error) {
      console.error('Lỗi khi chặn nhân viên:', error);
      setErrorMsg(error?.response?.data?.message || 'Có lỗi xảy ra khi chặn nhân viên');
    } finally {
      setProcessing(false);
    }
  };

  const handleUnblock = async () => {
    try {
      setProcessing(true);
      setErrorMsg('');

      await axios.put(API_CONFIG.getApiUrl(`/employees/block/${employeeId}`), {
        block: 0,
        reason: '',
      });

      if (onBlocked) onBlocked();
      onClose();
    } catch (error) {
      console.error('Lỗi khi bỏ chặn nhân viên:', error);
      setErrorMsg(error?.response?.data?.message || 'Có lỗi xảy ra khi bỏ chặn nhân viên');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>Chi tiết nhân viên</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading && (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" />
          </div>
        )}

        {!loading && errorMsg && (
          <div className="alert alert-danger" role="alert">
            {errorMsg}
          </div>
        )}

        {!loading && employee && (
          <>
            <p><strong>Họ tên:</strong> {employee.name}</p>
            <p><strong>Giới tính:</strong> {employee.gender === 1 ? 'Nam' : 'Nữ'}</p>
            <p><strong>Email:</strong> {employee.email}</p>
            <p><strong>Số điện thoại:</strong> {employee.phone}</p>
            <p><strong>Vị trí:</strong> {employee.position || 'Chưa cập nhật'}</p>
            <p><strong>Quyền:</strong> {employee.role === 1 ? 'Super Admin' : 'Seller'}</p>
            <p><strong>Trạng thái:</strong>{' '}
              {employee.block ? (
                <span className="text-danger">Bị chặn</span>
              ) : employee.status === 3 ? (
                <span className="text-warning">Nghỉ việc</span>
              ) : (
                <span className="text-success">Hoạt động</span>
              )}
            </p>
            {employee.block && (
              <p><strong>Lý do chặn:</strong> {employee.block_reason || 'Không có'}</p>
            )}

            {/* Nếu không phải Super Admin và chưa bị chặn thì hiển thị nhập lý do + nút chặn */}
            {employee.role !== 1 && !employee.block && (
              <Form.Group controlId="blockReason" className="mb-3">
                <Form.Label>Lý do chặn</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Nhập lý do chặn nhân viên"
                  disabled={processing}
                />
              </Form.Group>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading || processing}>
          Đóng
        </Button>

        {employee && employee.role !== 1 && !employee.block && (
          <Button
            variant="danger"
            onClick={handleBlock}
            disabled={processing || !blockReason.trim()}
          >
            {processing ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                /> Đang chặn...
              </>
            ) : (
              'Chặn nhân viên'
            )}
          </Button>
        )}

        {employee && employee.role !== 1 && employee.block && (
          <Button
            variant="success"
            onClick={handleUnblock}
            disabled={processing}
          >
            {processing ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                /> Đang bỏ chặn...
              </>
            ) : (
              'Bỏ chặn'
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
