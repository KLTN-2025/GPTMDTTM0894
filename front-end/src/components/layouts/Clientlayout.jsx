// src/components/layouts/ClientLayout.jsx
'use client';
import HeaderClient from "../customers/partials/header";
import FooterClient from "../customers/partials/footer";

export default function ClientLayout({ children }) {
  return (
    <>
      <HeaderClient />
      <main>{children}</main>
      <FooterClient />
    </>
  );
}
