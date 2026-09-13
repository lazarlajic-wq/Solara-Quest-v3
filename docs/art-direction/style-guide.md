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

## Character sprites: Universal LPC Spritesheet Generator (runtime layering)

Character art is now **layered at runtime**, not baked per class. Each
character is a stack of independent sprites — body, beard, hair, outfit —
composed with the **Universal LPC Spritesheet Character Generator**
(Liberated Pixel Cup art). All layers share the same 128px frame grid and
coordinate system, so any combination lines up without pre-baking every
possibility. See [`CREDITS.md`](CREDITS.md) for the required attribution,
which **must** stay reachable in-game, and
`apps/client/src/entities/CharacterSprite.ts` for the compositor.

This replaced two earlier approaches: a Higgsfield-generated sheet where
hairstyle/color drifted row-to-row (failing QA criterion 7), and — before
that — one fully-baked LPC sheet per class (real art, but no way to design
your own character or keep your look across a class change). The player now
designs body/hair/beard/eyes themselves at creation (spec section 6); the
class chosen at `CLASS_UNLOCK_LEVEL` (see `packages/shared/src/types.ts`)
only swaps the **outfit** layer on top.

### Why layering over one sheet per character

- The player can actually design their own character (spec section 6)
  instead of picking a fixed class avatar.
- Choosing/changing a class only swaps equipment — body/hair/face persist,
  matching "man erstellt nur eine Basis-Ausrüstung bis Level 5... und die
  jeweiligen Ausrüstungen bekommt" (starter leather look pre-unlock, class
  gear afterward, same character throughout).
- Still fully licensed and provenance-tracked per file (`LPC-CREDITS.csv`).

### Layer categories and draw order

Back to front: **body** (base) → **beard** → **hair** → **outfit**. Hair
draws over the beard so longer styles aren't clipped at the jaw.

| Layer | Key pattern | Notes |
|-------|-------------|-------|
| Body  | `layer_base_{gender}_{skinTone}_{eyeColor}` | Body + head + eye color are baked together — LPC recolors eyes as pixels *of* the head sprite, not a separate item, so this one combination can't be split further. |
| Hair  | `layer_hair_{style}_{color}` | Independent overlay, unisex. |
| Beard | `layer_beard_{style}_{color}` | Independent overlay; omitted entirely when `beardStyle === "none"`. |
| Outfit (starter) | `layer_outfit_{gender}_leather` | Neutral brown leather armor/pants/boots, worn by everyone below `CLASS_UNLOCK_LEVEL`. |
| Outfit (class) | `layer_outfit_class_{classId}` | Swapped in by `CharacterSprite.setClass()` once a class is chosen — see `ClassSelectScene`. |

All keys and the available option lists live in
`apps/client/src/core/CharacterLayers.ts`.

### Currently wired-up options (MVP slice — see "Adding more options" below)

- **Gender**: male, female
- **Skin tone**: light, brown
- **Eye color**: brown, blue
- **Hair style**: Plain (short), Ponytail
- **Hair color**: black, dark_brown
- **Beard**: none, Trimmed Beard (colors: black, dark_brown)

This is a deliberately bounded first slice (same "honest slice, documented
gaps" approach as the rest of Phase 2) — LPC has dozens more skin tones,
hairstyles, colors, and facial hair options; adding one is mechanical (see
below), it just wasn't exhaustively generated up front. Facial **scars**
were requested but aren't in this generator's asset catalog at all (only a
neck scarf accessory exists) — not implemented, and not simple to fake
without new art.

### Frame layout (every layer file, identical)

`apps/client/public/assets/characters/layers/{base,hair,beard,outfit}/*.png`
— 8 columns x 4 rows of 128x128 frames:

| Row | Direction | Columns |
|-----|-----------|---------|
| 0   | south     | 8-frame walk cycle |
| 1   | north     | 8-frame walk cycle |
| 2   | east      | 8-frame walk cycle |
| 3   | west      | 8-frame walk cycle |

Built from the generator's canonical full spritesheet export, which places
"walk" at a **fixed** pixel offset (`x:0, y:512`, 512x256, rows in
up/left/down/right order) regardless of which other animations are included.
Reordered to south/north/east/west and upscaled 2x (nearest-neighbor) via
`tools/art-pipeline/extract_layer.sh <full-sheet.png> <output.png>`.

### Reproducing or adding a layer

Run the generator locally (`git clone
https://github.com/liberatedpixelcup/Universal-LPC-Spritesheet-Character-Generator
&& npm install --ignore-scripts && npm run dev`). For each layer:

1. Open the generator with **only** that layer's hash params (leave
   everything else empty — the export will be transparent except for that
   item, which is exactly what's needed for an independent overlay).
2. **Uncheck "Show transparency grid"** in the Full Spritesheet Preview
   panel first — it's on by default and, if left on, bakes a visible
   checkerboard into the exported pixels instead of real alpha
   transparency (breaks compositing; check with
   `magick file.png -format "%[pixel:p{5,5}]" info:` — a background pixel
   must read `srgba(0,0,0,0)`, not an opaque gray).
3. Export via the "Spritesheet (PNG)" button, or headlessly via
   `document.getElementById('spritesheet-preview').toDataURL('image/png')`
   in the console.
4. Run `tools/art-pipeline/extract_layer.sh <exported.png> <dest.png>` to
   crop/reorder/upscale it into the project's frame convention, and save it
   under the matching `layers/{base,hair,beard,outfit}/` folder using the
   naming pattern from the table above.
5. Register it in `apps/client/src/core/CharacterLayers.ts`'s
   `AVAILABLE_*` arrays (base/hair/beard) so it's picked up by both the
   asset manifest and `validate-assets.mjs`, or add the class id to
   `CLASSES_WITH_OUTFIT_LAYER` for a new class outfit.

Base/head hash params: `sex=male|female`, `body=Body_Color_{skin}`,
`head=Human_{Male|Female}_{skin}`, `eyes=Eye_Color_{color}`. Hair:
`hair={ItemName}_{color}`. Beard: `beard={ItemName}_{color}`. Starter
outfit: `armour=Leather_leather&legs=Pants_brown&shoes=Basic_Boots_leather`.
Per-class outfit hashes (equipment only, no body/hair) are recorded in git
history for `outfit_{class}.png` generation — swordsman/tank/mage/
archer/assassin currently use the same gear selections as the original
single-sheet designs (Longsword+Legion armor, Plate+shield+Mace, purple
robe+staff, green vest+bow+quiver, black hood+vest+dagger respectively).

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
- Class outfit layers were generated once with a fixed gender (male) hash;
  they render fine on both genders in practice (many LPC armor/clothing
  items are unisex sprites), but haven't been re-verified per-gender pixel
  by pixel.
- No facial scars (not in this LPC catalog) or additional customization
  (face shape, tattoos) — see the MVP slice note above.

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
