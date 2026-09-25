"use client";

import { FormEvent, useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { getOne, putOne, seedIfNeeded } from "@/lib/db";
import type { Settings } from "@/lib/types";

export default function ActivatePage(){
  const [license,setLicense]=useState("");const [pin,setPin]=useState("");const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);
  useEffect(()=>{seedIfNeeded()},[]);
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setMessage("");const normalized=license.trim().toUpperCase();if(!/^[A-Z0-9]{3,12}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normalized)){setMessage("Format kode lisensi belum valid.");setBusy(false);return;}if(!/^\d{4,8}$/.test(pin)){setMessage("PIN harus 4–8 digit.");setBusy(false);return;}const current=await getOne<Settings>("settings","settings");if(current){await putOne("settings",{...current,activated:true,licenseCode:normalized,pin});setMessage("Mode Pro lokal berhasil diaktifkan. Nanti proses ini akan diverifikasi oleh backend lisensi universal.");}setBusy(false);}
  return <main className="simple-page auth-page"><a className="back-link" href="/">← Kembali ke Arunika</a><section className="auth-layout"><div className="auth-copy"><div className="eyebrow">AKTIVASI ARUNIKA PRO</div><h1>Sudah punya kode? Aktifkan langsung di aplikasi.</h1><p>Kode lisensi dan PIN akan menjadi gerbang akses Pro. Untuk fase front-end ini, validasi masih berjalan lokal dan siap diganti endpoint backend nanti.</p><div className="auth-points"><span><Icon name="lock" size={18}/> Aktivasi di perangkat</span><span><Icon name="check" size={18}/> Flow siap integrasi backend</span><span><Icon name="sparkles" size={18}/> Mode Pro langsung terbuka</span></div></div><form className="panel activation-card" onSubmit={submit}><div className="brand-symbol big">A</div><h2>Aktivasi Pro</h2><label><span>Kode lisensi</span><input value={license} onChange={e=>setLicense(e.target.value)} placeholder="ARUN-XXXX-XXXX-XXXX" autoCapitalize="characters"/></label><label><span>PIN</span><input value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,""))} placeholder="6 digit PIN" type="password" inputMode="numeric"/></label><button className="primary-btn large full" disabled={busy}>{busy?"Mengaktifkan…":"Aktifkan Arunika Pro"}</button>{message?<div className="form-message">{message}</div>:null}<a className="small-link center" href="/app">Masuk ke aplikasi <Icon name="arrow" size={15}/></a></form></section></main>;
}
