import ClientLayout from "@/components/layouts/Clientlayout";
import ProductDeatail from "@/components/customers/productDetail/product-Deail";

// ✅ Hàm fetch dữ liệu sản phẩm từ API
async function getProductDetail(slug) {
  console.log("Fetch product with slug:", slug);
  const res = await fetch(`http://localhost:5000/api/products/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Không tìm thấy sản phẩm");
  }

  const data = await res.json();

  return {
    ...data.product,
    attributes: data.attributes,
    skus: data.skus,
    product_imgs: data.images,
    specs: data.specs,
  };
}

// ✅ Metadata: set title động
export async function generateMetadata(propsPromise) {
  const { params } = await propsPromise; // 👈 await props

  const product = await getProductDetail(params.slug);

  return {
    title: `${product.products_name} - Táo Bro`,
    description: `Thông tin chi tiết sản phẩm ${product.products_name} tại Táo Bro.`,
  };
}

// ✅ Component chính
export default async function Page({ params }) {
  const product = await getProductDetail(params.slug);

  return (
    <ClientLayout>
      <ProductDeatail product={product}/>
    </ClientLayout>
  );
}
