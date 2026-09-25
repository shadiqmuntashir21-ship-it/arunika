import type { Book, HabitDay, LearningItem, ReadingSession, Settings } from "./types";

const now = new Date().toISOString();

export const demoBooks: Book[] = [
  {
    id: "book-atomic",
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Self Development",
    pagesRead: 198,
    totalPages: 320,
    startDate: "2026-09-10",
    status: "reading",
    rating: 5,
    price: 125000,
    type: "Fisik",
    ownership: "Buku sendiri",
    review: "Perubahan kecil yang konsisten jauh lebih kuat daripada motivasi sesaat.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "book-money",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    genre: "Financial",
    pagesRead: 256,
    totalPages: 256,
    startDate: "2026-08-12",
    finishDate: "2026-09-01",
    status: "finished",
    rating: 5,
    price: 108000,
    type: "Fisik",
    ownership: "Buku sendiri",
    review: "Keputusan finansial sangat dipengaruhi perilaku, bukan hanya kemampuan berhitung.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "book-pareto",
    title: "Pareto Learning System",
    author: "Gusti Alfian",
    genre: "Productivity",
    pagesRead: 33,
    totalPages: 33,
    startDate: "2026-08-23",
    finishDate: "2026-08-29",
    status: "finished",
    rating: 4,
    price: 89000,
    type: "E-book",
    ownership: "Buku sendiri",
    review: "Bagus untuk membangun cara belajar yang lebih efisien dan terarah.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "book-deep-work",
    title: "Deep Work",
    author: "Cal Newport",
    genre: "Productivity",
    pagesRead: 0,
    totalPages: 304,
    status: "wishlist",
    rating: 0,
    price: 119000,
    type: "Fisik",
    ownership: "Buku sendiri",
    review: "",
    createdAt: now,
    updatedAt: now
  }
];

export const demoLearning: LearningItem[] = [
  {
    id: "learn-finance-genz",
    title: "Financial for Gen Z",
    channel: "Raditya Dika",
    topic: "Financial",
    watchedMinutes: 30,
    totalMinutes: 120,
    startDate: "2026-09-15",
    status: "watching",
    rating: 5,
    source: "YouTube",
    type: "Video",
    highlights: "Sistem finansial yang sederhana lebih mudah dijaga daripada rencana yang terlalu rumit.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "learn-active",
    title: "How to Learn Better",
    channel: "Ali Abdaal",
    topic: "Self Development",
    watchedMinutes: 46,
    totalMinutes: 46,
    startDate: "2026-09-05",
    finishDate: "2026-09-05",
    status: "finished",
    rating: 5,
    source: "YouTube",
    type: "Video",
    highlights: "Active recall dan deliberate practice lebih kuat daripada menonton atau membaca secara pasif.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "learn-podcast",
    title: "The Creative Habit",
    channel: "The Knowledge Project",
    topic: "Creativity",
    watchedMinutes: 0,
    totalMinutes: 55,
    status: "wishlist",
    rating: 0,
    source: "Spotify",
    type: "Podcast",
    highlights: "",
    createdAt: now,
    updatedAt: now
  }
];

export const demoSessions: ReadingSession[] = [
  {
    id: "session-1",
    bookId: "book-atomic",
    date: "2026-09-23",
    startPage: 160,
    endPage: 176,
    minutes: 28,
    notes: "Fokus pada desain lingkungan, bukan hanya disiplin.",
    highlight: "Make the good habit obvious and the bad habit invisible.",
    createdAt: now
  },
  {
    id: "session-2",
    bookId: "book-atomic",
    date: "2026-09-24",
    startPage: 176,
    endPage: 188,
    minutes: 22,
    notes: "Habit stacking terasa paling mudah dipraktikkan.",
    highlight: "Setelah kebiasaan lama, tempelkan kebiasaan baru.",
    createdAt: now
  },
  {
    id: "session-3",
    bookId: "book-atomic",
    date: "2026-09-25",
    startPage: 188,
    endPage: 198,
    minutes: 18,
    notes: "Jaga identitas, bukan sekadar hasil.",
    highlight: "Setiap tindakan adalah suara untuk tipe orang yang ingin kita jadi.",
    createdAt: now
  }
];

export const demoHabit: HabitDay[] = [
  { id: "habit-23", date: "2026-09-23", readToday: true, pages: 16, minutes: 28 },
  { id: "habit-24", date: "2026-09-24", readToday: true, pages: 12, minutes: 22 },
  { id: "habit-25", date: "2026-09-25", readToday: true, pages: 10, minutes: 18 }
];

export const demoSettings: Settings = {
  id: "settings",
  name: "Pembaca Arunika",
  dailyPageTarget: 20,
  yearlyBookTarget: 15,
  onboardingDone: false,
  activated: false,
  theme: "arunika"
};
