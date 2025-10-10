'use client';
import { useState, useEffect } from "react";

export default function ProductImg({ images = [], mainImage = "" }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const initialIndex = mainImage
      ? images.findIndex((img) => img === mainImage)
      : 0;
    setSelectedIndex(initialIndex >= 0 ? initialIndex : 0);
  }, [mainImage, images]);

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) =>
      (prev - 1 + images.length) % images.length
    );
  };

  const selectedImage = images[selectedIndex];

  return (
    <div className="col-lg-5 mt-4 h-100">
      <div className="card h-100 shadow-sm position-relative">
        {selectedImage ? (
          <>
            <img
              className="w-100 img-fluid"
              src={selectedImage}
              alt="Main Product"
              style={{
                height: 400,
                objectFit: "contain",
                background: "#f9f9f9",
              }}
            />
            {/* Nút điều hướng trái */}
            {images.length > 1 && (
              <>
                <button
                  className="btn btn-sm btn-dark position-absolute top-50 start-0 translate-middle-y"
                  onClick={handlePrev}
                  style={{ zIndex: 2 }}
                >
                  &#8249;
                </button>
                <button
                  className="btn btn-sm btn-dark position-absolute top-50 end-0 translate-middle-y"
                  onClick={handleNext}
                  style={{ zIndex: 2 }}
                >
                  &#8250;
                </button>
              </>
            )}
          </>
        ) : (
          <div className="text-center p-5 text-muted">Chưa có ảnh hiển thị</div>
        )}
      </div>

      {/* Danh sách ảnh nhỏ */}
      {images.length > 1 && (
        <div className="mt-3 px-2" style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Thumbnail ${index}`}
              onClick={() => setSelectedIndex(index)}
              className={`img-thumbnail d-inline-block mx-1 ${
                selectedIndex === index
                  ? "border border-success border-3"
                  : "border"
              }`}
              style={{
                cursor: "pointer",
                height: 75,
                width: 75,
                objectFit: "cover",
                transition: "border 0.2s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
