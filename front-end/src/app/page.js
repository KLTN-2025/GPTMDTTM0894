import ClientLayout from "@/components/layouts/Clientlayout";
import Banner from "@/components/customers/home/banner";
import TopProduct from "@/components/customers/home/featuredProducts";
import CategoryProduct from "@/components/customers/home/categoryProducts";
import EmailSubscribe from "@/components/customers/home/subscribeFrom";

// ✅ 1. Hàm fetch dữ liệu Top Products từ Server Backend
async function getTopProducts() {
    try {
        // Gọi API Backend. Sử dụng cache: 'no-store' để buộc Next.js lấy dữ liệu mới nhất
        const res = await fetch('http://localhost:5000/api/products/top-products', { 
            cache: 'no-store' 
        });

        if (!res.ok) {
            // Log lỗi nếu API thất bại (ví dụ: lỗi 500)
            console.error("Lỗi khi fetch Top Products:", res.status);
            return [];
        }

        const data = await res.json();
        // API trả về { products: [...] } hoặc chỉ là mảng
        return data.products || data || []; 

    } catch (error) {
        // Log lỗi mạng hoặc lỗi server side khác
        console.error("Lỗi mạng/Server khi gọi Top Products:", error);
        return [];
    }
}

// ✅ 2. Component Trang Chủ (Server Component)
export default async function Home() {
    // Gọi hàm fetch dữ liệu
    const topProducts = await getTopProducts(); 
    
    // Log số lượng sản phẩm để kiểm tra trên Terminal Backend/VS Code Console
    console.log("Sản phẩm Top (đã fetch):", topProducts.length); 

    return (
        <ClientLayout>
            {/* 1. Banner */}
            <Banner/>
        
            {/* 2. Truyền dữ liệu vào TopProduct */}
            {/* Component này sẽ render danh sách nếu topProducts có dữ liệu */}
            <TopProduct products={topProducts} />

            {/* 3. Category và Subscribe */}
            <CategoryProduct/>

            <EmailSubscribe/>
        </ClientLayout>
    );
}