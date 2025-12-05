'use client';
import HeaderClient from "../customers/partials/header";
import FooterClient from "../customers/partials/footer";
import { useEffect } from 'react'; // <--- Bổ sung import useEffect

export default function ClientLayout({ children }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://app.tudongchat.com/js/chatbox.js';
    script.async = true;
    
    document.body.appendChild(script);

    const initializeChat = () => {
        if (typeof window.TuDongChat !== 'undefined') {
            const tudong_chatbox = new window.TuDongChat('5mTKohbMB-i-PcTxM_iHg');
            tudong_chatbox.initial();
        }
    };
    
    const timeoutId = setTimeout(initializeChat, 1000);

    return () => {
        document.body.removeChild(script);
        clearTimeout(timeoutId);
    };

  }, []); 

  return (
    <>
      <HeaderClient />
      <main>{children}</main>
      <FooterClient />
    </>
  );
}