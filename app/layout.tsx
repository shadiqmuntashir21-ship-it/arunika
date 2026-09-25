import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: { default: "Arunika", template: "%s · Arunika" },
  description: "Catat yang dibaca. Simpan yang dipelajari. Tumbuh setiap hari.",
  manifest: "/manifest.webmanifest",
  icons: { icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }] }
};

export const viewport: Viewport = {
  themeColor: "#173f3a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="id"><body><ServiceWorkerRegister />{children}</body></html>;
}
