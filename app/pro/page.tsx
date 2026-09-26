"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { purchasePublic } from "@/lib/backend";

type Method = {
  id:string;
  type:"bank"|"ewallet"|"qris"|"other";
  label:string;
  account_name?:string|null;
  account_number?:string|null;
  instructions?:string|null;
};

type Order = {
  id:string;
  order_code:string;
  buyer_name:string;
  whatsapp:string;
  email:string;
  amount:number;
  status:string;
  payment_method_snapshot?:Method|null;
};

const money=(n:number)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n||0);

export default function ProPage(){
  const [methods,setMethods]=useState<Method[]>([]);
  const [price,setPrice]=useState(49000);
  const [buyerName,setBuyerName]=useState("");
  const [whatsapp,setWhatsapp]=useState("");
  const [email,setEmail]=useState("");
  const [methodId,setMethodId]=useState("");
  const [order,setOrder]=useState<Order|null>(null);
  const [accessToken,setAccessToken]=useState("");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");

  const selected=useMemo(()=>methods.find(m=>m.id===methodId)||order?.payment_method_snapshot||null,[methods,methodId,order]);

  useEffect(()=>{
    (async()=>{
      try{
        const cfg=await purchasePublic("config");
        if(cfg?.ok){
          setMethods(cfg.paymentMethods||[]);
          setPrice(Number(cfg.config?.price)||49000);
          if(cfg.paymentMethods?.[0]?.id)setMethodId(cfg.paymentMethods[0].id);
        }
        const saved=localStorage.getItem("arunika_purchase");
        if(saved){
          const p=JSON.parse(saved);
          if(p.orderCode&&p.accessToken){
            const status=await purchasePublic("status",{orderCode:p.orderCode,accessToken:p.accessToken});
            if(status?.ok){
              setOrder(status.order);
              setAccessToken(p.accessToken);
            }
          }
        }
      }catch{}
    })();
  },[]);

  async function createOrder(e:FormEvent){
    e.preventDefault();
    setBusy(true);setMessage("");
    try{
      const res=await purchasePublic("create",{buyerName,whatsapp,email,paymentMethodId:methodId});
      if(!res?.ok)throw new Error(res?.message||res?.code||"Order gagal dibuat.");
      setOrder(res.order);setAccessToken(res.accessToken);
      localStorage.setItem("arunika_purchase",JSON.stringify({orderCode:res.order.order_code,accessToken:res.accessToken}));
      setMessage("Pesanan berhasil dibuat. Lakukan pembayaran sesuai metode yang dipilih.");
    }catch(error){setMessage(String((error as Error)?.message||error))}
    finally{setBusy(false)}
  }

  async function confirmPaid(){
    if(!order||!accessToken)return;
    setBusy(true);setMessage("");
    try{
      const res=await purchasePublic("confirmPaid",{orderCode:order.order_code,accessToken});
      if(!res?.ok)throw new Error(res?.message||res?.code||"Konfirmasi gagal.");
      setOrder(res.order);
      setMessage("Konfirmasi pembayaran sudah dikirim. Admin akan memeriksa pembayaran lalu kode aktivasi dikirim ke email kamu.");
    }catch(error){setMessage(String((error as Error)?.message||error))}
    finally{setBusy(false)}
  }

  async function refreshStatus(){
    if(!order||!accessToken)return;
    setBusy(true);setMessage("");
    try{
      const res=await purchasePublic("status",{orderCode:order.order_code,accessToken});
      if(res?.ok){
        setOrder(res.order);
        if(res.order.status==="completed")setMessage("Pembayaran sudah selesai diproses. Cek email untuk kode aktivasi Arunika.");
        else if(res.order.status==="license_ready")setMessage("Lisensi sudah disiapkan. Email aktivasi sedang diproses.");
        else if(res.order.status==="awaiting_verification")setMessage("Pembayaran masih menunggu verifikasi admin.");
        else setMessage("Status pesanan diperbarui.");
      }
    }catch(error){setMessage(String((error as Error)?.message||error))}
    finally{setBusy(false)}
  }

  function resetOrder(){
    localStorage.removeItem("arunika_purchase");
    setOrder(null);setAccessToken("");setMessage("");
  }

  const features=["Koleksi buku tanpa batas","Learning tracker tanpa batas","Reading session & habit tracker","Knowledge vault & insights","Backup & restore data lokal","Lisensi maksimal 2 perangkat","PWA untuk HP dan laptop"];

  return <main className="simple-page pro-checkout-page">
    <a className="back-link" href="/">← Kembali ke Arunika</a>

    <section className="pro-checkout-hero">
      <div>
        <div className="eyebrow">ARUNIKA PRO</div>
        <h1>Upgrade sekali. Gunakan untuk perjalanan belajarmu.</h1>
        <p>Arunika Pro membuka koleksi tanpa batas dan akses penuh aplikasi. Pembayaran dan lisensi sekarang sudah terhubung ke backend Arunika.</p>
        <div className="price-line promo-price-line"><del>{money(100000)}</del><strong>{money(price)}</strong><span>sekali bayar · tanpa biaya bulanan</span></div>
        <ul className="pro-feature-list">{features.map(f=><li key={f}><Icon name="check" size={17}/>{f}</li>)}</ul>
        <a className="ghost-btn" href="/activate">Saya sudah punya kode aktivasi</a>
      </div>

      <div className="panel checkout-card">
        {!order ? <>
          <div className="checkout-head"><div><span className="eyebrow">CHECKOUT</span><h2>Beli Arunika Pro</h2></div><div className="checkout-price promo-checkout-price"><del>{money(100000)}</del><strong>{money(price)}</strong></div></div>
          <form onSubmit={createOrder} className="checkout-form">
            <label><span>Nama lengkap</span><input required value={buyerName} onChange={e=>setBuyerName(e.target.value)} placeholder="Nama pembeli"/></label>
            <label><span>WhatsApp</span><input required value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="08xxxxxxxxxx" inputMode="tel"/></label>
            <label><span>Email</span><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@email.com"/></label>
            <div className="payment-label">Pilih metode pembayaran</div>
            <div className="payment-methods">
              {methods.map(m=><button type="button" key={m.id} className={methodId===m.id?"payment-choice active":"payment-choice"} onClick={()=>setMethodId(m.id)}>
                <span className={"payment-icon "+m.type}>{m.type==="qris"?"QR":m.label.slice(0,2).toUpperCase()}</span>
                <span><strong>{m.label}</strong><small>{m.type==="qris"?"QRIS":m.account_name||m.type}</small></span>
                <i>{methodId===m.id?"✓":""}</i>
              </button>)}
            </div>
            <button disabled={busy||!methodId} className="netflix-play checkout-submit">{busy?"Membuat pesanan…":"Lanjut ke Pembayaran"}</button>
          </form>
        </> : <>
          <div className="checkout-head"><div><span className="eyebrow">PESANAN</span><h2>{order.order_code}</h2></div><span className={"order-status "+order.status}>{order.status.replaceAll("_"," ")}</span></div>
          <div className="payment-summary">
            <div><span>Total</span><strong>{money(order.amount)}</strong></div>
            <div><span>Metode</span><strong>{order.payment_method_snapshot?.label||selected?.label||"-"}</strong></div>
          </div>
          {(order.status==="pending_payment"||order.status==="awaiting_verification")&&selected?<div className="transfer-box">
            <div className={"payment-big-icon "+selected.type}>{selected.type==="qris"?"QRIS":selected.label}</div>
            {selected.account_number?<div><span>Nomor / ID tujuan</span><strong className="account-number">{selected.account_number}</strong></div>:null}
            {selected.account_name?<div><span>Atas nama</span><strong>{selected.account_name}</strong></div>:null}
            {selected.instructions?<p>{selected.instructions}</p>:null}
          </div>:null}
          {order.status==="pending_payment"?<button className="netflix-play checkout-submit" disabled={busy} onClick={confirmPaid}>{busy?"Mengirim…":"Saya Sudah Bayar"}</button>:null}
          {order.status!=="pending_payment"?<button className="ghost-btn full" disabled={busy} onClick={refreshStatus}>{busy?"Memeriksa…":"Periksa Status Pesanan"}</button>:null}
          {order.status==="completed"?<a href="/activate" className="netflix-play checkout-submit">Aktifkan Arunika Pro <Icon name="arrow" size={17}/></a>:null}
          <button className="checkout-reset" type="button" onClick={resetOrder}>Buat pesanan baru</button>
        </>}
        {message?<div className="checkout-message">{message}</div>:null}
      </div>
    </section>
  </main>;
}
