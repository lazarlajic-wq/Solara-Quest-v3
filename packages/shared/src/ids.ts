/**
 * Solara Quest uses stable, human-readable string IDs everywhere (maps,
 * regions, portals, NPCs, enemies, bosses, quests, skills, items, pets,
 * market listings, animations, assets) so content can be added later
 * through data files without touching engine code.
 */
export type RegionId = string;
export type MapId = string;
export type PortalId = string;
export type NpcId = string;
export type EnemyId = string;
export type BossId = string;
export type QuestId = string;
export type SkillId = string;
export type ItemId = string;
export type PetId = string;
export type MarketListingId = string;
export type AnimationId = string;
export type AssetId = string;
export type ClassId = "assassin" | "tank" | "mage" | "archer" | "swordsman";

const idRegistry = new Set<string>();

/**
 * Registers an ID and throws if it was already used. Called by content
 * loaders at startup so duplicate-ID bugs fail loudly instead of silently
 * overwriting an earlier entry (see docs/architecture/overview.md, "no
 * silent failures" rule).
 */
export function registerId(namespace: string, id: string): void {
  const key = `${namespace}:${id}`;
  if (idRegistry.has(key)) {
    throw new Error(`Duplicate ID detected in "${namespace}": "${id}"`);
  }
  idRegistry.add(key);
}

export function resetIdRegistry(): void {
  idRegistry.clear();
}
