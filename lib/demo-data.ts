import type { Book, HabitDay, LearningItem, LearningSession, ReadingSession, Settings } from "./types";

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
    cover: "/demo/books/atomic-habits.jpg",
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
    cover: "/demo/books/psychology-of-money.jpg",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "book-deep-work",
    title: "Deep Work",
    author: "Cal Newport",
    genre: "Productivity",
    pagesRead: 168,
    totalPages: 304,
    startDate: "2026-09-03",
    status: "reading",
    rating: 5,
    price: 119000,
    type: "Fisik",
    ownership: "Buku sendiri",
    review: "Latih kemampuan fokus mendalam agar pekerjaan bernilai tinggi mendapat ruang yang cukup.",
    cover: "/demo/books/deep-work.jpg",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "book-essentialism",
    title: "Essentialism",
    author: "Greg McKeown",
    genre: "Productivity",
    pagesRead: 0,
    totalPages: 272,
    status: "wishlist",
    rating: 0,
    price: 110000,
    type: "Fisik",
    ownership: "Buku sendiri",
    review: "",
    cover: "/demo/books/essentialism.jpg",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "book-make-time",
    title: "Make Time",
    author: "Jake Knapp & John Zeratsky",
    genre: "Productivity",
    pagesRead: 41,
    totalPages: 304,
    startDate: "2026-09-20",
    status: "reading",
    rating: 4,
    price: 118000,
    type: "Fisik",
    ownership: "Buku sendiri",
    review: "Highlight satu hal penting setiap hari lalu lindungi waktu untuk mengerjakannya.",
    cover: "/demo/books/make-time.jpg",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "book-thinking",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    genre: "Psychology",
    pagesRead: 0,
    totalPages: 499,
    status: "wishlist",
    rating: 0,
    price: 145000,
    type: "Fisik",
    ownership: "Buku sendiri",
    review: "",
    cover: "/demo/books/thinking-fast-slow.jpg",
    createdAt: now,
    updatedAt: now
  },

];

export const demoLearning: LearningItem[] = [
  {
    id: "learn-ali-masterclass",
    title: "How to Study for Exams — An Evidence-Based Masterclass",
    channel: "Ali Abdaal",
    topic: "Learning",
    watchedMinutes: 74,
    totalMinutes: 171,
    startDate: "2026-09-15",
    status: "watching",
    rating: 5,
    source: "YouTube",
    type: "Video",
    highlights: "Active recall, spaced repetition, dan fokus pada pengujian diri membuat belajar jauh lebih aktif.",
    thumbnail: "/demo/learning/ali-abdaal-study.jpg",
    url: "https://www.youtube.com/watch?v=Lt54CX9DmS4",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "learn-raditya-genz",
    title: "Belajar Jadi Gen Z dari Aqeela",
    channel: "Raditya Dika",
    topic: "Perspective",
    watchedMinutes: 34,
    totalMinutes: 58,
    startDate: "2026-09-18",
    status: "watching",
    rating: 4,
    source: "YouTube",
    type: "Video",
    highlights: "Sudut pandang lintas generasi bisa membantu melihat kebiasaan, teknologi, dan cara berkomunikasi secara lebih luas.",
    thumbnail: "/demo/learning/raditya-genz.jpg",
    url: "https://www.youtube.com/watch?v=aOZ5A9r_sAw",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "learn-huberman-focus",
    title: "How to Focus to Change Your Brain",
    channel: "Huberman Lab Essentials",
    topic: "Focus & Learning",
    watchedMinutes: 0,
    totalMinutes: 33,
    status: "wishlist",
    rating: 0,
    source: "YouTube",
    type: "Video",
    highlights: "",
    thumbnail: "/demo/learning/huberman-focus.jpg",
    url: "https://www.youtube.com/watch?v=4AwyVTHEU3s",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "learn-huberman-study",
    title: "The Top Study Habits to Improve Learning",
    channel: "Huberman Lab Clips",
    topic: "Study",
    watchedMinutes: 14,
    totalMinutes: 14,
    startDate: "2026-09-06",
    finishDate: "2026-09-06",
    status: "finished",
    rating: 5,
    source: "YouTube",
    type: "Video",
    highlights: "Belajar yang terasa menantang dan aktif biasanya lebih efektif daripada konsumsi pasif.",
    thumbnail: "/demo/learning/huberman-study.jpg",
    url: "https://www.youtube.com/watch?v=1bszFX_XcbU",
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


export const demoLearningSessions: LearningSession[] = [
  {
    id: "learn-session-1",
    learningId: "learn-ali-masterclass",
    date: "2026-09-23",
    minutes: 24,
    notes: "Fokus pada active recall dan testing effect.",
    createdAt: now
  },
  {
    id: "learn-session-2",
    learningId: "learn-raditya-genz",
    date: "2026-09-24",
    minutes: 18,
    notes: "Mencatat perspektif lintas generasi yang menarik.",
    createdAt: now
  },
  {
    id: "learn-session-3",
    learningId: "learn-ali-masterclass",
    date: "2026-09-25",
    minutes: 32,
    notes: "Melanjutkan bagian spaced repetition dan practice testing.",
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
  dailyReadingMinutesTarget: 30,
  dailyLearningMinutesTarget: 30,
  yearlyBookTarget: 15,
  onboardingDone: false,
  activated: false,
  theme: "arunika"
};
