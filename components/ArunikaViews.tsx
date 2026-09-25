"use client";

import { useEffect, useState } from "react";
import { BarChart, Donut, GenreBars } from "./Charts";
import { Icon } from "./Icon";
import { Modal } from "./Modal";
import { readFileAsDataUrl } from "@/lib/file";
import type { Book, HabitDay, LearningItem, ReadingSession, Settings } from "@/lib/types";
import { bookStatusLabel, dateLabel, learningStatusLabel, monthKey, percent, rupiah, todayISO, uid } from "@/lib/utils";
import type { Snapshot } from "./app-types";

export function Overview({ data, metrics, insights, onTab, onSession }: any) {
  const targetPct = percent(metrics.finishedBooks.length, data.settings.yearlyBookTarget);
  const todayPages = metrics.todayHabit?.pages || 0;
  const continueBook = metrics.readingBooks[0];
  return (
    <div className="page-stack">
      <section className="hero-dashboard panel sunrise-panel">
        <div>
          <div className="eyebrow">Selamat datang, {data.settings.name}</div>
          <h2>Catat yang dibaca. Simpan yang dipelajari. <em>Tumbuh setiap hari.</em></h2>
          <p>Semua perjalanan membaca dan belajarmu tersimpan lokal di perangkat ini.</p>
          <div className="hero-buttons"><button className="primary-btn" onClick={onSession}><Icon name="plus" size={17}/> Catat sesi baca</button><button className="ghost-btn" onClick={() => onTab("learning")}>Tambah learning</button></div>
        </div>
        <Donut value={metrics.finishedBooks.length} total={data.settings.yearlyBookTarget} label="target buku" />
      </section>

      <section className="stat-grid">
        <Stat label="Buku selesai" value={`${metrics.finishedBooks.length}/${data.settings.yearlyBookTarget}`} helper={`${targetPct}% target tahunan`} icon="book" />
        <Stat label="Hari ini" value={`${todayPages}/${data.settings.dailyPageTarget}`} helper="halaman target harian" icon="target" />
        <Stat label="Reading streak" value={`${metrics.streak} hari`} helper="jaga ritmenya" icon="sparkles" />
        <Stat label="Learning time" value={`${metrics.learningMinutes} mnt`} helper={`${metrics.finishedLearning.length} konten selesai`} icon="play" />
      </section>

      <section className="dashboard-grid">
        <div className="panel section-panel span-7">
          <SectionHead eyebrow="Continue reading" title="Lanjutkan bacaanmu" action={<button className="small-link" onClick={() => onTab("books")}>Lihat semua <Icon name="arrow" size={15}/></button>} />
          {continueBook ? <BookHero book={continueBook} onSession={onSession} /> : <EmptyState icon="book" title="Belum ada buku aktif" text="Tambahkan buku dan mulai perjalanan membaca." />}
        </div>
        <div className="panel section-panel span-5">
          <SectionHead eyebrow="Monthly reads" title="Ritme membaca" />
          <BarChart data={insights.monthlyBooks} />
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel section-panel span-5">
          <SectionHead eyebrow="Learning queue" title="Belajar berikutnya" action={<button className="small-link" onClick={() => onTab("learning")}>Buka tracker <Icon name="arrow" size={15}/></button>} />
          <div className="compact-list">
            {data.learning.slice(0, 3).map((item: LearningItem) => <div className="compact-row" key={item.id}><div className="tiny-art"><Icon name="play" size={16}/></div><div><strong>{item.title}</strong><span>{item.channel} · {item.source}</span></div><b>{percent(item.watchedMinutes,item.totalMinutes)}%</b></div>)}
          </div>
        </div>
        <div className="panel section-panel span-7">
          <SectionHead eyebrow="Knowledge highlights" title="Yang layak diingat" action={<button className="small-link" onClick={() => onTab("knowledge")}>Knowledge vault <Icon name="arrow" size={15}/></button>} />
          <div className="quote-grid">
            {data.sessions.filter((s: ReadingSession) => s.highlight).slice(-2).reverse().map((session: ReadingSession) => <div className="quote-card" key={session.id}><Icon name="quote"/><p>{session.highlight}</p><span>{data.books.find((b: Book)=>b.id===session.bookId)?.title}</span></div>)}
          </div>
        </div>
      </section>
    </div>
  );
}

