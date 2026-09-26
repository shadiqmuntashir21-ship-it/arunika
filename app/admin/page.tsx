"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { adminConfig, adminLicenses, adminLogin, adminOrders } from "@/lib/backend";

type Tab = "dashboard"|"orders"|"licenses"|"email"|"payments"|"settings";

type Order = {
  id:string;
  order_code:string;
  buyer_name:string;
  whatsapp:string;
  email:string;
  amount:number;
  status:string;
  created_at:string;
  payment_claimed_at?:string|null;
  verified_at?:string|null;
  completed_at?:string|null;
  cancelled_at?:string|null;
  payment_method_snapshot?:{type?:string;label?:string;account_name?:string;account_number?:string}|null;
  license_id?:string|null;
  admin_notified_at?:string|null;
  buyer_notified_at?:string|null;
  email_notify_error?:string|null;
  final_email_sent_at?:string|null;
  final_email_error?:string|null;
  final_email_resend_id?:string|null;
  final_email_delivery_status?:string|null;
  final_email_delivery_checked_at?:string|null;
};

type License = {
  id:string;
  license_code:string;
  status:string;
  max_devices:number;
  buyer_name?:string|null;
  buyer_contact?:string|null;
  created_at:string;
  updated_at?:string|null;
  first_activated_at?:string|null;
  disabled_at?:string|null;
};

type Device = {
  id:string;
  license_id:string;
  device_name?:string|null;
  activated_at:string;
  last_seen?:string|null;
  revoked_at?:string|null;
  revoked_reason?:string|null;
};

type PaymentMethod = {
  id:string;
  type:string;
  label:string;
  account_name?:string|null;
  account_number?:string|null;
  instructions?:string|null;
  active:boolean;
  base_active?:boolean;
  sort_order:number;
};

type AdminSettings = {
  price:number;
  admin_whatsapp?:string|null;
  purchase_note?:string|null;
  admin_email?:string|null;
  email_from?:string|null;
  max_devices_default?:number;
  order_prefix?:string|null;
  admin_url?:string|null;
  email_brand_label?:string|null;
  email_tagline?:string|null;
  guidebook_filename?:string|null;
  requires_pin?:boolean;
};

type ConfigDraft = {
  adminEmail:string;
  adminWhatsapp:string;
  purchaseNote:string;
  emailFrom:string;
  emailBrandLabel:string;
  emailTagline:string;
  adminUrl:string;
};

const money=(n:number)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n||0);
const dt=(value?:string|null)=>value?new Intl.DateTimeFormat("id-ID",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value)):"—";
const dayKey=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const orderLabel=(status:string)=>({
  pending_payment:"Menunggu pembayaran",
  awaiting_verification:"Perlu verifikasi",
  license_ready:"Lisensi siap",
  completed:"Selesai",
  cancelled:"Dibatalkan"
}[status]||status.replaceAll("_"," "));
const emailLabel=(status?:string|null)=>({
  sent:"Terkirim",
  delivered:"Delivered",
  opened:"Dibuka",
  clicked:"Diklik",
  bounced:"Bounced",
  failed:"Gagal",
  complained:"Komplain",
  suppressed:"Suppressed"
}[String(status||"")]||(!status?"Belum dikirim":String(status)));
const maskLicense=(code:string)=>code?code.replace(/^([^-]+)-[^-]+-[^-]+-([^-]+)$/,"$1-••••-••••-$2"):"—";

function configDraft(settings?:AdminSettings|null):ConfigDraft{
  return {
    adminEmail:settings?.admin_email||"",
    adminWhatsapp:settings?.admin_whatsapp||"",
    purchaseNote:settings?.purchase_note||"",
    emailFrom:settings?.email_from||"",
    emailBrandLabel:settings?.email_brand_label||"",
    emailTagline:settings?.email_tagline||"",
    adminUrl:settings?.admin_url||""
  };
}

