export const metadata = {
    title: "Cảm ơn đã mua hàng - Táo Bro",
    descriptors: "Cảm ơn",
}

import ClientLayout from "@/components/layouts/Clientlayout"
import ThankYouPage from "@/components/customers/thankyou/thankyou"

export default function ThankYou() {

    return(

        <ClientLayout >

            <ThankYouPage />

        </ClientLayout>

    )

}
