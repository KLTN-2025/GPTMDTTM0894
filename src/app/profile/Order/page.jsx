'use client';

import { useEffect, useState } from "react";
import OrderList from "@/components/customers/accounts/OrderList";
import { jwtDecode } from "jwt-decode";

export default function OrderListPage() {

    const [idCustomer, setIdCustomer] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
        try {
            const decoded = jwtDecode(token);
            setIdCustomer(decoded.id_customer);
        } catch (err) {
            console.error("Lỗi khi decode token:", err);
        }
        }
    }, []);

    return (

        <>
        <h4>Đơn hàng đã đặt </h4>
        <OrderList idCustomer={idCustomer}/>
        </>

    )

}