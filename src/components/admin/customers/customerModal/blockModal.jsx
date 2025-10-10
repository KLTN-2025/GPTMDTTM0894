import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const BlockModal = ({ show, onClose, onConfirm, customer, reason, setReason }) => {
  return (
    <Modal show={show} onHide={onClose} centered backdrop={true}>
      <Modal.Header closeButton>
        <Modal.Title>Chặn khách hàng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Bạn có chắc muốn chặn khách hàng <strong>{customer?.name}</strong>?</p>
        <Form.Group className="mt-3">
          <Form.Label>Lý do chặn</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do chặn"
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={!reason.trim()}>
          Xác nhận chặn
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BlockModal;
