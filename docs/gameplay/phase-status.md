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

## Phase 2 — Referenzcharakter: PARTIAL

Done:
- Character creation scene (name + class selection, all 5 classes genuinely
  selectable and playable).
- 8-direction-aware movement/animation **architecture**
  (`vectorToDirection`, `normalizeMovement`, diagonal speed normalized).
- Desktop controls (WASD/arrows, Shift dash, E interact) and a basic mobile
  virtual joystick.
- Camera, world bounds, tile collision.

Not done / known gap:
- Only **one** authored direction exists in the reference art (see
  `docs/art-direction/style-guide.md` for why) — not the full 8. The engine
  doesn't need to change when real 8-direction art lands, only the manifest
  and `AUTHORED_DIRECTIONS`.
- Visible equipment layering (modular body/hair/armor/weapon layers) is not
  implemented — there is one flat character sprite per class right now.
- Character customization (skin/eye color, hairstyle, scars, etc.) is not
  implemented in the creation screen yet — only name + class.
- Dash/attack/hit/death animations are wired in code (`CharacterAnimations.ts`)
  but only idle/walk are actually exercised by the current Player state
  machine; attack/hit/death need combat (Phase 3) to trigger them.

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

Character creation → pick any class, enter a name (2+ chars) → start town.
WASD/arrows to move (8-direction, diagonal not faster), Shift to dash, E near
the NPC by the plaza entrance to talk, try walking into the west river to see
collision.
