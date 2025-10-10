// src/app/layout.js
import { Roboto, Roboto_Mono } from "next/font/google";
import RouteLoadingProvider from "@/components/loading/RouteLoading";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CompareProvider } from "../contexts/CompareContext";
import Script from "next/script";

import "./globals.css";
import "../../public/assets/css/bootstrap.min.css";
import "../../public/assets/css/templatemo.css";
import "../../public/assets/css/custom.css";
import "../../public/assets/css/fontawesome.min.css";
import "../styles/homepage.css";
// import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css';


const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],  // khai báo weights hợp lệ
  subsets: ["latin"],
  variable: "--font-roboto",
});

const robotoMono = Roboto_Mono({
  weight: ["400", "700"],  // khai báo weights hợp lệ cho mono (nếu cần)
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

export const metadata = {
  title: "Táo Bro - Trang Chủ",
  description: "Website bán sản phẩm Apple chính hãng",
  icons: {
    icon: "/apple_logo.ico",
    apple: "/assets/image/apple_logo.png", 
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        {/* Favicon và icon */}
        <link rel="icon" href="/apple_logo.ico" />
        {/* <link rel="apple-touch-icon" href="/assets/img/apple_logo.png" /> */}
        {/* <link rel="shortcut icon" href="/assets/img/apple_logo.png" type="image/x-icon" /> */}


        {/* Google Font bổ sung nếu không dùng next/font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;200;300;400;500;700;900&display=swap"
        />

        {/* chatbot */}
        <Script
          id="chatfuel-widget"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var script = document.createElement('script');
                script.dataset.bot = "68ac2b7c2a80a9af7959044a"; // ID bot của bạn
                script.dataset.zindex = "99999";
                script.src = "https://panel.chatfuel.com/widgets/chat-widget/chat-widget.js";
                script.async = true;
                script.defer = true;
                document.getElementsByTagName('head')[0].appendChild(script);
              })();
            `,
          }}
        />
      </head>
      <body className={`${roboto.variable} ${robotoMono.variable}`}>
      <RouteLoadingProvider>
        <CompareProvider>
          {children}
          <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          pauseOnHover
          theme="colored"
        />
        </CompareProvider>
      </RouteLoadingProvider>
      </body>
    </html>
  );
}
