import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";

export default function BannerModal({
  show,
  onClose,
  onSubmit,
  initialImageUrl,
  isEdit,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [type, setType] = useState(1); // 1 = ảnh, 2 = video
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (show) {
      setSelectedFile(null);
      setPreview(initialImageUrl || null);

      // Xác định type từ file gốc (nếu có)
      if (initialImageUrl) {
        const extension = initialImageUrl.split(".").pop().toLowerCase();
        const isVideo = ["mp4", "webm", "ogg"].includes(extension);
        setType(isVideo ? 2 : 1);
      } else {
        setType(1);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  }, [show, initialImageUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith("image");
    const isVideo = file.type.startsWith("video");

    const isValid = (type === 1 && isImage) || (type === 2 && isVideo);

    if (!isValid) {
      toast.error(`Chỉ được chọn ${type === 1 ? "ảnh" : "video"} hợp lệ`);
      setSelectedFile(null);
      setPreview(initialImageUrl || null); // fallback lại ảnh ban đầu
      if (fileInputRef.current) fileInputRef.current.value = null;
      return;
    }

    // Validate file size
    const fileSizeInMB = file.size / (1024 * 1024);

    let minSize = 0;
    let maxSize = 0;

    if (type === 1) {
      // Ảnh
      minSize = 0;   // tối thiểu 2MB
      maxSize = 2;   // ví dụ thêm max 5MB để tránh ảnh quá nặng
    } else {
      // Video
      minSize = 0;  // tối thiểu 10MB
      maxSize = 10;  // tối đa 20MB
    }

    if (fileSizeInMB < minSize) {
      toast.error(
        `${type === 1 ? "Ảnh" : "Video"} phải có dung lượng tối thiểu ${minSize}MB. File hiện tại: ${fileSizeInMB.toFixed(2)}MB`
      );
      setSelectedFile(null);
      setPreview(initialImageUrl || null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      return;
    }

    if (fileSizeInMB > maxSize) {
      toast.error(
        `${type === 1 ? "Ảnh" : "Video"} không được vượt quá ${maxSize}MB. File hiện tại: ${fileSizeInMB.toFixed(2)}MB`
      );
      setSelectedFile(null);
      setPreview(initialImageUrl || null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      return;
    }

    if (fileSizeInMB < minSize) {
      toast.error(`File banner phải có dung lượng tối thiểu ${minSize}MB. File hiện tại: ${fileSizeInMB.toFixed(2)}MB`);
      setSelectedFile(null);
      setPreview(initialImageUrl || null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      return;
    }

    if (fileSizeInMB > maxSize) {
      toast.error(`File banner không được vượt quá ${maxSize}MB. File hiện tại: ${fileSizeInMB.toFixed(2)}MB`);
      setSelectedFile(null);
      setPreview(initialImageUrl || null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    if (!selectedFile && !isEdit) {
      toast.error("Vui lòng chọn file để upload");
      return;
    }
    onSubmit(selectedFile, type);
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Sửa Banner" : "Thêm Banner"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Loại banner</Form.Label>
          <Form.Select
            value={type}
            onChange={(e) => {
              setType(Number(e.target.value));
              setSelectedFile(null);
              setPreview(null);
              if (fileInputRef.current) fileInputRef.current.value = null;
            }}
          >
            <option value={1}>Ảnh</option>
            <option value={2}>Video</option>
          </Form.Select>
        </Form.Group>

        <Form.Group>
          <Form.Label>Chọn {type === 1 ? "ảnh" : "video"}</Form.Label>
          <Form.Control
            ref={fileInputRef}
            type="file"
            accept={type === 1 ? "image/*" : "video/*"}
            onChange={handleFileChange}
          />
        </Form.Group>

        {preview && (
          <div className="mt-3 text-center">
            {type === 2 ? (
              <video
                src={preview}
                controls
                style={{
                  width: "100%",
                  maxWidth: 400,
                  height: 200,
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            ) : (
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: "100%",
                  maxWidth: 400,
                  height: 200,
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {isEdit ? "Cập nhật" : "Thêm mới"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
