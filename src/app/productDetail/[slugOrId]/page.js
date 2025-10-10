import ClientLayout from "@/components/layouts/Clientlayout";
import ProductDeatail from "@/components/customers/productDetail/product-Deail";
import API_CONFIG from "@/config/api";
  
async function getProductDetail(slugOrId) {
  try {
    const res = await fetch(API_CONFIG.getApiUrl(`/products/${slugOrId}`), {
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Sản phẩm không tồn tại");
      }
      throw new Error("Lỗi khi tải sản phẩm");
    }

    const data = await res.json();

    if (!data.product) {
      throw new Error("Dữ liệu sản phẩm không hợp lệ");
    }

    return {
      ...data.product,
      attributes: data.attributes || [],
      skus: data.skus || [],
      product_imgs: data.images || [],
      specs: data.specs || [],
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export default async function Page({ params }) {
  try {
    const product = await getProductDetail(params.slugOrId);

    return (
      <ClientLayout>
        <ProductDeatail product={product}/>
      </ClientLayout>
    );
  } catch (error) {
    return (
      <ClientLayout>
        <div className="container py-5">
          <div className="text-center">
            <h1 className="display-4 text-danger mb-4">Oops!</h1>
            <p className="lead mb-4">{error.message}</p>
            <a href="/" className="btn btn-primary">
              Về trang chủ
            </a>
          </div>
        </div>
      </ClientLayout>
    );
  }
}

