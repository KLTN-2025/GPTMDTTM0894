"use client";
import { useEffect, useRef } from "react";

export default function ProductGallery({ images = [], mainImage, setMainImage }) {
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    // reset trạng thái khi mainImage thay đổi (nếu muốn)
  }, [mainImage]);

  const onMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = "grabbing";
  };

  const onMouseLeave = () => {
    isDragging.current = false;
    scrollRef.current.style.cursor = "grab";
  };

  const onMouseUp = () => {
    isDragging.current = false;
    scrollRef.current.style.cursor = "grab";
  };

  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // tốc độ scroll khi kéo, *2 là nhanh hơn
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  if (!images || images.length === 0) {
    return <div className="text-muted">Không có ảnh sản phẩm</div>;
  }

  return (
    <div className="container">
      {/* Ảnh chính */}
      <div className="text-center mb-3">
        <img
          src={mainImage}
          alt="Ảnh sản phẩm chính"
          className="img-fluid rounded border shadow-sm"
          style={{ maxHeight: "500px", objectFit: "contain" }}
        />
      </div>

      {/* Ảnh thumbnail cuộn ngang có drag scroll */}
      <div
        ref={scrollRef}
        className="thumbnail-scroll"
        style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE 10+
          paddingBottom: "8px",
          cursor: "grab",
          userSelect: "none", // không cho bôi đen text khi kéo
        }}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      >
        {images.slice(0, 10).map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Ảnh nhỏ ${index}`}
            onClick={() => setMainImage(img)}
            className={`img-thumbnail rounded ${
              img === mainImage ? "border-primary" : "border-secondary"
            }`}
            style={{
              flex: "0 0 auto",
              width: "74px",
              height: "74px",
              objectFit: "cover",
              cursor: "pointer",
              borderWidth: img === mainImage ? "2px" : "1px",
              userSelect: "none", // tránh chọn ảnh khi kéo
            }}
          />
        ))}
      </div>

      {/* Ẩn thanh cuộn trên Chrome, Safari */}
      <style jsx>{`
        .thumbnail-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
