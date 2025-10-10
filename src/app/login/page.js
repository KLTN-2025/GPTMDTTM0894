export const metadata = {
    title: "Đăng nhập - Táo Bro",
    descriptors: "Đăng nhập tài khoản",
}

import ClientLayout from "@/components/layouts/Clientlayout";
import SginIn from "@/components/customers/login/sginIn";


export default function Login() {
    return(
        <ClientLayout>
        
        <SginIn />

        </ClientLayout>
    );
}