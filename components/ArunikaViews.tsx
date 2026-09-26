"use client";

import { useEffect, useState } from "react";
import { BarChart, Donut, GenreBars } from "./Charts";
import { Icon } from "./Icon";
import { Modal } from "./Modal";
import { readFileAsDataUrl } from "@/lib/file";
import type { Book, HabitDay, LearningItem, LearningSession, ReadingSession, Settings } from "@/lib/types";
import { bookStatusLabel, dateLabel, learningStatusLabel, monthKey, percent, rupiah, todayISO, uid } from "@/lib/utils";
import type { Snapshot } from "./app-types";
import { dailyTracker, monthlyTracker } from "@/lib/tracker";

function youtubeIdFromUrl(value: string) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const match = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/);
  return match?.[1] || "";
}

function youtubeThumbnailFromUrl(value: string) {
  const id = youtubeIdFromUrl(value);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
}

function openLearningUrl(item: LearningItem) {
  if (!item.url || typeof window === "undefined") return;
  window.open(item.url, "_blank", "noopener,noreferrer");
}

export function Overview({ data, metrics, insights, onTab, onSession }: any) {
  const featured: Book | undefined = metrics.readingBooks[0] || data.books[0];
  const continueReading = data.books.filter((b: Book) => b.status === "reading").slice(0, 8);
  const picks = [...data.books].filter((b: Book) => b.id !== featured?.id).slice(0, 10);
  const learningQueue = data.learning.filter((item: LearningItem) => item.status !== "finished").slice(0, 8);
  const todayPages = metrics.today?.pages || 0;
  const heroPct = featured ? percent(featured.pagesRead, featured.totalPages) : 0;
  const month = metrics.currentMonth;
  const monthLabel = new Intl.DateTimeFormat("id-ID",{month:"long",year:"numeric"}).format(new Date());

  return (
    <div className="stream-home">
      <section className={"stream-hero " + (featured?.cover ? "has-cover" : "no-cover")}>
        {featured?.cover ? <div className="stream-hero-art" aria-hidden="true">
          <img className="stream-hero-blur" src={featured.cover} alt=""/>
          <div className="stream-hero-art-shade"/>
          <img className="stream-hero-poster" src={featured.cover} alt=""/>
        </div> : null}

        <div className="stream-hero-content">
          <div className="hero-brandline"><span className="hero-a">A</span><span>ARUNIKA FEATURED</span></div>
          <div className="hero-kicker">Pilihan untuk {data.settings.name}</div>
          <h2>{featured?.title || "Mulai perjalanan membacamu."}</h2>
          {featured ? <div className="hero-meta"><b>{heroPct}% dibaca</b><span>{featured.genre || "Buku"}</span><span>{featured.type}</span><span>{featured.rating ? `${featured.rating}★` : "Belum dinilai"}</span></div> : null}
          <p>{featured?.review || "Catat sesi membaca dan belajar, lalu biarkan Arunika merangkum ritmemu setiap hari."}</p>
          <div className="stream-hero-actions">
            <button className="netflix-play" onClick={onSession}><Icon name="book" size={20}/> {featured ? "Catat Baca" : "Mulai Mencatat"}</button>
            <button className="netflix-more" onClick={() => onTab("habit")}><Icon name="calendar" size={19}/> Tracker Hari Ini</button>
          </div>
          {featured ? <div className="hero-progress"><div className="progress"><span style={{width:`${heroPct}%`}}/></div><small>{featured.pagesRead} / {featured.totalPages} halaman</small></div> : null}
        </div>

        <div className="hero-quick-stats">
          <div><strong>{metrics.streak}</strong><span>hari streak</span></div>
          <div><strong>{todayPages}</strong><span>halaman hari ini</span></div>
          <div><strong>{metrics.today?.totalMinutes || 0}</strong><span>menit hari ini</span></div>
        </div>
      </section>

      <div className="stream-rows">
        <MediaRail title="Lanjutkan Membaca" action={() => onTab("books")}>
          {continueReading.map((book: Book) => (
            <button className="media-card wide-card" key={book.id} onClick={() => onTab("books")}>
              <div className="media-art">
                {book.cover ? <img src={book.cover} alt={book.title}/> : <div className="poster-fallback"><span>{book.title.slice(0,1)}</span><small>{book.genre || "ARUNIKA"}</small></div>}
                <div className="media-overlay"><span className="round-play"><Icon name="book" size={18}/></span></div>
              </div>
              <div className="media-progress"><span style={{width:`${percent(book.pagesRead,book.totalPages)}%`}}/></div>
              <div className="media-caption"><strong>{book.title}</strong><span>{book.author}</span></div>
            </button>
          ))}
          {!continueReading.length ? <button className="media-card empty-media" onClick={() => onTab("books")}><Icon name="plus"/><span>Tambahkan buku</span></button> : null}
        </MediaRail>

        <section className="monthly-recap-section">
          <div className="rail-heading monthly-recap-heading">
            <div><span className="section-tag">REKAP BULAN INI</span><h3>{monthLabel}</h3></div>
            <button onClick={() => onTab("habit")}>Lihat tracker <Icon name="arrow" size={14}/></button>
          </div>
          <div className="monthly-recap-grid">
            <MonthlyMetric icon="check" label="Selesai" value={`${month.finishedBooks} buku · ${month.finishedLearning} video`} />
            <MonthlyMetric icon="play" label="On progress" value={`${month.readingInProgress} buku · ${month.learningInProgress} video`} />
            <MonthlyMetric icon="book" label="Halaman dibaca" value={String(month.pages)} helper="bulan ini" />
            <MonthlyMetric icon="clock" label="Durasi baca" value={formatMinutes(month.readingMinutes)} />
            <MonthlyMetric icon="play" label="Durasi belajar" value={formatMinutes(month.learningMinutes)} />
          </div>
        </section>

        <MediaRail title="Belajar Berikutnya" action={() => onTab("learning")}>
          {learningQueue.map((item: LearningItem) => (
            <button className="media-card learning-media" key={item.id} onClick={() => item.url ? openLearningUrl(item) : onTab("learning")}>
              <div className="media-art landscape">
                {item.thumbnail ? <img src={item.thumbnail} alt={item.title}/> : <div className="learning-poster"><Icon name="play" size={28}/><span>{item.type}</span></div>}
                <div className="media-overlay"><span className="round-play"><Icon name="play" size={18}/></span></div>
                <span className="media-badge">{item.url ? "Buka " : ""}{item.source}</span>
              </div>
              <div className="media-progress"><span style={{width:`${percent(item.watchedMinutes,item.totalMinutes)}%`}}/></div>
              <div className="media-caption"><strong>{item.title}</strong><span>{item.channel} · {item.topic}</span></div>
            </button>
          ))}
          {!learningQueue.length ? <button className="media-card empty-media" onClick={() => onTab("learning")}><Icon name="plus"/><span>Tambah learning</span></button> : null}
        </MediaRail>

        <MediaRail title="Pilihan untuk Koleksimu" action={() => onTab("wishlist")} topTen>
          {picks.map((book: Book,index:number) => (
            <button className="top-card" key={book.id} onClick={() => onTab("books")}>
              <span className="top-number">{index+1}</span>
              <div className="top-poster">
                {book.cover ? <img src={book.cover} alt={book.title}/> : <div className="poster-fallback"><span>{book.title.slice(0,1)}</span><small>{book.genre || "BOOK"}</small></div>}
                <div className="top-info"><strong>{book.title}</strong><span>{book.author}</span></div>
              </div>
            </button>
          ))}
        </MediaRail>

        <section className="stream-dashboard-row">
          <article className="stream-mini-panel">
            <div className="stream-mini-head"><div><span>Target Tahunan</span><h3>{metrics.finishedBooks.length} dari {data.settings.yearlyBookTarget} buku</h3></div><button onClick={()=>onTab("insights")}>Lihat insight</button></div>
            <Donut value={metrics.finishedBooks.length} total={data.settings.yearlyBookTarget} label="target buku"/>
          </article>
          <article className="stream-mini-panel insight-preview">
            <div className="stream-mini-head"><div><span>Aktivitas Tahun Ini</span><h3>Ritme baca & belajar</h3></div><button onClick={()=>onTab("habit")}>Habit</button></div>
            <BarChart data={insights.monthlyActivity}/>
          </article>
          <article className="stream-mini-panel knowledge-preview">
            <div className="stream-mini-head"><div><span>Knowledge Vault</span><h3>Yang layak diingat</h3></div><button onClick={()=>onTab("knowledge")}>Buka vault</button></div>
            {data.sessions.filter((x: ReadingSession)=>x.highlight).slice(-1).map((x:ReadingSession)=><blockquote key={x.id}>“{x.highlight}”</blockquote>)}
            {!data.sessions.some((x:ReadingSession)=>x.highlight)?<p>Highlight dan insight pilihanmu akan muncul di sini.</p>:null}
          </article>
        </section>
      </div>
    </div>
  );
}

