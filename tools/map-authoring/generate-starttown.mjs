// One-off generator for the Phase 4 starttown slice's Tiled JSON map.
// Run with: node tools/map-authoring/generate-starttown.mjs
// Re-run after editing this file to regenerate
// apps/client/public/assets/maps/starttown.json. Kept in the repo so the
// map can be regenerated or extended later instead of hand-editing the
// JSON array.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const TILE = 85;
const COLS = 30;
const ROWS = 20;
const TS_COLS = 12; // tileset.png columns

const T = {
  GRASS: 1,
  STONE: 25, // row2 col0 -> index 24 (0-based) -> gid 25
  WATER: 61, // row5 col0 -> index 60 -> gid 61
  FENCE_H: 97, // row8 col0 -> index 96 -> gid 97
  BUSH: 121, // row10 col0 -> index 120 -> gid 121
};

function fill(value) {
  return new Array(COLS * ROWS).fill(value);
}

function idx(x, y) {
  return y * COLS + x;
}

const ground = fill(T.GRASS);
const decoration = fill(0);

// Left river border (3 tiles wide).
for (let y = 0; y < ROWS; y++) {
  for (let x = 0; x < 3; x++) ground[idx(x, y)] = T.WATER;
}

// Central town plaza (stone).
const plaza = { x0: 10, y0: 6, x1: 22, y1: 15 };
for (let y = plaza.y0; y <= plaza.y1; y++) {
  for (let x = plaza.x0; x <= plaza.x1; x++) ground[idx(x, y)] = T.STONE;
}

// Fence line marking the plaza's north edge, with a gap for the entrance.
for (let x = plaza.x0; x <= plaza.x1; x++) {
  if (x >= 15 && x <= 17) continue; // entrance gap
  decoration[idx(x, plaza.y0 - 1)] = T.FENCE_H;
}

// Scattered bushes for visual interest (deterministic, not random spam).
const bushSpots = [
  [5, 4], [5, 16], [25, 4], [25, 16], [8, 10], [24, 10], [14, 4], [18, 17],
];
for (const [x, y] of bushSpots) decoration[idx(x, y)] = T.BUSH;

const map = {
  compressionlevel: -1,
  width: COLS,
  height: ROWS,
  tilewidth: TILE,
  tileheight: TILE,
  infinite: false,
  orientation: "orthogonal",
  renderorder: "right-down",
  tiledversion: "1.10.2",
  type: "map",
  version: "1.10",
  nextlayerid: 5,
  nextobjectid: 14,
  tilesets: [
    {
      firstgid: 1,
      name: "starttown",
      image: "../tilesets/starttown.png",
      imagewidth: TS_COLS * TILE,
      imageheight: TS_COLS * TILE,
      tilewidth: TILE,
      tileheight: TILE,
      columns: TS_COLS,
      tilecount: TS_COLS * TS_COLS,
      margin: 0,
      spacing: 0,
    },
  ],
  layers: [
    { id: 1, name: "ground", type: "tilelayer", width: COLS, height: ROWS, x: 0, y: 0, opacity: 1, visible: true, data: ground },
    { id: 2, name: "decoration", type: "tilelayer", width: COLS, height: ROWS, x: 0, y: 0, opacity: 1, visible: true, data: decoration },
    {
      id: 3,
      name: "collision",
      type: "objectgroup",
      opacity: 1,
      visible: true,
      objects: [
        { id: 1, name: "river", type: "collision", x: 0, y: 0, width: 3 * TILE, height: ROWS * TILE, rectangle: true },
      ],
    },
    {
      id: 4,
      name: "spawns",
      type: "objectgroup",
      opacity: 1,
      visible: true,
      objects: [
        { id: 2, name: "player_spawn", type: "spawn", x: 16 * TILE, y: 10 * TILE, width: TILE, height: TILE, point: false },
        {
          id: 3,
          name: "npc_trainer_gate",
          type: "npc",
          x: 16 * TILE,
          y: (plaza.y0 - 2) * TILE,
          width: TILE,
          height: TILE,
          properties: [{ name: "npcId", type: "string", value: "npc-r1-trainer-gate" }],
        },
        {
          id: 4,
          name: "portal_traininggrounds",
          type: "portal",
          x: 28 * TILE,
          y: 9 * TILE,
          width: TILE,
          height: 2 * TILE,
          properties: [{ name: "targetMapId", type: "string", value: "r1-traininggrounds" }],
        },
        {
          id: 5,
          name: "dummy_1",
          type: "dummy",
          x: 12 * TILE,
          y: 12 * TILE,
          width: TILE,
          height: TILE,
        },
        {
          id: 6,
          name: "dummy_2",
          type: "dummy",
          x: 20 * TILE,
          y: 12 * TILE,
          width: TILE,
          height: TILE,
        },
        {
          id: 7,
          name: "enemy_slime_1",
          type: "enemy",
          x: 6 * TILE,
          y: 3 * TILE,
          width: TILE,
          height: TILE,
        },
        {
          id: 8,
          name: "enemy_slime_2",
          type: "enemy",
          x: 25 * TILE,
          y: 17 * TILE,
          width: TILE,
          height: TILE,
        },
      ],
    },
  ],
};

const outPath = resolve(__dirname, "../../apps/client/public/assets/maps/starttown.json");
writeFileSync(outPath, JSON.stringify(map, null, 2));
console.log("Wrote", outPath);
