// components/loading/RouteLoading.jsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useTransition, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

export default function RouteLoadingProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    setShowLoading(true);

    const timeout = setTimeout(() => {
      setShowLoading(false);
    }, 400); // giữ loading tối thiểu 400ms

    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      {(isPending || showLoading) && <LoadingSpinner />}
      {children}
    </>
  );
}