export default function AdminPage(){
  const [token,setToken]=useState("");
  const [pin,setPin]=useState("");
  const [tab,setTab]=useState<Tab>("dashboard");
  const [orders,setOrders]=useState<Order[]>([]);
  const [licenses,setLicenses]=useState<License[]>([]);
  const [devices,setDevices]=useState<Device[]>([]);
  const [paymentMethods,setPaymentMethods]=useState<PaymentMethod[]>([]);
  const [settings,setSettings]=useState<AdminSettings|null>(null);
  const [config,setConfig]=useState<ConfigDraft>(configDraft());
  const [guidebook,setGuidebook]=useState<{ready?:boolean;approxBytes?:number}|null>(null);
  const [adminName,setAdminName]=useState("Admin");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [search,setSearch]=useState("");
  const [statusFilter,setStatusFilter]=useState("all");
  const [licenseSearch,setLicenseSearch]=useState("");
  const [selectedOrder,setSelectedOrder]=useState<Order|null>(null);
  const [selectedLicense,setSelectedLicense]=useState<License|null>(null);
  const [revealedCodes,setRevealedCodes]=useState<Record<string,boolean>>({});
  const [mobileNav,setMobileNav]=useState(false);

  useEffect(()=>{
    const saved=localStorage.getItem("arunika_admin_token")||"";
    if(saved){setToken(saved); void load(saved);}
  },[]);

  async function login(e:FormEvent){
    e.preventDefault();
    setBusy(true);setMessage("");
    try{
      const res=await adminLogin(pin);
      if(!res?.ok)throw new Error(res?.message||"PIN admin salah.");
      localStorage.setItem("arunika_admin_token",res.token);
      setToken(res.token);
      setAdminName(res.admin?.displayName||"Admin");
      setPin("");
      await load(res.token);
    }catch(err){setMessage(String((err as Error)?.message||err))}
    finally{setBusy(false)}
  }

  async function load(t=token){
    if(!t)return;
    setBusy(true);
    try{
      const [o,l,c]=await Promise.all([
        adminOrders(t,"list"),
        adminLicenses(t,"list"),
        adminConfig(t,"get")
      ]);
      if([o,l,c].some((x:any)=>x?.code==="UNAUTHORIZED"))throw new Error("Sesi admin berakhir.");
      if(!o?.ok||!l?.ok||!c?.ok)throw new Error("Dashboard belum dapat dimuat.");

      setOrders(o.orders||[]);
      setLicenses(l.licenses||[]);
      setDevices(l.devices||[]);
      setPaymentMethods(c.paymentMethods||o.paymentMethods||[]);
      setSettings(c.settings||null);
      setConfig(configDraft(c.settings));
      setGuidebook(o.guidebook||null);
      setAdminName(c.admin?.displayName||"Admin");
    }catch(err){
      const msg=String((err as Error)?.message||err);
      setMessage(msg);
      if(msg.includes("Sesi admin"))logout();
    }finally{setBusy(false)}
  }

  function logout(){
    localStorage.removeItem("arunika_admin_token");
    setToken("");setOrders([]);setLicenses([]);setDevices([]);setPaymentMethods([]);setSettings(null);
  }

  async function orderAction(action:string,orderId:string){
    setBusy(true);setMessage("");
    try{
      const res=await adminOrders(token,action,{orderId});
      if(!res?.ok)throw new Error(res?.message||res?.code||"Aksi gagal.");
      if(action==="assignLicense"){
        setMessage(`Pembayaran dikonfirmasi. Lisensi ${res.licenseCode||""} berhasil ditetapkan${res.emailSent?" dan email aktivasi terkirim.":res.emailError?" tetapi email gagal: "+res.emailError:"."}`);
      }else if(action==="resendEmail"){
        setMessage(res.emailSent?"Email aktivasi berhasil dikirim ulang.":"Email gagal dikirim: "+(res.emailError||""));
      }else if(action==="refreshEmailStatus"){
        setMessage(`Status email diperbarui: ${emailLabel(res.email?.status)}.`);
      }else{
        setMessage("Pesanan diperbarui.");
      }
      await load();
      setSelectedOrder(null);
    }catch(err){setMessage(String((err as Error)?.message||err))}
    finally{setBusy(false)}
  }

  async function generate(count:number){
    setBusy(true);setMessage("");
    try{
      const res=await adminLicenses(token,"generate",{count});
      if(!res?.ok)throw new Error(res?.code||"Gagal membuat lisensi.");
      setMessage(`${res.licenses?.length||count} lisensi ARUNIKA baru dibuat.`);
      await load();
    }catch(err){setMessage(String((err as Error)?.message||err))}
    finally{setBusy(false)}
  }

  async function licenseAction(action:string,licenseId:string,payload:Record<string,unknown>={}){
    setBusy(true);setMessage("");
    try{
      const res=await adminLicenses(token,action,{licenseId,...payload});
      if(!res?.ok)throw new Error(res?.message||res?.code||"Aksi lisensi gagal.");
      const copy:{[key:string]:string}={
        disable:"Lisensi dinonaktifkan.",
        enable:"Lisensi diaktifkan kembali.",
        resetAllDevices:"Semua slot perangkat lisensi sudah direset.",
        revokeDevice:"Perangkat berhasil dicabut."
      };
      setMessage(copy[action]||"Lisensi diperbarui.");
      await load();
      setSelectedLicense(null);
    }catch(err){setMessage(String((err as Error)?.message||err))}
    finally{setBusy(false)}
  }

  async function saveSettings(){
    setBusy(true);setMessage("");
    try{
      const res=await adminConfig(token,"updateSettings",config);
      if(!res?.ok)throw new Error(res?.message||res?.code||"Pengaturan gagal disimpan.");
      setMessage("Pengaturan admin dan email berhasil disimpan.");
      await load();
    }catch(err){setMessage(String((err as Error)?.message||err))}
    finally{setBusy(false)}
  }

  async function savePayment(method:PaymentMethod){
    setBusy(true);setMessage("");
    try{
      const res=await adminConfig(token,"updatePaymentMethod",{
        paymentMethodId:method.id,
        active:method.active,
        sortOrder:method.sort_order,
        label:method.label,
        accountName:method.account_name||"",
        accountNumber:method.account_number||"",
        instructions:method.instructions||""
      });
      if(!res?.ok)throw new Error(res?.message||res?.code||"Metode pembayaran gagal disimpan.");
      setMessage(`${method.label} berhasil diperbarui untuk ARUNIKA.`);
      await load();
    }catch(err){setMessage(String((err as Error)?.message||err))}
    finally{setBusy(false)}
  }

  async function uploadGuidebook(file?:File){
    if(!file)return;
    if(file.type!=="application/pdf"){setMessage("Guidebook harus berupa PDF.");return}
    setBusy(true);setMessage("");
    try{
      const base64=await fileToBase64(file);
      const res=await adminOrders(token,"uploadGuidebook",{filename:file.name,contentBase64:base64});
      if(!res?.ok)throw new Error(res?.message||res?.code||"Guidebook gagal diunggah.");
      setMessage(`Guidebook ${res.filename||file.name} berhasil disimpan dan akan dilampirkan pada email aktivasi.`);
      await load();
    }catch(err){setMessage(String((err as Error)?.message||err))}
    finally{setBusy(false)}
  }

  const analytics=useMemo(()=>{
    const now=new Date();
    const today=dayKey(now);
    const month=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    const completed=orders.filter(o=>o.status==="completed");
    const dateKey=(v?:string|null)=>v?dayKey(new Date(v)):"";
    const todayRevenue=completed.filter(o=>dateKey(o.completed_at)===today).reduce((n,o)=>n+Number(o.amount||0),0);
    const monthRevenue=completed.filter(o=>dateKey(o.completed_at).startsWith(month)).reduce((n,o)=>n+Number(o.amount||0),0);
    const ordersToday=orders.filter(o=>dateKey(o.created_at)===today).length;
    const awaiting=orders.filter(o=>o.status==="awaiting_verification").length;
    const pending=orders.filter(o=>o.status==="pending_payment").length;
    const delivered=orders.filter(o=>["delivered","opened","clicked"].includes(String(o.final_email_delivery_status||""))).length;
    const failed=orders.filter(o=>Boolean(o.final_email_error)||["failed","bounced","suppressed","complained"].includes(String(o.final_email_delivery_status||""))).length;
    const sent=orders.filter(o=>Boolean(o.final_email_sent_at)).length;

    const last7=Array.from({length:7},(_,index)=>{
      const d=new Date(now);d.setHours(0,0,0,0);d.setDate(d.getDate()-(6-index));
      const key=dayKey(d);
      const value=completed.filter(o=>dateKey(o.completed_at)===key).reduce((n,o)=>n+Number(o.amount||0),0);
      return {key,label:new Intl.DateTimeFormat("id-ID",{weekday:"short"}).format(d),value};
    });
    return {todayRevenue,monthRevenue,ordersToday,awaiting,pending,delivered,failed,sent,last7};
  },[orders]);

  const filteredOrders=useMemo(()=>{
    const q=search.trim().toLowerCase();
    return orders.filter(o=>{
      const statusOk=statusFilter==="all"||o.status===statusFilter;
      const searchOk=!q||[o.order_code,o.buyer_name,o.email,o.whatsapp,o.payment_method_snapshot?.label].some(v=>String(v||"").toLowerCase().includes(q));
      return statusOk&&searchOk;
    });
  },[orders,search,statusFilter]);

  const filteredLicenses=useMemo(()=>{
    const q=licenseSearch.trim().toLowerCase();
    return licenses.filter(l=>!q||[l.license_code,l.buyer_name,l.buyer_contact,l.status].some(v=>String(v||"").toLowerCase().includes(q)));
  },[licenses,licenseSearch]);

  const activeDevices=(licenseId:string)=>devices.filter(d=>d.license_id===licenseId&&!d.revoked_at);
  const orderLicense=(licenseId?:string|null)=>licenses.find(l=>l.id===licenseId);

  if(!token)return <main className="admin-page admin-login-page admin-v2-login">
    <a className="back-link" href="/">← Kembali ke Arunika</a>
    <form className="panel admin-login-card" onSubmit={login}>
      <div className="admin-login-brand"><span className="admin-brand-mark">A</span><div><div className="stream-wordmark">ARUNIKA</div><small>ADMIN CENTER</small></div></div>
      <span className="eyebrow">SECURE ACCESS</span>
      <h1>Kelola penjualan tanpa kerja berulang.</h1>
      <p>Order, verifikasi pembayaran, lisensi, perangkat, dan email aktivasi terhubung dalam satu dashboard.</p>
      <label><span>PIN Admin</span><input autoFocus type="password" inputMode="numeric" value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,""))} placeholder="••••••"/></label>
      <button className="netflix-play full" disabled={busy}>{busy?"Memverifikasi…":"Masuk Admin Center"}</button>
      {message?<div className="checkout-message">{message}</div>:null}
    </form>
  </main>;

  return <main className="admin-shell-v2">
    <aside className={`admin-sidebar-v2 ${mobileNav?"open":""}`}>
      <div className="admin-sidebar-brand">
        <span className="admin-brand-mark">A</span>
        <div><span className="stream-wordmark">ARUNIKA</span><small>ADMIN CENTER</small></div>
        <button className="admin-sidebar-close" onClick={()=>setMobileNav(false)}><Icon name="x" size={18}/></button>
      </div>
      <div className="admin-product-chip"><span/><div><strong>ARUNIKA PRO</strong><small>{money(settings?.price||49000)} · aktif</small></div></div>
      <nav className="admin-side-nav">
        <SideNavButton icon="home" label="Dashboard" active={tab==="dashboard"} onClick={()=>goTab("dashboard")} />
        <SideNavButton icon="book" label="Pesanan" badge={analytics.awaiting||undefined} active={tab==="orders"} onClick={()=>goTab("orders")} />
        <SideNavButton icon="crown" label="Lisensi" active={tab==="licenses"} onClick={()=>goTab("licenses")} />
        <SideNavButton icon="upload" label="Email" badge={analytics.failed||undefined} active={tab==="email"} onClick={()=>goTab("email")} />
        <SideNavButton icon="target" label="Pembayaran" active={tab==="payments"} onClick={()=>goTab("payments")} />
        <div className="admin-nav-divider"/>
        <SideNavButton icon="settings" label="Pengaturan" active={tab==="settings"} onClick={()=>goTab("settings")} />
      </nav>
      <div className="admin-sidebar-foot">
        <div className="admin-user-mini"><span>{adminName.slice(0,1).toUpperCase()}</span><div><strong>{adminName}</strong><small>Product Admin</small></div></div>
        <button onClick={logout}>Keluar</button>
      </div>
    </aside>

    {mobileNav?<button className="admin-mobile-backdrop" aria-label="Tutup menu" onClick={()=>setMobileNav(false)}/>:null}

    <section className="admin-workspace">
      <header className="admin-v2-topbar">
        <button className="admin-mobile-menu" onClick={()=>setMobileNav(true)}><Icon name="menu" size={20}/></button>
        <div className="admin-topbar-title"><span className="stream-wordmark mobile-brand">ARUNIKA</span><span className="admin-current-tab">{tabName(tab)}</span></div>
        <div className="admin-v2-actions">
          <span className="admin-live-dot"><i/> Live</span>
          <button onClick={()=>load()} disabled={busy}><Icon name="sparkles" size={15}/><span>Refresh</span></button>
        </div>
      </header>

      <div className="admin-v2-content">
        {message?<div className="admin-notice admin-v2-notice"><span>{message}</span><button onClick={()=>setMessage("")}>×</button></div>:null}

        {tab==="dashboard"?<DashboardView analytics={analytics} orders={orders} settings={settings} licenses={licenses} awaiting={orders.filter(o=>o.status==="awaiting_verification")} onVerify={(o:Order)=>setSelectedOrder(o)} />:null}
        {tab==="orders"?<OrdersView orders={filteredOrders} search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter} busy={busy} onOpen={setSelectedOrder} />:null}
        {tab==="licenses"?<LicensesView licenses={filteredLicenses} devices={devices} search={licenseSearch} setSearch={setLicenseSearch} busy={busy} revealed={revealedCodes} setRevealed={setRevealedCodes} onOpen={setSelectedLicense} onGenerate={generate} />:null}
        {tab==="email"?<EmailView orders={orders} analytics={analytics} busy={busy} onRefresh={(o:Order)=>orderAction("refreshEmailStatus",o.id)} onResend={(o:Order)=>orderAction("resendEmail",o.id)} />:null}
        {tab==="payments"?<PaymentsView methods={paymentMethods} setMethods={setPaymentMethods} busy={busy} onSave={savePayment} />:null}
        {tab==="settings"?<SettingsView settings={settings} config={config} setConfig={setConfig} guidebook={guidebook} busy={busy} onSave={saveSettings} onUpload={uploadGuidebook} />:null}
      </div>
    </section>

    {selectedOrder?<OrderDrawer order={selectedOrder} license={orderLicense(selectedOrder.license_id)} busy={busy} onClose={()=>setSelectedOrder(null)} onAction={orderAction} />:null}
    {selectedLicense?<LicenseDrawer license={selectedLicense} devices={activeDevices(selectedLicense.id)} busy={busy} onClose={()=>setSelectedLicense(null)} onAction={licenseAction} />:null}
  </main>;

  function goTab(next:Tab){setTab(next);setMobileNav(false)}
}

