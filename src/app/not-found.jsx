import ClientLayout from "@/components/layouts/Clientlayout";
import NotFoundContent from "@/components/customers/errors/NotFoundContent";

export const metadata = {
  title: "404 - Táo Bro",
  description: "404",
};

export default function NotFoundcontent () {
    return(

        <ClientLayout>

            <NotFoundContent />

        </ClientLayout>

    );
}