"use client";
import ClientLayout from "@/components/layouts/Clientlayout";
import AccountSidebar from "@/components/customers/accounts/AccountSidebar";
import EmailSubscribe from "@/components/customers/home/subscribeFrom";

export default function ProfileLayout({ children }) {

    return (

        <ClientLayout>


            <section className="container my-5">

                <div className="row">

                    <aside className="col-md-3 col-lg-3">

                    <AccountSidebar />

                    </aside>

                    <div className="col-md-9 col-lg-9">{children}</div>

                </div>

            </section>

        <EmailSubscribe />

        </ClientLayout>
  );

}