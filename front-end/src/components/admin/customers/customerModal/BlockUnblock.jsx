import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const BlockUnblockModal = ({ show, onClose, onConfirm, customer, isBlocking }) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isBlocking) {
      setReason(""); // Khi mở modal chặn thì reset lý do
    } else {
      setReason(""); // Khi mở modal mở chặn thì không cần lý do
    }
  }, [show, isBlocking]);

  const handleConfirm = () => {
    if (isBlocking && !reason.trim()) return; // Validate khi chặn phải có lý do
    onConfirm(reason.trim());
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{isBlocking ? "Chặn khách hàng" : "Mở chặn khách hàng"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Bạn có chắc muốn <strong>{isBlocking ? "chặn" : "mở chặn"}</strong> khách hàng <strong>{customer?.name}</strong>?
        </p>
        {isBlocking ? (
          <Form.Group>
            <Form.Label>Lý do chặn</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do chặn"
              autoFocus
            />
          </Form.Group>
        ) : (
          <p><em>Lý do chặn sẽ được xóa khỏi hệ thống.</em></p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button variant={isBlocking ? "danger" : "success"} onClick={handleConfirm} disabled={isBlocking && !reason.trim()}>
          {isBlocking ? "Xác nhận chặn" : "Xác nhận mở chặn"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BlockUnblockModal;
