"use client";

import { demoBooks, demoHabit, demoLearning, demoSessions, demoSettings } from "./demo-data";
import type { BackupPayload, Book, HabitDay, LearningItem, ReadingSession, Settings } from "./types";

const DB_NAME = "arunika-local";
const VERSION = 1;
const STORES = ["books", "learning", "sessions", "habit", "settings"] as const;

type StoreName = (typeof STORES)[number];

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store)) db.createObjectStore(store, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function tx<T>(storeName: StoreName, mode: IDBTransactionMode, runner: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const request = runner(transaction.objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getAll<T>(storeName: StoreName): Promise<T[]> {
  return tx<T[]>(storeName, "readonly", (store) => store.getAll());
}

export async function getOne<T>(storeName: StoreName, id: string): Promise<T | undefined> {
  return tx<T | undefined>(storeName, "readonly", (store) => store.get(id));
}

export async function putOne<T extends { id: string }>(storeName: StoreName, value: T): Promise<T> {
  await tx<IDBValidKey>(storeName, "readwrite", (store) => store.put(value));
  return value;
}

export async function deleteOne(storeName: StoreName, id: string): Promise<void> {
  await tx<undefined>(storeName, "readwrite", (store) => store.delete(id) as IDBRequest<undefined>);
}

export async function clearStore(storeName: StoreName): Promise<void> {
  await tx<undefined>(storeName, "readwrite", (store) => store.clear() as IDBRequest<undefined>);
}

async function count(storeName: StoreName) {
  return tx<number>(storeName, "readonly", (store) => store.count());
}

export async function seedIfNeeded() {
  if ((await count("settings")) > 0) return;
  await Promise.all([
    ...demoBooks.map((item) => putOne("books", item)),
    ...demoLearning.map((item) => putOne("learning", item)),
    ...demoSessions.map((item) => putOne("sessions", item)),
    ...demoHabit.map((item) => putOne("habit", item)),
    putOne("settings", demoSettings)
  ]);
}

export async function loadSnapshot() {
  await seedIfNeeded();
  const [books, learning, sessions, habit, settings] = await Promise.all([
    getAll<Book>("books"),
    getAll<LearningItem>("learning"),
    getAll<ReadingSession>("sessions"),
    getAll<HabitDay>("habit"),
    getOne<Settings>("settings", "settings")
  ]);
  return { books, learning, sessions, habit, settings: settings ?? demoSettings };
}

export async function exportBackup(): Promise<BackupPayload> {
  const data = await loadSnapshot();
  return { version: 1, exportedAt: new Date().toISOString(), ...data };
}

export async function importBackup(payload: BackupPayload) {
  if (!payload || payload.version !== 1) throw new Error("Format backup tidak dikenali.");
  await Promise.all(STORES.map((store) => clearStore(store)));
  await Promise.all([
    ...payload.books.map((item) => putOne("books", item)),
    ...payload.learning.map((item) => putOne("learning", item)),
    ...payload.sessions.map((item) => putOne("sessions", item)),
    ...payload.habit.map((item) => putOne("habit", item)),
    putOne("settings", payload.settings)
  ]);
}
