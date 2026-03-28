/**
 * Guest mode progress stored in localStorage.
 * Key: aiquest_progress
 * Shape mirrors the DB user_progress table for easy migration on sign-in.
 */

const STORAGE_KEY = "aiquest_progress";

// ============================================================
// Types
// ============================================================

export interface GuestLevelProgress {
  levelId: number;
  chapterId: number;
  completed: boolean;
  score: number | null;
  maxScore: number | null;
  attempts: number;
  timeSpentSeconds: number;
  completedAt: string | null; // ISO string
}

export interface GuestProgressStore {
  version: 1;
  updatedAt: string; // ISO string
  levels: Record<string, GuestLevelProgress>; // key: `level_${levelId}`
}

export interface GuestStats {
  totalCompleted: number;
  totalAttempts: number;
  totalXp: number;
  totalTimeSeconds: number;
  byChapter: Record<number, { completed: number; total: number }>;
}

// ============================================================
// Internal helpers
// ============================================================

function readStore(): GuestProgressStore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GuestProgressStore;
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStore(store: GuestProgressStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Quota exceeded — silently ignore
  }
}

function emptyStore(): GuestProgressStore {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    levels: {},
  };
}

// ============================================================
// Public API
// ============================================================

/**
 * Get all guest progress. Returns null if nothing stored.
 */
export function getGuestProgress(): GuestProgressStore | null {
  return readStore();
}

/**
 * Save or update progress for a specific level.
 */
export function saveGuestProgress(progress: GuestLevelProgress): void {
  const store = readStore() ?? emptyStore();
  const key = `level_${progress.levelId}`;
  const existing = store.levels[key];

  store.levels[key] = {
    ...progress,
    attempts: (existing?.attempts ?? 0) + 1,
    // Only update completedAt on first completion
    completedAt:
      progress.completed && !existing?.completedAt
        ? new Date().toISOString()
        : (existing?.completedAt ?? null),
  };
  store.updatedAt = new Date().toISOString();
  writeStore(store);
}

/**
 * Get aggregated stats for display on the hub page.
 */
export function getGuestStats(): GuestStats {
  const store = readStore();
  if (!store) {
    return {
      totalCompleted: 0,
      totalAttempts: 0,
      totalXp: 0,
      totalTimeSeconds: 0,
      byChapter: {},
    };
  }

  const byChapter: Record<number, { completed: number; total: number }> = {};
  let totalCompleted = 0;
  let totalAttempts = 0;
  let totalXp = 0;
  let totalTimeSeconds = 0;

  for (const entry of Object.values(store.levels)) {
    if (!byChapter[entry.chapterId]) {
      byChapter[entry.chapterId] = { completed: 0, total: 0 };
    }
    byChapter[entry.chapterId].total++;
    if (entry.completed) {
      byChapter[entry.chapterId].completed++;
      totalCompleted++;
      totalXp += entry.score ?? 0;
    }
    totalAttempts += entry.attempts;
    totalTimeSeconds += entry.timeSpentSeconds;
  }

  return {
    totalCompleted,
    totalAttempts,
    totalXp,
    totalTimeSeconds,
    byChapter,
  };
}

/**
 * Whether the guest has any stored progress.
 */
export function hasGuestProgress(): boolean {
  const store = readStore();
  return store !== null && Object.keys(store.levels).length > 0;
}

/**
 * Clear all guest progress (e.g., after syncing to DB on sign-in).
 */
export function clearGuestProgress(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Get progress for a specific level. Returns null if not attempted.
 */
export function getGuestLevelProgress(
  levelId: number,
): GuestLevelProgress | null {
  const store = readStore();
  if (!store) return null;
  return store.levels[`level_${levelId}`] ?? null;
}

/**
 * Get all completed level IDs for a specific chapter.
 */
export function getGuestChapterCompletedIds(chapterId: number): number[] {
  const store = readStore();
  if (!store) return [];
  return Object.values(store.levels)
    .filter((l) => l.chapterId === chapterId && l.completed)
    .map((l) => l.levelId);
}
