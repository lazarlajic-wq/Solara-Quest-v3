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

export const STORAGE_KEYS = {
  character: "solara.character.v1",
  settings: "solara.settings.v1",
} as const;
