"use client";

import { useEffect, useState, useMemo } from "react";

export default function Banner() {
  const [banners, setBanners] = useState([]);
  const primaryBanner = useMemo(() => banners.find((b) => b.is_primary === 1), [banners]);
  const otherBanners = useMemo(() => banners.filter((b) => b.is_primary === 0 && b.type === 1), [banners]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/banner");
        const data = await res.json();
        setBanners(data || []);
      } catch (error) {
        console.error("Lỗi khi tải banner:", error);
      }
    };

    fetchBanners();
  }, []);

  if (!primaryBanner) {
    return <div className="text-center py-5">Đang tải banner...</div>;
  }

  const isVideo = primaryBanner.type === 2;

  return (
    <div className="w-100">
      {/* === Banner chính === */}
      <div className="banner-container w-100 mb-1">
        {isVideo ? (
          <video
            className="w-100"
            src={`http://localhost:5000/uploads/${primaryBanner.banner_img}`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{ maxHeight: "700px", objectFit: "cover" }}
          />
        ) : (
          <img
            className="w-100"
            src={`http://localhost:5000/uploads/${primaryBanner.banner_img}`}
            alt="Banner chính"
            style={{ maxHeight: "600px", objectFit: "cover" }}
          />
        )}
      </div>

      {/* === Carousel ảnh phụ === */}
      {otherBanners.length > 0 && (
        <div
          id="secondaryBannerCarousel"
          className="carousel slide mx-auto mb-3"
          data-bs-ride="carousel"
          data-bs-interval="3000"
          style={{ maxWidth: "100%", width: "100%" }}
        >
          <div className="carousel-inner">
            {chunkArray(otherBanners, 3).map((group, idx) => (
              <div
                key={idx}
                className={`carousel-item ${idx === 0 ? "active" : ""}`}
              >
                <div className="d-flex justify-content-center flex-wrap gap-2 px-3">
                  {group.map((banner) => (
                    <img
                      key={banner.id_banner}
                      src={`http://localhost:5000/uploads/${banner.banner_img}`}
                      alt={`Banner ${banner.id_banner}`}
                      style={{
                        height: "300px",
                        objectFit: "cover",
                        width: group.length === 1 ? "300px" : "32%",
                        borderRadius: "6px",
                        transition: "all 0.3s ease-in-out",
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Mũi tên điều hướng */}
          <button
            className="carousel-control-prev custom-arrow"
            type="button"
            data-bs-target="#secondaryBannerCarousel"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon custom-icon" aria-hidden="true" />
            <span className="visually-hidden">Previous</span>
          </button>

          <button
            className="carousel-control-next custom-arrow"
            type="button"
            data-bs-target="#secondaryBannerCarousel"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon custom-icon" aria-hidden="true" />
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Hàm chia mảng thành từng nhóm nhỏ
function chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
