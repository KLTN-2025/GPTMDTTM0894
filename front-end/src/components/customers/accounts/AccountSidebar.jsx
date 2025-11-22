
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <div className="list-group">
      <Link
        href="/profile/UserDetail"
        className={`list-group-item list-group-item-action ${
          pathname === "/profile/UserDetail" ? "active" : ""
        }`}
      >
        Thông tin tài khoản
      </Link>
      <Link
        href="/profile/Address"
        className={`list-group-item list-group-item-action ${
          pathname === "/profile/Address" ? "active" : ""
        }`}
      >
        Thông tin địa chỉ
      </Link>
      <Link
        href="/profile/changePassword"
        className={`list-group-item list-group-item-action ${
          pathname === "/profile/changePassword" ? "active" : ""
        }`}
      >
        Thông tin mật khẩu
      </Link>
      <Link
        href="/profile/Review"
        className={`list-group-item list-group-item-action ${
          pathname === "/profile/Review" ? "active" : ""
        }`}
      >
        Sản phẩm đã được đánh giá
      </Link>
      <Link
        href="/profile/Order"
        className={`list-group-item list-group-item-action ${
          pathname === "/profile/Order" ? "active" : ""
        }`}
      >
        Đơn hàng đã đặt
      </Link>
    </div>
  );
}
