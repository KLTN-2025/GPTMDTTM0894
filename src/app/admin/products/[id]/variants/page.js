import ProductVariantsPage from "@/components/admin/products/form/ProductVariantsPage";

export const metadata = {
  title: "Quản lý biến thể sản phẩm - Táo Bro",
  description: "Quản lý thuộc tính và biến thể sản phẩm",
};

export default async function ProductVariants({ params }) {
  const { id } = await params;
  return <ProductVariantsPage productId={id} />;
}
