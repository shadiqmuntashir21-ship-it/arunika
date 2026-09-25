import type { loadSnapshot } from "@/lib/db";
export type Snapshot = Awaited<ReturnType<typeof loadSnapshot>>;
