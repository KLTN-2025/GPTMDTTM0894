import ClientLayout from "@/components/layouts/Clientlayout";
import Banner from "@/components/customers/home/banner";
import TopProduct from "@/components/customers/home/featuredProducts";
import CategoryProduct from "@/components/customers/home/categoryProducts";
import EmailSubscribe from "@/components/customers/home/subscribeFrom";
export default function Home() {
  return (
    <ClientLayout>
      <Banner />
      <TopProduct />
      <CategoryProduct />
      <EmailSubscribe />
    </ClientLayout>
  );
}
