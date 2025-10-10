// src/components/layouts/ProfileLayout.jsx

"use client";


import { usePathname } from "next/navigation";

export default function ProfileLayout({ children }) {
  const pathname = usePathname();

  return (
    <section className="container my-5">
      <div className="row">
        {/* Sidebar */}
        <nav className="col-md-3 col-lg-3" id="accountSidebar">
          <div className="list-group">

            <a
              href="/profile/UserDetail"
              className={`list-group-item list-group-item-action ${
                pathname === "/profile/UserDetail" ? "active" : ""
              }`}
            >
              Thông tin tài khoản
            </a>

            <a
              href="/profile/Address"
              className={`list-group-item list-group-item-action ${
                pathname === "/profile/Address" ? "active" : ""
              }`}
            >
              Thông tin địa chỉ
            </a>

            <a
              href="/profile/Password"
              className={`list-group-item list-group-item-action ${
                pathname === "/profile/Password" ? "active" : ""
              }`}
            >
              Thông tin mật khẩu
            </a>

            <a
              href="/profile/Review"
              className={`list-group-item list-group-item-action ${
                pathname === "/profile/Review" ? "active" : ""
              }`}
            >
              Sản phẩm đã từng đánh giá
            </a>
            
          </div>
        </nav>

        {/* Nội dung chính */}
        <div className="col-md-9 col-lg-9">{children}</div>
      </div>
    </section>
  );
}
