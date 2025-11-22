import React from "react";
import { Modal, Button } from "react-bootstrap";

const UnblockModal = ({ show, onClose, onConfirm, customer }) => {
  return (
    <Modal show={show} onHide={onClose} backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>Mở chặn khách hàng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Bạn có chắc muốn <strong>mở chặn</strong> khách hàng <strong>{customer?.name}</strong>?</p>
        <p><em>Lý do chặn sẽ được xóa khỏi hệ thống.</em></p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="success" onClick={onConfirm}>
          Xác nhận mở chặn
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UnblockModal;
