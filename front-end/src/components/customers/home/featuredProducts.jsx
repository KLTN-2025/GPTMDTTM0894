import Image from "next/image";

export default function TopProduct() {
  return (
    <section className="bg-light">
      <div className="container py-5">
        <div className="row text-center py-3">
          <div className="col-lg-6 m-auto">
            <h1 className="h1">Top sản phẩm nổi bật</h1>
          </div>
        </div>

        <div className="row">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
              <div className="card h-100 shadow-sm border-0 rounded-4">
                <a href="shop-single.html">
                  <Image
                    src="/assets/image/iphone-16-pro-max-sa-mac-thumb-1.png"
                    className="card-img-top p-3 rounded-4"
                    alt="Iphone 16 Pro Max"
                    width={300}
                    height={300}
                  />
                </a>
                <div className="card-body text-center">
                  <h6 className="card-title mb-2">
                    <a
                      href="shop-single.html"
                      className="text-decoration-none text-dark"
                      style={{ fontWeight: "bolder" }}
                    >
                      iPhone 16 Pro Max
                    </a>
                  </h6>

                  {/* Price */}
                  <div className="mb-2">
                    <span className="text-danger fw-bold">30.000.000đ</span>
                    <span className="text-muted text-decoration-line-through small">
                      31.000.000đ
                    </span>
                  </div>

                  <a
                    href="shop-single.html"
                    className="btn btn-outline-dark btn-sm rounded-pill px-3"
                  >
                    Xem chi tiết
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