function DashboardView({analytics,orders,settings,licenses,awaiting,onVerify}:any){
  const max=Math.max(...analytics.last7.map((x:any)=>x.value),1);
  const activity=orders.slice(0,7);
  return <>
    <PageHeader eyebrow="OVERVIEW" title="Dashboard" text="Pantau order, pembayaran, lisensi, dan pengiriman email ARUNIKA dari satu tempat." />
    <section className="admin-kpi-grid">
      <KpiCard icon="chart" label="Omzet hari ini" value={money(analytics.todayRevenue)} helper={`${analytics.ordersToday} order masuk`} />
      <KpiCard icon="calendar" label="Omzet bulan ini" value={money(analytics.monthRevenue)} helper="Order selesai" />
      <KpiCard icon="clock" label="Perlu verifikasi" value={String(analytics.awaiting)} helper={analytics.awaiting?"Butuh tindakan admin":"Semua aman"} danger={analytics.awaiting>0} />
      <KpiCard icon="crown" label="Lisensi tersedia" value={String(licenses.filter((l:License)=>l.status==="unused").length)} helper="Siap dialokasikan" />
    </section>

    <section className="admin-dashboard-grid">
      <article className="panel admin-dashboard-card admin-sales-card">
        <div className="admin-card-head-v2"><div><span className="eyebrow">7 HARI TERAKHIR</span><h2>Penjualan</h2></div><strong>{money(analytics.last7.reduce((n:number,x:any)=>n+x.value,0))}</strong></div>
        <div className="admin-sales-bars">{analytics.last7.map((x:any)=><div key={x.key}><div className="admin-bar-track"><span style={{height:`${Math.max(5,Math.round((x.value/max)*100))}%`}}/></div><small>{x.label}</small></div>)}</div>
      </article>

      <article className="panel admin-dashboard-card admin-system-card">
        <div className="admin-card-head-v2"><div><span className="eyebrow">AUTOMATION</span><h2>Status sistem</h2></div><span className="admin-ok-pill">AKTIF</span></div>
        <SystemLine label="Harga Pro" value={money(settings?.price||49000)} />
        <SystemLine label="Email admin" value={settings?.admin_email||"Belum diatur"} />
        <SystemLine label="Kode + PIN" value={settings?.requires_pin?"Aktif":"Kode saja"} />
        <SystemLine label="Perangkat / lisensi" value={`${settings?.max_devices_default||2} perangkat`} />
      </article>
    </section>

    <section className="admin-dashboard-grid bottom">
      <article className="panel admin-dashboard-card">
        <div className="admin-card-head-v2"><div><span className="eyebrow">PERLU TINDAKAN</span><h2>Pembayaran menunggu verifikasi</h2></div><span>{awaiting.length}</span></div>
        <div className="admin-action-list">
          {awaiting.slice(0,5).map((o:Order)=><button key={o.id} onClick={()=>onVerify(o)}><div><strong>{o.order_code}</strong><span>{o.buyer_name} · {o.payment_method_snapshot?.label||"Pembayaran"}</span></div><b>{money(o.amount)}</b><Icon name="arrow" size={15}/></button>)}
          {!awaiting.length?<div className="admin-empty-compact"><Icon name="check" size={22}/><span>Tidak ada pembayaran yang menunggu verifikasi.</span></div>:null}
        </div>
      </article>

      <article className="panel admin-dashboard-card">
        <div className="admin-card-head-v2"><div><span className="eyebrow">AKTIVITAS</span><h2>Terbaru</h2></div><span>{activity.length}</span></div>
        <div className="admin-activity-list">
          {activity.map((o:Order)=><div key={o.id}><span className={`activity-dot ${o.status}`}/><div><strong>{o.buyer_name}</strong><span>{o.order_code} · {orderLabel(o.status)}</span></div><small>{shortTime(o.created_at)}</small></div>)}
          {!activity.length?<div className="admin-empty-compact">Belum ada aktivitas.</div>:null}
        </div>
      </article>
    </section>
  </>;
}

