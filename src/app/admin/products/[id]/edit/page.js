'use client';
import EditProductPage from "@/components/admin/products/form/EditProductPage";

export default function Page({ params }) {
  return <EditProductPage productId={params.id} />;
}
