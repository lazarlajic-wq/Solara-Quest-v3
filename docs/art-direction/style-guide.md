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

## Known failing asset: `warrior-topdown-v2.png`

The only character sheet available at the start of this project
(`apps/client/public/assets/characters/swordsman.png`, sourced from an earlier
Higgsfield generation attempt) is a 10×8 grid of 128×128 frames. Column-wise it
reads as one animation cycle (idle → walk → attack → hit → death), but
**row-wise the hairstyle and coloring drift** — it was very likely meant to be
an 8-direction sheet (8 rows) and failed the consistency check in criterion 7
above. Using every row as a distinct direction would mean the character
visibly changes identity when it turns, which is explicitly disallowed
(spec section 4).

**Decision:** only row 0 is used, as a single authored pose (`AUTHORED_DIRECTIONS
= ["south"]` in `packages/shared/src/direction.ts`), mirrored on the X axis for
anything facing generally west. This is a documented, working placeholder —
not a silent shortcut — and the engine (`resolveDirectionFallback`,
`AnimationDefinition`, `DirectionalAnimationSet`) is already written to accept
a full 8-direction set the moment one exists, with no code changes beyond
updating `AUTHORED_DIRECTIONS` and the manifest.

## Backlog: generating a real reference character

To close this gap with Higgsfield (or another generator), regenerate the
Swordsman as **8 separate direction passes of the same seed/character**
(not one grid asking for 8 rows at once), each with the full idle/walk/
attack/hit/death cycle, then run them through the QA gate above before
touching `AUTHORED_DIRECTIONS`. The same process then extends to the other
four classes (Tank, Mage, Archer, Assassin), which currently use a tinted
copy of the Swordsman sheet as an even more temporary stand-in
(`PLACEHOLDER_TINTS` in `apps/client/src/entities/Player.ts`).

## Other available placeholder-quality source art

Not yet integrated, but present under the project's reference material and
usable as later starting points (still needs the same QA pass before
integration): topdown mage/paladin/ranger sheets, three pet sprite sheets,
and 14 NPC portrait/topdown pieces (alchemist, bard, blacksmith, fisher,
healer, innkeeper, merchant, miner, raid mystic, sailor, scholar, swamp
herbalist, trainer, villager).

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
