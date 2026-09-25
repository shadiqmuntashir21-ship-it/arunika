"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { BarChart, Donut, GenreBars } from "./Charts";
import { Icon } from "./Icon";
import { Modal } from "./Modal";
import { Overview, BooksView, LearningView, SessionsView, HabitView, KnowledgeView, InsightsView, WishlistView, SettingsView, BookForm, LearningForm, SessionForm, HabitForm, Onboarding } from "./ArunikaViews";
import { deleteOne, exportBackup, getOne, importBackup, loadSnapshot, putOne } from "@/lib/db";
import { downloadJson, readFileAsDataUrl } from "@/lib/file";
import type { BackupPayload, Book, BookStatus, HabitDay, LearningItem, LearningStatus, ReadingSession, Settings } from "@/lib/types";
import { bookStatusLabel, dateLabel, learningStatusLabel, monthKey, percent, rupiah, todayISO, uid } from "@/lib/utils";

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
  return { id: uid("learning"), title: "", channel: "", topic: "", watchedMinutes: 0, totalMinutes: 0, status: "watching", rating: 0, source: "YouTube", type: "Video", highlights: "", createdAt: now, updatedAt: now };
}

function emptySession(bookId = ""): ReadingSession {
  return { id: uid("session"), bookId, date: todayISO(), startPage: 0, endPage: 0, minutes: 0, notes: "", highlight: "", createdAt: new Date().toISOString() };
}

