# Architecture Overview

## Monorepo layout

```
apps/client/          Phaser 3 + TypeScript + Vite game client
packages/shared/       Cross-cutting types, IDs, direction/movement math, economy rules
packages/content/      Data-driven game content (classes, regions, world bible, quests…)
tools/asset-validation/ Scripts that check the asset manifest against disk
tools/map-authoring/   Generators for Tiled-compatible JSON maps
docs/                   This documentation
```

`packages/shared` and `packages/content` have no engine dependency — they are plain
TypeScript data/logic, resolved into the client via Vite aliases
(`apps/client/vite.config.ts`) so new regions, classes, items, quests, etc. can be
added there without touching engine code.

## Client structure

```
apps/client/src/
  main.ts        entry point, mounts the Phaser game into #game-root
  game.ts         Phaser.Game config (canvas size, physics, scene list)
  config.ts       ALL tuning numbers (speeds, tile size, storage keys, …)
  core/           engine-adjacent systems: asset manifest, error log, input, animations
  entities/       Sprite subclasses (Player, later NPCs/enemies/pets)
  scenes/         Boot, CharacterCreate, Town (+ future scenes, one per map/UI screen)
  ui/             HUD and other screen-space UI
```

## No-black-square rule

Every asset the game loads is declared once in `core/AssetManifest.ts`
(spec section 2: "zentrale Asset-Manifeste"). `BootScene` loads everything from
that manifest, and if anything fails to load, `ErrorLog` records it and BootScene
renders a **visible red error banner listing every missing asset and its expected
path** instead of continuing — the game refuses to start silently degraded.
`tools/asset-validation/validate-assets.mjs` also checks every manifest path
exists on disk as a pre-build gate.

## Direction & animation system

The engine is built to be fully 8-direction-aware from day one
(`packages/shared/src/direction.ts`): `Direction`, `vectorToDirection`,
`normalizeMovement` (so diagonal movement isn't faster), and
`resolveDirectionFallback`, which maps a requested direction to whichever
direction currently has authored, style-checked art (`AUTHORED_DIRECTIONS`).
Today that's a single pose ("south"), mirrored for anything facing generally
west — see `docs/art-direction/style-guide.md` for why, and Phase 2 in
`docs/gameplay/phase-status.md` for the plan to close that gap. No engine code
needs to change when better art lands — only `AUTHORED_DIRECTIONS` and the
manifest.

## IDs

Every map, region, portal, NPC, enemy, boss, quest, skill, item, pet, market
listing, animation and asset uses a stable string ID (`packages/shared/src/ids.ts`).
`registerId()` throws on a duplicate ID so content collisions fail loudly at
load time instead of silently overwriting each other.

## Maps

Maps are authored as Tiled-compatible JSON (`apps/client/public/assets/maps/*.json`)
with separate layers for ground, decoration, collision (object layer) and
spawns/interactables (object layer). `tools/map-authoring/generate-starttown.mjs`
generates the current start-town slice programmatically so it can be
regenerated/extended without hand-editing a large tile array. Larger regions
will need real chunk streaming (spec section 17) — not yet implemented; the
current map is small enough to load whole.

## Backend-readiness

Nothing here talks to a server. State (character, later inventory/skills/pets/
market) is persisted to `localStorage` behind small, focused modules
(e.g. `CharacterCreateScene`'s save/load), so swapping in real backend calls
later means replacing those functions' bodies, not rearchitecting scenes.
