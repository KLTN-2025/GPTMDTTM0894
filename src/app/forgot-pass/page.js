export const metadata = {
    title: "Quên mật khẩu - Táo Bro",
    descriptors: "Quên mật khẩu",
}

import ClientLayout from "@/components/layouts/Clientlayout";
import ForgotPass from "@/components/customers/login/forgotPass";

export default function Forgot_Pass() {

    return(

        <ClientLayout>

            <ForgotPass />

        </ClientLayout>

    );

}