export function BooksView({ books, query, setQuery, filter, setFilter, onAdd, onEdit, onDelete }: any) {
  return (
    <div className="page-stack">
      <PageIntro eyebrow="Reading log" title="Perpustakaan buku" text="Kelola bacaan, progress, rating, harga, kepemilikan, review, dan cover buku dalam satu tempat." button={<button className="primary-btn" onClick={onAdd}><Icon name="plus" size={17}/> Tambah buku</button>} />
      <div className="toolbar panel">
        <label className="search-box"><Icon name="search" size={18}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Cari judul, penulis, atau genre…" /></label>
        <select value={filter} onChange={(e)=>setFilter(e.target.value)}><option value="all">Semua status</option><option value="reading">Sedang dibaca</option><option value="finished">Selesai</option><option value="wishlist">Waiting list</option><option value="unfinished">Tidak selesai</option></select>
      </div>
      <div className="library-grid">
        {books.map((book: Book) => <BookTile key={book.id} book={book} onEdit={()=>onEdit(book)} onDelete={()=>onDelete(book.id)} />)}
        {!books.length ? <div className="panel full-row"><EmptyState icon="book" title="Tidak ada buku ditemukan" text="Coba ubah filter atau tambahkan buku baru." /></div> : null}
      </div>
    </div>
  );
}

export function LearningView({ items, query, setQuery, filter, setFilter, onAdd, onEdit, onDelete }: any) {
  return (
    <div className="page-stack">
      <PageIntro eyebrow="Learning log" title="Video, webinar, podcast & course" text="Track durasi, topik, sumber, progress, rating, dan highlights dari setiap konten yang kamu pelajari." button={<button className="primary-btn" onClick={onAdd}><Icon name="plus" size={17}/> Tambah learning</button>} />
      <div className="toolbar panel">
        <label className="search-box"><Icon name="search" size={18}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Cari judul, channel, topik, sumber…" /></label>
        <select value={filter} onChange={(e)=>setFilter(e.target.value)}><option value="all">Semua status</option><option value="watching">Ditonton</option><option value="finished">Selesai</option><option value="wishlist">Waiting list</option><option value="unfinished">Tidak selesai</option></select>
      </div>
      <div className="learning-grid">
        {items.map((item: LearningItem) => <LearningTile key={item.id} item={item} onEdit={()=>onEdit(item)} onDelete={()=>onDelete(item.id)} />)}
        {!items.length ? <div className="panel full-row"><EmptyState icon="play" title="Belum ada learning item" text="Tambahkan video, webinar, podcast, course, atau artikel." /></div> : null}
      </div>
    </div>
  );
}

export function SessionsView({ sessions, books, onAdd, onDelete }: any) {
  const sorted = [...sessions].sort((a: ReadingSession,b: ReadingSession)=>b.date.localeCompare(a.date));
  return (
    <div className="page-stack">
      <PageIntro eyebrow="Reading sessions" title="Catat setiap sesi membaca" text="Masukkan halaman awal, halaman akhir, durasi, catatan, dan highlight. Progress buku dan habit harian akan diperbarui otomatis." button={<button className="primary-btn" onClick={()=>onAdd(books.find((b:Book)=>b.status==="reading")?.id || "")}><Icon name="plus" size={17}/> Sesi baru</button>} />
      <div className="session-list">
        {sorted.map((session: ReadingSession) => {
          const book = books.find((b: Book)=>b.id===session.bookId);
          return <div className="panel session-row" key={session.id}><div className="session-date"><strong>{new Date(session.date+"T00:00:00").getDate()}</strong><span>{new Intl.DateTimeFormat("id-ID",{month:"short"}).format(new Date(session.date+"T00:00:00"))}</span></div><div className="session-main"><div className="session-title"><div><strong>{book?.title || "Buku dihapus"}</strong><span>{session.startPage} → {session.endPage} · {Math.max(0,session.endPage-session.startPage)} halaman · {session.minutes} menit</span></div><button className="icon-btn danger" onClick={()=>onDelete(session.id)}><Icon name="trash" size={17}/></button></div>{session.notes ? <p>{session.notes}</p> : null}{session.highlight ? <div className="inline-highlight"><Icon name="quote" size={16}/>{session.highlight}</div> : null}</div></div>
        })}
        {!sorted.length ? <div className="panel"><EmptyState icon="clock" title="Belum ada sesi" text="Mulai catat kebiasaan membaca per sesi." /></div> : null}
      </div>
    </div>
  );
}

