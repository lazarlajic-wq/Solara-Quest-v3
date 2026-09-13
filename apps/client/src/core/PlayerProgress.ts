import { STORAGE_KEYS } from "../config";

export interface PlayerProgress {
  level: number;
}

const DEFAULT_PROGRESS: PlayerProgress = { level: 1 };

/**
 * Minimal level tracking so class unlock (CLASS_UNLOCK_LEVEL) has something
 * real to gate on. There is no XP/combat system yet (Phase 3) — leveling up
 * is currently only reachable via debugLevelUp(), bound to a dev-only key in
 * TownScene. Replace with real XP once combat exists; the storage shape and
 * CLASS_UNLOCK_LEVEL check downstream don't need to change.
 */
export function loadProgress(): PlayerProgress {
  const raw = localStorage.getItem(STORAGE_KEYS.progress);
  if (!raw) return { ...DEFAULT_PROGRESS };
  try {
    return { ...DEFAULT_PROGRESS, ...(JSON.parse(raw) as Partial<PlayerProgress>) };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

function saveProgress(progress: PlayerProgress): void {
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
}

export function debugLevelUp(): PlayerProgress {
  const progress = loadProgress();
  progress.level += 1;
  saveProgress(progress);
  return progress;
}
