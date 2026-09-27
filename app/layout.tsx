import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: { default: "Growva", template: "%s · Growva" },
  description: "Catat yang dibaca. Simpan yang dipelajari. Tumbuh setiap hari.",
  manifest: "/manifest.webmanifest?v=growva-ribbon-4",
  icons: {
    icon: [{ url: "/icons/growva?v=growva-ribbon-4", type: "image/png", sizes: "512x512" }],
    shortcut: [{ url: "/icons/growva?v=growva-ribbon-4", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/icons/growva?v=growva-ribbon-4", type: "image/png", sizes: "512x512" }]
  }
};

export const viewport: Viewport = {
  themeColor: "#070707",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

const themeBoot = `(function(){try{var t=localStorage.getItem("arunika-theme");document.documentElement.dataset.theme=t==="light"?"light":"night";}catch(e){document.documentElement.dataset.theme="night";}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="id" data-theme="night" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: themeBoot }} /></head>
    <body><ServiceWorkerRegister />{children}</body>
  </html>;
}