export function HabitView({ habit, settings, onAdd }: any) {
  const now = new Date();
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const year = cursor.getFullYear(), month = cursor.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay()+6)%7;
  const monthPrefix = `${year}-${String(month+1).padStart(2,"0")}`;
  const monthData = habit.filter((h: HabitDay)=>monthKey(h.date)===monthPrefix);
  const totalPages = monthData.reduce((n:number,h:HabitDay)=>n+h.pages,0);
  const totalMinutes = monthData.reduce((n:number,h:HabitDay)=>n+h.minutes,0);
  const readingDays = monthData.filter((h:HabitDay)=>h.readToday).length;
  return <div className="page-stack">
    <PageIntro eyebrow="Book habit tracker" title="Bangun ritme membaca" text="Isi apakah kamu membaca hari ini, berapa menit, dan berapa halaman. Lihat recap bulanan dalam kalender yang sederhana." button={<button className="primary-btn" onClick={onAdd}><Icon name="plus" size={17}/> Isi hari ini</button>} />
    <section className="stat-grid three">
      <Stat label="Total halaman" value={`${totalPages}`} helper="bulan ini" icon="book" />
      <Stat label="Total menit" value={`${totalMinutes}`} helper="waktu membaca" icon="clock" />
      <Stat label="Hari membaca" value={`${readingDays}/${days}`} helper={`target ${settings.dailyPageTarget} halaman/hari`} icon="calendar" />
    </section>
    <section className="panel calendar-panel">
      <div className="calendar-head"><button className="icon-btn" onClick={()=>setCursor(new Date(year,month-1,1))}>‹</button><div><div className="eyebrow">HABIT CALENDAR</div><h3>{new Intl.DateTimeFormat("id-ID",{month:"long",year:"numeric"}).format(cursor)}</h3></div><button className="icon-btn" onClick={()=>setCursor(new Date(year,month+1,1))}>›</button></div>
      <div className="week-row">{["Sen","Sel","Rab","Kam","Jum","Sab","Min"].map(d=><span key={d}>{d}</span>)}</div>
      <div className="calendar-grid">{Array(firstDay).fill(null).map((_,i)=><div key={`e${i}`} className="day empty"/>)}{Array.from({length:days},(_,i)=>i+1).map(day=>{const date=`${monthPrefix}-${String(day).padStart(2,"0")}`;const h=habit.find((x:HabitDay)=>x.date===date);const active=Boolean(h?.readToday);return <div key={date} className={`day ${active?"active":""} ${date===todayISO()?"today":""}`}><strong>{day}</strong>{active?<><span>{h.pages} hlm</span><small>{h.minutes} mnt</small></>:<span>—</span>}</div>})}</div>
    </section>
  </div>;
}

export function KnowledgeView({ data }: { data: Snapshot }) {
  const notes = data.sessions.filter(s=>s.notes || s.highlight).map(s=>({id:s.id,type:"Buku",title:data.books.find(b=>b.id===s.bookId)?.title||"Buku",date:s.date,note:s.notes,highlight:s.highlight}));
  const learning = data.learning.filter(l=>l.highlights).map(l=>({id:l.id,type:l.type,title:l.title,date:l.finishDate||l.startDate||l.createdAt.slice(0,10),note:"",highlight:l.highlights}));
  const reviews = data.books.filter(b=>b.review).map(b=>({id:b.id,type:"Review",title:b.title,date:b.finishDate||b.startDate||b.createdAt.slice(0,10),note:b.review,highlight:""}));
  const all=[...notes,...learning,...reviews].sort((a,b)=>b.date.localeCompare(a.date));
  return <div className="page-stack"><PageIntro eyebrow="Knowledge vault" title="Simpan hal yang layak diingat" text="Semua review buku, catatan sesi, highlights, dan takeaway learning dikumpulkan menjadi knowledge vault pribadi." />
    <div className="knowledge-grid">{all.map(item=><article className="panel knowledge-card" key={`${item.type}-${item.id}`}><div className="knowledge-meta"><span>{item.type}</span><time>{dateLabel(item.date)}</time></div><h3>{item.title}</h3>{item.highlight?<blockquote>{item.highlight}</blockquote>:null}{item.note?<p>{item.note}</p>:null}</article>)}{!all.length?<div className="panel full-row"><EmptyState icon="bulb" title="Knowledge vault masih kosong" text="Catatan, review, dan highlights akan muncul di sini."/></div>:null}</div>
  </div>;
}

