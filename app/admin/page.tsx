"use client";

import { FormEvent, useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { adminLicenses, adminLogin, adminOrders } from "@/lib/backend";

type Order = {
  id:string; order_code:string; buyer_name:string; whatsapp:string; email:string;
  amount:number; status:string; created_at:string; payment_method_snapshot?:{label?:string}|null;
  final_email_sent_at?:string|null; final_email_error?:string|null;
};
type LicenseStats={total:number;active:number;reserved?:number;unused:number;disabled:number};

const money=(n:number)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n||0);

export default function AdminPage(){
  const [token,setToken]=useState("");
  const [pin,setPin]=useState("");
  const [orders,setOrders]=useState<Order[]>([]);
  const [orderStats,setOrderStats]=useState<any>(null);
  const [licenseStats,setLicenseStats]=useState<LicenseStats|null>(null);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [tab,setTab]=useState<"orders"|"licenses">("orders");

  useEffect(()=>{
    const saved=localStorage.getItem("arunika_admin_token")||"";
    if(saved){setToken(saved); void load(saved);}
  },[]);

  async function login(e:FormEvent){
    e.preventDefault();setBusy(true);setMessage("");
    try{
      const res=await adminLogin(pin);
      if(!res?.ok)throw new Error(res?.message||"PIN admin salah.");
      localStorage.setItem("arunika_admin_token",res.token);
      setToken(res.token);setPin("");
      await load(res.token);
    }catch(err){setMessage(String((err as Error)?.message||err))}
    finally{setBusy(false)}
  }

  async function load(t=token){
    if(!t)return;
    setBusy(true);setMessage("");
    try{
      const [o,l]=await Promise.all([adminOrders(t,"list"),adminLicenses(t,"list")]);
      if(o?.code==="UNAUTHORIZED"||l?.code==="UNAUTHORIZED")throw new Error("Sesi admin berakhir.");
      if(o?.ok){setOrders(o.orders||[]);setOrderStats(o.stats||null)}
      if(l?.ok)setLicenseStats(l.stats||null);
    }catch(err){
      const msg=String((err as Error)?.message||err);
      setMessage(msg);
      if(msg.includes("Sesi admin"))logout();
    }finally{setBusy(false)}
  }

  function logout(){
    localStorage.removeItem("arunika_admin_token");setToken("");setOrders([]);setOrderStats(null);setLicenseStats(null);
  }

  async function orderAction(action:string,orderId:string){
    setBusy(true);setMessage("");
    try{
      const res=await adminOrders(token,action,{orderId});
      if(!res?.ok)throw new Error(res?.message||res?.code||"Aksi gagal.");
      if(action==="assignLicense")setMessage(`Lisensi ${res.licenseCode||""}${res.activationPin?" · PIN "+res.activationPin:""} berhasil ditetapkan.${res.emailSent?" Email aktivasi terkirim.":res.emailError?" Email belum terkirim: "+res.emailError:""}`);
      else if(action==="resendEmail")setMessage(res.emailSent?"Email aktivasi dikirim ulang.":"Email gagal dikirim: "+(res.emailError||""));
      else setMessage("Pesanan diperbarui.");
      await load();
    }catch(err){setMessage(String((err as Error)?.message||err))}
    finally{setBusy(false)}
  }

  async function generate(count:number){
    setBusy(true);setMessage("");
    try{
      const res=await adminLicenses(token,"generate",{count});
      if(!res?.ok)throw new Error(res?.code||"Gagal membuat lisensi.");
      setMessage(`${res.licenses?.length||count} lisensi Arunika baru dibuat.`);
      await load();
    }catch(err){setMessage(String((err as Error)?.message||err))}
    finally{setBusy(false)}
  }

  if(!token)return <main className="admin-page admin-login-page">
    <a className="back-link" href="/">← Arunika</a>
    <form className="panel admin-login-card" onSubmit={login}>
      <div className="stream-wordmark">ARUNIKA</div>
      <span className="eyebrow">ADMIN CENTER</span>
      <h1>Masuk ke Admin Arunika</h1>
      <p>Gunakan PIN admin yang sudah terdaftar di backend universal.</p>
      <label><span>PIN Admin</span><input autoFocus type="password" inputMode="numeric" value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,""))} placeholder="••••••"/></label>
      <button className="netflix-play full" disabled={busy}>{busy?"Memverifikasi…":"Masuk Admin"}</button>
      {message?<div className="checkout-message">{message}</div>:null}
    </form>
  </main>;

  return <main className="admin-page">
    <header className="admin-topbar">
      <div><span className="stream-wordmark">ARUNIKA</span><small>ADMIN CENTER</small></div>
      <div className="admin-actions"><button onClick={()=>load()} disabled={busy}><Icon name="sparkles" size={16}/> Refresh</button><button onClick={logout}>Keluar</button></div>
    </header>

    <section className="admin-hero">
      <div><span className="eyebrow">PRODUCT · ARUNIKA</span><h1>Order & Lisensi</h1><p>Backend universal yang sama, data produk tetap dipisahkan berdasarkan product code.</p></div>
      <div className="admin-tabs"><button className={tab==="orders"?"active":""} onClick={()=>setTab("orders")}>Pesanan</button><button className={tab==="licenses"?"active":""} onClick={()=>setTab("licenses")}>Lisensi</button></div>
    </section>

    {message?<div className="admin-notice">{message}</div>:null}

    {tab==="orders"?<>
      <section className="admin-stat-grid">
        <AdminStat label="Total order" value={String(orderStats?.total??orders.length)}/>
        <AdminStat label="Menunggu verifikasi" value={String(orderStats?.awaiting??0)}/>
        <AdminStat label="Lisensi siap" value={String(orderStats?.ready??0)}/>
        <AdminStat label="Selesai" value={String(orderStats?.completed??0)}/>
      </section>

      <section className="panel admin-table-card">
        <div className="admin-card-head"><div><span className="eyebrow">PURCHASE ORDERS</span><h2>Pesanan terbaru</h2></div><span>{orders.length} order</span></div>
        <div className="admin-table-scroll">
          <table className="admin-table"><thead><tr><th>Order</th><th>Pembeli</th><th>Metode</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>{orders.map(o=><tr key={o.id}>
            <td><strong>{o.order_code}</strong><small>{new Date(o.created_at).toLocaleString("id-ID")}</small></td>
            <td><strong>{o.buyer_name}</strong><small>{o.email}</small></td>
            <td>{o.payment_method_snapshot?.label||"-"}</td>
            <td>{money(o.amount)}</td>
            <td><span className={"order-status "+o.status}>{o.status.replaceAll("_"," ")}</span>{o.final_email_error?<small className="email-error">{o.final_email_error}</small>:null}</td>
            <td><div className="table-actions">
              {o.status==="awaiting_verification"?<button className="approve" onClick={()=>orderAction("assignLicense",o.id)} disabled={busy}>Konfirmasi & Kirim Kode</button>:null}
              {(o.status==="license_ready"||o.status==="completed")?<button onClick={()=>orderAction("resendEmail",o.id)} disabled={busy}>Kirim Ulang Email</button>:null}
              {["pending_payment","awaiting_verification","license_ready"].includes(o.status)?<button className="danger" onClick={()=>orderAction("cancel",o.id)} disabled={busy}>Batalkan</button>:null}
            </div></td>
          </tr>)}
          {!orders.length?<tr><td colSpan={6} className="empty-table">Belum ada pesanan Arunika.</td></tr>:null}</tbody></table>
        </div>
      </section>
    </>:<>
      <section className="admin-stat-grid">
        <AdminStat label="Total lisensi" value={String(licenseStats?.total??0)}/>
        <AdminStat label="Stok belum dipakai" value={String(licenseStats?.unused??0)}/>
        <AdminStat label="Reserved" value={String(licenseStats?.reserved??0)}/>
        <AdminStat label="Aktif" value={String(licenseStats?.active??0)}/>
      </section>
      <section className="panel license-stock-card">
        <div><span className="eyebrow">LICENSE STOCK</span><h2>Stok kode Arunika</h2><p>Sistem order otomatis mengambil kode berstatus unused yang memiliki entitlement ARUNIKA.</p></div>
        <div className="license-actions"><button className="ghost-btn" onClick={()=>generate(10)} disabled={busy}>+ 10 Lisensi</button><button className="netflix-play" onClick={()=>generate(100)} disabled={busy}>+ 100 Lisensi</button></div>
      </section>
    </>}

    <footer className="admin-footer">ARUNIKA · Universal Licensing Backend</footer>
  </main>;
}

function AdminStat({label,value}:{label:string;value:string}){return <div className="panel admin-stat"><span>{label}</span><strong>{value}</strong></div>}
