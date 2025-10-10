'use client';
import { useState } from 'react';

export default function ProductDescription({ description }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="container feature-grid" id="features">
      <h2 className="text-center">Mô tả sản phẩm</h2>
      <article className="feature single-column-feature">
        {/* Phần mô tả sản phẩm */}
        <div
          className={`product-description ${expanded ? 'expanded' : 'collapsed'}`}
        >
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </div>

        {/* Nút đọc thêm đặt ở ngoài, bên dưới và căn giữa */}
        <div className="text-center mt-3">
          <button
            className="btn btn-outline-primary"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Thu gọn' : 'Đọc thêm'}
          </button>
        </div>
      </article>
    </section>
  );
}
