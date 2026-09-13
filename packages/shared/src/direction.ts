/**
 * The eight compass directions every character, NPC, enemy and piece of
 * visible equipment must be able to face and animate in.
 */
export const DIRECTIONS = [
  "north",
  "northeast",
  "east",
  "southeast",
  "south",
  "southwest",
  "west",
  "northwest",
] as const;

export type Direction = (typeof DIRECTIONS)[number];

export interface Vector2 {
  x: number;
  y: number;
}

/**
 * Maps an arbitrary movement vector to the nearest of the 8 compass
 * directions. Screen space: +x = east, +y = south.
 */
export function vectorToDirection(vector: Vector2): Direction | null {
  const { x, y } = vector;
  if (x === 0 && y === 0) return null;

  const angle = Math.atan2(y, x); // -PI..PI, 0 = east
  const sector = Math.round(angle / (Math.PI / 4)); // -4..4, one of 8 sectors
  const table: Record<number, Direction> = {
    0: "east",
    1: "southeast",
    2: "south",
    3: "southwest",
    4: "west",
    [-4]: "west",
    [-3]: "northwest",
    [-2]: "north",
    [-1]: "northeast",
  };
  return table[sector] ?? "south";
}

/**
 * Normalizes a raw input axis (-1, 0, 1 per axis) so that diagonal movement
 * covers the same distance per second as cardinal movement.
 */
export function normalizeMovement(vector: Vector2): Vector2 {
  const length = Math.hypot(vector.x, vector.y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: vector.x / length, y: vector.y / length };
}

/**
 * Directions that currently ship with a fully authored, style-checked sprite.
 * Everything else falls back through {@link resolveDirectionFallback}.
 *
 * All five classes now have real south/north/east/west walk cycles, composed
 * with the Universal LPC Spritesheet Generator (Liberated Pixel Cup) — see
 * docs/art-direction/CREDITS.md for required attribution and
 * docs/art-direction/style-guide.md for how these were assembled. Diagonals
 * still collapse to the nearest authored cardinal — see
 * docs/gameplay/phase-status.md, Phase 2, for the plan to author true
 * 8-direction diagonal frames.
 */
export const AUTHORED_DIRECTIONS: readonly Direction[] = ["south", "north", "east", "west"] as const;

/**
 * Resolves a requested direction to an authored one + whether to mirror it.
 * All four cardinals are authored directly (no mirroring needed); diagonals
 * collapse to the nearest authored cardinal (south/north win over east/west,
 * matching how most top-down RPGs bias diagonal sprites toward the vertical
 * read).
 */
export function resolveDirectionFallback(direction: Direction): {
  authored: Direction;
  flipX: boolean;
} {
  switch (direction) {
    case "south":
    case "north":
    case "east":
    case "west":
      return { authored: direction, flipX: false };
    case "southeast":
      return { authored: "south", flipX: false };
    case "southwest":
      return { authored: "south", flipX: false };
    case "northeast":
      return { authored: "north", flipX: false };
    case "northwest":
      return { authored: "north", flipX: false };
    default:
      return { authored: "south", flipX: false };
  }
}
