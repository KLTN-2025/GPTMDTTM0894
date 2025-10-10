"use client";

import { useEffect, useState, useMemo } from "react";
import { API_CONFIG } from "@/config/api";

export default function Banner() {
  const [banners, setBanners] = useState([]);
  const primaryBanner = useMemo(() => banners.find((b) => b.is_primary === 1), [banners]);
  const otherBanners = useMemo(() => banners.filter((b) => b.is_primary === 0 && b.type === 1), [banners]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(API_CONFIG.getApiUrl("/banner"));
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
    <section className="banner-section mb-5">
      {/* === Banner chính === */}
      <div className="banner-container w-100 mb-4 position-relative overflow-hidden rounded-4 shadow-lg">
        {isVideo ? (
          <video
            className="w-100 banner-media"
            src={`${API_CONFIG.BACKEND_URL}/uploads/${primaryBanner.banner_img}`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{ maxHeight: "600px", objectFit: "cover" }}
          />
        ) : (
          <img
            className="w-100 banner-media"
            src={`${API_CONFIG.BACKEND_URL}/uploads/${primaryBanner.banner_img}`}
            alt="Banner chính"
            style={{ maxHeight: "600px", objectFit: "cover" }}
          />
        )}
        
        {/* Banner Overlay Content */}
        <div className="banner-overlay position-absolute bottom-0 start-0 w-100 p-4 text-white">
          <div className="container">
            <div className="row">
              <div className="col-lg-6">
                <div className="banner-content">
                  <div className="badge bg-warning text-dark mb-2 px-3 py-1">
                    🔥 Sản phẩm mới
                  </div>
                  <h3 className="fw-bold mb-2">Khám phá Apple mới nhất</h3>
                  <p className="mb-3 opacity-90">Trải nghiệm công nghệ đỉnh cao với giá tốt nhất</p>
                  <button className="btn btn-warning rounded-pill px-4">
                    Mua ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                      src={`${API_CONFIG.BACKEND_URL}/uploads/${banner.banner_img}`}
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
      
      <style jsx>{`
        .banner-media {
          transition: transform 0.3s ease;
        }
        
        .banner-container:hover .banner-media {
          transform: scale(1.02);
        }
        
        .banner-overlay {
          background: linear-gradient(transparent, rgba(0,0,0,0.7));
        }
        
        .custom-arrow {
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          border: none;
          width: 50px;
          height: 50px;
        }
        
        .custom-arrow:hover {
          background: rgba(255,255,255,0.4);
        }
        
        .custom-icon {
          filter: invert(1);
        }
        
        .carousel-item img:hover {
          transform: scale(1.05);
          filter: brightness(1.1);
        }
      `}</style>
    </section>
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
