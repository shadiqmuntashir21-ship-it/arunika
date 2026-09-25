import type { BookStatus, LearningStatus } from "./types";

export function uid(prefix = "id") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function percent(value: number, total: number) {
  if (!total) return 0;
  return clamp(Math.round((value / total) * 100), 0, 100);
}

export function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value || 0);
}

export function dateLabel(value?: string) {
  if (!value) return "—";
  const d = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

export function monthKey(value: string) {
  return value.slice(0, 7);
}

export function monthName(monthIndex: number) {
  return new Intl.DateTimeFormat("id-ID", { month: "short" }).format(new Date(2026, monthIndex, 1));
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function bookStatusLabel(status: BookStatus) {
  return {
    reading: "Sedang dibaca",
    finished: "Selesai",
    wishlist: "Waiting list",
    unfinished: "Tidak selesai"
  }[status];
}

export function learningStatusLabel(status: LearningStatus) {
  return {
    watching: "Ditonton",
    finished: "Selesai",
    wishlist: "Waiting list",
    unfinished: "Tidak selesai"
  }[status];
}