function MonthlyMetric({icon,label,value,helper}:{icon:any;label:string;value:string;helper?:string}) {
  return <article className="monthly-metric">
    <span className="monthly-metric-icon"><Icon name={icon} size={18}/></span>
    <div><small>{label}</small><strong>{value}</strong>{helper?<span>{helper}</span>:null}</div>
  </article>;
}

function formatMinutes(minutes:number) {
  if (minutes < 60) return `${minutes} mnt`;
  const hours=Math.floor(minutes/60), rest=minutes%60;
  return rest ? `${hours}j ${rest}m` : `${hours} jam`;
}
function MediaRail({title,action,children,topTen=false}:{title:string;action:()=>void;children:any;topTen?:boolean}){
  return <section className={"media-rail "+(topTen?"top-ten-rail":"")}>
    <div className="rail-heading"><h3>{title}</h3><button onClick={action}>Lihat Semua <Icon name="arrow" size={14}/></button></div>
    <div className="rail-track">{children}</div>
  </section>;
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

export function LearningView({ items, query, setQuery, filter, setFilter, onAdd, onEdit, onDelete, onSession }: any) {
  return (
    <div className="page-stack">
      <PageIntro eyebrow="Learning log" title="Belajar, catat sesi, lihat ritmenya" text="Simpan video, webinar, podcast atau course. Catat durasi setiap sesi supaya aktivitas belajar otomatis masuk ke Habit." button={<button className="primary-btn" onClick={onAdd}><Icon name="plus" size={17}/> Tambah learning</button>} />
      <div className="toolbar panel">
        <label className="search-box"><Icon name="search" size={18}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Cari judul, channel, topik, sumber…" /></label>
        <select value={filter} onChange={(e)=>setFilter(e.target.value)}><option value="all">Semua status</option><option value="watching">On progress</option><option value="finished">Selesai</option><option value="wishlist">Waiting list</option><option value="unfinished">Tidak selesai</option></select>
      </div>
      <div className="learning-grid">
        {items.map((item: LearningItem) => <LearningTile key={item.id} item={item} onEdit={()=>onEdit(item)} onDelete={()=>onDelete(item.id)} onSession={()=>onSession(item)} />)}
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

export function HabitView({ data, onRead, onLearn, onDeleteRead, onDeleteLearn }: any) {
  const now = new Date();
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate,setSelectedDate]=useState(todayISO());
  const year = cursor.getFullYear(), month = cursor.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay()+6)%7;
  const monthPrefix = `${year}-${String(month+1).padStart(2,"0")}`;
  const selected = dailyTracker(data, selectedDate);
  const monthSummary = monthlyTracker(data, monthPrefix);
  const readingForDay = data.sessions.filter((session:ReadingSession)=>session.date===selectedDate);
  const learningForDay = data.learningSessions.filter((session:LearningSession)=>session.date===selectedDate);
  const monthTitle = new Intl.DateTimeFormat("id-ID",{month:"long",year:"numeric"}).format(cursor);
  const selectedLabel = new Intl.DateTimeFormat("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date(selectedDate+"T00:00:00"));

  const defaultBook = data.books.find((book:Book)=>book.status==="reading")?.id || "";
  const defaultLearning = data.learning.find((item:LearningItem)=>item.status==="watching")?.id || "";

  return <div className="page-stack habit-page">
    <PageIntro eyebrow="Daily habit tracker" title="Ritme baca & belajar" text="Pilih tanggal untuk melihat jumlah buku, halaman, video, serta durasi baca dan belajar. Semua dihitung dari sesi yang kamu catat." button={<div className="habit-intro-actions"><button className="ghost-btn" onClick={()=>onRead(defaultBook)}><Icon name="book" size={17}/> Catat baca</button><button className="primary-btn" onClick={()=>onLearn(defaultLearning)}><Icon name="play" size={17}/> Catat belajar</button></div>} />

    <section className="daily-tracker-grid">
      <article className="daily-tracker-card activity-card">
        <div className="tracker-card-head"><span>Aktivitas</span><small>{selectedDate===todayISO()?"Hari ini":selectedLabel}</small></div>
        <div className="activity-values">
          <div><strong>{selected.books}</strong><span>buku</span></div>
          <div><strong>{selected.pages}</strong><span>halaman</span></div>
          <div><strong>{selected.videos}</strong><span>video</span></div>
        </div>
      </article>

      <article className="daily-tracker-card duration-card">
        <div className="tracker-card-head"><span>Durasi</span><small>{selected.totalMinutes} menit total</small></div>
        <div className="duration-values">
          <div><i className="tracker-dot reading"/><span>Baca</span><strong>{formatMinutes(selected.readingMinutes)}</strong></div>
          <div><i className="tracker-dot learning"/><span>Belajar</span><strong>{formatMinutes(selected.learningMinutes)}</strong></div>
        </div>
      </article>

      <article className="daily-tracker-card target-card">
        <div className="tracker-card-head"><span>Target harian</span><small>{[selected.pageTargetReached,selected.readingTargetReached,selected.learningTargetReached].filter(Boolean).length}/3 tercapai</small></div>
        <TargetLine label="Halaman" value={selected.pages} target={data.settings.dailyPageTarget} unit="hlm"/>
        <TargetLine label="Durasi baca" value={selected.readingMinutes} target={data.settings.dailyReadingMinutesTarget} unit="mnt"/>
        <TargetLine label="Durasi belajar" value={selected.learningMinutes} target={data.settings.dailyLearningMinutesTarget} unit="mnt"/>
      </article>
    </section>

    <section className="panel calendar-panel habit-calendar-panel">
      <div className="calendar-head">
        <button className="icon-btn" onClick={()=>setCursor(new Date(year,month-1,1))}>‹</button>
        <div><div className="eyebrow">HABIT CALENDAR</div><h3>{monthTitle}</h3><p>{monthSummary.activeDays} hari aktif · {formatMinutes(monthSummary.totalMinutes)} aktivitas</p></div>
        <button className="icon-btn" onClick={()=>setCursor(new Date(year,month+1,1))}>›</button>
      </div>
      <div className="calendar-legend"><span><i className="tracker-dot reading"/>Baca</span><span><i className="tracker-dot learning"/>Belajar</span></div>
      <div className="week-row">{["Sen","Sel","Rab","Kam","Jum","Sab","Min"].map(d=><span key={d}>{d}</span>)}</div>
      <div className="calendar-grid">
        {Array(firstDay).fill(null).map((_,i)=><div key={`e${i}`} className="day empty"/>)}
        {Array.from({length:days},(_,i)=>i+1).map(day=>{
          const date=`${monthPrefix}-${String(day).padStart(2,"0")}`;
          const summary=dailyTracker(data,date);
          return <button type="button" key={date} className={`day habit-day ${summary.active?"active":""} ${date===todayISO()?"today":""} ${date===selectedDate?"selected":""}`} onClick={()=>setSelectedDate(date)}>
            <strong>{day}</strong>
            {summary.active?<div className="day-duration-list">
              {summary.readingMinutes>0?<span className="day-duration reading"><i/><b>{summary.readingMinutes}</b><small>m</small></span>:null}
              {summary.learningMinutes>0?<span className="day-duration learning"><i/><b>{summary.learningMinutes}</b><small>m</small></span>:null}
            </div>:<span className="day-empty-mark">—</span>}
          </button>
        })}
      </div>
    </section>

    <section className="selected-day-panel">
      <div className="selected-day-head">
        <div><span className="section-tag">DETAIL HARI</span><h3>{selectedLabel}</h3></div>
        <div className="selected-day-total">{selected.totalMinutes} menit</div>
      </div>
      <div className="day-session-columns">
        <article className="day-session-column">
          <div className="day-session-title"><span><i className="tracker-dot reading"/>Sesi baca</span><strong>{selected.readingMinutes} mnt</strong></div>
          {readingForDay.map((session:ReadingSession)=>{
            const book=data.books.find((entry:Book)=>entry.id===session.bookId);
            return <div className="day-session-row" key={session.id}><div><strong>{book?.title||"Buku"}</strong><span>{Math.max(0,session.endPage-session.startPage)} halaman · {session.minutes} menit</span></div><button className="icon-btn danger" onClick={()=>onDeleteRead(session.id)}><Icon name="trash" size={15}/></button></div>
          })}
          {!readingForDay.length?<p className="day-session-empty">Belum ada sesi baca pada tanggal ini.</p>:null}
        </article>
        <article className="day-session-column">
          <div className="day-session-title"><span><i className="tracker-dot learning"/>Sesi belajar</span><strong>{selected.learningMinutes} mnt</strong></div>
          {learningForDay.map((session:LearningSession)=>{
            const item=data.learning.find((entry:LearningItem)=>entry.id===session.learningId);
            return <div className="day-session-row" key={session.id}><div><strong>{item?.title||"Learning"}</strong><span>{session.minutes} menit · {item?.source||"Learning"}</span></div><button className="icon-btn danger" onClick={()=>onDeleteLearn(session.id)}><Icon name="trash" size={15}/></button></div>
          })}
          {!learningForDay.length?<p className="day-session-empty">Belum ada sesi belajar pada tanggal ini.</p>:null}
        </article>
      </div>
    </section>
  </div>;
}

function TargetLine({label,value,target,unit}:{label:string;value:number;target:number;unit:string}) {
  const pct=Math.min(100,target>0?Math.round((value/target)*100):0);
  return <div className="target-line"><div><span>{label}</span><b>{value}/{target} {unit}</b></div><div className="target-track"><span style={{width:`${pct}%`}}/></div></div>;
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

export function SettingsView({ settings, isPro, onSave, onExport, onImport }: any) {
  const [name,setName]=useState(settings.name);
  const [daily,setDaily]=useState(settings.dailyPageTarget);
  const [readingMinutes,setReadingMinutes]=useState(settings.dailyReadingMinutesTarget||30);
  const [learningMinutes,setLearningMinutes]=useState(settings.dailyLearningMinutesTarget||30);
  const [yearly,setYearly]=useState(settings.yearlyBookTarget);

  return <div className="page-stack"><PageIntro eyebrow="Settings" title="Atur target sesuai ritmemu" text="Target dibuat untuk membantu membangun kebiasaan, bukan sekadar mengejar jumlah buku atau video." />
    <section className="settings-layout">
      <div className="panel settings-card target-settings-card">
        <SectionHead eyebrow="Profile & habit target" title="Target harian"/>
        <div className="form-grid two">
          <Field label="Nama"><input value={name} onChange={e=>setName(e.target.value)}/></Field>
          <Field label="Halaman / hari"><input type="number" min="1" value={daily} onChange={e=>setDaily(Number(e.target.value))}/></Field>
          <Field label="Durasi baca / hari (menit)"><input type="number" min="1" value={readingMinutes} onChange={e=>setReadingMinutes(Number(e.target.value))}/></Field>
          <Field label="Durasi belajar / hari (menit)"><input type="number" min="1" value={learningMinutes} onChange={e=>setLearningMinutes(Number(e.target.value))}/></Field>
          <Field label="Buku / tahun"><input type="number" min="1" value={yearly} onChange={e=>setYearly(Number(e.target.value))}/></Field>
        </div>
        <button className="primary-btn" onClick={()=>onSave({name,dailyPageTarget:daily,dailyReadingMinutesTarget:readingMinutes,dailyLearningMinutesTarget:learningMinutes,yearlyBookTarget:yearly})}>Simpan target</button>
      </div>
      <div className="panel settings-card"><SectionHead eyebrow="Data" title="Backup & restore"/><p className="muted">Data pribadi tetap tersimpan lokal di perangkat. Export JSON membuat salinan yang bisa kamu simpan sendiri.</p><div className="button-row"><button className="ghost-btn" onClick={onExport}><Icon name="download" size={17}/> Export</button><button className="ghost-btn" onClick={onImport}><Icon name="upload" size={17}/> Import</button></div>{!isPro?<div className="pro-lock"><Icon name="lock" size={16}/> Backup & restore tersedia di Pro.</div>:null}</div>
      <div className="panel settings-card accent"><SectionHead eyebrow="Access" title={isPro?"Arunika Pro aktif":"Mode Demo aktif"}/><p>{isPro?`Lisensi ${settings.licenseCode||"lokal"} aktif di perangkat ini.`:"Demo menyimpan data lokal dan membatasi jumlah koleksi. Upgrade Pro Rp25.000 untuk membuka mode penuh."}</p>{!isPro?<a className="primary-btn" href="/pro">Upgrade Pro · Rp25.000</a>:null}</div>
    </section>
  </div>;
}

export function BookForm({ open, book, setBook, onClose, onSubmit }: any) {
  async function cover(file?:File){if(file)setBook({...book,cover:await readFileAsDataUrl(file)});}
  return <Modal open={open} title={book.title?"Edit buku":"Tambah buku"} subtitle="Cukup isi yang penting. Detail lain bisa ditambahkan kapan saja." onClose={onClose} wide>
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-grid two compact-form">
        <Field label="Judul buku *"><input required value={book.title} onChange={e=>setBook({...book,title:e.target.value})} placeholder="Judul buku"/></Field>
        <Field label="Penulis *"><input required value={book.author} onChange={e=>setBook({...book,author:e.target.value})} placeholder="Nama penulis"/></Field>
        <Field label="Status"><select value={book.status} onChange={e=>setBook({...book,status:e.target.value})}><option value="reading">Sedang dibaca</option><option value="finished">Selesai</option><option value="wishlist">Waiting list</option><option value="unfinished">Tidak selesai</option></select></Field>
        <Field label="Total halaman"><input type="number" min="0" value={book.totalPages} onChange={e=>setBook({...book,totalPages:Number(e.target.value)})}/></Field>
        <Field label="Halaman dibaca"><input type="number" min="0" value={book.pagesRead} onChange={e=>setBook({...book,pagesRead:Number(e.target.value)})}/></Field>
        <Field label="Cover buku"><input type="file" accept="image/*" onChange={e=>cover(e.target.files?.[0])}/></Field>
        {book.cover?<div className="cover-preview compact-cover-preview"><img src={book.cover} alt="Preview cover"/><span>Preview cover</span></div>:null}
      </div>
      <details className="form-advanced">
        <summary>Detail tambahan</summary>
        <div className="form-grid two advanced-grid">
          <Field label="Genre"><input value={book.genre} onChange={e=>setBook({...book,genre:e.target.value})} placeholder="Self Development"/></Field>
          <Field label="Rating"><select value={book.rating} onChange={e=>setBook({...book,rating:Number(e.target.value)})}>{[0,1,2,3,4,5].map(n=><option value={n} key={n}>{n ? n + " bintang" : "Belum dinilai"}</option>)}</select></Field>
          <Field label="Tanggal mulai"><input type="date" value={book.startDate||""} onChange={e=>setBook({...book,startDate:e.target.value})}/></Field>
          <Field label="Tanggal selesai"><input type="date" value={book.finishDate||""} onChange={e=>setBook({...book,finishDate:e.target.value})}/></Field>
          <Field label="Jenis buku"><select value={book.type} onChange={e=>setBook({...book,type:e.target.value})}><option>Fisik</option><option>E-book</option><option>Audiobook</option></select></Field>
          <Field label="Kepemilikan"><select value={book.ownership} onChange={e=>setBook({...book,ownership:e.target.value})}><option>Buku sendiri</option><option>Pinjam</option><option>Perpustakaan</option><option>Lainnya</option></select></Field>
          <Field label="Harga"><input type="number" min="0" value={book.price} onChange={e=>setBook({...book,price:Number(e.target.value)})}/></Field>
          <Field label="Review / alasan membaca" wide><textarea rows={4} value={book.review} onChange={e=>setBook({...book,review:e.target.value})}/></Field>
        </div>
      </details>
      <ModalActions onClose={onClose}/>
    </form>
  </Modal>;
}

export function LearningForm({ open, item, setItem, onClose, onSubmit }: any) {
  async function thumb(file?:File){if(file)setItem({...item,thumbnail:await readFileAsDataUrl(file)});}
  function setUrl(value:string){
    const autoThumb=youtubeThumbnailFromUrl(value);
    setItem({...item,url:value,thumbnail:autoThumb || item.thumbnail,source:autoThumb && (!item.source || item.source==="YouTube") ? "YouTube" : item.source});
  }
  return <Modal open={open} title={item.title?"Edit learning":"Tambah learning"} subtitle="Simpan link dan progress. Detail lain bisa diisi belakangan." onClose={onClose} wide>
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-grid two compact-form">
        <Field label="URL konten" wide><input type="url" value={item.url||""} onChange={e=>setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..."/></Field>
        <Field label="Judul *"><input required value={item.title} onChange={e=>setItem({...item,title:e.target.value})} placeholder="Judul video / podcast / course"/></Field>
        <Field label="Channel / Brand"><input value={item.channel} onChange={e=>setItem({...item,channel:e.target.value})}/></Field>
        <Field label="Status"><select value={item.status} onChange={e=>setItem({...item,status:e.target.value})}><option value="watching">Sedang dipelajari</option><option value="finished">Selesai</option><option value="wishlist">Waiting list</option><option value="unfinished">Tidak selesai</option></select></Field>
        <Field label="Progress (menit)"><input type="number" min="0" value={item.watchedMinutes} onChange={e=>setItem({...item,watchedMinutes:Number(e.target.value)})}/></Field>
        <Field label="Total durasi (menit)"><input type="number" min="0" value={item.totalMinutes} onChange={e=>setItem({...item,totalMinutes:Number(e.target.value)})}/></Field>
      </div>
      {item.thumbnail?<div className="learning-form-preview"><img src={item.thumbnail} alt="Preview thumbnail"/><div><strong>Preview</strong><span>{item.url?"Card akan membuka sumber aslinya.":"Thumbnail tersimpan lokal."}</span></div></div>:null}
      <details className="form-advanced">
        <summary>Detail tambahan</summary>
        <div className="form-grid two advanced-grid">
          <Field label="Topik"><input value={item.topic} onChange={e=>setItem({...item,topic:e.target.value})}/></Field>
          <Field label="Jenis"><select value={item.type} onChange={e=>setItem({...item,type:e.target.value})}><option>Video</option><option>Podcast</option><option>Webinar</option><option>Course</option><option>Article</option></select></Field>
          <Field label="Sumber"><input value={item.source} onChange={e=>setItem({...item,source:e.target.value})} placeholder="YouTube / Spotify / Zoom"/></Field>
          <Field label="Rating"><select value={item.rating} onChange={e=>setItem({...item,rating:Number(e.target.value)})}>{[0,1,2,3,4,5].map(n=><option value={n} key={n}>{n ? n + " bintang" : "Belum dinilai"}</option>)}</select></Field>
          <Field label="Tanggal mulai"><input type="date" value={item.startDate||""} onChange={e=>setItem({...item,startDate:e.target.value})}/></Field>
          <Field label="Tanggal selesai"><input type="date" value={item.finishDate||""} onChange={e=>setItem({...item,finishDate:e.target.value})}/></Field>
          <Field label="Thumbnail"><input type="file" accept="image/*" onChange={e=>thumb(e.target.files?.[0])}/></Field>
          <Field label="Highlight / takeaway" wide><textarea rows={4} value={item.highlights} onChange={e=>setItem({...item,highlights:e.target.value})}/></Field>
        </div>
      </details>
      <ModalActions onClose={onClose}/>
    </form>
  </Modal>;
}

export function SessionForm({ open, session, setSession, books, onClose, onSubmit }: any) {
  const pages=Math.max(0,session.endPage-session.startPage);
  return <Modal open={open} title="Catat sesi membaca" subtitle="Isi progress utama. Habit harian akan diperbarui otomatis." onClose={onClose}>
    <form className="modal-form" onSubmit={onSubmit}>
      <div className="form-grid compact-form">
        <Field label="Buku"><select required value={session.bookId} onChange={e=>setSession({...session,bookId:e.target.value})}><option value="">Pilih buku</option>{books.map((b:Book)=><option value={b.id} key={b.id}>{b.title}</option>)}</select></Field>
        <Field label="Tanggal"><input type="date" value={session.date} onChange={e=>setSession({...session,date:e.target.value})}/></Field>
        <div className="form-grid two page-range-fields"><Field label="Halaman awal"><input type="number" min="0" value={session.startPage} onChange={e=>setSession({...session,startPage:Number(e.target.value)})}/></Field><Field label="Halaman akhir"><input type="number" min="0" value={session.endPage} onChange={e=>setSession({...session,endPage:Number(e.target.value)})}/></Field></div>
        <div className="session-calc"><strong>{pages} halaman</strong><span>ditambahkan ke progress hari ini</span></div>
        <Field label="Durasi (menit)"><input type="number" min="0" value={session.minutes} onChange={e=>setSession({...session,minutes:Number(e.target.value)})}/></Field>
      </div>
      <details className="form-advanced">
        <summary>Catatan & highlight</summary>
        <div className="form-grid advanced-grid">
          <Field label="Catatan sesi"><textarea rows={3} value={session.notes} onChange={e=>setSession({...session,notes:e.target.value})}/></Field>
          <Field label="Highlight"><textarea rows={3} value={session.highlight} onChange={e=>setSession({...session,highlight:e.target.value})}/></Field>
        </div>
      </details>
      <ModalActions onClose={onClose}/>
    </form>
  </Modal>;
}

export function HabitForm({ open, existing, onClose, onSave }: any) {
  const [date,setDate]=useState(todayISO());const existingDay=existing.find((h:HabitDay)=>h.date===date);const [pages,setPages]=useState(existingDay?.pages||0);const [minutes,setMinutes]=useState(existingDay?.minutes||0);const [read,setRead]=useState(existingDay?.readToday??true);
  useEffect(()=>{const h=existing.find((x:HabitDay)=>x.date===date);setPages(h?.pages||0);setMinutes(h?.minutes||0);setRead(h?.readToday??true)},[date,existing]);
  return <Modal open={open} title="Isi habit membaca" subtitle="Catat aktivitas membaca harian." onClose={onClose}><div className="modal-form"><Field label="Tanggal"><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></Field><label className="switch-row"><input type="checkbox" checked={read} onChange={e=>setRead(e.target.checked)}/><span><strong>Baca buku hari ini?</strong><small>Tandai jika kamu sempat membaca.</small></span></label><Field label="Berapa menit?"><input type="number" min="0" value={minutes} onChange={e=>setMinutes(Number(e.target.value))}/></Field><Field label="Berapa halaman?"><input type="number" min="0" value={pages} onChange={e=>setPages(Number(e.target.value))}/></Field><div className="modal-actions"><button className="ghost-btn" onClick={onClose}>Batal</button><button className="primary-btn" onClick={()=>onSave(date,pages,minutes,read)}>Simpan habit</button></div></div></Modal>;
}

export function Onboarding({ open, settings, onFinish }: any) {
  const [step,setStep]=useState(0);
  const [name,setName]=useState(settings.name||"");
  const [daily,setDaily]=useState(settings.dailyPageTarget||20);
  const [readingMinutes,setReadingMinutes]=useState(settings.dailyReadingMinutesTarget||30);
  const [learningMinutes,setLearningMinutes]=useState(settings.dailyLearningMinutesTarget||30);
  const [yearly,setYearly]=useState(settings.yearlyBookTarget||15);
  if(!open)return null;

  return <div className="onboarding"><div className="onboard-card panel"><div className="onboard-symbol">A</div><div className="eyebrow">SELAMAT DATANG DI ARUNIKA</div>
    {step===0?<><h1>Bangun ritme membaca dan belajar yang konsisten.</h1><p>Catat sesi. Lihat progres. Tumbuh setiap hari tanpa mengejar angka berlebihan.</p><button className="primary-btn" onClick={()=>setStep(1)}>Atur target <Icon name="arrow" size={17}/></button></>
    :<><h1>Mulai dari target yang realistis.</h1><div className="form-grid onboarding-target-grid">
      <Field label="Nama panggilan"><input value={name} onChange={e=>setName(e.target.value)}/></Field>
      <div className="form-grid two"><Field label="Halaman / hari"><input type="number" min="1" value={daily} onChange={e=>setDaily(Number(e.target.value))}/></Field><Field label="Baca / hari (menit)"><input type="number" min="1" value={readingMinutes} onChange={e=>setReadingMinutes(Number(e.target.value))}/></Field></div>
      <div className="form-grid two"><Field label="Belajar / hari (menit)"><input type="number" min="1" value={learningMinutes} onChange={e=>setLearningMinutes(Number(e.target.value))}/></Field><Field label="Buku / tahun"><input type="number" min="1" value={yearly} onChange={e=>setYearly(Number(e.target.value))}/></Field></div>
    </div><button className="primary-btn" onClick={()=>onFinish(name,daily,readingMinutes,learningMinutes,yearly)}>Masuk ke Arunika</button></>}
  </div></div>;
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
  return <article className="panel learning-tile">
    <div className={item.url ? "learning-thumb learning-thumb-link" : "learning-thumb"} role={item.url ? "button" : undefined} tabIndex={item.url ? 0 : -1} onClick={()=>item.url && openLearningUrl(item)} onKeyDown={(e)=>{if(item.url && (e.key==="Enter"||e.key===" ")){e.preventDefault();openLearningUrl(item)}}} aria-label={item.url ? `Buka ${item.title}` : undefined}>
      {item.thumbnail?<img src={item.thumbnail} alt={item.title}/>:<div className="learning-fallback"><Icon name="play" size={30}/><span>{item.type}</span></div>}
      {item.url?<div className="watch-overlay"><span className="round-play"><Icon name="play" size={18}/></span><strong>Tonton</strong></div>:null}
      <div className="tile-actions" onClick={(e)=>e.stopPropagation()}><button type="button" onClick={onEdit}><Icon name="edit" size={16}/></button><button type="button" className="danger" onClick={onDelete}><Icon name="trash" size={16}/></button></div>
    </div>
    <div className="tile-body"><div className="tile-top"><span className={`status-pill ${item.status}`}>{learningStatusLabel(item.status)}</span><span>{item.source}</span></div><h3>{item.title}</h3><p>{item.channel} · {item.topic}</p><div className="progress"><span style={{width:`${pct}%`}}/></div><div className="tile-details"><span>{pct}%</span><span>{item.watchedMinutes}/{item.totalMinutes} mnt</span><span>{item.rating?`${item.rating}★`:"—"}</span></div>{item.url?<button className="watch-link" type="button" onClick={()=>openLearningUrl(item)}><Icon name="play" size={14}/> Tonton di {item.source||"sumber"}</button>:null}{item.highlights?<div className="review-snippet">{item.highlights}</div>:null}</div>
  </article>;
}
