"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "./Icon";

type TourTab = "overview" | "books" | "learning" | "sessions" | "habit" | "knowledge" | "insights" | "wishlist" | "settings";
type TourSignal = { type:string; nonce:number } | null;

type Step = {
  id:string;
  tab:TourTab;
  eyebrow:string;
  title:string;
  text:string;
  hint:string;
  icon:Parameters<typeof Icon>[0]["name"];
  selector?:string;
  requiredEvent?:string;
};

const demoSteps:Step[]=[
  {id:"overview",tab:"overview",eyebrow:"1 · MULAI DI BERANDA",title:"Lihat semuanya dalam satu layar.",text:"Beranda memperlihatkan buku yang sedang dibaca, learning yang berjalan, rekap bulan ini, serta ritme harianmu.",hint:"Tekan Lanjut. Arunika akan membawamu otomatis ke fitur berikutnya.",icon:"home"},
  {id:"books",tab:"books",eyebrow:"2 · PERPUSTAKAAN",title:"Semua bacaan tersusun visual.",text:"Di sini kamu melihat cover asli, progress, status, rating, review, dan Waiting List. Coba klik buku mana pun kalau ingin melihat detailnya.",hint:"Tombol Tambah buku adalah pintu masuk untuk membangun koleksimu sendiri.",icon:"book",selector:'[data-tour-action="add-book"]'},
  {id:"sessions",tab:"sessions",eyebrow:"3 · SESI MEMBACA",title:"Progress dicatat per sesi.",text:"Sesi Baca menyimpan halaman awal–akhir, durasi, catatan, dan highlight. Satu input kemudian mengalir ke buku, Habit, dan Knowledge.",hint:"Di Pro, kamu bisa memakai alur ini untuk catatan bacaan sehari-hari.",icon:"clock",selector:'[data-tour-action="add-session"]'},
  {id:"learning",tab:"learning",eyebrow:"4 · LEARNING TRACKER",title:"YouTube dan course tidak lagi tercecer.",text:"Semua contoh learning sudah memiliki thumbnail. Simpan video, podcast, webinar, course, atau artikel dan lanjutkan progresnya kapan saja.",hint:"Catat sesi belajar agar durasi otomatis masuk Habit.",icon:"play",selector:'[data-tour-action="add-learning"]'},
  {id:"habit",tab:"habit",eyebrow:"5 · HABIT",title:"Inilah hubungan antarfiturnya.",text:"Aktivitas membaca dan belajar berkumpul di kalender yang sama. Kamu bisa melihat halaman, menit baca, menit belajar, dan target per hari.",hint:"Merah menandai membaca, hijau menandai learning.",icon:"calendar",selector:'[data-tour-panel="habit"]'},
  {id:"knowledge",tab:"knowledge",eyebrow:"6 · KNOWLEDGE VAULT",title:"Yang dipelajari tidak hilang.",text:"Review buku, highlight sesi baca, dan takeaway learning dikumpulkan menjadi vault pengetahuan pribadi.",hint:"Tujuannya bukan hanya selesai konsumsi konten, tetapi menyimpan hal yang berguna.",icon:"bulb",selector:'[data-tour-panel="knowledge"]'},
  {id:"insights",tab:"insights",eyebrow:"7 · INSIGHT",title:"Aktivitas berubah menjadi pola.",text:"Insight memperlihatkan rekap tahunan, aktivitas bulanan, genre, penulis, dan channel yang paling sering kamu pelajari.",hint:"Semakin konsisten dipakai, semakin bermakna recap-nya.",icon:"chart",selector:'[data-tour-panel="insights"]'},
  {id:"wishlist",tab:"wishlist",eyebrow:"8 · WAITING LIST",title:"Simpan untuk nanti tanpa kehilangan jejak.",text:"Buku dan learning yang belum ingin dimulai tetap tersusun di Waiting List, bukan tercecer di notes atau tab browser.",hint:"Saat siap, ubah statusnya dan mulai progress.",icon:"heart",selector:'[data-tour-panel="wishlist"]'},
  {id:"settings",tab:"settings",eyebrow:"9 · SETTINGS & PWA",title:"Sesuaikan Arunika dengan ritmemu.",text:"Atur target halaman, menit membaca, menit belajar, Dark/Light Mode, backup, dan pasang Arunika sebagai aplikasi.",hint:"Tour fitur juga selalu bisa dibuka ulang dari sini.",icon:"settings",selector:'.settings-app-actions'},
  {id:"finish",tab:"overview",eyebrow:"10 · SELESAI",title:"Sekarang kamu sudah melihat alur lengkapnya.",text:"Baca → catat sesi → Habit → Knowledge → Insight. Semua contoh Demo tetap bisa kamu eksplorasi sesukamu sebelum membeli Pro.",hint:"Kalau cocok, aktivasi Pro akan membersihkan semua data contoh dan menyiapkan ruang pribadi yang kosong.",icon:"sparkles"}
];

