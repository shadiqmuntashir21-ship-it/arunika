import type { Book, HabitDay, LearningItem, LearningSession, ReadingSession, Settings } from "./types";

export type TrackerData = {
  books: Book[];
  learning: LearningItem[];
  sessions: ReadingSession[];
  learningSessions: LearningSession[];
  habit: HabitDay[];
  settings: Settings;
};

export type DailyTrackerSummary = {
  date: string;
  books: number;
  pages: number;
  videos: number;
  readingMinutes: number;
  learningMinutes: number;
  totalMinutes: number;
  active: boolean;
  pageTargetReached: boolean;
  readingTargetReached: boolean;
  learningTargetReached: boolean;
};

export type MonthlyTrackerSummary = {
  key: string;
  finishedBooks: number;
  finishedLearning: number;
  readingInProgress: number;
  learningInProgress: number;
  pages: number;
  readingMinutes: number;
  learningMinutes: number;
  totalMinutes: number;
  activeDays: number;
};

export function pagesInSession(session: ReadingSession) {
  return Math.max(0, Number(session.endPage || 0) - Number(session.startPage || 0));
}

export function monthOf(date: string) {
  return String(date || "").slice(0, 7);
}

export function dailyTracker(data: TrackerData, date: string): DailyTrackerSummary {
  const readSessions = data.sessions.filter((session) => session.date === date);
  const learnSessions = data.learningSessions.filter((session) => session.date === date);
  const legacy = data.habit.find((day) => day.date === date);

  const sessionPages = readSessions.reduce((sum, session) => sum + pagesInSession(session), 0);
  const sessionReadingMinutes = readSessions.reduce((sum, session) => sum + Number(session.minutes || 0), 0);
  const sessionLearningMinutes = learnSessions.reduce((sum, session) => sum + Number(session.minutes || 0), 0);

  const pages = readSessions.length ? sessionPages : Number(legacy?.pages || 0);
  const readingMinutes = readSessions.length ? sessionReadingMinutes : Number(legacy?.minutes || 0);
  const learningMinutes = learnSessions.length ? sessionLearningMinutes : Number(legacy?.learningMinutes || 0);

  const bookIds = new Set(readSessions.map((session) => session.bookId).filter(Boolean));
  const learningIds = new Set(learnSessions.map((session) => session.learningId).filter(Boolean));
  const videos = learningIds.size || Number(legacy?.videos || 0);
  const books = bookIds.size;
  const totalMinutes = readingMinutes + learningMinutes;

  return {
    date,
    books,
    pages,
    videos,
    readingMinutes,
    learningMinutes,
    totalMinutes,
    active: totalMinutes > 0 || pages > 0 || videos > 0 || Boolean(legacy?.readToday),
    pageTargetReached: pages >= Number(data.settings.dailyPageTarget || 0),
    readingTargetReached: readingMinutes >= Number(data.settings.dailyReadingMinutesTarget || 0),
    learningTargetReached: learningMinutes >= Number(data.settings.dailyLearningMinutesTarget || 0),
  };
}

export function monthlyTracker(data: TrackerData, key: string): MonthlyTrackerSummary {
  const readingSessions = data.sessions.filter((session) => monthOf(session.date) === key);
  const learningSessions = data.learningSessions.filter((session) => monthOf(session.date) === key);

  const finishedBooks = data.books.filter((book) => book.status === "finished" && monthOf(book.finishDate || "") === key).length;
  const finishedLearning = data.learning.filter((item) => item.status === "finished" && monthOf(item.finishDate || "") === key).length;

  const touchedBookIds = new Set(readingSessions.map((session) => session.bookId));
  const touchedLearningIds = new Set(learningSessions.map((session) => session.learningId));

  for (const book of data.books) {
    if (book.status === "reading" && monthOf(book.startDate || "") === key) touchedBookIds.add(book.id);
  }
  for (const item of data.learning) {
    if (item.status === "watching" && monthOf(item.startDate || "") === key) touchedLearningIds.add(item.id);
  }

  const readingInProgress = [...touchedBookIds].filter((id) => data.books.find((book) => book.id === id)?.status === "reading").length;
  const learningInProgress = [...touchedLearningIds].filter((id) => data.learning.find((item) => item.id === id)?.status === "watching").length;

  const daysInMonth = new Date(Number(key.slice(0, 4)), Number(key.slice(5, 7)), 0).getDate();
  let pages = 0;
  let readingMinutes = 0;
  let learningMinutes = 0;
  let activeDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${key}-${String(day).padStart(2, "0")}`;
    const summary = dailyTracker(data, date);
    pages += summary.pages;
    readingMinutes += summary.readingMinutes;
    learningMinutes += summary.learningMinutes;
    if (summary.active) activeDays++;
  }

  return {
    key,
    finishedBooks,
    finishedLearning,
    readingInProgress,
    learningInProgress,
    pages,
    readingMinutes,
    learningMinutes,
    totalMinutes: readingMinutes + learningMinutes,
    activeDays,
  };
}

export function monthActivityMinutes(data: TrackerData, year: number) {
  return Array.from({ length: 12 }, (_, index) => {
    const key = `${year}-${String(index + 1).padStart(2, "0")}`;
    return monthlyTracker(data, key).totalMinutes;
  });
}
