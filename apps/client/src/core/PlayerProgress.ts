import { STORAGE_KEYS, xpToNextLevel } from "../config";

export interface PlayerProgress {
  level: number;
  xp: number; // progress toward the next level; resets to 0 (carrying remainder) on level-up
}

const DEFAULT_PROGRESS: PlayerProgress = { level: 1, xp: 0 };

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

export interface AddXpResult {
  progress: PlayerProgress;
  levelsGained: number;
}

/** Adds XP, applying every level-up the amount crosses (carrying the XP remainder forward). */
export function addXp(amount: number): AddXpResult {
  const progress = loadProgress();
  progress.xp += amount;
  let levelsGained = 0;

  let required = xpToNextLevel(progress.level);
  while (progress.xp >= required) {
    progress.xp -= required;
    progress.level += 1;
    levelsGained += 1;
    required = xpToNextLevel(progress.level);
  }

  saveProgress(progress);
  return { progress, levelsGained };
}

/** Dev-only convenience for reaching a level without playing through combat. */
export function debugLevelUp(): PlayerProgress {
  const progress = loadProgress();
  progress.level += 1;
  progress.xp = 0;
  saveProgress(progress);
  return progress;
}
