// src/app/profile/page.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectToDefault() {
  const router = useRouter();

  useEffect(() => {
    router.push("/profile/UserDetail");
  }, [router]);

  return null; // hoặc loading spinner nếu muốn
}