export function InsightsView({ data, insights, year, setYear }: any) {
  const years = Array.from(new Set([new Date().getFullYear(),...data.books.flatMap((b:Book)=>[b.startDate,b.finishDate].filter(Boolean).map((d:any)=>new Date(d).getFullYear())),...data.learning.flatMap((l:LearningItem)=>[l.startDate,l.finishDate].filter(Boolean).map((d:any)=>new Date(d).getFullYear()))])).sort((a:any,b:any)=>b-a);
  const finishedBooks = data.books.filter((b:Book)=>b.status==="finished" && b.finishDate && new Date(b.finishDate).getFullYear()===year);
  const finishedLearning = data.learning.filter((l:LearningItem)=>l.status==="finished" && l.finishDate && new Date(l.finishDate).getFullYear()===year);
  const pages=finishedBooks.reduce((n:number,b:Book)=>n+b.pagesRead,0);
  const mins=finishedLearning.reduce((n:number,l:LearningItem)=>n+l.watchedMinutes,0);
  return <div className="page-stack"><PageIntro eyebrow="Recap & insight" title="Lihat perjalananmu secara utuh" text="Recap buku dan learning sesuai tahun, monthly reads, monthly watch, genre, penulis, dan channel paling dominan." button={<select className="year-select" value={year} onChange={(e)=>setYear(Number(e.target.value))}>{years.map((y:any)=><option key={y}>{y}</option>)}</select>} />
    <section className="stat-grid"><Stat label="Total buku" value={`${finishedBooks.length}`} helper="selesai tahun ini" icon="book"/><Stat label="Halaman dibaca" value={`${pages}`} helper="dari buku selesai" icon="target"/><Stat label="Total learning" value={`${finishedLearning.length}`} helper="konten selesai" icon="play"/><Stat label="Durasi ditonton" value={`${mins} mnt`} helper="learning selesai" icon="clock"/></section>
    <section className="dashboard-grid"><div className="panel section-panel span-6"><SectionHead eyebrow="Monthly reads" title="Buku selesai per bulan"/><BarChart data={insights.monthlyBooks}/></div><div className="panel section-panel span-6"><SectionHead eyebrow="Monthly watch" title="Learning selesai per bulan"/><BarChart data={insights.monthlyLearning}/></div></section>
    <section className="dashboard-grid"><div className="panel section-panel span-4"><SectionHead eyebrow="Genre" title="Top genre"/><GenreBars items={insights.genres}/></div><div className="panel section-panel span-4"><SectionHead eyebrow="Authors" title="Top penulis"/><RankList items={insights.authors}/></div><div className="panel section-panel span-4"><SectionHead eyebrow="Channels" title="Top channel/brand"/><RankList items={insights.channels}/></div></section>
  </div>;
}

export function WishlistView({ books, learning, onBook, onLearning }: any) {
  return <div className="page-stack"><PageIntro eyebrow="Waiting list" title="Yang ingin kamu baca & pelajari" text="Simpan buku dan konten belajar untuk nanti. Saat siap, ubah statusnya menjadi sedang dibaca atau ditonton." />
    <section className="dashboard-grid"><div className="panel section-panel span-6"><SectionHead eyebrow="Books" title={`Buku (${books.length})`}/><div className="wish-list">{books.map((b:Book)=><button key={b.id} onClick={()=>onBook(b)}><div className="tiny-art"><Icon name="book" size={16}/></div><div><strong>{b.title}</strong><span>{b.author}</span></div><Icon name="arrow" size={16}/></button>)}{!books.length?<EmptyState icon="heart" title="Wishlist buku kosong" text="Tandai buku dengan status Waiting list."/>:null}</div></div><div className="panel section-panel span-6"><SectionHead eyebrow="Learning" title={`Learning (${learning.length})`}/><div className="wish-list">{learning.map((l:LearningItem)=><button key={l.id} onClick={()=>onLearning(l)}><div className="tiny-art"><Icon name="play" size={16}/></div><div><strong>{l.title}</strong><span>{l.channel} · {l.source}</span></div><Icon name="arrow" size={16}/></button>)}{!learning.length?<EmptyState icon="heart" title="Wishlist learning kosong" text="Tambahkan video atau podcast ke Waiting list."/>:null}</div></div></section>
  </div>;
}

