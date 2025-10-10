// pages/contact.js

export const metadata = {
  title: "Liên hệ - Táo Bro",
  description: "Liên hệ với Táo Bro để được hỗ trợ.",
};

import Contact from "@/components/customers/contact/contactMe";

import ClientLayout from "@/components/layouts/Clientlayout";

export default function ContactMe() {

  return (

    <>

      <ClientLayout>

        <Contact />

      </ClientLayout>

    </>

  );

}
