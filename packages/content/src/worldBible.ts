export interface RegionBibleEntry {
  id: string;
  order: number;
  name: string;
  theme: string;
  travelMethod: string;
  status: "playable-slice" | "planned";
}

/**
 * Full World Bible stub for all ten regions (spec section 15/16). Only
 * region 1 ("Solara Coast") has a playable slice in this version; the rest
 * are placeholders to be fleshed out (history, enemies, bosses, pets,
 * equipment, quests) region-by-region per the phased build plan in
 * docs/gameplay/phase-status.md.
 */
export const WORLD_BIBLE: RegionBibleEntry[] = [
  { id: "region-01-solara-coast", order: 1, name: "Solara Coast", theme: "Startregion & Grundlagen", travelMethod: "Hafen (Schiff)", status: "playable-slice" },
  { id: "region-02-emberfall", order: 2, name: "Emberfall", theme: "Elementargefahren (Feuer)", travelMethod: "Gebirgspass", status: "planned" },
  { id: "region-03-frosthollow", order: 3, name: "Frosthollow", theme: "Elite-Gegner & Gruppenquests", travelMethod: "Unterwassertunnel", status: "planned" },
  { id: "region-04-windmere", order: 4, name: "Windmere Highlands", theme: "Bewegungs- & Umgebungsmechaniken", travelMethod: "Luftschiff", status: "planned" },
  { id: "region-05-verdant-ruins", order: 5, name: "Verdant Ruins", theme: "Komplexere Dungeons", travelMethod: "Ruinentor", status: "planned" },
  { id: "region-06-obsidian-order", order: 6, name: "Obsidian Order", theme: "Klassen-Spezialisierungen", travelMethod: "Magisches Portal", status: "planned" },
  { id: "region-07-tidalreach", order: 7, name: "Tidalreach", theme: "Anspruchsvolle Gruppeninhalte", travelMethod: "Waldpfad", status: "planned" },
  { id: "region-08-duskmarch", order: 8, name: "Duskmarch", theme: "Fortgeschrittene Bossmechaniken", travelMethod: "Wüstenkarawane", status: "planned" },
  { id: "region-09-starfall-vale", order: 9, name: "Starfall Vale", theme: "Endgame-Vorbereitung", travelMethod: "Traumwelt", status: "planned" },
  { id: "region-10-solstice-throne", order: 10, name: "Solstice Throne", theme: "Endgame: stärkste Bosse & Raids", travelMethod: "Bossdurchgang", status: "planned" },
];
