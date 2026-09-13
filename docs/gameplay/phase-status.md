# Phase Status

Tracks progress against the Solara Quest masterprompt's 41 sections and the
Phase 1–6 build plan (section 38). This is a living document — update it
whenever a phase's scope changes.

## Phase 1 — Fundament: DONE

- New repository (`lazarlajic-wq/Solara-Quest-v3`), npm-workspaces monorepo
  matching the spec's `apps/ packages/ tools/ docs/` layout.
- Phaser 3 + TypeScript + Vite, strict TS config, production build verified.
- Central asset manifest + visible error banner for missing assets (no black
  squares) — `core/AssetManifest.ts`, `core/ErrorLog.ts`, `scenes/BootScene.ts`.
- Data-driven content packages (`@solara/shared`, `@solara/content`) with
  stable IDs and duplicate-ID detection (`registerId`).
- Asset path validator (`npm run validate:assets`).

## Phase 2 — Referenzcharakter: PARTIAL (art quality bar met, real character creation)

Done:
- **Real character creation**: the player designs gender, skin tone, eye
  color, hairstyle + color, and beard + color themselves (spec section 6),
  rendered live via runtime-layered LPC art (body/beard/hair/outfit as
  independent stacked sprites sharing one frame index) — see
  `apps/client/src/entities/CharacterSprite.ts` and
  `docs/art-direction/style-guide.md`. A curated subset of LPC's options is
  wired up so far (2 skin tones, 2 eye colors, 2 hairstyles x 2 colors, 1
  beard style x 2 colors); more are a mechanical addition, documented in the
  style guide. Facial scars were requested but don't exist in this LPC
  catalog and aren't implemented.
- **Class choice moved to `CLASS_UNLOCK_LEVEL` (5)**: everyone starts in the
  same neutral brown leather outfit; class is chosen later via the new
  `ClassSelectScene`, which only swaps the equipment layer on top of the
  player's designed character — the body/hair/face they made persists.
  Reachable by talking to the town NPC once the level requirement is met.
- **Level tracking is a stub**: `apps/client/src/core/PlayerProgress.ts`
  stores a `level` in localStorage; there's no XP/combat yet (Phase 3), so
  the only way to level up today is a dev-only debug key (`K` in
  `TownScene`, gated by `import.meta.env.DEV`). Replace with real XP once
  combat exists — the storage shape and the `CLASS_UNLOCK_LEVEL` check
  don't need to change.
- 4-direction-aware movement/animation, no mirroring needed
  (`vectorToDirection`, `normalizeMovement`, diagonal speed normalized,
  diagonals collapse to nearest cardinal), now driving every layer in sync.
- Desktop controls (WASD/arrows, Shift dash, E interact) and a basic mobile
  virtual joystick.
- Camera, world bounds, tile collision.

Not done / known gap:
- True 8-direction diagonal art (currently diagonals reuse the nearest
  cardinal — see `AUTHORED_DIRECTIONS` in `packages/shared/src/direction.ts`).
- Only a curated slice of LPC's customization catalog is wired up (see
  style guide) — more skin tones/hairstyles/colors/beards are a drop-in
  extension, not a redesign.
- Attack/hurt/death animations aren't wired yet — only idle/walk are
  exercised by the current Player state machine. The LPC catalog has these
  (`slash`, `hurt`, ...) but pairing them per class/weapon is a Phase 3
  (combat) decision — see the style guide's "Known gaps".

## Phase 3 — Kampf und Klassen: NOT STARTED

No skills, skill tree, skill bar, resource (mana/energy) spending, or
enemies yet. `ClassDefinition.baseStats` exists as data but isn't consumed
by any combat system.

## Phase 4 — Erste Region: SLICE ONLY

Done: a real, fully-integrated (not standalone) start-town map — Tiled JSON
map with ground/decoration/collision/spawn layers, tileset reuse, an
interactable NPC, and a portal stub that shows an honest "not built yet"
message rather than pretending to transition.

Not done: training grounds, harbor, the four field areas, the Leviathan
boss area, and the capital (see `packages/content/src/regions/
region-01-solara-coast.ts` for the full map graph — every ID is already
reserved, `hasAuthoredMap: false` on all of them). No quests, no enemies, no
Solaris economy hooked up yet, no pets, no marketplace.

## Phase 5 — Weltplanung: STUB ONLY

`packages/content/src/worldBible.ts` reserves IDs, names, and themes for all
ten regions per the spec's difficulty progression, but only region 1 has any
real content.

## Phase 6 — Weitere Regionen: NOT STARTED

## Cross-cutting systems not yet started

Skill trees, skill bar (1–9), equipment/inventory, NPC dialogue trees beyond
one line, enemies/bosses, quests, Solaris economy, pets, player marketplace
(spec sections 26–32) — none implemented. `packages/shared/src/economy.ts`
has the market-fee formula (5%, round-then-subtract) ready and unit-testable
ahead of the marketplace UI existing.

## How to verify what exists today

```bash
npm install
npm run typecheck
npm run build
npm run validate:assets
npm run dev   # then open the printed localhost URL
```

Character creation → design your look (gender/skin/eyes/hair/beard), enter a
name (2+ chars) → start town wearing the neutral leather starter outfit.
WASD/arrows to move (8-direction, diagonal not faster), Shift to dash, E near
the NPC by the plaza entrance to talk, try walking into the west river to see
collision. In dev mode, press `K` a few times to level up (stub — see Phase
2), then talk to the NPC again to unlock class selection at Level 5; picking
a class swaps only your equipment, not your designed character.
