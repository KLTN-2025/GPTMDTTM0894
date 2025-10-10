import React from "react";

export default function RelatedProducts({ products }) {
  if (!products || products.length === 0) {
    return <p>Không có sản phẩm cùng loại.</p>;
  }

  return (
    <section className="py-5">
      <div className="container">
        <div className="row text-left p-2 pb-3">
          <h4>Sản phẩm cùng loại</h4>
        </div>

        <div id="carousel-related-product" className="d-flex flex-row flex-wrap gap-3">
          {products.map((product) => (
            <div key={product.id_products} className="p-2 pb-3" style={{ minWidth: "220px" }}>
              <div className="product-wap card rounded-0">
                <div className="card rounded-0 position-relative">
                  <img
                    className="card-img rounded-0 img-fluid"
                    src={
                      product.images?.[0]?.img_url || "/no-image.png"
                    }
                    alt={product.products_name}
                    style={{ height: 200, objectFit: "contain" }}
                  />
                </div>
                <div className="card-body text-center">
                  <a href={`/product/${product.id_products}`} className="h5 text-decoration-none d-block mb-2">
                    {product.products_name}
                  </a>
                  <p className="text-center mb-0 text-success fw-bold">
                    {Number(product.products_sale_price).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </p>
                  {product.products_market_price !== product.products_sale_price && (
                    <p className="text-center mb-0 text-muted text-decoration-line-through">
                      {Number(product.products_market_price).toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