const proSteps:Step[]=[
  {id:"overview",tab:"overview",eyebrow:"1 · ORIENTASI",title:"Ini ruang belajar pribadimu.",text:"Kita akan mencoba alur nyata: tambah buku, catat sesi, tambah learning, lihat Habit, Knowledge, Insight, dan Waiting List.",hint:"Data latihan memakai ID khusus dan akan dihapus otomatis setelah tour.",icon:"home"},
  {id:"add-book",tab:"books",eyebrow:"2 · TAMBAH BUKU",title:"Sekarang coba tambah satu buku.",text:"Tekan tombol Tambah buku. Form latihan sudah kami isi sebagai contoh—kamu boleh mengubahnya, lalu tekan Simpan.",hint:"Langkah akan lanjut otomatis setelah buku tersimpan.",icon:"book",selector:'[data-tour-action="add-book"]',requiredEvent:"book-saved"},
  {id:"reading-session",tab:"sessions",eyebrow:"3 · CATAT BACA",title:"Catat satu sesi membaca.",text:"Tekan Sesi baru. Contoh sudah berisi halaman 1–16, durasi 20 menit, catatan, dan satu highlight. Tekan Simpan.",hint:"Setelah disimpan, progress buku dan Habit akan berubah otomatis.",icon:"clock",selector:'[data-tour-action="add-session"]',requiredEvent:"reading-saved"},
  {id:"habit",tab:"habit",eyebrow:"4 · HABIT",title:"Lihat hasilnya langsung.",text:"Sesi baca tadi sekarang muncul di Habit hari ini: buku, halaman, durasi, dan kalender berubah tanpa input ulang.",hint:"Ini inti Arunika: satu input mengalir ke banyak bagian.",icon:"calendar",selector:'[data-tour-panel="habit"]'},
  {id:"add-learning",tab:"learning",eyebrow:"5 · TAMBAH LEARNING",title:"Sekarang tambahkan satu learning.",text:"Tekan Tambah learning. Contoh YouTube sudah disiapkan. Simpan untuk membuat item learning pertamamu.",hint:"Thumbnail, sumber, durasi, dan status bisa dikelola dari sini.",icon:"play",selector:'[data-tour-action="add-learning"]',requiredEvent:"learning-saved"},
  {id:"learning-session",tab:"learning",eyebrow:"6 · SESI BELAJAR",title:"Catat durasi belajar.",text:"Pada card contoh tour, tekan Catat sesi. Form sudah diisi 12 menit. Simpan untuk memperbarui progress dan Habit.",hint:"Langkah akan lanjut otomatis setelah sesi tersimpan.",icon:"clock",selector:'[data-tour-item="tour-learning"] [data-tour-action="log-learning"]',requiredEvent:"learning-session-saved"},
  {id:"knowledge",tab:"knowledge",eyebrow:"7 · KNOWLEDGE VAULT",title:"Insight tadi tidak hilang.",text:"Highlight dari sesi baca dan takeaway learning sekarang terkumpul di Knowledge Vault.",hint:"Semua berasal dari data yang barusan kamu coba sendiri.",icon:"bulb",selector:'[data-tour-panel="knowledge"]'},
  {id:"insights",tab:"insights",eyebrow:"8 · INSIGHT",title:"Aktivitas menjadi pola.",text:"Insight membaca data yang sudah kamu masukkan untuk menunjukkan ritme dan perkembangan dari waktu ke waktu.",hint:"Semakin konsisten dipakai, semakin bermakna recap-nya.",icon:"chart",selector:'[data-tour-panel="insights"]'},
  {id:"wishlist",tab:"wishlist",eyebrow:"9 · WAITING LIST",title:"Simpan yang belum ingin dimulai.",text:"Kami menaruh satu contoh Deep Work di Waiting List supaya kamu bisa melihat bagaimana bacaan untuk nanti tetap tersusun.",hint:"Item contoh ini juga akan dibersihkan setelah tour.",icon:"heart",selector:'[data-tour-panel="wishlist"]'},
  {id:"settings",tab:"settings",eyebrow:"10 · SETTINGS & PWA",title:"Terakhir, sesuaikan Arunika.",text:"Di sini ada target harian, Dark/Light Mode, Install Arunika, backup, dan tombol untuk mengulang tour kapan saja.",hint:"Setelah selesai, semua data latihan dihapus dan ruang Pro kembali bersih.",icon:"settings",selector:'.settings-app-actions'}
];

