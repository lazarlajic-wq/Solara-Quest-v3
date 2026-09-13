/**
 * All tuning numbers for the client live here (spec: "config.ts holds ALL
 * tuning numbers"). Nothing gameplay-relevant should be a magic number
 * scattered in scene/entity files.
 */
export const TILE_SIZE = 32;

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 640;

export const CHUNK_SIZE_TILES = 32;
export const ACTIVE_CHUNK_RADIUS = 1; // 3x3 chunks active around the player

export const PLAYER_WALK_SPEED = 180; // px/s
export const PLAYER_RUN_SPEED = 300; // px/s
export const PLAYER_DASH_SPEED = 620; // px/s
export const PLAYER_DASH_DURATION_MS = 160;
export const PLAYER_DASH_COOLDOWN_MS = 900;

export const SKILL_BAR_SLOT_COUNT = 9;

// Combat (Phase 3 first slice: basic melee attack against training dummies —
// see docs/gameplay/phase-status.md for what's still missing, e.g. real
// enemies, skills, and resource spending).
export const DEFAULT_ATTACK_DAMAGE = 10; // used before a class (and its baseStats.attack) is chosen
export const PLAYER_ATTACK_COOLDOWN_MS = 500;
export const PLAYER_ATTACK_RANGE = 60; // px, distance from player to the attack point
export const PLAYER_ATTACK_HIT_RADIUS = 40; // px, how close a target must be to the attack point

export const DUMMY_MAX_HP = 50;
export const DUMMY_XP_REWARD = 60;
export const DUMMY_RESPAWN_MS = 4000;

// Real (hostile, damage-dealing) enemies — the first ones that can hurt the
// player back. Still placeholder art (see entities/Enemy.ts).
export const ENEMY_MAX_HP = 40;
export const ENEMY_XP_REWARD = 40;
export const ENEMY_DAMAGE = 8;
export const ENEMY_ATTACK_COOLDOWN_MS = 1000;
export const ENEMY_ATTACK_RANGE = 44;
export const ENEMY_AGGRO_RANGE = 160;
export const ENEMY_LEASH_RANGE = 220; // gives up chasing and returns home past this distance from spawn
export const ENEMY_MOVE_SPEED = 90; // px/s
export const ENEMY_RESPAWN_MS = 6000;

export const PLAYER_RESPAWN_DELAY_MS = 1200;

// XP required to go from `level` to `level + 1`. No real combat/quest economy
// yet, so this is a placeholder curve — revisit once more XP sources exist.
export const xpToNextLevel = (level: number): number => 50 * level;

export const STORAGE_KEYS = {
  character: "solara.character.v1",
  settings: "solara.settings.v1",
  progress: "solara.progress.v1",
} as const;
