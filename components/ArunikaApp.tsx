"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BarChart, Donut, GenreBars } from "./Charts";
import { Icon } from "./Icon";
import { Modal } from "./Modal";
import { Overview, BooksView, LearningView, SessionsView, HabitView, KnowledgeView, InsightsView, WishlistView, SettingsView, BookForm, LearningForm, SessionForm, LearningSessionForm, Onboarding } from "./ArunikaViews";
import { deleteOne, exportBackup, getOne, importBackup, loadSnapshot, putOne } from "@/lib/db";
import { downloadJson, readFileAsDataUrl } from "@/lib/file";
import type { BackupPayload, Book, BookStatus, LearningItem, LearningSession, LearningStatus, ReadingSession, Settings } from "@/lib/types";
import { bookStatusLabel, dateLabel, learningStatusLabel, monthKey, percent, rupiah, todayISO, uid } from "@/lib/utils";
import { verifyArunikaLicense } from "@/lib/backend";
import { InstallButton, ThemeToggle } from "./AppControls";
import { ProductTour } from "./ProductTour";
import { dailyTracker, monthActivityMinutes, monthlyTracker } from "@/lib/tracker";
import { TOUR_IDS, tourBookExample, tourLearningExample, tourLearningSessionExample, tourReadingSessionExample, tourWishlistExample } from "@/lib/tour";

type Tab = "overview" | "books" | "learning" | "sessions" | "habit" | "knowledge" | "insights" | "wishlist" | "settings";
type Snapshot = Awaited<ReturnType<typeof loadSnapshot>>;

const navItems: Array<{ key: Tab; label: string; icon: Parameters<typeof Icon>[0]["name"] }> = [
  { key: "overview", label: "Beranda", icon: "home" },
  { key: "books", label: "Buku", icon: "book" },
  { key: "learning", label: "Belajar", icon: "play" },
  { key: "sessions", label: "Sesi Baca", icon: "clock" },
  { key: "habit", label: "Habit", icon: "calendar" },
  { key: "knowledge", label: "Knowledge", icon: "bulb" },
  { key: "insights", label: "Insight", icon: "chart" },
  { key: "wishlist", label: "Wishlist", icon: "heart" },
  { key: "settings", label: "Pengaturan", icon: "settings" }
];

function emptyBook(): Book {
  const now = new Date().toISOString();
  return { id: uid("book"), title: "", author: "", genre: "", pagesRead: 0, totalPages: 0, status: "reading", rating: 0, price: 0, type: "Fisik", ownership: "Buku sendiri", review: "", createdAt: now, updatedAt: now };
}

function emptyLearning(): LearningItem {
  const now = new Date().toISOString();
  return { id: uid("learning"), title: "", channel: "", topic: "", watchedMinutes: 0, totalMinutes: 0, status: "watching", rating: 0, source: "YouTube", type: "Video", highlights: "", url: "", createdAt: now, updatedAt: now };
}

function emptySession(bookId = ""): ReadingSession {
  return { id: uid("session"), bookId, date: todayISO(), startPage: 0, endPage: 0, minutes: 0, notes: "", highlight: "", createdAt: new Date().toISOString() };
}

function emptyLearningSession(learningId = ""): LearningSession {
  return { id: uid("learning-session"), learningId, date: todayISO(), minutes: 0, notes: "", createdAt: new Date().toISOString() };
}