export function ProductTour({
  open,
  isPro,
  signal,
  onClose,
  onNavigate,
  onStepChange
}:{
  open:boolean;
  isPro:boolean;
  signal:TourSignal;
  onClose:(reason:"completed"|"skipped")=>void;
  onNavigate:(tab:TourTab)=>void;
  onStepChange:(stepId:string)=>void;
}){
  const steps=isPro?proSteps:demoSteps;
  const [index,setIndex]=useState(0);
  const [waiting,setWaiting]=useState(false);
  const step=steps[index];

  useEffect(()=>{
    if(!open)return;
    const saved=isPro?Number(localStorage.getItem("arunika-pro-tour-step")||0):0;
    setIndex(Number.isFinite(saved)&&saved>=0&&saved<steps.length?saved:0);
  },[open,isPro,steps.length]);

  useEffect(()=>{
    if(!open)return;
    onNavigate(step.tab);
    onStepChange(step.id);
    setWaiting(false);
    if(isPro){
      localStorage.setItem("arunika-pro-tour-active","1");
      localStorage.setItem("arunika-pro-tour-step",String(index));
    }
    window.setTimeout(()=>window.scrollTo({top:0,behavior:"smooth"}),60);

    let cleanup=()=>{};
    const timer=window.setTimeout(()=>{
      const selector=step.selector||`[data-tour="${step.tab}"]`;
      const targets=Array.from(document.querySelectorAll<HTMLElement>(selector));
      targets.forEach(target=>target.classList.add("tour-focus"));
      const click=()=>{ if(step.requiredEvent)setWaiting(true); };
      targets.forEach(target=>target.addEventListener("click",click));
      cleanup=()=>{
        targets.forEach(target=>target.classList.remove("tour-focus"));
        targets.forEach(target=>target.removeEventListener("click",click));
      };
    },180);
    return ()=>{window.clearTimeout(timer);cleanup();};
  },[open,index,isPro,step.id,step.tab,step.selector,step.requiredEvent,onNavigate,onStepChange]);

  useEffect(()=>{
    if(!open||!signal||!step.requiredEvent)return;
    if(signal.type!==step.requiredEvent)return;
    setWaiting(false);
    const timer=window.setTimeout(()=>setIndex(value=>Math.min(value+1,steps.length-1)),420);
    return ()=>window.clearTimeout(timer);
  },[signal,open,step.requiredEvent,steps.length]);

  const progress=useMemo(()=>Math.round(((index+1)/steps.length)*100),[index,steps.length]);
  if(!open)return null;

  function next(){
    if(step.requiredEvent)return;
    if(index>=steps.length-1){onClose("completed");return}
    setIndex(value=>value+1);
  }
  function back(){ if(index>0)setIndex(value=>value-1); }
  function skip(){ onClose("skipped"); }

  return <>
    <div className={`product-tour-dim ${waiting?"modal-action":""}`} aria-hidden="true"/>
    <aside className={`product-tour-card ${waiting?"modal-action":""}`} role="dialog" aria-modal="false" aria-label="Tour fitur Arunika">
      <div className="product-tour-progress"><span style={{width:`${progress}%`}}/></div>
      <div className="product-tour-top">
        <span className="product-tour-icon"><Icon name={step.icon} size={19}/></span>
        <span>{step.eyebrow}</span>
        <button type="button" onClick={skip}>Lewati</button>
      </div>
      <h2>{step.title}</h2>
      <p>{step.text}</p>
      <div className="product-tour-hint"><Icon name={step.requiredEvent?"target":"sparkles"} size={15}/><span>{waiting?"Selesaikan form yang sedang terbuka lalu tekan Simpan.":step.hint}</span></div>
      <div className="product-tour-footer">
        <span>{index+1} / {steps.length}</span>
        <div>
          {waiting?<button className="tour-back" type="button" onClick={()=>setWaiting(false)}>Coba lagi</button>:index>0?<button className="tour-back" type="button" onClick={back}>Sebelumnya</button>:null}
          {step.requiredEvent
            ? <button className="tour-next tour-required" type="button" disabled>{waiting?"Menunggu disimpan…":"Lakukan langkah di layar"}</button>
            : <button className="tour-next" type="button" onClick={next}>{index===steps.length-1?"Selesai":"Lanjut"} <Icon name="arrow" size={14}/></button>}
        </div>
      </div>
    </aside>
  </>;
}