function OrdersView({orders,search,setSearch,statusFilter,setStatusFilter,onOpen}:any){
  return <>
    <PageHeader eyebrow="TRANSACTIONS" title="Pesanan" text="Cari pembeli, periksa klaim pembayaran, dan selesaikan order tanpa copy-paste kode aktivasi." />
    <section className="admin-filterbar panel">
      <label><Icon name="search" size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari nama, email, WhatsApp, order…"/></label>
      <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
        <option value="all">Semua status</option>
        <option value="pending_payment">Menunggu pembayaran</option>
        <option value="awaiting_verification">Perlu verifikasi</option>
        <option value="license_ready">Lisensi siap</option>
        <option value="completed">Selesai</option>
        <option value="cancelled">Dibatalkan</option>
      </select>
      <span>{orders.length} order</span>
    </section>
    <section className="panel admin-table-card admin-table-card-v2">
      <div className="admin-table-scroll"><table className="admin-table admin-table-v2">
        <thead><tr><th>Order</th><th>Pembeli</th><th>Metode</th><th>Total</th><th>Status</th><th>Email</th><th/></tr></thead>
        <tbody>{orders.map((o:Order)=><tr key={o.id}>
          <td><strong>{o.order_code}</strong><small>{dt(o.created_at)}</small></td>
          <td><strong>{o.buyer_name}</strong><small>{o.email}<br/>{o.whatsapp}</small></td>
          <td><strong>{o.payment_method_snapshot?.label||"—"}</strong><small>{o.payment_method_snapshot?.type||""}</small></td>
          <td><strong>{money(o.amount)}</strong></td>
          <td><OrderStatus status={o.status}/></td>
          <td><EmailStatus order={o}/></td>
          <td><button className="admin-row-open" onClick={()=>onOpen(o)}>Detail <Icon name="arrow" size={14}/></button></td>
        </tr>)}
        {!orders.length?<tr><td colSpan={7} className="empty-table">Tidak ada pesanan yang cocok.</td></tr>:null}</tbody>
      </table></div>
    </section>
  </>;
}

