"use client";
import Image from "next/image";
import Link from "next/link";

export default function NotFoundContent() {
  return (
    <section className="container py-5 text-center">
      <div className="row justify-content-center">
        <div className="col-md-8">

          

          {/* Tiêu đề */}
          <h1 className="display-4 fw-bold mb-3">404 - Không tìm thấy trang</h1>

          {/* Mô tả */}
          <p className="text-muted mb-4">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>

          {/* Hình ảnh minh họa 404 */}
          <div className="mb-4">
            <Image
              src="https://i.pinimg.com/originals/b2/2e/7b/b22e7b363991f08444230d2d3762a242.gif"
              alt="404 Not Found"
              width={400}
              height={300}
              className="img-fluid"
            />
          </div>

          {/* Nút quay về trang chủ */}
          <Link href="/" className="btn btn-dark rounded-pill px-4">
            Quay về trang chủ
          </Link>
        </div>
      </div>
    </section>
  );
}
