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
  {
    key: "char_swordsman",
    kind: "spritesheet",
    path: "assets/characters/swordsman.png",
    frameConfig: { frameWidth: 128, frameHeight: 128 },
  },
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
];

export function getManifestEntry(key: string): AssetManifestEntry {
  const entry = ASSET_MANIFEST.find((e) => e.key === key);
  if (!entry) throw new Error(`Asset key not in manifest: "${key}"`);
  return entry;
}