function LicensesView({licenses,devices,search,setSearch,revealed,setRevealed,onOpen,onGenerate,busy}:any){
  const deviceCount=(id:string)=>devices.filter((d:Device)=>d.license_id===id&&!d.revoked_at).length;
  return <>
    <PageHeader eyebrow="LICENSE INVENTORY" title="Lisensi" text="Stok lisensi ARUNIKA, pemilik, status aktivasi, dan perangkat terhubung." actions={<div className="admin-head-actions"><button className="ghost-btn" disabled={busy} onClick={()=>onGenerate(10)}>+10 kode</button><button className="netflix-play" disabled={busy} onClick={()=>onGenerate(100)}>+100 kode</button></div>} />
    <section className="admin-license-summary">
      <LicenseMini label="Total" value={licenses.length}/>
      <LicenseMini label="Tersedia" value={licenses.filter((l:License)=>l.status==="unused").length}/>
      <LicenseMini label="Reserved" value={licenses.filter((l:License)=>l.status==="reserved").length}/>
      <LicenseMini label="Aktif" value={licenses.filter((l:License)=>l.status==="active").length}/>
      <LicenseMini label="Disabled" value={licenses.filter((l:License)=>l.status==="disabled").length}/>
    </section>
    <section className="admin-filterbar panel one-search"><label><Icon name="search" size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari kode, pembeli, kontak, status…"/></label><span>{licenses.length} lisensi</span></section>
    <section className="panel admin-table-card admin-table-card-v2">
      <div className="admin-table-scroll"><table className="admin-table admin-table-v2">
        <thead><tr><th>Kode</th><th>Status</th><th>Pemilik</th><th>Perangkat</th><th>Aktivasi</th><th/></tr></thead>
        <tbody>{licenses.map((l:License)=><tr key={l.id}>
          <td><div className="license-code-cell"><strong>{revealed[l.id]?l.license_code:maskLicense(l.license_code)}</strong><button onClick={()=>setRevealed((v:any)=>({...v,[l.id]:!v[l.id]}))}>{revealed[l.id]?"Sembunyikan":"Lihat"}</button></div></td>
          <td><LicenseStatus status={l.status}/></td>
          <td><strong>{l.buyer_name||"Belum dialokasikan"}</strong><small>{l.buyer_contact||"—"}</small></td>
          <td><strong>{deviceCount(l.id)}/{l.max_devices||2}</strong><small>aktif</small></td>
          <td><strong>{l.first_activated_at?dt(l.first_activated_at):"Belum aktif"}</strong></td>
          <td><button className="admin-row-open" onClick={()=>onOpen(l)}>Kelola <Icon name="arrow" size={14}/></button></td>
        </tr>)}</tbody>
      </table></div>
    </section>
  </>;
}