export function ArunikaApp() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [bookModal, setBookModal] = useState(false);
  const [learningModal, setLearningModal] = useState(false);
  const [sessionModal, setSessionModal] = useState(false);
  const [habitModal, setHabitModal] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [editingBook, setEditingBook] = useState<Book>(emptyBook());
  const [editingLearning, setEditingLearning] = useState<LearningItem>(emptyLearning());
  const [editingSession, setEditingSession] = useState<ReadingSession>(emptySession());
  const [query, setQuery] = useState("");
  const [bookFilter, setBookFilter] = useState<BookStatus | "all">("all");
  const [learningFilter, setLearningFilter] = useState<LearningStatus | "all">("all");
  const [year, setYear] = useState(new Date().getFullYear());
  const [toast, setToast] = useState("");
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const importRef = useRef<HTMLInputElement | null>(null);

  async function refresh() {
    const snapshot = await loadSnapshot();
    setData(snapshot);
    setOnboarding(!snapshot.settings.onboardingDone);
  }

  useEffect(() => {
    refresh();
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

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
    const todayHabit = data.habit.find((h) => h.date === todayISO());
    const sortedHabit = [...data.habit].filter((h) => h.readToday).sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    if (sortedHabit.length) {
      const cursor = new Date();
      for (let i = 0; i < 370; i++) {
        const key = cursor.toISOString().slice(0, 10);
        const found = data.habit.some((h) => h.date === key && h.readToday);
        if (!found) {
          if (i === 0) {
            cursor.setDate(cursor.getDate() - 1);
            continue;
          }
          break;
        }
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      }
    }
    return { finishedBooks, readingBooks, finishedLearning, totalPages, learningMinutes, todayHabit, streak };
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
    return { monthlyBooks, monthlyLearning, genres: top(genreCount), authors: top(authorCount), channels: top(channelCount) };
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
    refresh();
  }

  async function saveSession(e: FormEvent) {
    e.preventDefault();
    if (!editingSession.bookId) return setToast("Pilih buku terlebih dahulu.");
    if (editingSession.endPage < editingSession.startPage) return setToast("Halaman akhir tidak boleh lebih kecil dari halaman awal.");
    const pages = Math.max(0, editingSession.endPage - editingSession.startPage);
    await putOne("sessions", editingSession);
    const book = snapshot.books.find((b) => b.id === editingSession.bookId);
    if (book) {
      await putOne("books", { ...book, pagesRead: Math.max(book.pagesRead, editingSession.endPage), updatedAt: new Date().toISOString() });
    }
    const currentHabit = snapshot.habit.find((h) => h.date === editingSession.date);
    const habit: HabitDay = currentHabit
      ? { ...currentHabit, readToday: true, pages: currentHabit.pages + pages, minutes: currentHabit.minutes + editingSession.minutes }
      : { id: uid("habit"), date: editingSession.date, readToday: true, pages, minutes: editingSession.minutes };
    await putOne("habit", habit);
    setSessionModal(false);
    setToast("Sesi baca dicatat dan habit diperbarui.");
    refresh();
  }

  async function saveHabitEntry(date: string, pages: number, minutes: number, readToday: boolean) {
    const existing = snapshot.habit.find((h) => h.date === date);
    const item: HabitDay = existing ? { ...existing, pages, minutes, readToday } : { id: uid("habit"), date, pages, minutes, readToday };
    await putOne("habit", item);
    setHabitModal(false);
    setToast("Habit harian disimpan.");
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

  async function finishOnboarding(name: string, dailyTarget: number, yearlyTarget: number) {
    const settings: Settings = { ...snapshot.settings, name: name.trim() || "Pembaca Arunika", dailyPageTarget: dailyTarget || 20, yearlyBookTarget: yearlyTarget || 15, onboardingDone: true };
    await putOne("settings", settings);
    setOnboarding(false);
    refresh();
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

  async function installApp() {
    if (installPrompt) {
      await installPrompt.prompt();
      setInstallPrompt(null);
      return;
    }
    setToast("Di iPhone: Share → Add to Home Screen. Di Chrome desktop/Android: gunakan menu Install App.");
  }

  return (
    <div className="app-shell stream-app">
      <header className="stream-nav">
        <div className="stream-nav-left">
          <button className="mobile-menu stream-menu-btn" onClick={() => setMobileNav((v) => !v)} aria-label="Menu"><Icon name="menu" /></button>
          <button className="stream-wordmark" onClick={() => setTab("overview")} aria-label="Beranda Arunika">ARUNIKA</button>
          <nav className="stream-nav-links" aria-label="Navigasi utama">
            {navItems.slice(0, 8).map((item) => (
              <button key={item.key} className={tab === item.key ? "active" : ""} onClick={() => setTab(item.key)}>{item.label}</button>
            ))}
          </nav>
        </div>
        <div className="stream-nav-actions">
          <button className="nav-icon-btn" title="Cari" onClick={() => { setTab("books"); setTimeout(() => document.querySelector<HTMLInputElement>(".search-box input")?.focus(), 100); }}><Icon name="search" /></button>
          <button className="desktop-install" onClick={installApp}>Install</button>
          {!isPro ? <a className="stream-pro-pill" href="/pro"><Icon name="crown" size={15}/> PRO</a> : <span className="stream-pro-active"><Icon name="check" size={14}/> PRO</span>}
          <button className="profile-avatar" onClick={() => setTab("settings")} title="Profil">{snapshot.settings.name.slice(0, 1).toUpperCase()}</button>
        </div>
      </header>

      <aside className={`mobile-drawer ${mobileNav ? "open" : ""}`}>
        <div className="drawer-head"><span className="stream-wordmark">ARUNIKA</span><button className="icon-btn" onClick={()=>setMobileNav(false)}><Icon name="x"/></button></div>
        <nav>{navItems.map((item)=><button key={item.key} className={tab===item.key?"active":""} onClick={()=>{setTab(item.key);setMobileNav(false)}}><Icon name={item.icon}/><span>{item.label}</span></button>)}</nav>
        {!isPro?<a className="drawer-pro" href="/pro"><Icon name="crown"/> Upgrade Arunika Pro <span>Rp20.000</span></a>:null}
      </aside>
      {mobileNav?<button className="drawer-backdrop" onClick={()=>setMobileNav(false)} aria-label="Tutup menu"/>:null}

      <main className="app-main stream-main">
        {tab !== "overview" ? <section className="stream-page-title">
          <div><span>{isPro ? "ARUNIKA PRO" : "MODE DEMO"}</span><h1>{navItems.find((n) => n.key === tab)?.label}</h1></div>
          <div className="stream-page-actions"><button onClick={installApp}><Icon name="download" size={16}/> Install App</button></div>
        </section> : null}

        {tab === "overview" && <Overview data={snapshot} metrics={metrics} insights={insights} onTab={setTab} onSession={() => { setEditingSession(emptySession(metrics.readingBooks[0]?.id || "")); setSessionModal(true); }} />}
        {tab === "books" && <BooksView books={filteredBooks} query={query} setQuery={setQuery} filter={bookFilter} setFilter={setBookFilter} onAdd={() => { setEditingBook(emptyBook()); setBookModal(true); }} onEdit={(book: Book) => { setEditingBook(book); setBookModal(true); }} onDelete={removeBook} />}
        {tab === "learning" && <LearningView items={filteredLearning} query={query} setQuery={setQuery} filter={learningFilter} setFilter={setLearningFilter} onAdd={() => { setEditingLearning(emptyLearning()); setLearningModal(true); }} onEdit={(item: LearningItem) => { setEditingLearning(item); setLearningModal(true); }} onDelete={removeLearning} />}
        {tab === "sessions" && <SessionsView sessions={snapshot.sessions} books={snapshot.books} onAdd={(bookId: string) => { setEditingSession(emptySession(bookId)); setSessionModal(true); }} onDelete={async (id: string) => { if (confirm("Hapus sesi baca ini?")) { await deleteOne("sessions", id); refresh(); } }} />}
        {tab === "habit" && <HabitView habit={snapshot.habit} settings={snapshot.settings} onAdd={() => setHabitModal(true)} />}
        {tab === "knowledge" && <KnowledgeView data={snapshot} />}
        {tab === "insights" && <InsightsView data={snapshot} insights={insights} year={year} setYear={setYear} />}
        {tab === "wishlist" && <WishlistView books={snapshot.books.filter((b) => b.status === "wishlist")} learning={snapshot.learning.filter((l) => l.status === "wishlist")} onBook={(book: Book) => { setEditingBook(book); setBookModal(true); }} onLearning={(item: LearningItem) => { setEditingLearning(item); setLearningModal(true); }} />}
        {tab === "settings" && <SettingsView settings={snapshot.settings} isPro={isPro} onSave={updateSettings} onExport={doExport} onImport={() => importRef.current?.click()} onInstall={installApp} />}

        <input ref={importRef} className="hidden" type="file" accept="application/json" onChange={(e) => { const file = e.target.files?.[0]; if (file) doImport(file); e.currentTarget.value = ""; }} />
      </main>

      <nav className="mobile-bottom-nav stream-bottom-nav">
        {navItems.filter((item)=>["overview","books","learning","habit","wishlist"].includes(item.key)).map((item) => <button key={item.key} className={tab === item.key ? "active" : ""} onClick={() => setTab(item.key)}><Icon name={item.icon} size={19}/><span>{item.label}</span></button>)}
      </nav>

      <BookForm open={bookModal} book={editingBook} setBook={setEditingBook} onClose={() => setBookModal(false)} onSubmit={saveBook} />
      <LearningForm open={learningModal} item={editingLearning} setItem={setEditingLearning} onClose={() => setLearningModal(false)} onSubmit={saveLearning} />
      <SessionForm open={sessionModal} session={editingSession} setSession={setEditingSession} books={snapshot.books.filter((b) => b.status === "reading" || b.id === editingSession.bookId)} onClose={() => setSessionModal(false)} onSubmit={saveSession} />
      <HabitForm open={habitModal} existing={snapshot.habit} onClose={() => setHabitModal(false)} onSave={saveHabitEntry} />
      <Onboarding open={onboarding} settings={snapshot.settings} onFinish={finishOnboarding} />
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );

