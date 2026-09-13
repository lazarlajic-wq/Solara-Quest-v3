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
  wired up so far (4 skin tones, 5 eye colors, 5 hairstyles x 5 colors, 5
  beard styles x 5 colors, all independently combinable); more are a
  mechanical addition, documented in the style guide. Facial scars were
  requested but don't exist in this LPC catalog and aren't implemented.
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

## Phase 3 — Kampf und Klassen: SLICE ONLY

Done:
- **Real melee combat loop**: Space (or the on-screen sword button on
  mobile) swings at whatever's in front of the player within
  `PLAYER_ATTACK_RANGE`/`PLAYER_ATTACK_HIT_RADIUS` (see `config.ts`), on a
  cooldown. `ClassDefinition.baseStats.attack` is now actually consumed —
  damage is class-based once a class is chosen, `DEFAULT_ATTACK_DAMAGE`
  before that. `baseStats.health` now drives the HUD HP value once a class
  is picked, too.
- **Training dummies** (`apps/client/src/entities/TrainingDummy.ts`): two
  stationary practice targets in the start town plaza, with a visible HP
  bar, that take damage, "die" (grant XP, disappear), and respawn after
  `DUMMY_RESPAWN_MS`. Deliberately obvious placeholder art (a straw target
  on a post, procedurally drawn) since no real enemy art exists yet — not a
  disguised reuse of another asset.
- **Real XP/leveling** (`apps/client/src/core/PlayerProgress.ts`):
  defeating a dummy grants `DUMMY_XP_REWARD` XP; leveling now happens
  through play, not only the dev-only debug key. `CLASS_UNLOCK_LEVEL` (5)
  is reachable this way, tested end-to-end (dummy kills → level 5 → NPC →
  ClassSelectScene → equipment swap → HP recalculated from the class).
  The XP curve (`xpToNextLevel` in `config.ts`) is a placeholder — there's
  no quest/other XP source yet to calibrate against.
- HUD now shows level + an XP progress bar alongside HP/Solaris.

Not done:
- No skill tree, skill bar, or resource (mana/energy) spending —
  `baseStats.resource`/`resourceType` still aren't consumed anywhere. This
  is the next natural slice on top of today's combat loop.
- No real enemies (only the training dummy), no damage taken by the player,
  no death/respawn for the player, no combat outside the start town.
- No attack animation — the swing is a small scale-pulse tween on the
  character sprite, not a real animation (see Phase 2's "Known gaps": LPC's
  slash/attack frames aren't extracted yet, and pairing them per class
  weapon is still open).

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
collision. Walk up to one of the two training dummies in the plaza and press
Space repeatedly to attack — watch its HP bar drop, then its XP/level-up
toast and the HUD's level/XP bar once it's defeated. After enough dummy
kills to reach Level 5 (or, faster, the dev-only `K` debug key), talk to the
NPC again to unlock class selection; picking a class swaps only your
equipment (and recalculates HP from `baseStats`), not your designed
character.
