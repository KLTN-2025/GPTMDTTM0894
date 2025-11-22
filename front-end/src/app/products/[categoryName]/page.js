import ProductList from "@/components/customers/categoryProduct/productList";
import ClientLayout from "@/components/layouts/Clientlayout";

async function getCategoryBySlug(slug) {
  const res = await fetch(`http://localhost:5000/api/categories/category-product/${slug}`, {
    cache: "no-store", // luôn lấy mới
  });

  if (!res.ok) throw new Error("Không tìm thấy danh mục");
  return res.json();
}

export async function generateMetadata({ params }) {
  const category = await getCategoryBySlug(params.categoryName);

  return {
    title: `${category.name} - Táo Bro`,
    description: `Danh mục sản phẩm ${category.name} tại Táo Bro.`,
  };
}


export default function ProductPage () {

    return(
        
        <ClientLayout>
                <ProductList />
        </ClientLayout>
        
    );

}