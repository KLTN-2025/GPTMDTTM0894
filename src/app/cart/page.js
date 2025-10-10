export const metadata = {
  title: "Giỏ hàng - Táo Bro",
  description: "Liên hệ với Táo Bro để được hỗ trợ.",
};

import CartWrapper from "@/components/customers/cart/cart";

import ClientLayout from "@/components/layouts/Clientlayout";

export default function Cart() {
    
    return (
    
        <>
    
          <ClientLayout>
    
            <CartWrapper />
    
          </ClientLayout>
    
        </>
    
      );

}