export function ArunikaApp() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [bookModal, setBookModal] = useState(false);
  const [learningModal, setLearningModal] = useState(false);
  const [sessionModal, setSessionModal] = useState(false);
  const [learningSessionModal, setLearningSessionModal] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState("");
  const [tourSignal, setTourSignal] = useState<{type:string;nonce:number}|null>(null);
  const [editingBook, setEditingBook] = useState<Book>(emptyBook());
  const [editingLearning, setEditingLearning] = useState<LearningItem>(emptyLearning());
  const [editingSession, setEditingSession] = useState<ReadingSession>(emptySession());
  const [editingLearningSession, setEditingLearningSession] = useState<LearningSession>(emptyLearningSession());
  const [query, setQuery] = useState("");
  const [bookFilter, setBookFilter] = useState<BookStatus | "all">("all");
  const [learningFilter, setLearningFilter] = useState<LearningStatus | "all">("all");
  const [year, setYear] = useState(new Date().getFullYear());
  const [toast, setToast] = useState("");
  const importRef = useRef<HTMLInputElement | null>(null);

  const navigateTour = useCallback((nextTab: Tab) => {
    setTab(nextTab);
    setMobileNav(false);
  }, []);


  async function refresh() {
    const snapshot = await loadSnapshot();
    setData(snapshot);
    setOnboarding(!snapshot.settings.onboardingDone);
  }

  useEffect(() => {
    refresh();
    const requested = new URLSearchParams(window.location.search).get("tab") as Tab | null;
    if (requested && navItems.some((item) => item.key === requested)) setTab(requested);
  }, []);

  useEffect(() => {
    if (!data?.settings.activated) return;
    if (localStorage.getItem("arunika-pro-tour-active") === "1") setTourOpen(true);
  }, [data?.settings.activated]);

  async function cleanupTourSandbox() {
    await Promise.all([
      deleteOne("sessions", TOUR_IDS.readingSession),
      deleteOne("learningSessions", TOUR_IDS.learningSession),
      deleteOne("books", TOUR_IDS.book),
      deleteOne("books", TOUR_IDS.wishlist),
      deleteOne("learning", TOUR_IDS.learning)
    ]);
  }

  async function beginTour() {
    if (data?.settings.activated) {
      await cleanupTourSandbox();
      await putOne("books", tourWishlistExample());
      localStorage.setItem("arunika-pro-tour-active", "1");
      localStorage.setItem("arunika-pro-tour-step", "0");
      await refresh();
    }
    setTourOpen(true);
  }

  async function finishTour() {
    if (!data?.settings.activated) localStorage.setItem("arunika-demo-tour-seen","1");
    if (data?.settings.activated) {
      await cleanupTourSandbox();
      localStorage.removeItem("arunika-pro-tour-active");
      localStorage.removeItem("arunika-pro-tour-step");
      localStorage.setItem("arunika-tour-seen", "1");
      await refresh();
    }
    setTourOpen(false);
    setTourStep("");
    setTab("overview");
  }

  function signalTour(type:string){
    setTourSignal({type,nonce:Date.now()});
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const metrics = useMemo(() => {
    if (!data) return null;
    const finishedBooks = data.books.filter((b) => b.status === "finished");
    const readingBooks = data.books.filter((b) => b.status === "reading");
    const finishedLearning = data.learning.filter((l) => l.status === "finished");
    const totalPages = data.books.reduce((n, b) => n + b.pagesRead, 0);
    const learningMinutes = data.learning.reduce((n, l) => n + l.watchedMinutes, 0);
    const today = dailyTracker(data, todayISO());
    const currentMonth = monthlyTracker(data, todayISO().slice(0, 7));

    let streak = 0;
    const cursor = new Date();
    for (let i = 0; i < 370; i++) {
      const key = cursor.toISOString().slice(0, 10);
      const active = dailyTracker(data, key).active;
      if (!active) {
        if (i === 0) {
          cursor.setDate(cursor.getDate() - 1);
          continue;
        }
        break;
      }
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    return { finishedBooks, readingBooks, finishedLearning, totalPages, learningMinutes, today, currentMonth, streak };
  }, [data]);

  const filteredBooks = useMemo(() => {
    if (!data) return [];
    return data.books
      .filter((b) => bookFilter === "all" || b.status === bookFilter)
      .filter((b) => `${b.title} ${b.author} ${b.genre}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [data, bookFilter, query]);

  const filteredLearning = useMemo(() => {
    if (!data) return [];
    return data.learning
      .filter((item) => learningFilter === "all" || item.status === learningFilter)
      .filter((item) => `${item.title} ${item.channel} ${item.topic} ${item.source}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [data, learningFilter, query]);

  const insights = useMemo(() => {
    if (!data) return null;
    const monthlyBooks = Array(12).fill(0) as number[];
    const monthlyLearning = Array(12).fill(0) as number[];
    const genreCount = new Map<string, number>();
    const authorCount = new Map<string, number>();
    const channelCount = new Map<string, number>();

    for (const book of data.books) {
      if (book.genre) genreCount.set(book.genre, (genreCount.get(book.genre) || 0) + 1);
      if (book.status === "finished" && book.finishDate && new Date(book.finishDate).getFullYear() === year) {
        monthlyBooks[new Date(`${book.finishDate}T00:00:00`).getMonth()]++;
        authorCount.set(book.author || "Tanpa penulis", (authorCount.get(book.author || "Tanpa penulis") || 0) + 1);
      }
    }
    for (const item of data.learning) {
      if (item.status === "finished" && item.finishDate && new Date(item.finishDate).getFullYear() === year) {
        monthlyLearning[new Date(`${item.finishDate}T00:00:00`).getMonth()]++;
        channelCount.set(item.channel || "Tanpa channel", (channelCount.get(item.channel || "Tanpa channel") || 0) + 1);
      }
    }
    const top = (map: Map<string, number>) => [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, value]) => ({ label, value }));
    return { monthlyBooks, monthlyLearning, monthlyActivity: monthActivityMinutes(data, year), genres: top(genreCount), authors: top(authorCount), channels: top(channelCount) };
  }, [data, year]);

  if (!data || !metrics || !insights) return <div className="loading"><div className="loader-mark">A</div><p>Menyiapkan Arunika…</p></div>;

  const snapshot = data;

  const isPro = snapshot.settings.activated;
  const demoLimitBooks = !isPro && snapshot.books.length >= 6;
  const demoLimitLearning = !isPro && snapshot.learning.length >= 6;

  async function saveBook(e: FormEvent) {
    e.preventDefault();
    if (!editingBook.title.trim() || !editingBook.author.trim()) return setToast("Judul dan penulis wajib diisi.");
    if (demoLimitBooks && !snapshot.books.some((b) => b.id === editingBook.id)) return setToast("Demo maksimal 6 buku. Upgrade Pro untuk tanpa batas.");
    const book = { ...editingBook, pagesRead: Math.min(editingBook.pagesRead, editingBook.totalPages || editingBook.pagesRead), updatedAt: new Date().toISOString() };
    await putOne("books", book);
    setBookModal(false);
    setToast("Buku tersimpan.");
    if (book.id === TOUR_IDS.book) signalTour("book-saved");
    refresh();
  }

  async function saveLearning(e: FormEvent) {
    e.preventDefault();
    if (!editingLearning.title.trim()) return setToast("Judul konten wajib diisi.");
    if (demoLimitLearning && !snapshot.learning.some((item) => item.id === editingLearning.id)) return setToast("Demo maksimal 6 learning item. Upgrade Pro untuk tanpa batas.");
    const item = { ...editingLearning, watchedMinutes: Math.min(editingLearning.watchedMinutes, editingLearning.totalMinutes || editingLearning.watchedMinutes), updatedAt: new Date().toISOString() };
    await putOne("learning", item);
    setLearningModal(false);
    setToast("Learning item tersimpan.");
    if (item.id === TOUR_IDS.learning) signalTour("learning-saved");
    refresh();
  }

  async function saveSession(e: FormEvent) {
    e.preventDefault();
    if (!editingSession.bookId) return setToast("Pilih buku terlebih dahulu.");
    if (editingSession.endPage < editingSession.startPage) return setToast("Halaman akhir tidak boleh lebih kecil dari halaman awal.");
    await putOne("sessions", editingSession);
    const book = snapshot.books.find((b) => b.id === editingSession.bookId);
    if (book) {
      await putOne("books", {
        ...book,
        pagesRead: Math.max(book.pagesRead, editingSession.endPage),
        startDate: book.startDate || editingSession.date,
        status: book.status === "wishlist" ? "reading" : book.status,
        updatedAt: new Date().toISOString()
      });
    }
    setSessionModal(false);
    setToast("Sesi baca dicatat. Tracker harian diperbarui otomatis.");
    if (editingSession.id === TOUR_IDS.readingSession) signalTour("reading-saved");
    refresh();
  }

  async function saveLearningSession(e: FormEvent) {
    e.preventDefault();
    if (!editingLearningSession.learningId) return setToast("Pilih konten belajar terlebih dahulu.");
    if (editingLearningSession.minutes <= 0) return setToast("Masukkan durasi belajar.");
    await putOne("learningSessions", editingLearningSession);

    const item = snapshot.learning.find((entry) => entry.id === editingLearningSession.learningId);
    if (item) {
      const nextMinutes = item.totalMinutes > 0
        ? Math.min(item.totalMinutes, item.watchedMinutes + editingLearningSession.minutes)
        : item.watchedMinutes + editingLearningSession.minutes;
      const completed = item.totalMinutes > 0 && nextMinutes >= item.totalMinutes;
      await putOne("learning", {
        ...item,
        watchedMinutes: nextMinutes,
        startDate: item.startDate || editingLearningSession.date,
        finishDate: completed ? (item.finishDate || editingLearningSession.date) : item.finishDate,
        status: completed ? "finished" : (item.status === "wishlist" ? "watching" : item.status),
        updatedAt: new Date().toISOString()
      });
    }

    setLearningSessionModal(false);
    setToast("Sesi belajar dicatat. Tracker harian diperbarui otomatis.");
    if (editingLearningSession.id === TOUR_IDS.learningSession) signalTour("learning-session-saved");
    refresh();
  }

  async function removeReadingSession(id: string) {
    const session = snapshot.sessions.find((entry) => entry.id === id);
    if (!session || !confirm("Hapus sesi baca ini?")) return;
    await deleteOne("sessions", id);
    setToast("Sesi baca dihapus.");
    refresh();
  }

  async function removeLearningSession(id: string) {
    if (!confirm("Hapus sesi belajar ini?")) return;
    await deleteOne("learningSessions", id);
    setToast("Sesi belajar dihapus.");
    refresh();
  }

  async function removeBook(id: string) {
    if (!confirm("Hapus buku ini? Sesi baca terkait juga akan dihapus.")) return;
    await deleteOne("books", id);
    for (const session of snapshot.sessions.filter((s) => s.bookId === id)) await deleteOne("sessions", session.id);
    setToast("Buku dihapus.");
    refresh();
  }

  async function removeLearning(id: string) {
    if (!confirm("Hapus learning item ini?")) return;
    await deleteOne("learning", id);
    setToast("Learning item dihapus.");
    refresh();
  }

  async function finishWelcome(startTour: boolean) {
    await putOne("settings", { ...snapshot.settings, onboardingDone: true });
    setOnboarding(false);
    await refresh();
    if (startTour) await beginTour();
  }

  async function updateSettings(patch: Partial<Settings>) {
    await putOne("settings", { ...snapshot.settings, ...patch });
    setToast("Pengaturan disimpan.");
    refresh();
  }

  async function doExport() {
    if (!isPro) return setToast("Backup & export tersedia di Pro.");
    const backup = await exportBackup();
    downloadJson(`arunika-backup-${todayISO()}.json`, backup);
    setToast("Backup berhasil diunduh.");
  }

  async function doImport(file: File) {
    if (!isPro) return setToast("Import backup tersedia di Pro.");
    try {
      const payload = JSON.parse(await file.text()) as BackupPayload;
      await importBackup(payload);
      setToast("Backup berhasil dipulihkan.");
      refresh();
    } catch {
      setToast("File backup tidak valid.");
    }
  }


  return (
    <div className="app-shell stream-app">
      <header className="stream-nav">
        <div className="stream-nav-left">
          <button className="mobile-menu stream-menu-btn" onClick={() => setMobileNav((v) => !v)} aria-label="Menu"><Icon name="menu" /></button>
          <button className="stream-wordmark" onClick={() => setTab("overview")} aria-label="Beranda Arunika">ARUNIKA</button>
          <nav className="stream-nav-links" aria-label="Navigasi utama">
            {navItems.slice(0, 8).map((item) => (
              <button data-tour={item.key} key={item.key} className={tab === item.key ? "active" : ""} onClick={() => setTab(item.key)}>{item.label}</button>
            ))}
          </nav>
        </div>
        <div className="stream-nav-actions">
          {!isPro ? <button className="header-tour-btn" type="button" onClick={() => beginTour()}>Tour Fitur</button> : null}
          <div className="desktop-theme-control"><ThemeToggle compact /></div>
          <div className="desktop-install-control"><InstallButton compact /></div>
          {!isPro ? <a className="stream-pro-pill" href="/pro">PRO</a> : <span className="stream-pro-active">PRO</span>}
          <button className="profile-avatar" onClick={() => setTab("settings")} title="Profil">{snapshot.settings.name.slice(0, 1).toUpperCase()}</button>
        </div>
      </header>

      <aside className={`mobile-drawer ${mobileNav ? "open" : ""}`}>
        <div className="drawer-head"><span className="stream-wordmark">ARUNIKA</span><button className="icon-btn" onClick={()=>setMobileNav(false)}><Icon name="x"/></button></div>
        <div className="drawer-utility"><ThemeToggle /><InstallButton />{!isPro?<button className="drawer-tour-btn" type="button" onClick={()=>{setMobileNav(false);beginTour();}}>Mulai Tour Fitur</button>:null}</div>
        <nav>{navItems.map((item)=><button data-tour={item.key} key={item.key} className={tab===item.key?"active":""} onClick={()=>{setTab(item.key);setMobileNav(false)}}><Icon name={item.icon}/><span>{item.label}</span></button>)}</nav>
        {!isPro?<a className="drawer-pro" href="/pro">Upgrade Arunika Pro <span>Rp49.000</span></a>:null}
      </aside>
      {mobileNav?<button className="drawer-backdrop" onClick={()=>setMobileNav(false)} aria-label="Tutup menu"/>:null}

      <main className="app-main stream-main">
        {!isPro && tab==="overview" ? <section className="demo-mode-strip"><div><strong>Mode Demo</strong><span>Contoh buku, learning, habit, dan insight sudah lengkap.</span></div><button type="button" onClick={()=>beginTour()}>Mulai Tour Fitur</button></section> : null}
        {tab === "overview" && <Overview data={snapshot} metrics={metrics} insights={insights} onTab={setTab} onSession={() => { setEditingSession(emptySession(metrics.readingBooks[0]?.id || "")); setSessionModal(true); }} />}
        {tab === "books" && <BooksView books={filteredBooks} query={query} setQuery={setQuery} filter={bookFilter} setFilter={setBookFilter} onAdd={() => { setEditingBook(tourOpen && tourStep==="add-book" ? tourBookExample() : emptyBook()); setBookModal(true); }} onEdit={(book: Book) => { setEditingBook(book); setBookModal(true); }} onDelete={removeBook} />}
        {tab === "learning" && <LearningView items={filteredLearning} query={query} setQuery={setQuery} filter={learningFilter} setFilter={setLearningFilter} onAdd={() => { setEditingLearning(tourOpen && tourStep==="add-learning" ? tourLearningExample() : emptyLearning()); setLearningModal(true); }} onEdit={(item: LearningItem) => { setEditingLearning(item); setLearningModal(true); }} onDelete={removeLearning} onSession={(item: LearningItem) => { setEditingLearningSession(tourOpen && tourStep==="learning-session" && item.id===TOUR_IDS.learning ? tourLearningSessionExample() : emptyLearningSession(item.id)); setLearningSessionModal(true); }} />}
        {tab === "sessions" && <SessionsView sessions={snapshot.sessions} books={snapshot.books} onAdd={(bookId: string) => { setEditingSession(tourOpen && tourStep==="reading-session" ? tourReadingSessionExample() : emptySession(bookId)); setSessionModal(true); }} onDelete={removeReadingSession} />}
        {tab === "habit" && <HabitView data={snapshot} onRead={(bookId: string) => { setEditingSession(emptySession(bookId)); setSessionModal(true); }} onLearn={(learningId: string) => { setEditingLearningSession(emptyLearningSession(learningId)); setLearningSessionModal(true); }} onDeleteRead={removeReadingSession} onDeleteLearn={removeLearningSession} />}
        {tab === "knowledge" && <KnowledgeView data={snapshot} />}
        {tab === "insights" && <InsightsView data={snapshot} insights={insights} year={year} setYear={setYear} />}
        {tab === "wishlist" && <WishlistView books={snapshot.books.filter((b) => b.status === "wishlist")} learning={snapshot.learning.filter((l) => l.status === "wishlist")} onBook={(book: Book) => { setEditingBook(book); setBookModal(true); }} onLearning={(item: LearningItem) => { setEditingLearning(item); setLearningModal(true); }} />}
        {tab === "settings" && <SettingsView settings={snapshot.settings} isPro={isPro} onSave={updateSettings} onExport={doExport} onImport={() => importRef.current?.click()} onStartTour={() => beginTour()} />}

        <input ref={importRef} className="hidden" type="file" accept="application/json" onChange={(e) => { const file = e.target.files?.[0]; if (file) doImport(file); e.currentTarget.value = ""; }} />
      </main>

      <nav className="mobile-bottom-nav stream-bottom-nav">
        {navItems.filter((item)=>["overview","books","learning","habit","wishlist"].includes(item.key)).map((item) => <button data-tour={item.key} key={item.key} className={tab === item.key ? "active" : ""} onClick={() => setTab(item.key)}><Icon name={item.icon} size={19}/><span>{item.label}</span></button>)}
      </nav>

      <BookForm open={bookModal} book={editingBook} setBook={setEditingBook} onClose={() => setBookModal(false)} onSubmit={saveBook} />
      <LearningForm open={learningModal} item={editingLearning} setItem={setEditingLearning} onClose={() => setLearningModal(false)} onSubmit={saveLearning} />
      <SessionForm open={sessionModal} session={editingSession} setSession={setEditingSession} books={snapshot.books.filter((b) => b.status !== "finished" || b.id === editingSession.bookId)} onClose={() => setSessionModal(false)} onSubmit={saveSession} />
      <LearningSessionForm open={learningSessionModal} session={editingLearningSession} setSession={setEditingLearningSession} items={snapshot.learning.filter((item) => item.status !== "finished" || item.id === editingLearningSession.learningId)} onClose={() => setLearningSessionModal(false)} onSubmit={saveLearningSession} />
      <Onboarding open={onboarding} isPro={isPro} onTour={() => finishWelcome(true)} onSkip={() => finishWelcome(false)} />
      <ProductTour open={tourOpen} isPro={isPro} signal={tourSignal} onClose={() => finishTour()} onNavigate={navigateTour} onStepChange={setTourStep} />
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}
