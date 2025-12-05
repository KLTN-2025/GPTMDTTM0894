"use client";

import Image from "next/image";
import Link from "next/link";

const formatVND = (value) => {
  return Number(value).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  });
};

const baseUrl = "http://localhost:5000";

export default function TopProduct({ products = [] }) {
  // Nếu không có sản phẩm, không hiển thị section
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="bg-light">
      <div className="container py-5">
        <div className="row text-center py-3">
          <div className="col-lg-6 m-auto">
            <h1 className="h1">Top sản phẩm nổi bật</h1>
          </div>
        </div>

        <div className="row">
          {products.map((product) => {
            const productId = product.id_products || product.products_id;
            const mainImageUrl = product.main_image_url;
            const mainImage = mainImageUrl 
              ? (mainImageUrl.startsWith("http") ? mainImageUrl : baseUrl + mainImageUrl)
              : "/no-image.png";
            const productName = product.products_name || "Không rõ";
            // ✅ Đảm bảo giá luôn là số
            const salePrice = Number(product.products_sale_price || product.sale_price || 0) || 0;
            const marketPrice = Number(product.products_market_price || product.market_price || 0) || 0;

            return (
              <div key={productId} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                <div className="card h-100 shadow-sm border-0 rounded-4">
                  <Link href={`/productDetail/${productId}`}>
                    <Image
                      src={mainImage}
                      className="card-img-top p-3 rounded-4"
                      alt={productName}
                      width={300}
                      height={300}
                      style={{ objectFit: "contain" }}
                    />
                  </Link>
                  <div className="card-body text-center">
                    <h6 className="card-title mb-2">
                      <Link
                        href={`/productDetail/${productId}`}
                        className="text-decoration-none text-dark"
                        style={{ fontWeight: "bolder" }}
                      >
                        {productName}
                      </Link>
                    </h6>

                    {/* Price */}
                    <div className="mb-2">
                      <span className="text-danger fw-bold">
                        {formatVND(salePrice)}
                      </span>
                      {marketPrice > salePrice && (
                        <span className="text-muted text-decoration-line-through small ms-2">
                          {formatVND(marketPrice)}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/productDetail/${productId}`}
                      className="btn btn-outline-dark btn-sm rounded-pill px-3"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
