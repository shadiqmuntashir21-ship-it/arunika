import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: { default: "Arunika", template: "%s · Arunika" },
  description: "Catat yang dibaca. Simpan yang dipelajari. Tumbuh setiap hari.",
  manifest: "/manifest.webmanifest",
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" }], apple: [{ url: "/icons/apple-touch-icon.png", type: "image/png", sizes: "180x180" }] }
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
