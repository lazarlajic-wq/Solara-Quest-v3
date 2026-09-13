import type { AnimationId, ClassId, ItemId, NpcId, PetId, QuestId, RegionId, SkillId } from "./ids";
import type { Direction } from "./direction";

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythical";

export interface ClassDefinition {
  id: ClassId;
  name: string;
  role: string;
  description: string;
  baseStats: {
    health: number;
    resource: number; // mana or energy
    attack: number;
    defense: number;
    speed: number;
  };
  resourceType: "mana" | "energy";
  weaponName: string;
}

export interface SkillDefinition {
  id: SkillId;
  classId: ClassId;
  name: string;
  description: string;
  type: "active" | "passive";
  branch: string;
  levelRequirement: number;
  skillPointCost: number;
  requires?: SkillId[];
  resourceCost?: number;
  cooldownMs?: number;
}

export interface ItemDefinition {
  id: ItemId;
  name: string;
  description: string;
  rarity: Rarity;
  slot?: EquipmentSlot;
  stackable: boolean;
  tradable: boolean;
  systemSellPrice: number; // Solaris; legendary/mythical are fixed at 1
  iconKey: string;
}

export type EquipmentSlot =
  | "head"
  | "chest"
  | "hands"
  | "legs"
  | "feet"
  | "mainHand"
  | "offHand"
  | "shield"
  | "accessory"
  | "back"
  | "pet";

export interface QuestObjective {
  description: string;
  targetId?: string;
  requiredAmount: number;
}

export interface QuestDefinition {
  id: QuestId;
  regionId: RegionId;
  title: string;
  description: string;
  objectives: QuestObjective[];
  rewardSolaris: number;
  rewardItemIds: ItemId[];
  requiresQuestId?: QuestId;
  nextQuestId?: QuestId;
}

export interface NpcDefinition {
  id: NpcId;
  name: string;
  role: "merchant" | "trainer" | "questgiver" | "healer" | "blacksmith" | "civilian" | "guard";
  spriteSheetKey: string;
  regionId: RegionId;
  dialogue: string[];
  questIds: QuestId[];
}

export interface PetDefinition {
  id: PetId;
  name: string;
  regionId: RegionId;
  element: string;
  rarity: Rarity;
  spriteSheetKey: string;
  evolutions: PetEvolution[];
}

export interface PetEvolution {
  stage: number;
  name: string;
  requiredLevel: number;
  spriteSheetKey: string;
}

export type Gender = "male" | "female";
export type SkinTone = "light" | "brown";
export type EyeColor = "brown" | "blue";
export type HairStyle = "plain" | "ponytail";
export type HairColor = "black" | "dark_brown";
export type BeardStyle = "none" | "trimmed";

/**
 * The player-designed look (spec section 6: modular character creation),
 * independent of class. Rendered as stacked sprite layers sharing one
 * animation frame index — see apps/client/src/entities/CharacterSprite.ts.
 * Class equipment is a separate "outfit" layer applied on top once
 * CLASS_UNLOCK_LEVEL is reached, so the designed body/hair/face persists.
 */
export interface CharacterAppearance {
  gender: Gender;
  skinTone: SkinTone;
  eyeColor: EyeColor;
  hairStyle: HairStyle;
  hairColor: HairColor;
  beardStyle: BeardStyle;
  beardColor: HairColor;
}

/** Level at which a class (and its equipment look) becomes chooseable. */
export const CLASS_UNLOCK_LEVEL = 5;

export interface AnimationDefinition {
  id: AnimationId;
  spriteSheetKey: string;
  frameWidth: number;
  frameHeight: number;
  frames: number[];
  frameRate: number;
  repeat: number; // -1 = loop
}

export interface DirectionalAnimationSet {
  idle: Record<Direction, AnimationId>;
  walk: Record<Direction, AnimationId>;
  run?: Record<Direction, AnimationId>;
  dash?: Record<Direction, AnimationId>;
  attack: Record<Direction, AnimationId>;
  hit: Record<Direction, AnimationId>;
  death: Record<Direction, AnimationId>;
}