export function SettingsView({ settings, isPro, onSave, onExport, onImport, onInstall }: any) {
  const [name,setName]=useState(settings.name);const [daily,setDaily]=useState(settings.dailyPageTarget);const [yearly,setYearly]=useState(settings.yearlyBookTarget);
  return <div className="page-stack"><PageIntro eyebrow="Settings" title="Atur Arunika sesuai ritmemu" text="Target baca, profil lokal, instalasi PWA, backup, dan status lisensi dapat dikelola dari sini." />
    <section className="settings-layout"><div className="panel settings-card"><SectionHead eyebrow="Profile & target" title="Preferensi membaca"/><div className="form-grid"><Field label="Nama"><input value={name} onChange={e=>setName(e.target.value)}/></Field><Field label="Target halaman / hari"><input type="number" min="1" value={daily} onChange={e=>setDaily(Number(e.target.value))}/></Field><Field label="Target buku / tahun"><input type="number" min="1" value={yearly} onChange={e=>setYearly(Number(e.target.value))}/></Field></div><button className="primary-btn" onClick={()=>onSave({name,dailyPageTarget:daily,yearlyBookTarget:yearly})}>Simpan pengaturan</button></div>
      <div className="panel settings-card"><SectionHead eyebrow="App" title="Install Arunika"/><p className="muted">Pasang sebagai aplikasi di home screen untuk pengalaman lebih fokus dan cepat.</p><button className="ghost-btn" onClick={onInstall}>Install / lihat panduan</button></div>
      <div className="panel settings-card"><SectionHead eyebrow="Data" title="Backup & restore"/><p className="muted">Data pribadi tetap lokal. Export JSON membuat salinan yang bisa disimpan sendiri.</p><div className="button-row"><button className="ghost-btn" onClick={onExport}><Icon name="download" size={17}/> Export</button><button className="ghost-btn" onClick={onImport}><Icon name="upload" size={17}/> Import</button></div>{!isPro?<div className="pro-lock"><Icon name="lock" size={16}/> Backup & restore tersedia di Pro.</div>:null}</div>
      <div className="panel settings-card accent"><SectionHead eyebrow="Access" title={isPro?"Arunika Pro aktif":"Mode Demo aktif"}/><p>{isPro?`Lisensi ${settings.licenseCode||"lokal"} aktif di perangkat ini.`:"Demo menyimpan data lokal dan membatasi jumlah koleksi. Upgrade Pro Rp20.000 untuk membuka mode penuh."}</p>{!isPro?<a className="primary-btn" href="/pro">Upgrade Pro · Rp20.000</a>:null}</div>
    </section>
  </div>;
}

export function BookForm({ open, book, setBook, onClose, onSubmit }: any) {
  async function cover(file?:File){if(file)setBook({...book,cover:await readFileAsDataUrl(file)});}
  return <Modal open={open} title={book.title?"Edit buku":"Tambah buku"} subtitle="Isi Reading Log Arunika." onClose={onClose} wide><form className="modal-form" onSubmit={onSubmit}><div className="form-grid two"><Field label="Judul buku *"><input required value={book.title} onChange={e=>setBook({...book,title:e.target.value})}/></Field><Field label="Penulis *"><input required value={book.author} onChange={e=>setBook({...book,author:e.target.value})}/></Field><Field label="Genre"><input value={book.genre} onChange={e=>setBook({...book,genre:e.target.value})} placeholder="Self Development"/></Field><Field label="Status"><select value={book.status} onChange={e=>setBook({...book,status:e.target.value})}><option value="reading">Sedang dibaca</option><option value="finished">Selesai</option><option value="wishlist">Waiting list</option><option value="unfinished">Tidak selesai</option></select></Field><Field label="Jumlah halaman dibaca"><input type="number" min="0" value={book.pagesRead} onChange={e=>setBook({...book,pagesRead:Number(e.target.value)})}/></Field><Field label="Total halaman"><input type="number" min="0" value={book.totalPages} onChange={e=>setBook({...book,totalPages:Number(e.target.value)})}/></Field><Field label="Tanggal mulai"><input type="date" value={book.startDate||""} onChange={e=>setBook({...book,startDate:e.target.value})}/></Field><Field label="Tanggal selesai"><input type="date" value={book.finishDate||""} onChange={e=>setBook({...book,finishDate:e.target.value})}/></Field><Field label="Rating"><select value={book.rating} onChange={e=>setBook({...book,rating:Number(e.target.value)})}>{[0,1,2,3,4,5].map(n=><option value={n} key={n}>{n?`${n} bintang`:"Belum dinilai"}</option>)}</select></Field><Field label="Harga"><input type="number" min="0" value={book.price} onChange={e=>setBook({...book,price:Number(e.target.value)})}/></Field><Field label="Jenis buku"><select value={book.type} onChange={e=>setBook({...book,type:e.target.value})}><option>Fisik</option><option>E-book</option><option>Audiobook</option></select></Field><Field label="Kepemilikan"><select value={book.ownership} onChange={e=>setBook({...book,ownership:e.target.value})}><option>Buku sendiri</option><option>Pinjam</option><option>Perpustakaan</option><option>Lainnya</option></select></Field><Field label="Cover buku"><input type="file" accept="image/*" onChange={e=>cover(e.target.files?.[0])}/></Field>{book.cover?<div className="cover-preview"><img src={book.cover} alt="Preview cover"/></div>:null}<Field label="Review / kenapa harus baca" wide><textarea rows={4} value={book.review} onChange={e=>setBook({...book,review:e.target.value})}/></Field></div><ModalActions onClose={onClose}/></form></Modal>;
}

