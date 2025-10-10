export const metadata = {
    title: "Đăng ký - Táo Bro",
    descriptors: "Đăng ký tài khoản",
}

import ClientLayout from "@/components/layouts/Clientlayout";
import SignUp from "@/components/customers/login/signUp";

export default function Register() {
    return(

        <ClientLayout>

        <SignUp />

        </ClientLayout>

    );
}