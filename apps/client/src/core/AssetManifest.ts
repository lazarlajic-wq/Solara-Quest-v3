import { SKILL_DEFINITIONS } from "@solara/content";
import { LAYER_MANIFEST_ENTRIES } from "./CharacterLayers";

const SKILL_ICON_MANIFEST_ENTRIES: AssetManifestEntry[] = SKILL_DEFINITIONS.map((skill) => ({
  key: skill.iconKey,
  kind: "image" as const,
  path: `assets/ui/skills/${skill.iconKey}.png`,
}));

export type AssetKind = "image" | "spritesheet" | "tilemapTiledJSON" | "audio";

export interface SpriteSheetFrameConfig {
  frameWidth: number;
  frameHeight: number;
}

export interface AssetManifestEntry {
  key: string;
  kind: AssetKind;
  path: string;
  frameConfig?: SpriteSheetFrameConfig;
}

/**
 * The single source of truth for every asset the client loads. No scene may
 * call `this.load.image/spritesheet/audio` directly with an inline path —
 * everything is registered here first (spec section 2: "zentrale
 * Asset-Manifeste"). `tools/asset-validation/validate-assets.mjs` checks
 * every path here actually exists on disk before a build is considered
 * good.
 */
export const ASSET_MANIFEST: AssetManifestEntry[] = [
  {
    key: "tileset_starttown",
    kind: "image",
    path: "assets/tilesets/starttown.png",
  },
  // Layered character art composed with the Universal LPC Spritesheet
  // Generator (Liberated Pixel Cup) — see docs/art-direction/CREDITS.md for
  // the required attribution. Every layer is an 8-col x 4-row grid of
  // 128x128 frames (rows: south/north/east/west walk cycles, 8 frames each)
  // sharing the same coordinate system, so any combination can be stacked
  // at runtime — see apps/client/src/entities/CharacterSprite.ts and
  // docs/art-direction/style-guide.md for the full option list.
  ...LAYER_MANIFEST_ENTRIES,
  {
    key: "icon_heart",
    kind: "image",
    path: "assets/ui/icon_heart.png",
  },
  {
    key: "icon_coin",
    kind: "image",
    path: "assets/ui/icon_coin.png",
  },
  {
    key: "map_starttown",
    kind: "tilemapTiledJSON",
    path: "assets/maps/starttown.json",
  },
  ...SKILL_ICON_MANIFEST_ENTRIES,
];

export function getManifestEntry(key: string): AssetManifestEntry {
  const entry = ASSET_MANIFEST.find((e) => e.key === key);
  if (!entry) throw new Error(`Asset key not in manifest: "${key}"`);
  return entry;
}
