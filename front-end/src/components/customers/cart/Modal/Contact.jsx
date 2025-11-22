// components/ContactWarningModal.js
import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useRouter } from "next/navigation";

export default function ContactWarningModal({ show, onHide }) {
  const router = useRouter();

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Liên hệ đặt hàng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Một số sản phẩm trong giỏ hàng có số lượng lớn hơn 10. 
        Vui lòng liên hệ với cửa hàng để đặt hàng riêng.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
        <Button variant="primary" onClick={() => router.push("/contact")}>
          Đi tới trang liên hệ
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
