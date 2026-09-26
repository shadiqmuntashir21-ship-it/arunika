"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "./Icon";

type TourTab = "overview" | "books" | "learning" | "sessions" | "habit" | "knowledge" | "insights" | "wishlist" | "settings";

const steps: Array<{
  tab: TourTab;
  eyebrow: string;
  title: string;
  text: string;
  hint: string;
  icon: Parameters<typeof Icon>[0]["name"];
}> = [
  {
    tab: "overview",
    eyebrow: "1 · BERANDA",
    title: "Mulai dari gambaran besar.",
    text: "Beranda merangkum ritme bulan ini: buku dan learning yang selesai, progres yang sedang berjalan, halaman, serta durasi baca dan belajar.",
    hint: "Semua angka di sini terbentuk otomatis dari sesi yang kamu catat.",
    icon: "home"
  },
  {
    tab: "books",
    eyebrow: "2 · READING LOG",
    title: "Jadikan perpustakaanmu hidup.",
    text: "Tambahkan buku, cover, status, halaman, rating, review, dan progres. Buku yang sedang dibaca bisa langsung dilanjutkan dari sesi berikutnya.",
    hint: "Di Mode Demo kamu bebas mencoba data contoh tanpa mengubah data siapa pun.",
    icon: "book"
  },
  {
    tab: "learning",
    eyebrow: "3 · LEARNING TRACKER",
    title: "Video dan course tidak lagi tercecer.",
    text: "Simpan YouTube, podcast, webinar, course, atau artikel. Catat durasi belajar dan lanjutkan sumber aslinya kapan saja.",
    hint: "URL YouTube dapat menampilkan thumbnail otomatis.",
    icon: "play"
  },
  {
    tab: "sessions",
    eyebrow: "4 · SESI BACA",
    title: "Catat progres setiap kali membaca.",
    text: "Masukkan halaman awal, halaman akhir, durasi, catatan, dan highlight. Progress buku dan Habit ikut diperbarui.",
    hint: "Satu sesi cukup beberapa detik untuk dicatat.",
    icon: "clock"
  },
  {
    tab: "habit",
    eyebrow: "5 · HABIT",
    title: "Lihat konsistensi, bukan cuma angka akhir.",
    text: "Kalender Habit menggabungkan aktivitas membaca dan belajar per hari, lengkap dengan halaman, durasi, dan target harian.",
    hint: "Merah untuk membaca, hijau untuk learning — mudah dibaca sekilas.",
    icon: "calendar"
  },
  {
    tab: "knowledge",
    eyebrow: "6 · KNOWLEDGE VAULT",
    title: "Simpan hal yang layak diingat.",
    text: "Review, highlight buku, catatan sesi, dan takeaway learning dikumpulkan dalam satu vault pribadi.",
    hint: "Tujuannya bukan hanya selesai konsumsi, tetapi membawa pulang sesuatu.",
    icon: "bulb"
  },
  {
    tab: "insights",
    eyebrow: "7 · INSIGHT",
    title: "Lihat perjalananmu secara utuh.",
    text: "Pantau buku dan learning selesai per bulan, aktivitas tahunan, genre dominan, penulis, serta channel yang paling sering kamu pelajari.",
    hint: "Gunakan recap untuk melihat pola, bukan untuk mengejar angka kosong.",
    icon: "chart"
  },
  {
    tab: "wishlist",
    eyebrow: "8 · WAITING LIST",
    title: "Simpan untuk nanti, tanpa kehilangan jejak.",
    text: "Masukkan buku dan konten yang ingin dipelajari ke Waiting List. Saat waktunya tiba, ubah status dan mulai progres.",
    hint: "Semua tetap tersusun di satu tempat.",
    icon: "heart"
  },
  {
    tab: "settings",
    eyebrow: "9 · PENGATURAN",
    title: "Sesuaikan Arunika dengan ritmemu.",
    text: "Atur target halaman, menit membaca, menit belajar, target buku tahunan, theme, backup, dan akses Pro.",
    hint: "Tour ini bisa dibuka lagi kapan saja dari Pengaturan.",
    icon: "settings"
  }
];

export function ProductTour({
  open,
  onClose,
  onNavigate
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (tab: TourTab) => void;
}) {
  const [index, setIndex] = useState(0);
  const step = steps[index];

  useEffect(() => {
    if (!open) return;
    setIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    onNavigate(step.tab);
    window.scrollTo({ top: 0, behavior: "smooth" });

    const selector = `[data-tour="${step.tab}"]`;
    const target = document.querySelector<HTMLElement>(selector);
    target?.classList.add("tour-focus");
    return () => target?.classList.remove("tour-focus");
  }, [open, index, step.tab, onNavigate]);

  const progress = useMemo(() => Math.round(((index + 1) / steps.length) * 100), [index]);

  if (!open) return null;

  function next() {
    if (index >= steps.length - 1) {
      localStorage.setItem("arunika-tour-seen", "1");
      onClose();
      return;
    }
    setIndex((value) => value + 1);
  }

  function skip() {
    localStorage.setItem("arunika-tour-seen", "1");
    onClose();
  }

  return <>
    <div className="product-tour-dim" aria-hidden="true" />
    <aside className="product-tour-card" role="dialog" aria-modal="false" aria-label="Tour fitur Arunika">
      <div className="product-tour-progress"><span style={{ width: `${progress}%` }} /></div>
      <div className="product-tour-top">
        <span className="product-tour-icon"><Icon name={step.icon} size={19}/></span>
        <span>{step.eyebrow}</span>
        <button type="button" onClick={skip} aria-label="Lewati tour">Lewati</button>
      </div>
      <h2>{step.title}</h2>
      <p>{step.text}</p>
      <div className="product-tour-hint"><Icon name="sparkles" size={15}/><span>{step.hint}</span></div>
      <div className="product-tour-footer">
        <span>{index + 1} / {steps.length}</span>
        <div>
          {index > 0 ? <button className="tour-back" type="button" onClick={() => setIndex((value) => value - 1)}>Sebelumnya</button> : null}
          <button className="tour-next" type="button" onClick={next}>{index === steps.length - 1 ? "Selesai" : "Lanjut"} <Icon name="arrow" size={14}/></button>
        </div>
      </div>
    </aside>
  </>;
}
