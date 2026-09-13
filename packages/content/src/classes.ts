import type { ClassDefinition } from "@solara/shared";

/**
 * The five playable classes (spec section 7). Class identity no longer owns
 * character art directly: the player designs their own body/hair/face at
 * creation (see CharacterAppearance), and picking a class at
 * CLASS_UNLOCK_LEVEL applies that class's generated outfit layer on top —
 * see apps/client/src/core/CharacterLayers.ts and
 * docs/art-direction/style-guide.md.
 */
export const CLASS_DEFINITIONS: ClassDefinition[] = [
  {
    id: "swordsman",
    name: "Swordsman",
    role: "Balanced melee",
    description: "Ausgeglichener Nahkampf mit Schwertkombinationen, Kontern und Vorwärtsangriff.",
    baseStats: { health: 120, resource: 60, attack: 14, defense: 12, speed: 180 },
    resourceType: "energy",
    weaponName: "Langschwert",
  },
  {
    id: "tank",
    name: "Tank",
    role: "Frontline defender",
    description: "Hohe Lebenspunkte, Schild, Blocken und Flächenkontrolle für die Gruppe.",
    baseStats: { health: 180, resource: 50, attack: 9, defense: 22, speed: 150 },
    resourceType: "energy",
    weaponName: "Streitkolben & Schild",
  },
  {
    id: "mage",
    name: "Mage",
    role: "Elemental caster",
    description: "Fernkampfzauber mit Feuer, Eis, Blitz und arkaner Magie, geringe Verteidigung.",
    baseStats: { health: 85, resource: 120, attack: 18, defense: 6, speed: 165 },
    resourceType: "mana",
    weaponName: "Zauberstab",
  },
  {
    id: "archer",
    name: "Archer",
    role: "Ranged precision",
    description: "Hohe Reichweite, Mehrfachschuss, Ausweichrolle und Fallen.",
    baseStats: { health: 95, resource: 90, attack: 16, defense: 8, speed: 185 },
    resourceType: "energy",
    weaponName: "Recurve-Bogen",
  },
  {
    id: "assassin",
    name: "Assassin",
    role: "Burst / speed",
    description: "Hohe Geschwindigkeit, kritische Treffer, Schatten-Dash, Gift- und Blutungseffekte.",
    baseStats: { health: 90, resource: 100, attack: 20, defense: 7, speed: 205 },
    resourceType: "energy",
    weaponName: "Dolch",
  },
];

export function getClassDefinition(id: string): ClassDefinition {
  const def = CLASS_DEFINITIONS.find((c) => c.id === id);
  if (!def) throw new Error(`Unknown class id: ${id}`);
  return def;
}