function EmailView({orders,analytics,busy,onRefresh,onResend}:any){
  const list=orders.filter((o:Order)=>o.final_email_sent_at||o.status==="license_ready"||o.status==="completed");
  return <>
    <PageHeader eyebrow="EMAIL AUTOMATION" title="Email" text="Pantau email notifikasi pembayaran dan email kode aktivasi yang dikirim otomatis oleh sistem." />
    <section className="admin-kpi-grid email-kpis">
      <KpiCard icon="upload" label="Email aktivasi terkirim" value={String(analytics.sent)} helper="Memiliki timestamp kirim" />
      <KpiCard icon="check" label="Delivered / dibuka" value={String(analytics.delivered)} helper="Status provider" />
      <KpiCard icon="clock" label="Menunggu email" value={String(orders.filter((o:Order)=>o.status==="license_ready"&&!o.final_email_sent_at).length)} helper="Lisensi sudah siap" />
      <KpiCard icon="x" label="Gagal / bounced" value={String(analytics.failed)} helper={analytics.failed?"Perlu diperiksa":"Tidak ada masalah"} danger={analytics.failed>0} />
    </section>

    <section className="panel admin-email-flow-card">
      <span className="eyebrow">AUTOMATION FLOW</span>
      <div className="admin-email-flow">
        <div><span>1</span><strong>User klik “Sudah Bayar”</strong><small>Email admin + pembeli otomatis</small></div><i>→</i>
        <div><span>2</span><strong>Admin konfirmasi</strong><small>Lisensi + PIN dialokasikan</small></div><i>→</i>
        <div><span>3</span><strong>Email aktivasi</strong><small>Kode dikirim otomatis</small></div>
      </div>
    </section>

    <section className="panel admin-table-card admin-table-card-v2">
      <div className="admin-table-scroll"><table className="admin-table admin-table-v2">
        <thead><tr><th>Pembeli</th><th>Order</th><th>Notifikasi klaim</th><th>Email aktivasi</th><th>Terakhir dicek</th><th>Aksi</th></tr></thead>
        <tbody>{list.map((o:Order)=><tr key={o.id}>
          <td><strong>{o.buyer_name}</strong><small>{o.email}</small></td>
          <td><strong>{o.order_code}</strong></td>
          <td><div className="email-mini-status"><span className={o.admin_notified_at?"ok":"muted"}>Admin {o.admin_notified_at?"✓":"—"}</span><span className={o.buyer_notified_at?"ok":"muted"}>Pembeli {o.buyer_notified_at?"✓":"—"}</span></div></td>
          <td><EmailStatus order={o}/>{o.final_email_error?<small className="email-error">{o.final_email_error}</small>:null}</td>
          <td>{dt(o.final_email_delivery_checked_at||o.final_email_sent_at)}</td>
          <td><div className="table-actions">{o.final_email_resend_id?<button disabled={busy} onClick={()=>onRefresh(o)}>Cek status</button>:null}{["license_ready","completed"].includes(o.status)?<button className="approve" disabled={busy} onClick={()=>onResend(o)}>Kirim ulang</button>:null}</div></td>
        </tr>)}
        {!list.length?<tr><td colSpan={6} className="empty-table">Belum ada email aktivasi.</td></tr>:null}</tbody>
      </table></div>
    </section>
  </>;
}

function PaymentsView({methods,setMethods,busy,onSave}:any){
  function patch(id:string,key:string,value:any){setMethods((rows:PaymentMethod[])=>rows.map(row=>row.id===id?{...row,[key]:value}:row))}
  return <>
    <PageHeader eyebrow="PAYMENT CONFIG" title="Pembayaran" text="Konfigurasi ini khusus ARUNIKA. Perubahan nomor atau instruksi tidak mengubah konfigurasi produk Dailyn." />
    <section className="admin-payment-grid">
      {methods.map((m:PaymentMethod)=><article className={`panel admin-payment-card ${m.active?"active":"inactive"}`} key={m.id}>
        <div className="admin-payment-head"><div><span className={`payment-method-badge ${m.type}`}>{m.type.toUpperCase()}</span><h3>{m.label}</h3></div><label className="admin-toggle"><input type="checkbox" checked={m.active} onChange={e=>patch(m.id,"active",e.target.checked)}/><span/></label></div>
        <div className="admin-form-grid">
          <label><span>Nama metode</span><input value={m.label} onChange={e=>patch(m.id,"label",e.target.value)}/></label>
          <label><span>Atas nama</span><input value={m.account_name||""} onChange={e=>patch(m.id,"account_name",e.target.value)}/></label>
          <label className="wide"><span>Nomor / ID tujuan</span><input value={m.account_number||""} onChange={e=>patch(m.id,"account_number",e.target.value)}/></label>
          <label><span>Urutan</span><input type="number" min="0" value={m.sort_order} onChange={e=>patch(m.id,"sort_order",Number(e.target.value))}/></label>
          <label className="wide"><span>Instruksi pembayaran</span><textarea rows={3} value={m.instructions||""} onChange={e=>patch(m.id,"instructions",e.target.value)}/></label>
        </div>
        <button className="ghost-btn full" disabled={busy||!m.base_active} onClick={()=>onSave(m)}>Simpan {m.label}</button>
      </article>)}
    </section>
  </>;
}

