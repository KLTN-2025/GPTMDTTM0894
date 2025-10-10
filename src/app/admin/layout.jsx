"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/partials/sidebar";
import AdminHeader from "@/components/admin/partials/header";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true); // Tránh nháy layout

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    // console.log("🔐 TOKEN:", token);
    if (!token) {
      router.push("/login-admin/login");
    } else {
      setIsAuthenticated(true);
    }
    setCheckingAuth(false);
  }, [router]);

  if (checkingAuth) {
    return null; // hoặc spinner cũng được
  }

  if (!isAuthenticated) {
    return null; // Không render gì nếu chưa xác thực
  }

  return (
    <div className="d-flex" style={{ height: "100vh", overflow: "hidden" }}>
      <AdminSidebar />
      <div className="flex-grow-1 d-flex flex-column">
        <AdminHeader />
        <main className="flex-grow-1 p-4" style={{ overflowY: "auto", backgroundColor: "#f8f9fa" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
