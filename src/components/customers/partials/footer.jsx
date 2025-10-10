"use client";
import Script from "next/script";
import axios from "axios";
import Link from "next/link";
import { useState, useEffect } from "react";
import { API_CONFIG } from "@/config/api";

export default function FooterClient() {
  const [parentCategories, setParentCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(API_CONFIG.getApiUrl("/categories/parent"));
        setParentCategories(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <>
      <footer className="bg-dark" id="tempaltemo_footer">
        <div className="container">
          <div className="row">
            {/* Thông tin shop */}
            <div className="col-md-4 pt-5">
              <img
                className="text-success border-bottom pb-3 border-light logo"
                style={{ width: "auto", height: "100px" }}
                src="/assets/image/IMG_2254.jpg"
                alt="Logo"
              />
              <ul className="list-unstyled text-light footer-link-list">
                <li>
                  <i className="fas fa-map-marker-alt fa-fw"></i> Đẹp trai nhất Đà Nẵng
                </li>
                <li>
                  <i className="fa fa-phone fa-fw"></i>
                  <a className="text-decoration-none" href="tel:0777527125">
                    0777527125
                  </a>
                </li>
                <li>
                  <i className="fa fa-envelope fa-fw"></i>
                  <a className="text-decoration-none" href="mailto:tunlhpd09942@gmail.com">
                    tunlhpd09942@gmail.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Danh mục lấy động */}
            <div className="col-md-4 pt-5">
              <h2 className="h2 text-light border-bottom pb-3 border-light">Danh mục</h2>
              <ul className="list-unstyled text-light footer-link-list">
                {parentCategories.length > 0 ? (
                  parentCategories.map((cat) => (
                    <li key={cat.category_id}>
                      <Link href={`/products/${cat.name}`} className="text-decoration-none">
                        {cat.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li>Không có danh mục</li>
                )}
              </ul>
            </div>

            {/* Các trang */}
            <div className="col-md-4 pt-5">
              <h2 className="h2 text-light border-bottom pb-3 border-light">Các trang</h2>
              <ul className="list-unstyled text-light footer-link-list">
                <li>
                  <Link href="/" className="text-decoration-none">
                    Trang Chủ
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-decoration-none">
                    Liên hệ
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-decoration-none">
                    Đăng ký
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-decoration-none">
                    Đăng nhập
                  </Link>
                </li>
                <li>
                  <a className="text-decoration-none" href="#">
                    Giới thiệu
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Social + bản quyền */}
          <div className="row text-light mb-4">
            <div className="col-12 mb-3">
              <div className="w-100 my-3 border-top border-light"></div>
            </div>
            <div className="col-auto me-auto">
              <ul className="list-inline text-left footer-icons">
                {/* Social icons... */}
                {/* ...giữ nguyên*/}
              </ul>
            </div>
          </div>
        </div>

        <div className="w-100 bg-black py-3">
          <div className="container">
            <div className="row pt-2">
              <div className="col-12">
                <p className="text-left text-light">
                  Copyright &copy; 2025 TonyThuyTu | Designed by{" "}
                  <a rel="sponsored" href="https://github.com/TonyThuyTu" target="_blank">
                    Tonynguyen
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Import các script sau footer */}
      <Script src="/assets/js/jquery-1.11.0.min.js" strategy="beforeInteractive" />
      <Script src="/assets/js/jquery-migrate-1.2.1.min.js" strategy="beforeInteractive" />
      <Script src="/assets/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/templatemo.js" strategy="afterInteractive" />
      <Script src="/assets/js/custom.js" strategy="afterInteractive" />
    </>
  );
}
