import type { BeardStyle, EyeColor, Gender, HairColor, HairStyle, SkinTone } from "@solara/shared";
import type { ClassId } from "@solara/shared";
import type { AssetManifestEntry } from "./AssetManifest";

const FRAME_CONFIG = { frameWidth: 128, frameHeight: 128 };

/** Base body/head/hair/beard/eye options actually generated so far — see style-guide.md to add more. */
export const AVAILABLE_SKIN_TONES: SkinTone[] = ["light", "amber", "olive", "brown"];
export const AVAILABLE_EYE_COLORS: EyeColor[] = ["brown", "blue", "green", "gray", "purple"];
export const AVAILABLE_HAIR_STYLES: HairStyle[] = ["plain", "ponytail", "bob", "long", "curly"];
export const AVAILABLE_HAIR_COLORS: HairColor[] = ["black", "dark_brown", "blonde", "red", "gray"];
export const AVAILABLE_BEARD_STYLES: BeardStyle[] = ["none", "trimmed", "basic", "medium", "mustache", "winter"];

/** Classes that have a generated outfit-only layer (equipment unlocked at CLASS_UNLOCK_LEVEL). */
export const CLASSES_WITH_OUTFIT_LAYER: ClassId[] = ["swordsman", "tank", "mage", "archer", "assassin"];

/**
 * Body + head only — eye color is a SEPARATE overlay layer (see eyeLayerKey),
 * not baked in here. LPC recolors eyes as pixels of the head sprite itself,
 * so a naive "one base per skin+eye" scheme would need
 * genders x skins x eyes images; instead the base is rendered once per
 * gender+skin (with a throwaway default eye color) and the real eye color is
 * drawn on top via a small opaque-only-at-the-iris overlay extracted by
 * diffing two eye-color renders — see tools/art-pipeline and the style guide.
 */
export function baseLayerKey(gender: Gender, skinTone: SkinTone): string {
  return `layer_base_${gender}_${skinTone}`;
}

export function eyeLayerKey(eyeColor: EyeColor): string {
  return `layer_eye_${eyeColor}`;
}

export function hairLayerKey(hairStyle: HairStyle, hairColor: HairColor): string {
  return `layer_hair_${hairStyle}_${hairColor}`;
}

export function beardLayerKey(beardStyle: Exclude<BeardStyle, "none">, beardColor: HairColor): string {
  return `layer_beard_${beardStyle}_${beardColor}`;
}

export function starterOutfitLayerKey(gender: Gender): string {
  return `layer_outfit_${gender}_leather`;
}

export function classOutfitLayerKey(classId: ClassId): string {
  return `layer_outfit_class_${classId}`;
}

function layerEntries(prefix: string, path: string, names: string[]): AssetManifestEntry[] {
  return names.map((name) => ({
    key: `${prefix}${name}`,
    kind: "spritesheet" as const,
    path: `assets/characters/layers/${path.replace("{name}", name)}`,
    frameConfig: FRAME_CONFIG,
  }));
}

const baseNames = AVAILABLE_SKIN_TONES.flatMap((skin) => ["male", "female"].map((gender) => `${gender}_${skin}`));
const hairNames = AVAILABLE_HAIR_STYLES.flatMap((style) => AVAILABLE_HAIR_COLORS.map((color) => `${style}_${color}`));
const beardNames = AVAILABLE_BEARD_STYLES.filter((s): s is Exclude<BeardStyle, "none"> => s !== "none").flatMap(
  (style) => AVAILABLE_HAIR_COLORS.map((color) => `${style}_${color}`),
);

export const LAYER_MANIFEST_ENTRIES: AssetManifestEntry[] = [
  ...layerEntries("layer_base_", "base/{name}.png", baseNames),
  ...layerEntries("layer_eye_", "eyes/{name}.png", AVAILABLE_EYE_COLORS),
  ...layerEntries("layer_hair_", "hair/{name}.png", hairNames),
  ...layerEntries("layer_beard_", "beard/{name}.png", beardNames),
  ...layerEntries("layer_outfit_", "outfit/{name}.png", ["male_leather", "female_leather"]),
  ...layerEntries(
    "layer_outfit_class_",
    "outfit/{name}.png",
    CLASSES_WITH_OUTFIT_LAYER as unknown as string[],
  ),
];
