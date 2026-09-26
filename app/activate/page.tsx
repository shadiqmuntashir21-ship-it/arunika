"use client";

import { FormEvent, useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { clearStore, getOne, putOne, seedIfNeeded } from "@/lib/db";
import type { Settings } from "@/lib/types";
import { activateArunikaLicense } from "@/lib/backend";

export default function ActivatePage(){
  const [license,setLicense]=useState("");
  const [pin,setPin]=useState("");
  const [message,setMessage]=useState("");
  const [success,setSuccess]=useState(false);
  const [busy,setBusy]=useState(false);

  useEffect(()=>{seedIfNeeded()},[]);

  async function submit(e:FormEvent){
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setSuccess(false);

    const normalized=license.trim().toUpperCase();
    if(!/^[A-Z0-9]{3,12}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normalized)){
      setMessage("Format kode lisensi belum valid.");
      setBusy(false);
      return;
    }
    if(!/^\d{6}$/.test(pin)){
      setMessage("PIN aktivasi harus 6 digit.");
      setBusy(false);
      return;
    }

    try{
      const result=await activateArunikaLicense(normalized,pin);
      if(!result?.ok) throw new Error(result?.message||"Aktivasi gagal.");

      const current=await getOne<Settings>("settings","settings");
      if(current){
        await Promise.all([
          clearStore("books"),
          clearStore("learning"),
          clearStore("sessions"),
          clearStore("learningSessions"),
          clearStore("habit")
        ]);
        await putOne("settings",{
          ...current,
          activated:true,
          licenseCode:normalized,
          onboardingDone:false
        });
      }
      setSuccess(true);
      setMessage("Arunika Pro berhasil diaktifkan. Koleksi contoh Demo sudah dibersihkan dan aplikasi siap diisi dengan data milikmu.");
    }catch(error){
      const raw=String((error as Error)?.message||error);
      const friendly=raw.includes("PRODUCT_NOT_ENTITLED")
        ?"Kode ini tidak memiliki akses ke Arunika."
        :raw.includes("PIN_INVALID")
        ?"PIN aktivasi salah."
        :raw.includes("DEVICE_LIMIT")
        ?"Lisensi ini sudah mencapai batas perangkat."
        :raw.includes("NOT_FOUND")||raw.includes("tidak ditemukan")
        ?"Kode aktivasi tidak ditemukan."
        :raw.includes("DISABLED")
        ?"Lisensi sedang dinonaktifkan."
        :raw.includes("RATE_LIMIT")
        ?"Terlalu banyak percobaan. Coba lagi beberapa menit."
        :raw;
      setMessage(friendly||"Aktivasi belum berhasil.");
    }finally{
      setBusy(false);
    }
  }

  return <main className="simple-page auth-page">
    <a className="back-link" href="/">← Kembali ke Arunika</a>
    <section className="auth-layout">
      <div className="auth-copy">
        <div className="eyebrow">AKTIVASI ARUNIKA PRO</div>
        <h1>Aktivasi nyata. Lisensi terhubung ke backend.</h1>
        <p>Kode aktivasi dan PIN diverifikasi ke server Arunika, lalu lisensi diikat ke perangkat ini.</p>
        <div className="auth-points">
          <span><Icon name="lock" size={18}/> Kode + PIN diverifikasi server</span>
          <span><Icon name="check" size={18}/> Maksimal perangkat mengikuti lisensi</span>
          <span><Icon name="sparkles" size={18}/> Data Demo dibersihkan setelah aktivasi berhasil</span>
        </div>
      </div>

      <form className="panel activation-card" onSubmit={submit}>
        <div className="brand-symbol big">A</div>
        <h2>Aktivasi Pro</h2>
        <label>
          <span>Kode lisensi</span>
          <input value={license} onChange={e=>setLicense(e.target.value)} placeholder="ARUN-XXXX-XXXX-XXXX" autoCapitalize="characters"/>
        </label>
        <label>
          <span>PIN aktivasi</span>
          <input value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,""))} placeholder="6 digit dari email" type="password" inputMode="numeric" maxLength={6}/>
        </label>
        <button className="primary-btn large full" disabled={busy}>{busy?"Memverifikasi lisensi…":"Aktifkan Arunika Pro"}</button>
        {message?<div className={success?"form-message success-message":"form-message"}>{message}</div>:null}
        {success?<a className="netflix-play center" href="/app">Masuk ke Arunika <Icon name="arrow" size={15}/></a>:<a className="small-link center" href="/pro">Belum punya kode? Beli Pro</a>}
      </form>
    </section>
  </main>;
}
