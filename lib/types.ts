export type BookStatus = "reading" | "finished" | "wishlist" | "unfinished";
export type LearningStatus = "watching" | "finished" | "wishlist" | "unfinished";
export type BookType = "Fisik" | "E-book" | "Audiobook";
export type Ownership = "Buku sendiri" | "Pinjam" | "Perpustakaan" | "Lainnya";
export type LearningType = "Video" | "Podcast" | "Webinar" | "Course" | "Article";

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  pagesRead: number;
  totalPages: number;
  startDate?: string;
  finishDate?: string;
  status: BookStatus;
  rating: number;
  price: number;
  type: BookType;
  ownership: Ownership;
  review: string;
  cover?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningItem {
  id: string;
  title: string;
  channel: string;
  topic: string;
  watchedMinutes: number;
  totalMinutes: number;
  startDate?: string;
  finishDate?: string;
  status: LearningStatus;
  rating: number;
  source: string;
  type: LearningType;
  highlights: string;
  thumbnail?: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  date: string;
  startPage: number;
  endPage: number;
  minutes: number;
  notes: string;
  highlight: string;
  createdAt: string;
}

export interface LearningSession {
  id: string;
  learningId: string;
  date: string;
  minutes: number;
  notes: string;
  createdAt: string;
}

export interface HabitDay {
  id: string;
  date: string;
  readToday: boolean;
  pages: number;
  minutes: number;
  learningMinutes?: number;
  videos?: number;
}

export interface Settings {
  id: "settings";
  name: string;
  dailyPageTarget: number;
  dailyReadingMinutesTarget: number;
  dailyLearningMinutesTarget: number;
  yearlyBookTarget: number;
  onboardingDone: boolean;
  activated: boolean;
  licenseCode?: string;
  pin?: string;
  theme: "arunika";
  demoVersion?: number;
}

export interface BackupPayload {
  version: 1 | 2;
  exportedAt: string;
  books: Book[];
  learning: LearningItem[];
  sessions: ReadingSession[];
  learningSessions?: LearningSession[];
  habit: HabitDay[];
  settings: Settings;
}