function SettingsView({settings,config,setConfig,guidebook,busy,onSave,onUpload}:any){
  const patch=(key:keyof ConfigDraft,value:string)=>setConfig((v:ConfigDraft)=>({...v,[key]:value}));
  return <>
    <PageHeader eyebrow="PRODUCT SETTINGS" title="Pengaturan" text="Atur tujuan notifikasi, identitas email, dan guidebook. Data personal pengguna tetap tidak masuk dashboard admin." />
    <section className="admin-settings-grid">
      <article className="panel admin-settings-card">
        <div className="admin-card-head-v2"><div><span className="eyebrow">EMAIL & NOTIFIKASI</span><h2>Identitas pengirim</h2></div></div>
        <div className="admin-form-grid">
          <label><span>Email admin</span><input type="email" value={config.adminEmail} onChange={e=>patch("adminEmail",e.target.value)} placeholder="admin@email.com"/></label>
          <label><span>WhatsApp admin</span><input value={config.adminWhatsapp} onChange={e=>patch("adminWhatsapp",e.target.value)} placeholder="08xxxxxxxxxx"/></label>
          <label className="wide"><span>Email From</span><input value={config.emailFrom} onChange={e=>patch("emailFrom",e.target.value)} placeholder="Arunika <noreply@domain.com>"/></label>
          <label><span>Brand email</span><input value={config.emailBrandLabel} onChange={e=>patch("emailBrandLabel",e.target.value)}/></label>
          <label><span>Admin URL</span><input value={config.adminUrl} onChange={e=>patch("adminUrl",e.target.value)}/></label>
          <label className="wide"><span>Tagline email</span><input value={config.emailTagline} onChange={e=>patch("emailTagline",e.target.value)}/></label>
          <label className="wide"><span>Catatan pembelian</span><textarea rows={3} value={config.purchaseNote} onChange={e=>patch("purchaseNote",e.target.value)}/></label>
        </div>
        <button className="netflix-play" disabled={busy} onClick={onSave}>Simpan pengaturan</button>
      </article>

      <article className="panel admin-settings-card admin-product-settings-card">
        <span className="eyebrow">PRODUCT</span><h2>ARUNIKA Pro</h2>
        <div className="admin-readonly-list">
          <SystemLine label="Harga checkout" value={money(settings?.price||49000)} />
          <SystemLine label="Prefix order" value={settings?.order_prefix||"ARUN"} />
          <SystemLine label="Maks. perangkat" value={`${settings?.max_devices_default||2}`} />
          <SystemLine label="PIN aktivasi" value={settings?.requires_pin?"6 digit · aktif":"Tidak aktif"} />
        </div>
        <small>Parameter lisensi inti dibuat read-only di dashboard agar tidak berubah tanpa sengaja.</small>
      </article>

      <article className="panel admin-settings-card admin-guidebook-card">
        <span className="eyebrow">GUIDEBOOK</span><h2>Panduan PDF</h2>
        <p>{guidebook?.ready?"Guidebook siap dan otomatis ikut pada email aktivasi.":"Belum ada guidebook PDF. Email aktivasi tetap dapat dikirim tanpa lampiran."}</p>
        {guidebook?.ready?<div className="guidebook-ready"><Icon name="check" size={16}/><span>{Math.max(1,Math.round((guidebook.approxBytes||0)/1024))} KB tersimpan</span></div>:null}
        <label className="admin-upload-box"><Icon name="upload" size={20}/><span>{guidebook?.ready?"Ganti guidebook PDF":"Upload guidebook PDF"}</span><input type="file" accept="application/pdf" disabled={busy} onChange={e=>onUpload(e.target.files?.[0])}/></label>
      </article>

      <article className="panel admin-settings-card privacy-card">
        <span className="eyebrow">PRIVACY</span><h2>Local-first tetap terjaga</h2>
        <p>Dashboard admin hanya menangani transaksi, lisensi, perangkat, email, dan konfigurasi produk. Buku, video, habit, highlight, dan catatan pribadi pengguna tetap berada di perangkat pengguna.</p>
      </article>
    </section>
  </>;
}

