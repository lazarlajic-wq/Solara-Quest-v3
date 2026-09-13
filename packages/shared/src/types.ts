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
  /** Direction the reference art currently exists for; see AUTHORED_DIRECTIONS. */
  hasFullArt: boolean;
  spriteSheetKey: string;
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