export function LearningForm({ open, item, setItem, onClose, onSubmit }: any) {
  async function thumb(file?:File){if(file)setItem({...item,thumbnail:await readFileAsDataUrl(file)});}
  return <Modal open={open} title={item.title?"Edit learning":"Tambah learning"} subtitle="Video, webinar, podcast, course, atau artikel." onClose={onClose} wide><form className="modal-form" onSubmit={onSubmit}><div className="form-grid two"><Field label="Judul *"><input required value={item.title} onChange={e=>setItem({...item,title:e.target.value})}/></Field><Field label="Channel / Brand"><input value={item.channel} onChange={e=>setItem({...item,channel:e.target.value})}/></Field><Field label="Topik"><input value={item.topic} onChange={e=>setItem({...item,topic:e.target.value})}/></Field><Field label="Jenis"><select value={item.type} onChange={e=>setItem({...item,type:e.target.value})}><option>Video</option><option>Podcast</option><option>Webinar</option><option>Course</option><option>Article</option></select></Field><Field label="Durasi ditonton (menit)"><input type="number" min="0" value={item.watchedMinutes} onChange={e=>setItem({...item,watchedMinutes:Number(e.target.value)})}/></Field><Field label="Total durasi (menit)"><input type="number" min="0" value={item.totalMinutes} onChange={e=>setItem({...item,totalMinutes:Number(e.target.value)})}/></Field><Field label="Tanggal mulai"><input type="date" value={item.startDate||""} onChange={e=>setItem({...item,startDate:e.target.value})}/></Field><Field label="Tanggal selesai"><input type="date" value={item.finishDate||""} onChange={e=>setItem({...item,finishDate:e.target.value})}/></Field><Field label="Status"><select value={item.status} onChange={e=>setItem({...item,status:e.target.value})}><option value="watching">Ditonton</option><option value="finished">Selesai</option><option value="wishlist">Waiting list</option><option value="unfinished">Tidak selesai</option></select></Field><Field label="Rating"><select value={item.rating} onChange={e=>setItem({...item,rating:Number(e.target.value)})}>{[0,1,2,3,4,5].map(n=><option value={n} key={n}>{n?`${n} bintang`:"Belum dinilai"}</option>)}</select></Field><Field label="Sumber"><input value={item.source} onChange={e=>setItem({...item,source:e.target.value})} placeholder="YouTube / Spotify / Zoom"/></Field><Field label="Thumbnail"><input type="file" accept="image/*" onChange={e=>thumb(e.target.files?.[0])}/></Field><Field label="Highlights / takeaway" wide><textarea rows={5} value={item.highlights} onChange={e=>setItem({...item,highlights:e.target.value})}/></Field></div><ModalActions onClose={onClose}/></form></Modal>;
}