function OrderDrawer({order,license,busy,onClose,onAction}:any){
  return <div className="admin-drawer-backdrop" onClick={onClose}>
    <aside className="admin-detail-drawer" onClick={e=>e.stopPropagation()}>
      <div className="admin-drawer-head"><div><span className="eyebrow">ORDER DETAIL</span><h2>{order.order_code}</h2></div><button onClick={onClose}><Icon name="x" size={20}/></button></div>
      <OrderStatus status={order.status}/>
      <div className="admin-detail-section"><h3>Pembeli</h3><DetailLine label="Nama" value={order.buyer_name}/><DetailLine label="Email" value={order.email}/><DetailLine label="WhatsApp" value={order.whatsapp}/></div>
      <div className="admin-detail-section"><h3>Pembayaran</h3><DetailLine label="Total" value={money(order.amount)}/><DetailLine label="Metode" value={order.payment_method_snapshot?.label||"—"}/><DetailLine label="Diklaim" value={dt(order.payment_claimed_at)}/></div>
      <div className="admin-detail-section"><h3>Lisensi</h3><DetailLine label="Kode" value={license?.license_code||"Belum dialokasikan"}/><DetailLine label="Email aktivasi" value={emailLabel(order.final_email_delivery_status)}/></div>
      <div className="admin-drawer-actions">
        {order.status==="awaiting_verification"?<button className="netflix-play full" disabled={busy} onClick={()=>onAction("assignLicense",order.id)}><Icon name="check" size={16}/> Konfirmasi Pembayaran & Kirim Kode</button>:null}
        {["license_ready","completed"].includes(order.status)?<button className="ghost-btn full" disabled={busy} onClick={()=>onAction("resendEmail",order.id)}>Kirim Ulang Email Aktivasi</button>:null}
        {order.final_email_resend_id?<button className="ghost-btn full" disabled={busy} onClick={()=>onAction("refreshEmailStatus",order.id)}>Periksa Status Email</button>:null}
        {["pending_payment","awaiting_verification","license_ready"].includes(order.status)?<button className="danger-btn full" disabled={busy} onClick={()=>{if(confirm("Batalkan pesanan ini?"))onAction("cancel",order.id)}}>Batalkan Pesanan</button>:null}
      </div>
    </aside>
  </div>;
}

function LicenseDrawer({license,devices,busy,onClose,onAction}:any){
  return <div className="admin-drawer-backdrop" onClick={onClose}>
    <aside className="admin-detail-drawer" onClick={e=>e.stopPropagation()}>
      <div className="admin-drawer-head"><div><span className="eyebrow">LICENSE DETAIL</span><h2>{license.license_code}</h2></div><button onClick={onClose}><Icon name="x" size={20}/></button></div>
      <LicenseStatus status={license.status}/>
      <div className="admin-detail-section"><h3>Pemilik</h3><DetailLine label="Nama" value={license.buyer_name||"Belum dialokasikan"}/><DetailLine label="Kontak" value={license.buyer_contact||"—"}/><DetailLine label="Aktivasi pertama" value={dt(license.first_activated_at)}/></div>
      <div className="admin-detail-section"><h3>Perangkat aktif · {devices.length}/{license.max_devices||2}</h3>
        <div className="admin-device-list">{devices.map((d:Device)=><div key={d.id}><div><strong>{d.device_name||"Perangkat"}</strong><span>Aktif {dt(d.activated_at)} · terakhir {dt(d.last_seen)}</span></div><button disabled={busy} onClick={()=>onAction("revokeDevice",license.id,{deviceRecordId:d.id})}>Cabut</button></div>)}
        {!devices.length?<p>Belum ada perangkat aktif.</p>:null}</div>
      </div>
      <div className="admin-drawer-actions">
        {devices.length?<button className="ghost-btn full" disabled={busy} onClick={()=>{if(confirm("Reset semua perangkat untuk lisensi ini?"))onAction("resetAllDevices",license.id)}}>Reset Semua Perangkat</button>:null}
        {license.status==="disabled"?<button className="netflix-play full" disabled={busy} onClick={()=>onAction("enable",license.id)}>Aktifkan Lisensi</button>:<button className="danger-btn full" disabled={busy} onClick={()=>{if(confirm("Nonaktifkan lisensi ini?"))onAction("disable",license.id)}}>Nonaktifkan Lisensi</button>}
      </div>
    </aside>
  </div>;
}

function SideNavButton({icon,label,badge,active,onClick}:any){return <button className={active?"active":""} onClick={onClick}><Icon name={icon} size={18}/><span>{label}</span>{badge?<b>{badge}</b>:null}</button>}
function PageHeader({eyebrow,title,text,actions}:any){return <section className="admin-page-head"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>{actions?<div>{actions}</div>:null}</section>}
function KpiCard({icon,label,value,helper,danger=false}:any){return <article className={`panel admin-kpi-card ${danger?"danger":""}`}><span className="admin-kpi-icon"><Icon name={icon} size={19}/></span><small>{label}</small><strong>{value}</strong><p>{helper}</p></article>}
function SystemLine({label,value}:{label:string;value:string}){return <div className="admin-system-line"><span>{label}</span><strong>{value}</strong></div>}
function LicenseMini({label,value}:{label:string;value:number}){return <div className="panel admin-license-mini"><span>{label}</span><strong>{value}</strong></div>}
function OrderStatus({status}:{status:string}){return <span className={`order-status ${status}`}>{orderLabel(status)}</span>}
function LicenseStatus({status}:{status:string}){return <span className={`license-status-badge ${status}`}>{status==="unused"?"Tersedia":status==="reserved"?"Reserved":status==="active"?"Aktif":status==="disabled"?"Disabled":status}</span>}
function EmailStatus({order}:{order:Order}){const status=order.final_email_delivery_status||(order.final_email_sent_at?"sent":null);const failed=Boolean(order.final_email_error)||["failed","bounced","suppressed","complained"].includes(String(status||""));return <span className={`email-status-badge ${failed?"failed":status||"waiting"}`}>{failed?"Gagal":emailLabel(status)}</span>}
function DetailLine({label,value}:{label:string;value:string}){return <div className="admin-detail-line"><span>{label}</span><strong>{value}</strong></div>}
function shortTime(value:string){const d=new Date(value);return new Intl.DateTimeFormat("id-ID",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}).format(d)}
function tabName(tab:Tab){return ({dashboard:"Dashboard",orders:"Pesanan",licenses:"Lisensi",email:"Email",payments:"Pembayaran",settings:"Pengaturan"} as Record<Tab,string>)[tab]}
function fileToBase64(file:File):Promise<string>{return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||""));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file)})}
