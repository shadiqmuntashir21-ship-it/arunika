import type { Book, LearningItem, LearningSession, ReadingSession } from "./types";

export const TOUR_IDS = {
  book: "arunika-tour-book",
  readingSession: "arunika-tour-reading-session",
  learning: "arunika-tour-learning",
  learningSession: "arunika-tour-learning-session",
  wishlist: "arunika-tour-wishlist"
} as const;

function nowIso(){ return new Date().toISOString(); }
function today(){ return new Date().toISOString().slice(0,10); }

export function tourBookExample(): Book {
  const now=nowIso();
  return {
    id: TOUR_IDS.book,
    title: "Atomic Habits · Contoh Tour",
    author: "James Clear",
    genre: "Self Development",
    pagesRead: 0,
    totalPages: 320,
    status: "reading",
    rating: 0,
    price: 0,
    type: "Fisik",
    ownership: "Buku sendiri",
    review: "Contoh buku untuk belajar memakai Arunika. Data ini akan dibersihkan setelah tour selesai.",
    cover: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
    createdAt: now,
    updatedAt: now
  };
}

export function tourReadingSessionExample(): ReadingSession {
  return {
    id: TOUR_IDS.readingSession,
    bookId: TOUR_IDS.book,
    date: today(),
    startPage: 1,
    endPage: 16,
    minutes: 20,
    notes: "Contoh sesi tour: membaca 15 halaman selama 20 menit.",
    highlight: "Perubahan kecil yang dilakukan konsisten bisa menghasilkan perubahan besar.",
    createdAt: nowIso()
  };
}

export function tourLearningExample(): LearningItem {
  const now=nowIso();
  return {
    id: TOUR_IDS.learning,
    title: "How to Study for Exams · Contoh Tour",
    channel: "Ali Abdaal",
    topic: "Learning",
    watchedMinutes: 0,
    totalMinutes: 30,
    status: "watching",
    rating: 0,
    source: "YouTube",
    type: "Video",
    highlights: "Contoh learning untuk memahami alur Learning → Session → Habit → Knowledge.",
    thumbnail: "https://i.ytimg.com/vi/Lt54CX9DmS4/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=Lt54CX9DmS4",
    createdAt: now,
    updatedAt: now
  };
}

export function tourLearningSessionExample(): LearningSession {
  return {
    id: TOUR_IDS.learningSession,
    learningId: TOUR_IDS.learning,
    date: today(),
    minutes: 12,
    notes: "Contoh sesi belajar tour: fokus pada satu insight yang bisa langsung dipraktikkan.",
    createdAt: nowIso()
  };
}

export function tourWishlistExample(): Book {
  const now=nowIso();
  return {
    id: TOUR_IDS.wishlist,
    title: "Deep Work · Contoh Waiting List",
    author: "Cal Newport",
    genre: "Productivity",
    pagesRead: 0,
    totalPages: 304,
    status: "wishlist",
    rating: 0,
    price: 0,
    type: "Fisik",
    ownership: "Buku sendiri",
    review: "Contoh item Waiting List selama tour.",
    cover: "https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg",
    createdAt: now,
    updatedAt: now
  };
}
