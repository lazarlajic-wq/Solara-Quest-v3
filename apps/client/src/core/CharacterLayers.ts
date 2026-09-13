import type { BeardStyle, EyeColor, Gender, HairColor, HairStyle, SkinTone } from "@solara/shared";
import type { ClassId } from "@solara/shared";
import type { AssetManifestEntry } from "./AssetManifest";

const FRAME_CONFIG = { frameWidth: 128, frameHeight: 128 };

/** Base body/head combos actually generated so far — see style-guide.md to add more. */
export const AVAILABLE_SKIN_TONES: SkinTone[] = ["light", "brown"];
export const AVAILABLE_EYE_COLORS: EyeColor[] = ["brown", "blue"];
export const AVAILABLE_HAIR_STYLES: HairStyle[] = ["plain", "ponytail"];
export const AVAILABLE_HAIR_COLORS: HairColor[] = ["black", "dark_brown"];
export const AVAILABLE_BEARD_STYLES: BeardStyle[] = ["none", "trimmed"];

/** Classes that have a generated outfit-only layer (equipment unlocked at CLASS_UNLOCK_LEVEL). */
export const CLASSES_WITH_OUTFIT_LAYER: ClassId[] = ["swordsman", "tank", "mage", "archer", "assassin"];

export function baseLayerKey(gender: Gender, skinTone: SkinTone, eyeColor: EyeColor): string {
  return `layer_base_${gender}_${skinTone}_${eyeColor}`;
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

const baseNames = AVAILABLE_SKIN_TONES.flatMap((skin) =>
  AVAILABLE_EYE_COLORS.flatMap((eye) => ["male", "female"].map((gender) => `${gender}_${skin}_${eye}`)),
);
const hairNames = AVAILABLE_HAIR_STYLES.flatMap((style) => AVAILABLE_HAIR_COLORS.map((color) => `${style}_${color}`));
const beardNames = AVAILABLE_BEARD_STYLES.filter((s): s is "trimmed" => s !== "none").flatMap((style) =>
  AVAILABLE_HAIR_COLORS.map((color) => `${style}_${color}`),
);

export const LAYER_MANIFEST_ENTRIES: AssetManifestEntry[] = [
  ...layerEntries("layer_base_", "base/{name}.png", baseNames),
  ...layerEntries("layer_hair_", "hair/{name}.png", hairNames),
  ...layerEntries("layer_beard_", "beard/{name}.png", beardNames),
  ...layerEntries("layer_outfit_", "outfit/{name}.png", ["male_leather", "female_leather"]),
  ...layerEntries(
    "layer_outfit_class_",
    "outfit/{name}.png",
    CLASSES_WITH_OUTFIT_LAYER as unknown as string[],
  ),
];
