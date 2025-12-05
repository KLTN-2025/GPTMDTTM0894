"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

import BannerCategory from "./bannerCategory";
import CategoryChildren from "./categoryChildren";
import ProductFilter from "./productFilter";
import ProductGrid from "./productAll";

export default function ProductList() {
  const params = useParams();
  const categoryId = params?.categoryName; // categoryName giờ là category_id

  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!categoryId) return;

    const fetchCategoryDetail = async () => {
      setLoading(true);
      try {
        // ✅ Gọi API với category_id
        const res = await axios.get(
          `http://localhost:5000/api/categories/category-product/${categoryId}`
        );
        setCategoryData(res.data);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
        setCategoryData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetail();
  }, [categoryId]);

  if (loading) 
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );

  if (!categoryData) return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );

  return (
    <div className="mb-5">
      {/* Banner danh mục cha */}
      <BannerCategory 
      bannerImg={categoryData.img} 
      title={categoryData.name} 
      name={categoryData.name}
      subText={categoryData.note || "Khám phá sản phẩm"}
      />

      {/* Danh mục con */}
      <CategoryChildren childrenCategories={categoryData.children} />

      {/* Hiển thị sản phẩm */}
      <ProductFilter />
      <ProductGrid products={categoryData.products} />
    </div>
  );
}