export function SessionForm({ open, session, setSession, books, onClose, onSubmit }: any) {
  const pages=Math.max(0,session.endPage-session.startPage);
  return <Modal open={open} title="Catat sesi membaca" subtitle="Progress buku dan habit harian akan diperbarui otomatis." onClose={onClose}><form className="modal-form" onSubmit={onSubmit}><div className="form-grid"><Field label="Buku"><select required value={session.bookId} onChange={e=>setSession({...session,bookId:e.target.value})}><option value="">Pilih buku</option>{books.map((b:Book)=><option value={b.id} key={b.id}>{b.title}</option>)}</select></Field><Field label="Tanggal"><input type="date" value={session.date} onChange={e=>setSession({...session,date:e.target.value})}/></Field><div className="form-grid two"><Field label="Halaman awal"><input type="number" min="0" value={session.startPage} onChange={e=>setSession({...session,startPage:Number(e.target.value)})}/></Field><Field label="Halaman akhir"><input type="number" min="0" value={session.endPage} onChange={e=>setSession({...session,endPage:Number(e.target.value)})}/></Field></div><div className="session-calc"><strong>{pages} halaman</strong><span>akan ditambahkan ke habit hari ini</span></div><Field label="Durasi (menit)"><input type="number" min="0" value={session.minutes} onChange={e=>setSession({...session,minutes:Number(e.target.value)})}/></Field><Field label="Catatan sesi"><textarea rows={3} value={session.notes} onChange={e=>setSession({...session,notes:e.target.value})}/></Field><Field label="Highlight"><textarea rows={3} value={session.highlight} onChange={e=>setSession({...session,highlight:e.target.value})}/></Field></div><ModalActions onClose={onClose}/></form></Modal>;
}

export function HabitForm({ open, existing, onClose, onSave }: any) {
  const [date,setDate]=useState(todayISO());const existingDay=existing.find((h:HabitDay)=>h.date===date);const [pages,setPages]=useState(existingDay?.pages||0);const [minutes,setMinutes]=useState(existingDay?.minutes||0);const [read,setRead]=useState(existingDay?.readToday??true);
  useEffect(()=>{const h=existing.find((x:HabitDay)=>x.date===date);setPages(h?.pages||0);setMinutes(h?.minutes||0);setRead(h?.readToday??true)},[date,existing]);
  return <Modal open={open} title="Isi habit membaca" subtitle="Catat aktivitas membaca harian." onClose={onClose}><div className="modal-form"><Field label="Tanggal"><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></Field><label className="switch-row"><input type="checkbox" checked={read} onChange={e=>setRead(e.target.checked)}/><span><strong>Baca buku hari ini?</strong><small>Tandai jika kamu sempat membaca.</small></span></label><Field label="Berapa menit?"><input type="number" min="0" value={minutes} onChange={e=>setMinutes(Number(e.target.value))}/></Field><Field label="Berapa halaman?"><input type="number" min="0" value={pages} onChange={e=>setPages(Number(e.target.value))}/></Field><div className="modal-actions"><button className="ghost-btn" onClick={onClose}>Batal</button><button className="primary-btn" onClick={()=>onSave(date,pages,minutes,read)}>Simpan habit</button></div></div></Modal>;
}

export function Onboarding({ open, settings, onFinish }: any) {
  const [step,setStep]=useState(0);const [name,setName]=useState(settings.name||"");const [daily,setDaily]=useState(settings.dailyPageTarget||20);const [yearly,setYearly]=useState(settings.yearlyBookTarget||15);
  if(!open)return null;
  return <div className="onboarding"><div className="onboard-card panel"><div className="onboard-symbol">A</div><div className="eyebrow">SELAMAT DATANG DI ARUNIKA</div>{step===0?<><h1>Tempat perjalanan membaca dan belajarmu bertumbuh.</h1><p>Catat yang dibaca. Simpan yang dipelajari. Tumbuh setiap hari.</p><button className="primary-btn" onClick={()=>setStep(1)}>Mulai setup <Icon name="arrow" size={17}/></button></>:<><h1>Atur target yang realistis.</h1><div className="form-grid"><Field label="Nama panggilan"><input value={name} onChange={e=>setName(e.target.value)}/></Field><div className="form-grid two"><Field label="Halaman / hari"><input type="number" min="1" value={daily} onChange={e=>setDaily(Number(e.target.value))}/></Field><Field label="Buku / tahun"><input type="number" min="1" value={yearly} onChange={e=>setYearly(Number(e.target.value))}/></Field></div></div><button className="primary-btn" onClick={()=>onFinish(name,daily,yearly)}>Masuk ke Arunika</button></>}</div></div>;
}

