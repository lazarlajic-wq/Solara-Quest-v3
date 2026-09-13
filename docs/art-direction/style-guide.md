# Art Direction & Style Guide

## Perspective & look (spec section 35)

- Top-down perspective, consistent camera angle across all characters/objects.
- High-quality pixel art, consistent light source and shadow direction.
- Consistent proportions and clear silhouettes; no photorealistic elements,
  no modern/out-of-setting objects, no mixed art styles.
- Real transparent backgrounds (no baked-in white/black backgrounds).

## QA gate before any asset is integrated

An asset may only be wired into the manifest/game if it passes:

1. Perspective matches the reference angle.
2. Style/palette matches the established look.
3. Dimensions match the declared frame size exactly (no stretching needed).
4. Real alpha transparency.
5. Correct orientation for its slot/direction.
6. No cropped elements, artifacts, or duplicated limbs/parts.
7. **Animation consistency** — the same character/object must look like the
   same character/object across every frame and every direction.

## Character sprites: Universal LPC Spritesheet Generator

All five classes now have real, QA-passing 4-direction (south/north/east/west)
walk-cycle sheets, composed with the **Universal LPC Spritesheet Character
Generator** (Liberated Pixel Cup art) rather than generated from scratch —
see [`CREDITS.md`](CREDITS.md) for the required attribution, which **must**
stay reachable in-game.

This replaced an earlier failed attempt (a Higgsfield-generated 10x8 sheet
where hairstyle/color drifted row-to-row, failing QA criterion 7 above — kept
only as a cautionary note, the file itself is gone).

### Why LPC over pure image generation

- Real, consistent multi-direction art (no mirroring hacks) with correctly
  rigged walk cycles per direction, already passing criterion 7.
- Modular equipment layers (body/hair/torso/legs/feet/weapon/shield/hat/cape/
  quiver/...) matching the modular-character requirement in spec section 6 —
  thousands of combinations available without generating anything.
- Clearly licensed (OGA-BY/CC-BY-SA/GPL, per-asset in `LPC-CREDITS.csv`) —
  Higgsfield-generated art has no equivalent provenance trail.

### Frame layout (all 5 class sheets, identical)

`apps/client/public/assets/characters/{class}-directional.png` — 8 columns x
4 rows of 128x128 frames:

| Row | Direction | Columns |
|-----|-----------|---------|
| 0   | south     | 8-frame walk cycle |
| 1   | north     | 8-frame walk cycle |
| 2   | east      | 8-frame walk cycle |
| 3   | west      | 8-frame walk cycle |

Built from the generator's canonical full spritesheet export, which places
"walk" at a **fixed** pixel offset (`x:0, y:512`, 512x256, rows in
up/left/down/right order) regardless of which other animations are included
— see `ANIMATION_OFFSETS`/`ANIMATION_CONFIGS` in the generator's
`sources/state/constants.ts` if reproducing this. Reordered to
south/north/east/west and upscaled 2x (nearest-neighbor) to match this
project's 128px frame convention.

### Per-class selections (for reproducing/editing)

Run the generator locally (`npm install --ignore-scripts && npm run dev`),
then open with the class's hash appended to reload that exact build:

- **Swordsman**: `#sex=male&body=Body_Color_light&head=Human_Male_light&expression=Neutral_light&armour=Legion_steel&legs=Armour_steel&weapon=Longsword&hair=Spiked_dark_brown&shoes=Basic_Boots_leather`
- **Tank**: `#sex=male&body=Body_Color_light&head=Human_Male_light&expression=Neutral_light&armour=Plate_steel&legs=Armour_steel&shoes=Basic_Boots_leather&hat=Legion_steel&shield=Round_Shield&weapon=Mace`
- **Mage**: `#sex=male&body=Body_Color_light&head=Human_Male_light&expression=Neutral_light&clothes=Longsleeve_purple&legs=Pantaloons_purple&cape=Solid_purple&hat=Wizard_Hat_Base&weapon=Simple_staff&hair=Long_dark_brown`
- **Archer**: `#sex=male&body=Body_Color_light&head=Human_Male_light&expression=Neutral_light&vest=Vest_green&legs=Pants_brown&shoes=Basic_Boots_leather&weapon=Recurve&quiver=Quiver&hair=Ponytail_dark_brown`
- **Assassin**: `#sex=male&body=Body_Color_light&head=Human_Male_light&expression=Neutral_light&hat=Sack_Cloth_Hood_black&vest=Vest_black&legs=Pants_black&shoes=Basic_Boots_leather&weapon=Dagger`

Export via the "Spritesheet (PNG)" button (or, headlessly,
`document.getElementById('spritesheet-preview').toDataURL('image/png')` in
the browser console), crop `512x256` at `(0, 512)`, split into 4x `512x64`
rows, reorder to south/north/east/west, then
`magick <reordered> -filter point -resize 200% <class>-directional.png`.

### Known gaps (see `docs/gameplay/phase-status.md`, Phase 2/3)

- Only **walk** (+ implicit idle from frame 0) is authored per direction.
  Attack/hurt/death animations exist in the LPC catalog (`slash`, `hurt`,
  etc.) but need a weapon-aware pairing decision once Phase 3 (combat)
  defines what each class's attack should look like — a first attempt at
  reusing "slash" broke because heavy weapons like the Longsword only
  support `slash_oversize`/`thrust_oversize`, not plain `slash`.
- Diagonal directions (northeast/southwest/...) still collapse to the
  nearest cardinal (`resolveDirectionFallback` in
  `packages/shared/src/direction.ts`) — true 8-direction art is a stretch
  goal, not urgent given LPC's own convention is 4-direction.
- Visual customization at character creation (skin/eye color, face, scars)
  isn't exposed yet — the generator supports all of this per-layer; only the
  class's preset combination is used today.

## Other available placeholder-quality source art

Not yet integrated: topdown mage/paladin/ranger Higgsfield sheets, three pet
sprite sheets, and 14 NPC portrait/topdown pieces (alchemist, bard,
blacksmith, fisher, healer, innkeeper, merchant, miner, raid mystic, sailor,
scholar, swamp herbalist, trainer, villager) — still need the QA pass above,
and NPCs in particular are a strong candidate for the same LPC-generator
workflow used for player characters (it has civilian/NPC-appropriate
clothing and can reuse the same layering pipeline) rather than more
Higgsfield generation.

## Asset folder structure (spec section 35)

```
apps/client/public/assets/
  characters/
  equipment/       (not yet populated)
  weapons/         (not yet populated)
  npcs/            (not yet populated)
  enemies/         (not yet populated)
  bosses/          (not yet populated)
  pets/            (not yet populated)
  tilesets/
  ui/
  maps/
  audio/           (not yet populated)
```
