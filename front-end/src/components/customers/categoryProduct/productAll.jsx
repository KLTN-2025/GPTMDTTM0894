import React from "react";

function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function ProductGrid({ products = [] }) {
  
  const formatVND = (number) => {
    const value = Number(number);
    if (isNaN(value)) return "0₫";
    return value.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    });
  };

  const getImageUrl = (img) => {
    if (!img) return "https://thumbs.dreamstime.com/b/no-image-available-icon-flat-vector-no-image-available-icon-flat-vector-illustration-132482953.jpg";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/uploads/")) {
      return `http://localhost:5000${img}`;
    }
    return `http://localhost:5000/uploads/${img}`;
  };

  if (!products || products.length === 0) {
    return <div className="text-center py-5">Không có sản phẩm nào.</div>;
  }

  return (
    <section className="product-grid-section">
      <div className='grid'>
        {products.map((product, i) => {
          const mainImg =
            product?.images?.find((img) => img.is_main)?.Img_url ||
            product?.images?.[0]?.Img_url ||
            null;

          const imgUrl = getImageUrl(mainImg);
          // const slug = product.slug || toSlug(product.products_name);

          return (
            <div key={product.id_products || i} className='product-card'>
              <a href={`/productDetail/${product.products_slug || toSlug(product.products_name)}`}>
                <img src={imgUrl} alt={product.products_name} />
              </a>
              <h3>{product.products_name}</h3>
              <p> Giá chỉ từ {formatVND(product.market_price)}</p>
              <div className="buttons-buy">
                <a href={`/productDetail/${product.products_slug || toSlug(product.products_name)}`}>
                  Xem chi tiết
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