function Stat({ label, value, helper, icon }: any) { return <div className="panel stat-card"><div className="stat-icon"><Icon name={icon}/></div><div><span>{label}</span><strong>{value}</strong><small>{helper}</small></div></div>; }
function SectionHead({ eyebrow, title, action }: any) { return <div className="section-head"><div><div className="eyebrow">{eyebrow}</div><h3>{title}</h3></div>{action}</div>; }
function PageIntro({ eyebrow, title, text, button }: any) { return <section className="page-intro"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2><p>{text}</p></div>{button}</section>; }
function Field({ label, children, wide=false }: any) { return <label className={`field ${wide?"wide":""}`}><span>{label}</span>{children}</label>; }
function ModalActions({ onClose }: any) { return <div className="modal-actions"><button type="button" className="ghost-btn" onClick={onClose}>Batal</button><button type="submit" className="primary-btn">Simpan</button></div>; }
function EmptyState({ icon, title, text }: any) { return <div className="empty-state"><div className="empty-icon"><Icon name={icon}/></div><strong>{title}</strong><p>{text}</p></div>; }
function RankList({ items }: any) { return <div className="rank-list">{items.map((item:any,index:number)=><div key={item.label}><span>#{index+1}</span><strong>{item.label}</strong><b>{item.value}</b></div>)}{!items.length?<p className="muted">Belum cukup data.</p>:null}</div>; }

function BookHero({ book, onSession }: { book: Book; onSession: () => void }) {
  const pct=percent(book.pagesRead,book.totalPages);
  return <div className="book-hero"><div className="book-cover large">{book.cover?<img src={book.cover} alt={book.title}/>:<div className="cover-fallback"><span>{book.title.slice(0,1)}</span><small>ARUNIKA</small></div>}</div><div className="book-hero-main"><span className={`status-pill ${book.status}`}>{bookStatusLabel(book.status)}</span><h3>{book.title}</h3><p>{book.author} · {book.genre||"Tanpa genre"}</p><div className="progress"><span style={{width:`${pct}%`}}/></div><div className="progress-copy"><span>{book.pagesRead}/{book.totalPages} halaman</span><strong>{pct}%</strong></div><button className="primary-btn compact" onClick={onSession}>Lanjut baca</button></div></div>;
}

function BookTile({ book, onEdit, onDelete }: { book: Book; onEdit:()=>void; onDelete:()=>void }) {
  const pct=percent(book.pagesRead,book.totalPages);
  return <article className="panel book-tile"><div className="book-cover">{book.cover?<img src={book.cover} alt={book.title}/>:<div className="cover-fallback"><span>{book.title.slice(0,1)}</span><small>{book.genre||"ARUNIKA"}</small></div>}<div className="tile-actions"><button onClick={onEdit}><Icon name="edit" size={16}/></button><button className="danger" onClick={onDelete}><Icon name="trash" size={16}/></button></div></div><div className="tile-body"><div className="tile-top"><span className={`status-pill ${book.status}`}>{bookStatusLabel(book.status)}</span><span className="rating">{book.rating?`${"★".repeat(book.rating)}${"☆".repeat(5-book.rating)}`:"Belum rating"}</span></div><h3>{book.title}</h3><p>{book.author}</p><div className="progress"><span style={{width:`${pct}%`}}/></div><div className="tile-details"><span>{pct}%</span><span>{book.pagesRead}/{book.totalPages} hlm</span><span>{book.type}</span></div>{book.review?<div className="review-snippet">{book.review}</div>:null}</div></article>;
}

function LearningTile({ item, onEdit, onDelete }: { item: LearningItem; onEdit:()=>void; onDelete:()=>void }) {
  const pct=percent(item.watchedMinutes,item.totalMinutes);
  return <article className="panel learning-tile"><div className="learning-thumb">{item.thumbnail?<img src={item.thumbnail} alt={item.title}/>:<div className="learning-fallback"><Icon name="play" size={30}/><span>{item.type}</span></div>}<div className="tile-actions"><button onClick={onEdit}><Icon name="edit" size={16}/></button><button className="danger" onClick={onDelete}><Icon name="trash" size={16}/></button></div></div><div className="tile-body"><div className="tile-top"><span className={`status-pill ${item.status}`}>{learningStatusLabel(item.status)}</span><span>{item.source}</span></div><h3>{item.title}</h3><p>{item.channel} · {item.topic}</p><div className="progress"><span style={{width:`${pct}%`}}/></div><div className="tile-details"><span>{pct}%</span><span>{item.watchedMinutes}/{item.totalMinutes} mnt</span><span>{item.rating?`${item.rating}★`:"—"}</span></div>{item.highlights?<div className="review-snippet">{item.highlights}</div>:null}</div></article>;
}
