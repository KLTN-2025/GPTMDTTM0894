"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

export default function CategoryProduct() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/categories/home")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Lỗi khi load homepage:", err));
  }, []);

  const baseUrl = "http://localhost:5000";

  return (
    <section className="bg-light">
      <div className="container py-2">
        {categories.map((cat) => (
          <div key={cat.category_id}>
            {/* Tiêu đề danh mục */}
            <div className="row text-center py-3">
              <div className="col-lg-6 m-auto">
                <h1 className="h1">{cat.name}</h1>
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="row">
              {(cat.products || []).map((product) => {
                // Lấy ảnh đại diện: ảnh đầu tiên is_main=true hoặc ảnh đầu tiên
                const mainImage =
                  product.images?.find((img) => img.is_main) || product.images?.[0];
                const imageUrl = mainImage ? baseUrl + mainImage.Img_url : "/https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

                return (
                  <div
                    key={product.id_products}
                    className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
                  >
                    <div className="card h-100 shadow-sm border-0 rounded-4">
                      <a href={`//productDetail/${product.products_slug || product.id_products}`}>
                        <Image
                          src={imageUrl}
                          className="card-img-top p-3 rounded-4"
                          alt={product.products_name}
                          width={300}
                          height={300}
                          style={{ objectFit: "contain" }}
                        />
                      </a>
                      <div className="card-body text-center">
                        <h6 className="card-title mb-2">
                          <a
                            href={`/productDetail/${product.slug || product.id_products}`}
                            className="text-decoration-none text-dark fw-bold"
                          >
                            {product.products_name}
                          </a>
                        </h6>

                        <div className="mb-2">
                          <span className="text-danger fw-bold">
                            {parseInt(product.products_sale_price).toLocaleString("vi-VN")}đ
                          </span>{" "}
                          <span className="text-muted text-decoration-line-through small">
                            {parseInt(product.products_market_price).toLocaleString("vi-VN")}đ
                          </span>
                        </div>

                        <a
                          href={`/productDetail/${product.slug || product.id_products}`}
                          className="btn btn-outline-dark btn-sm rounded-pill px-3"
                        >
                          Xem chi tiết
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Nút xem thêm danh mục */}
            <div className="row mt-3">
              <div className="col text-center">
                <a href={`/products/${cat.name}`} className="btn btn-primary btn-lg px-5">
                  Xem tất cả {cat.name}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
