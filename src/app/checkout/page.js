export const metadata = {
  title: "Thanh toán - Táo Bro",
  description: "Thanh toán",
};

import ClientLayout from "@/components/layouts/Clientlayout";
import CheckoutPage from "@/components/customers/checkout/checkoutPage";

export default function CheckOut() {

    return (

        <>
        
            <ClientLayout>

                <CheckoutPage />

            </ClientLayout>

        </>

    )

}