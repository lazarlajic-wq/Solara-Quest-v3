/**
 * Region 1 map graph (spec section 16). Only "starttown" has an authored
 * Tiled map in this version (apps/client/public/assets/maps/starttown.json);
 * the rest are declared here as the source of truth for IDs and portal
 * wiring so the remaining maps can be added later without touching code.
 */
export interface RegionMapNode {
  mapId: string;
  name: string;
  connectsTo: string[];
  hasAuthoredMap: boolean;
}

export const REGION_01_MAPS: RegionMapNode[] = [
  { mapId: "r1-starttown", name: "Startstadt", connectsTo: ["r1-traininggrounds", "r1-harbor"], hasAuthoredMap: true },
  { mapId: "r1-traininggrounds", name: "Trainingslager", connectsTo: ["r1-starttown", "r1-field-1"], hasAuthoredMap: false },
  { mapId: "r1-harbor", name: "Hafen", connectsTo: ["r1-starttown", "r1-field-1"], hasAuthoredMap: false },
  { mapId: "r1-field-1", name: "Feldgebiet 1", connectsTo: ["r1-traininggrounds", "r1-harbor", "r1-field-2"], hasAuthoredMap: false },
  { mapId: "r1-field-2", name: "Feldgebiet 2", connectsTo: ["r1-field-1", "r1-field-3"], hasAuthoredMap: false },
  { mapId: "r1-field-3", name: "Feldgebiet 3", connectsTo: ["r1-field-2", "r1-field-4"], hasAuthoredMap: false },
  { mapId: "r1-field-4", name: "Feldgebiet 4", connectsTo: ["r1-field-3", "r1-leviathan"], hasAuthoredMap: false },
  { mapId: "r1-leviathan", name: "Leviathan-Bossgebiet", connectsTo: ["r1-field-4", "r1-capital"], hasAuthoredMap: false },
  { mapId: "r1-capital", name: "Hauptstadt", connectsTo: ["r1-leviathan"], hasAuthoredMap: false },
];
