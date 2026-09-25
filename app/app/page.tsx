import type { Metadata } from "next";
import { ArunikaApp } from "@/components/ArunikaApp";

export const metadata: Metadata = { title: "Aplikasi" };
export default function AppPage(){ return <ArunikaApp />; }
