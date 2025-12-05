import ProductList from "@/components/customers/categoryProduct/productList";
import ClientLayout from "@/components/layouts/Clientlayout";

async function getCategoryById(categoryId) {
  const res = await fetch(`http://localhost:5000/api/categories/category-product/${categoryId}`, {
    cache: "no-store", // luôn lấy mới
  });

  if (!res.ok) throw new Error("Không tìm thấy danh mục");
  return res.json();
}

export async function generateMetadata({ params }) {
  try {
    const categoryId = params.categoryName; // categoryName giờ là ID
    const category = await getCategoryById(categoryId);

    return {
      title: `${category.name} - Táo Bro`,
      description: `Danh mục sản phẩm ${category.name} tại Táo Bro.`,
    };
  } catch (error) {
    return {
      title: `Sản phẩm - Táo Bro`,
      description: `Danh mục sản phẩm tại Táo Bro.`,
    };
  }
}


export default function ProductPage () {

    return(
        
        <ClientLayout>
                <ProductList />
        </ClientLayout>
        
    );

}